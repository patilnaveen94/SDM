import React, { useMemo, useState } from 'react';
import { getGearInventoryBreakdown, getOrderBalance, getOrders, Order } from '../store/dataStore';

type ReportPeriod = 'week' | 'month' | 'custom';

interface GearRentalSummary {
  gearId: string;
  name: string;
  brand: string;
  quantity: number;
  hirePeriods: number;
  estimatedValue: number;
}

interface ReturnActivity {
  orderId: string;
  customerName: string;
  recordedAt: string;
  activity: string;
  items: string;
  note: string;
}

function localDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getWeekStart(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  return start;
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>): void {
  const csv = `\uFEFF${rows.map(row => row.map(escapeCsv).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function getStatusLabel(order: Order): string {
  if (order.status === 'partially_returned') return 'Partially returned';
  if (order.status === 'returned_pending_payment') return order.missingItems?.length ? 'Closed · missing items · payment pending' : 'Returned · payment pending';
  if (order.status === 'settled') return order.missingItems?.length ? 'Paid · missing items' : 'Paid';
  return order.status === 'active' ? 'Active' : order.status;
}

export const ReportsPage: React.FC = () => {
  const now = new Date();
  const today = localDateString(now);
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [startDate, setStartDate] = useState(localDateString(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [endDate, setEndDate] = useState(today);

  const allOrders = getOrders();
  const inventory = getGearInventoryBreakdown();
  const periodOrders = allOrders.filter(order => {
    const date = order.createdAt.slice(0, 10);
    return date >= startDate && date <= endDate;
  });
  const collections = allOrders.flatMap(order => {
    const payments = order.paymentHistory || (order.paymentStatus === 'paid' && order.settledAt
      ? [{ amount: order.totalAmount, paidAt: order.settledAt }]
      : []);
    return payments
      .filter(payment => payment.paidAt.slice(0, 10) >= startDate && payment.paidAt.slice(0, 10) <= endDate)
      .map(payment => ({ order, payment }));
  });
  const collectedAmount = collections.reduce((sum, entry) => sum + entry.payment.amount, 0);
  const estimatedCollection = periodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalDiscount = periodOrders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
  const pendingOrders = allOrders.filter(order => order.paymentStatus !== 'paid');
  const pendingCollection = pendingOrders.reduce((sum, order) => sum + getOrderBalance(order), 0);
  const returnActivity: ReturnActivity[] = allOrders.flatMap(order => [
    ...(order.partialReturns || [])
      .filter(entry => entry.returnedAt.slice(0, 10) >= startDate && entry.returnedAt.slice(0, 10) <= endDate)
      .map(entry => ({
        orderId: order.id,
        customerName: order.customerName,
        recordedAt: entry.returnedAt,
        activity: 'Items received',
        items: entry.items.map(item => `${item.gearName} x${item.quantity}`).join('; '),
        note: entry.note,
      })),
    ...((order.missingItems?.length && order.returnedAt && order.returnedAt.slice(0, 10) >= startDate && order.returnedAt.slice(0, 10) <= endDate)
      ? [{
        orderId: order.id,
        customerName: order.customerName,
        recordedAt: order.returnedAt,
        activity: 'Closed with missing items',
        items: order.missingItems.map(item => `${item.gearName} x${item.quantity}`).join('; '),
        note: order.missingNote || '',
      }]
      : []),
  ]).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

  const gearSummary = useMemo(() => {
    const summaries = new Map<string, GearRentalSummary>();
    periodOrders.filter(order => order.type === 'rental').forEach(order => {
      order.items.forEach(item => {
        const summary = summaries.get(item.gearId) || {
          gearId: item.gearId,
          name: item.gearName,
          brand: '',
          quantity: 0,
          hirePeriods: 0,
          estimatedValue: 0,
        };
        summary.quantity += item.quantity;
        summary.hirePeriods += item.quantity * order.days;
        summary.estimatedValue += item.quantity * order.days * item.dailyRate;
        summaries.set(item.gearId, summary);
      });
    });
    return Array.from(summaries.values()).sort((a, b) => b.hirePeriods - a.hirePeriods);
  }, [periodOrders]);

  const setPreset = (nextPeriod: Exclude<ReportPeriod, 'custom'>) => {
    const current = new Date();
    setPeriod(nextPeriod);
    setEndDate(localDateString(current));
    setStartDate(localDateString(nextPeriod === 'week'
      ? getWeekStart(current)
      : new Date(current.getFullYear(), current.getMonth(), 1)));
  };

  const exportReport = () => {
    const rows: Array<Array<string | number>> = [
      ['SDM Camera & Solutions - Audit and Operations Report'],
      ['Period', `${startDate} to ${endDate}`],
      [],
      ['Financial summary'],
      ['Estimated collection from orders created in period (INR)', estimatedCollection],
      ['Payments collected in period (INR)', collectedAmount],
      ['Discounts granted on orders created in period (INR)', totalDiscount],
      ['Current pending collection across all unpaid orders (INR)', pendingCollection],
      ['Orders created in period', periodOrders.length],
      ['Orders still pending payment', pendingOrders.length],
      [],
      ['Highest rented gear'],
      ['Rank', 'Gear', 'Units rented', 'Hire periods (unit-periods)', 'Gross estimated value (INR)'],
      ...gearSummary.map((item, index) => [index + 1, item.name, item.quantity, item.hirePeriods, item.estimatedValue]),
      [],
      ['Inventory snapshot as of export'],
      ['Gear', 'Total stock', 'Available now', 'Currently out', 'Reserved for future orders', 'Missing / written off'],
      ...inventory.map(item => [item.gear.name, item.gear.totalStock, item.available, item.out, item.blocked, item.missing]),
      [],
      ['Orders created in period'],
      ['Order ID', 'Created', 'Customer', 'Phone', 'Type', 'Items', 'Period count', 'Subtotal (INR)', 'Discount (INR)', 'Total (INR)', 'Payment status', 'Order status', 'Returned items', 'Missing items', 'Return notes'],
      ...periodOrders.map(order => [
        order.id,
        order.createdAt,
        order.customerName,
        order.customerPhone,
        order.type,
        order.items.map(item => `${item.gearName} x${item.quantity}`).join('; '),
        order.days,
        order.totalAmount + (order.discountAmount || 0),
        order.discountAmount || 0,
        getOrderBalance(order),
        order.paymentStatus,
        getStatusLabel(order),
        (order.partialReturns || []).map(entry => entry.items.map(item => `${item.gearName} x${item.quantity}`).join('; ')).filter(Boolean).join(' | '),
        (order.missingItems || []).map(item => `${item.gearName} x${item.quantity}`).join('; '),
        [order.missingNote, ...(order.partialReturns || []).map(entry => entry.note)].filter(Boolean).join(' | ') || order.notes || '',
      ]),
      [],
      ['Payments received in period'],
      ['Order ID', 'Payment date', 'Customer', 'Amount (INR)'],
      ...collections.map(({ order, payment }) => [order.id, payment.paidAt, order.customerName, payment.amount]),
      [],
      ['Currently pending collection - all unpaid orders'],
      ['Order ID', 'Created', 'Customer', 'Phone', 'Items', 'Amount due (INR)', 'Order status', 'Missing items', 'Return notes'],
      ...pendingOrders.map(order => [
        order.id,
        order.createdAt,
        order.customerName,
        order.customerPhone,
        order.items.map(item => `${item.gearName} x${item.quantity}`).join('; '),
        order.totalAmount,
        getStatusLabel(order),
        (order.missingItems || []).map(item => `${item.gearName} x${item.quantity}`).join('; '),
        [order.missingNote, ...(order.partialReturns || []).map(entry => entry.note)].filter(Boolean).join(' | ') || order.notes || '',
      ]),
      [],
      ['Return and missing-item activity in selected period'],
      ['Recorded at', 'Activity', 'Order ID', 'Customer', 'Items', 'Note'],
      ...returnActivity.map(entry => [entry.recordedAt, entry.activity, entry.orderId, entry.customerName, entry.items, entry.note]),
    ];
    downloadCsv(`sdm-audit-report-${startDate}-to-${endDate}.csv`, rows);
  };

  const statCards = [
    { label: 'Estimated collection', value: formatCurrency(estimatedCollection), description: 'Total net value of orders created in period', color: 'text-blue-300' },
    { label: 'Payments collected', value: formatCurrency(collectedAmount), description: 'Payments received in period', color: 'text-green-400' },
    { label: 'Total discounts given', value: formatCurrency(totalDiscount), description: 'Discounts on orders created in period', color: 'text-purple-300' },
    { label: 'Pending collection', value: formatCurrency(pendingCollection), description: `${pendingOrders.length} unpaid order(s), across all dates`, color: 'text-amber-300' },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-2 text-2xl font-heading font-bold text-white">Reports & Audit</h1>
          <p className="text-sm text-gray-500">Collections, discounts, rentals, stock and order-level records.</p>
        </div>
        <button onClick={exportReport} className="rounded-xl bg-gold px-5 py-3 text-sm font-bold text-obsidian hover:bg-gold-light">
          Download CSV report
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          <button onClick={() => setPreset('week')} className={`rounded-lg px-4 py-2 text-xs font-semibold ${period === 'week' ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400'}`}>This week</button>
          <button onClick={() => setPreset('month')} className={`rounded-lg px-4 py-2 text-xs font-semibold ${period === 'month' ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400'}`}>This month</button>
        </div>
        <label className="text-xs text-gray-500">From
          <input type="date" value={startDate} max={endDate} onChange={event => { setStartDate(event.target.value); setPeriod('custom'); }} className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" />
        </label>
        <label className="text-xs text-gray-500">To
          <input type="date" value={endDate} min={startDate} onChange={event => { setEndDate(event.target.value); setPeriod('custom'); }} className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" />
        </label>
        <p className="text-xs text-gray-500">Order totals and discounts use order creation date. Payments collected use payment date. Pending collection includes all unpaid orders.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(card => (
          <article key={card.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className={`mt-2 text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="mt-2 text-[10px] text-gray-600">{card.description}</p>
          </article>
        ))}
      </div>

      <section className="mb-8 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Highest rented gear</h2>
            <p className="mt-1 text-xs text-gray-500">Ranked by rented unit-periods in the selected order period.</p>
          </div>
          <span className="text-xs text-gray-500">{gearSummary.length} item(s)</span>
        </div>
        {gearSummary.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No rental orders in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-gray-500">
                <tr><th className="pb-3">Rank / gear</th><th className="pb-3 text-right">Units rented</th><th className="pb-3 text-right">Unit-periods</th><th className="pb-3 text-right">Estimated gross</th></tr>
              </thead>
              <tbody>
                {gearSummary.map((item, index) => (
                  <tr key={item.gearId} className="border-t border-white/5 text-gray-300">
                    <td className="py-3"><span className="mr-2 text-gold">#{index + 1}</span>{item.name}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{item.hirePeriods}</td>
                    <td className="py-3 text-right">{formatCurrency(item.estimatedValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Orders in selected period</h2>
        {periodOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No orders were created in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-gray-500">
                <tr><th className="pb-3">Order / customer</th><th className="pb-3">Items</th><th className="pb-3 text-right">Subtotal</th><th className="pb-3 text-right">Discount</th><th className="pb-3 text-right">Net total</th><th className="pb-3 text-right">Payment</th></tr>
              </thead>
              <tbody>
                {periodOrders.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(order => (
                  <tr key={order.id} className="border-t border-white/5 text-gray-300">
                    <td className="py-3"><p className="font-medium text-white">{order.customerName}</p><p className="mt-1 text-gray-600">{order.id} · {order.createdAt.slice(0, 10)}</p></td>
                    <td className="py-3">{order.items.map(item => `${item.gearName} ×${item.quantity}`).join(', ')}<p className="mt-1 text-gray-600">{order.days} period(s) · {getStatusLabel(order)}</p>{order.missingItems?.map(item => <p key={item.gearId} className="mt-1 text-red-300">Missing: {item.gearName} ×{item.quantity}</p>)}{order.missingNote && <p className="mt-1 text-red-300">Closeout note: {order.missingNote}</p>}{order.partialReturns?.map((entry, index) => <p key={`${entry.returnedAt}-${index}`} className="mt-1 text-orange-300">Return note: {entry.note}</p>)}</td>
                    <td className="py-3 text-right">{formatCurrency(order.totalAmount + (order.discountAmount || 0))}</td>
                    <td className="py-3 text-right">{formatCurrency(order.discountAmount || 0)}</td>
                    <td className="py-3 text-right font-semibold text-white">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-3 text-right">
                      {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'partial' ? `Partial · ${formatCurrency(getOrderBalance(order))} due` : `Pending · ${formatCurrency(getOrderBalance(order))} due`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Returns and missing-item closeouts</h2>
        {returnActivity.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No return activity was recorded in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-gray-500">
                <tr><th className="pb-3">Recorded</th><th className="pb-3">Activity</th><th className="pb-3">Order / customer</th><th className="pb-3">Items</th><th className="pb-3">Note</th></tr>
              </thead>
              <tbody>
                {returnActivity.map((entry, index) => (
                  <tr key={`${entry.orderId}-${entry.recordedAt}-${entry.activity}-${index}`} className="border-t border-white/5 text-gray-300">
                    <td className="py-3">{new Date(entry.recordedAt).toLocaleString('en-IN')}</td>
                    <td className={entry.activity === 'Closed with missing items' ? 'py-3 text-red-300' : 'py-3 text-orange-300'}>{entry.activity}</td>
                    <td className="py-3"><p className="text-white">{entry.customerName}</p><p className="text-gray-600">{entry.orderId}</p></td>
                    <td className="py-3">{entry.items}</td>
                    <td className="py-3">{entry.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-4 text-[10px] text-gray-600">
        Estimated collection represents net booked order value, not a guarantee of payment. Payments collected are based on recorded settlement dates. This operational report is generated from data stored in this browser.
      </p>
    </div>
  );
};
