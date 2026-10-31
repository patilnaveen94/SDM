import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getGearInventoryBreakdown,
  getOrders,
  getActiveOrders,
  getOverdueOrders,
  getPendingPaymentOrders,
  getPartiallyReturnedOrders,
  getOutstandingOrderItems,
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

  const inventory = getGearInventoryBreakdown();
  const orders = getOrders();
  const activeOrders = getActiveOrders();
  const overdueOrders = getOverdueOrders();
  const pendingPayment = getPendingPaymentOrders();
  const partiallyReturned = getPartiallyReturnedOrders();
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
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const rentOutOrders = activeOrders.filter(order => order.type === 'rental' && !isFutureOrderStart(order));
  const deliveryToday = activeOrders.filter(order => order.type === 'rental' && order.startDate === todayString);
  const receiveToday = activeOrders.filter(order => order.type === 'rental' && order.endDate === todayString);
  const pendingAmount = [...activeOrders, ...pendingPayment].reduce((sum, order) => sum + order.totalAmount, 0);
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
        description: `${order.status === 'partially_returned' ? `Still out: ${getOutstandingOrderItems(order).map(item => `${item.gearName} ×${item.quantity}`).join(', ')} · ` : ''}${order.missingItems?.length ? `Missing: ${order.missingItems.map(item => `${item.gearName} ×${item.quantity}`).join(', ')} · ` : ''}${order.items.map(item => `${item.gearName} ×${item.quantity}`).join(', ')} · ${order.startDate} – ${order.endDate}${order.missingNote ? ` · Closeout note: ${order.missingNote}` : order.partialReturns?.length ? ` · Note: ${order.partialReturns[order.partialReturns.length - 1].note}` : ''}`,
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
    title: 'Customer enquiries & quotations',
    rows: openQuotes.map(request => ({
      title: request.customerName,
      description: `${request.eventType} · Requested for ${request.requestedDate}${request.message ? ` · ${request.message}` : ''}`,
      value: `${request.customerPhone}${request.customerEmail ? ` · ${request.customerEmail}` : ''}`,
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
    { label: 'Missing / Written Off', value: missingUnits, icon: '⚠️', color: 'text-red-300', onClick: () => showInventory('Missing or written-off gear', 'missing') },
    { label: 'Customers', value: customers.length, icon: '👥', color: 'text-cyan-400', onClick: showCustomers },
    { label: 'New Quotations', value: openQuotes.length, icon: '🧾', color: 'text-amber-400', onClick: showQuotes },
    { label: 'Saved Quotations', value: savedQuotations.length, icon: '📄', color: 'text-blue-300', onClick: showSavedQuotations },
    { label: 'Total Gear Items', value: inventory.length, icon: '🎬', color: 'text-gray-300', onClick: showAllGear },
  ];

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

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-10">
        {stats.map(stat => (
          <button
            type="button"
            key={stat.label}
            onClick={stat.onClick}
            aria-label={`View details for ${stat.label}`}
            className="text-left bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-gold/40 hover:bg-white/[0.05] transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            <div className="text-[10px] text-gray-600 mt-2">Click to view details</div>
          </button>
        ))}
      </div>

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

      {pendingPayment.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">💳 Pending Payments — Items Returned</h2>
          <div className="space-y-3">
            {pendingPayment.map(order => (
              <div key={order.id} className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName} <span className="text-gray-500">• {order.customerPhone}</span></p>
                  <p className="text-gray-400 text-xs mt-1">{order.items.map(item => `${item.gearName} ×${item.quantity}`).join(', ')}</p>
                  <p className="text-yellow-400 text-xs mt-1">Amount: ₹{order.totalAmount.toLocaleString('en-IN')} ({order.days} days)</p>
                </div>
                <button onClick={() => handleSettle(order.id)} className="px-4 py-2 rounded-lg bg-gold/10 text-gold text-xs font-bold hover:bg-gold/20 transition-colors">💰 Payment Received</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">🔥 Active Orders — Items Out</h2>
        {activeOrders.length === 0 ? (
          <p className="text-gray-500 text-sm py-6">No active orders. All items are back.</p>
        ) : (
          <div className="space-y-3">
            {activeOrders.filter(order => !overdueOrders.find(overdue => overdue.id === order.id)).map(order => (
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
                <p className="text-xs text-gray-300"><span className="font-semibold text-white">{request.customerName}</span> · Prepare a priced quotation or convert this enquiry into an order.</p>
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
                    Convert to order
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
