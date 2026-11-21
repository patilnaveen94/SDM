import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getGearInventoryBreakdown,
  getOrders,
  getActiveOrders,
  getOverdueOrders,
  getPendingPaymentOrders,
  getPartiallyReturnedOrders,
  getOutstandingOrderItems,
  getOrderBalance,
  getCustomerProfiles,
  getQuoteRequests,
  getQuotations,
  addQuoteRequest,
  isFutureOrderStart,
  settleOrder,
  QuoteRequest,
  SavedQuotation,
} from '../store/dataStore';
import { QuotationModal } from './QuotationModal';
import { AdminCalendar } from './AdminCalendar';

interface DetailRow {
  title: string;
  description: string;
  value: string;
  returnOrderId?: string;
}

interface DashboardDetail {
  title: string;
  rows: DetailRow[];
  quoteRequests?: QuoteRequest[];
  quotations?: SavedQuotation[];
}

interface ActiveQuotation {
  request: QuoteRequest;
  quotation?: SavedQuotation;
}

export const DashboardPage: React.FC = () => {
  const [, setRefresh] = useState(0);
  const [detail, setDetail] = useState<DashboardDetail | null>(null);
  const [activeQuotation, setActiveQuotation] = useState<ActiveQuotation | null>(null);
  const navigate = useNavigate();
  const reload = () => setRefresh(n => n + 1);
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'sdm_quote_requests') setRefresh(n => n + 1);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setRefresh]);

  const inventory = getGearInventoryBreakdown();
  const orders = getOrders();
  const activeOrders = getActiveOrders();
  const overdueOrders = getOverdueOrders();
  const pendingPayment = getPendingPaymentOrders();
  const partiallyReturned = getPartiallyReturnedOrders();
  const missingFollowUps = partiallyReturned.filter(order => (order.missingItems?.length || 0) > 0);
  const savedCustomers = getCustomerProfiles();
  const customersByPhone = new Map(savedCustomers.map(customer => [customer.phone, {
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    lastUpdated: customer.lastUpdated,
  }]));
  orders.forEach(order => {
    const existing = customersByPhone.get(order.customerPhone);
    customersByPhone.set(order.customerPhone, {
      name: existing?.name || order.customerName,
      phone: order.customerPhone,
      email: existing?.email || order.customerEmail,
      lastUpdated: existing?.lastUpdated || order.createdAt,
    });
  });
  const customers = Array.from(customersByPhone.values());
  const quoteRequests = getQuoteRequests();
  const savedQuotations = getQuotations();
  const openQuotes = quoteRequests.filter(request => !request.convertedOrderId);
  const onlineEnquiries = openQuotes.filter(request => request.requestType === 'rental');
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const rentOutOrders = activeOrders.filter(order => order.type === 'rental' && !isFutureOrderStart(order));
  const deliveryToday = activeOrders.filter(order => order.type === 'rental' && order.startDate === todayString);
  const receiveToday = activeOrders.filter(order => order.type === 'rental' && order.endDate === todayString);
  const pendingAmount = [...activeOrders, ...pendingPayment].reduce((sum, order) => sum + getOrderBalance(order), 0);
  const availableUnits = inventory.reduce((sum, item) => sum + item.available, 0);
  const itemsOut = inventory.reduce((sum, item) => sum + item.out, 0);
  const blockedUnits = inventory.reduce((sum, item) => sum + item.blocked, 0);

  const missingUnits = inventory.reduce((sum, item) => sum + item.missing, 0);
  const showInventory = (title: string, key: 'available' | 'out' | 'blocked' | 'missing') => {
    const labels = { available: 'available', out: 'currently out', blocked: 'blocked for future orders', missing: 'missing / written off' };
    const rows = inventory
      .filter(item => item[key] > 0)
      .map(item => ({
        title: item.gear.name,
        description: `${item.gear.brand} · ${item.gear.category} · ${item.gear.totalStock} total units`,
        value: `${item[key]} unit${item[key] === 1 ? '' : 's'} ${labels[key]}`,
      }));
    setDetail({ title, rows });
  };

  const showOrders = (title: string, selectedOrders: typeof orders) => {
    setDetail({
      title,
      rows: selectedOrders.map(order => ({
        title: order.customerName,
        description: `${order.status === 'partially_returned' ? `Still out: ${getOutstandingOrderItems(order).map(item => `${item.gearName} ×${item.quantity}`).join(', ')} · ` : ''}${order.missingItems?.length ? `Missing: ${order.missingItems.map(item => `${item.gearName} ×${item.quantity}`).join(', ')} · ` : ''}${order.items.map(item => `${item.gearName} ×${item.quantity}`).join(', ')} · ${order.startDate} – ${order.endDate}${order.missingNote ? ` · Follow-up note: ${order.missingNote}` : order.partialReturns?.length ? ` · Note: ${order.partialReturns[order.partialReturns.length - 1].note}` : ''}`,
        value: `₹${order.totalAmount.toLocaleString('en-IN')}`,
        returnOrderId: order.status === 'active' || order.status === 'partially_returned' ? order.id : undefined,
      })),
    });
  };

  const showAllGear = () => {
    setDetail({
      title: 'All gear items',
      rows: inventory.map(({ gear, available, out, blocked, missing }) => ({
        title: gear.name,
        description: `${gear.brand} · ${gear.category}`,
        value: `${available} available · ${out} out · ${blocked} blocked · ${missing} missing`,
      })),
    });
  };

  const showCustomers = () => setDetail({
    title: 'Customers',
    rows: customers.map(customer => ({
      title: customer.name,
      description: `${customer.phone}${customer.email ? ` · ${customer.email}` : ''}`,
      value: `Last updated ${new Date(customer.lastUpdated).toLocaleDateString('en-IN')}`,
    })),
  });

  const showQuotes = () => setDetail({
    title: 'Online enquiries & quotations',
    rows: openQuotes.map(request => ({
      title: request.customerName,
      description: request.requestType === 'rental'
        ? `${request.rentalItems?.map(item => `${item.gearName} ×${item.quantity}`).join(', ') || 'Gear rental'} · ${request.requestedDate}${request.requestedEndDate ? ` to ${request.requestedEndDate}` : ''}${request.message ? ` · ${request.message}` : ''}`
        : `${request.eventType} · Requested for ${request.requestedDate}${request.message ? ` · ${request.message}` : ''}`,
      value: `${request.status === 'approved' ? 'Approved · ' : 'Pending · '}${request.customerPhone}${request.customerEmail ? ` · ${request.customerEmail}` : ''}`,
    })),
    quoteRequests: openQuotes,
  });

  const showSavedQuotations = () => setDetail({
    title: 'Saved quotations',
    rows: [],
    quotations: savedQuotations,
  });

  const openSavedQuotation = (quotation: SavedQuotation) => {
    const request = quoteRequests.find(item => item.id === quotation.requestId) || {
      id: quotation.requestId,
      customerName: quotation.customerName,
      customerPhone: quotation.customerPhone,
      customerEmail: quotation.customerEmail,
      eventType: quotation.eventType,
      requestedDate: quotation.requestedDate,
      message: quotation.message,
      createdAt: quotation.createdAt,
    };
    setActiveQuotation({ request, quotation });
    setDetail(null);
  };

  const showStockOverview = () => setDetail({
    title: 'Asset stock overview',
    rows: inventory.map(({ gear, available, out, blocked, missing }) => ({
      title: gear.name,
      description: `${gear.brand} · ${gear.category} · ${gear.totalStock} total units`,
      value: `${available} available · ${out} out · ${blocked} reserved · ${missing} missing`,
    })),
  });

  const handleReceiveItem = (id: string) => navigate('/admin/orders', { state: { returnOrderId: id } });
  const handleSettle = (id: string) => { settleOrder(id); reload(); };
  const createBlankQuotation = () => {
    const now = new Date();
    const requestedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const quotation = addQuoteRequest({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      eventType: 'New quotation',
      requestedDate,
      message: '',
    });
    setActiveQuotation({ request: quotation });
  };

  const stats = [
    { label: 'Rent Out', value: itemsOut, icon: '📦', color: 'text-orange-400', onClick: () => showOrders('Equipment currently rented out', rentOutOrders) },
    { label: 'Delivery Today', value: deliveryToday.length, icon: '🚚', color: 'text-blue-400', onClick: () => showOrders('Deliveries scheduled today', deliveryToday) },
    { label: 'Receive Today', value: receiveToday.length, icon: '📥', color: 'text-green-400', onClick: () => showOrders('Equipment due back today', receiveToday) },
    { label: 'Asset Stock Overview', value: inventory.length, icon: '🎥', color: 'text-purple-400', onClick: showStockOverview },
    { label: 'Available Inventory', value: availableUnits, icon: '✅', color: 'text-green-400', onClick: () => showInventory('Available inventory', 'available') },
    { label: 'Blocked for Future Orders', value: blockedUnits, icon: '🗓️', color: 'text-blue-400', onClick: () => showInventory('Inventory blocked for future orders', 'blocked') },
    { label: 'Active Orders', value: activeOrders.length, icon: '🔥', color: 'text-green-400', onClick: () => showOrders('Active orders', activeOrders) },
    { label: 'Overdue Returns', value: overdueOrders.length, icon: '⚠️', color: 'text-red-400', onClick: () => showOrders('Overdue returns', overdueOrders) },
    { label: 'Pending Payments', value: pendingPayment.length, icon: '💳', color: 'text-yellow-400', onClick: () => showOrders('Pending payments', pendingPayment) },
    { label: 'Partially Returned', value: partiallyReturned.length, icon: '📥', color: 'text-orange-300', onClick: () => showOrders('Partially returned orders', partiallyReturned) },
    { label: 'Missing Gear Follow-ups', value: missingFollowUps.length, icon: '🔔', color: 'text-red-300', onClick: () => showOrders('Open missing gear follow-ups', missingFollowUps) },
    { label: 'Missing / Written Off Stock', value: missingUnits, icon: '⚠️', color: 'text-red-300', onClick: () => showInventory('Missing or written-off gear', 'missing') },
    { label: 'Customers', value: customers.length, icon: '👥', color: 'text-cyan-400', onClick: showCustomers },
    { label: 'Online Enquiries', value: onlineEnquiries.length, icon: '🛒', color: 'text-amber-400', onClick: showQuotes },
    { label: 'Saved Quotations', value: savedQuotations.length, icon: '📄', color: 'text-blue-300', onClick: showSavedQuotations },
    { label: 'Total Gear Items', value: inventory.length, icon: '🎬', color: 'text-gray-300', onClick: showAllGear },
  ];
  const priorityStats = stats.filter(stat => ['Rent Out', 'Delivery Today', 'Receive Today', 'Overdue Returns'].includes(stat.label));
  const businessStats = stats.filter(stat => !priorityStats.includes(stat));
  const renderStats = (items: typeof stats) => (
    <div className="grid grid-cols-1 min-[360px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {items.map(stat => (
        <button
          type="button"
          key={stat.label}
          onClick={stat.onClick}
          aria-label={`View details for ${stat.label}`}
          className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-left transition-colors hover:border-gold/40 hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-gold/50 sm:p-5"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-2xl">{stat.icon}</span>
            <span className="text-[10px] font-medium text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">View →</span>
          </div>
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="mt-1 text-xs font-medium text-gray-500">{stat.label}</div>
        </button>
      ))}
    </div>
  );
  const generalActiveOrders = activeOrders.filter(order =>
    !overdueOrders.some(overdue => overdue.id === order.id)
    && !missingFollowUps.some(missing => missing.id === order.id),
  );

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of your business at a glance</p>
        </div>
        <button
          onClick={createBlankQuotation}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-obsidian transition-colors hover:bg-gold-light"
        >
          <span aria-hidden="true">＋</span> Create Quotation
        </button>
      </div>

      <AdminCalendar orders={orders} />

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Today &amp; immediate attention</h2>
        {renderStats(priorityStats)}
      </section>
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Business snapshot</h2>
        {renderStats(businessStats)}
      </section>

      <div className="mb-8">
        <Link to="/admin/inventory" className="inline-flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm font-medium text-gold hover:bg-gold/10">
          📦 Open inventory management
        </Link>
      </div>

      {pendingAmount > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
          <p className="text-yellow-400 font-medium text-sm">💰 Pending collections: ₹{pendingAmount.toLocaleString('en-IN')}</p>
        </div>
      )}

      {onlineEnquiries.some(request => request.status !== 'approved') && (
        <section className="mb-8 rounded-2xl border border-gold/20 bg-gold/5 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gold">🛒 New online rental enquiries</h2>
              <p className="mt-1 text-xs text-gray-400">
                {onlineEnquiries.filter(request => request.status !== 'approved').length} request(s) waiting for review
              </p>
            </div>
            <button onClick={showQuotes} className="rounded-lg border border-gold/20 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/10">
              Review enquiries
            </button>
          </div>
        </section>
      )}

      {overdueOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-red-400 mb-4">⚠️ Overdue — Item Not Returned</h2>
          <div className="space-y-3">
            {overdueOrders.map(order => (
              <div key={order.id} className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName} <span className="text-gray-500">• {order.customerPhone}</span></p>
                  <p className="text-gray-400 text-xs mt-1">{order.items.map(item => `${item.gearName} ×${item.quantity}`).join(', ')}</p>
                  <p className="text-red-400 text-[10px] mt-1">Due: {order.endDate} • {Math.ceil((Date.now() - new Date(order.endDate).getTime()) / 86400000)} days overdue</p>
                </div>
                <button onClick={() => handleReceiveItem(order.id)} className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors whitespace-nowrap">✓ Item Received</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {missingFollowUps.length > 0 && (
        <section className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 sm:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-red-400">🔔 Missing gear — order remains open</h2>
            <p className="mt-1 text-xs text-gray-500">These orders stay active until every item is received. This reminder remains here for staff follow-up.</p>
          </div>
          <div className="space-y-3">
            {missingFollowUps.map(order => (
              <div key={order.id} className="flex flex-col gap-3 rounded-xl border border-red-500/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{order.customerName} <span className="text-gray-500">· {order.customerPhone}</span></p>
                  <p className="mt-1 text-xs text-gray-400">Still out: {getOutstandingOrderItems(order).map(item => `${item.gearName} ×${item.quantity}`).join(', ')}</p>
                  {order.missingNote && <p className="mt-1 text-xs text-red-300">Last note: {order.missingNote}</p>}
                </div>
                <button onClick={() => handleReceiveItem(order.id)} className="rounded-lg bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20">Record follow-up</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {pendingPayment.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">💳 Pending Payments — Items Returned</h2>
          <div className="space-y-3">
            {pendingPayment.map(order => (
              <div key={order.id} className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName} <span className="text-gray-500">• {order.customerPhone}</span></p>
                  <p className="text-gray-400 text-xs mt-1">{order.items.map(item => `${item.gearName} ×${item.quantity}`).join(', ')}</p>
                  <p className="text-yellow-400 text-xs mt-1">Balance due: ₹{getOrderBalance(order).toLocaleString('en-IN')} ({order.days} days)</p>
                </div>
                <button onClick={() => handleSettle(order.id)} className="px-4 py-2 rounded-lg bg-gold/10 text-gold text-xs font-bold hover:bg-gold/20 transition-colors">💰 Payment Received</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">🔥 Active Orders — Items Out</h2>
        {generalActiveOrders.length === 0 ? (
          <p className="text-gray-500 text-sm py-6">{activeOrders.length === 0 ? 'No active orders. All items are back.' : 'No other active orders to show.'}</p>
        ) : (
          <div className="space-y-3">
            {generalActiveOrders.map(order => (
              <div key={order.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName} <span className="text-gray-500">• {order.customerPhone}</span></p>
                  <p className="text-gray-400 text-xs mt-1">{order.items.map(item => `${item.gearName} ×${item.quantity}`).join(', ')}</p>
                  <p className="text-gray-500 text-[10px] mt-1">{order.startDate} → {order.endDate} ({order.days} days) • ₹{order.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <button onClick={() => handleReceiveItem(order.id)} className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors whitespace-nowrap">✓ Item Received</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-detail-title"
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-dark-surface border border-white/10 rounded-2xl p-5 sm:p-6"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 id="dashboard-detail-title" className="text-lg font-bold text-white">{detail.title}</h2>
              <button onClick={() => setDetail(null)} aria-label="Close details" className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            {detail.rows.length === 0 && !detail.quoteRequests?.length && !detail.quotations?.length ? (
              <p className="py-8 text-center text-sm text-gray-500">Nothing to show here yet.</p>
            ) : detail.rows.length > 0 ? (
              <div className="space-y-2">
                {detail.rows.map((row, index) => (
                  <div key={`${row.title}-${index}`} className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{row.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{row.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <p className="text-xs font-semibold text-gold sm:text-right">{row.value}</p>
                      {row.returnOrderId && (
                        <button
                          onClick={() => handleReceiveItem(row.returnOrderId!)}
                          className="rounded-lg bg-orange-500/10 px-3 py-1.5 text-[10px] font-bold text-orange-200 hover:bg-orange-500/20"
                        >Record return</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {detail.quoteRequests?.map(request => (
              <div key={request.id} className="mt-4 flex flex-col gap-3 rounded-xl border border-gold/20 bg-gold/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-xs text-gray-300">
                  <p><span className="font-semibold text-white">{request.customerName}</span> · {request.requestType === 'rental' ? 'Online gear enquiry' : 'Event enquiry'} · {request.status === 'approved' ? 'Approved' : 'Awaiting review'}</p>
                  {request.requestType === 'rental' && (
                    <>
                      <p className="mt-1 text-gray-400">{request.rentalItems?.map(item => `${item.gearName} ×${item.quantity}`).join(', ')}</p>
                      <p className="mt-1 text-gray-500">{request.requestedDate}{request.requestedEndDate ? ` – ${request.requestedEndDate}` : ''}{typeof request.estimatedTotal === 'number' ? ` · Estimate ₹${request.estimatedTotal.toLocaleString('en-IN')}` : ''}</p>
                    </>
                  )}
                  <p className="mt-1 text-gray-500">{request.customerPhone}{request.customerEmail ? ` · ${request.customerEmail}` : ''}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setActiveQuotation({ request }); setDetail(null); }}
                    className="rounded-lg border border-blue-300/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/20"
                  >
                    Create quotation
                  </button>
                  <button
                    onClick={() => navigate('/admin/orders', { state: { quoteRequest: request } })}
                    className="rounded-lg bg-gold px-4 py-2 text-xs font-bold text-obsidian hover:bg-gold-light"
                  >
                    {request.requestType === 'rental' ? 'Review & approve' : 'Convert to order'}
                  </button>
                </div>
              </div>
            ))}
            {detail.quotations?.map(quotation => (
              <div key={quotation.id} className="mt-4 flex flex-col gap-3 rounded-xl border border-blue-300/20 bg-blue-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-300">
                  <span className="font-semibold text-white">{quotation.customerName || 'Unnamed customer'}</span>
                  {' · '}SDM-Q-{quotation.id.toUpperCase()} · {quotation.eventType}
                  {' · '}₹{(quotation.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) - quotation.discount).toLocaleString('en-IN')}
                  {' · '}Updated {new Date(quotation.updatedAt).toLocaleDateString('en-IN')}
                </p>
                <button
                  onClick={() => openSavedQuotation(quotation)}
                  className="rounded-lg border border-blue-300/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/20"
                >
                  View / Edit quotation
                </button>
              </div>
            ))}
          </section>
        </div>
      )}
      {activeQuotation && (
        <QuotationModal
          key={activeQuotation.quotation?.id || activeQuotation.request.id}
          request={activeQuotation.request}
          quotation={activeQuotation.quotation}
          onSaved={reload}
          onClose={() => setActiveQuotation(null)}
        />
      )}
    </div>
  );
};
