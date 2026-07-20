import React, { useState } from 'react';
import { getOrders, getGearInventory, createOrder, markItemsReturned, settleOrder, Order, OrderItem, calculateDays, calculateOrderTotal } from '../store/dataStore';

export const OrdersPage: React.FC = () => {
  const [, setRefresh] = useState(0);
  const reload = () => setRefresh(n => n + 1);
  const [filter, setFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);

  const orders = getOrders();
  const gear = getGearInventory();
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  // ─── Create Order Form State ───
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderType, setOrderType] = useState<'rental' | 'event_booking'>('rental');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [eventType, setEventType] = useState('');
  const [notes, setNotes] = useState('');

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const calculatedTotal = calculateOrderTotal(selectedItems, days);

  const addItemToOrder = (gearId: string) => {
    const item = gear.find(g => g.id === gearId);
    if (!item) return;
    if (selectedItems.find(i => i.gearId === gearId)) return;
    const availQty = item.totalStock - item.currentlyRented;
    if (availQty <= 0) return;
    setSelectedItems([...selectedItems, { gearId: item.id, gearName: item.name, quantity: 1, dailyRate: item.dailyRate }]);
  };

  const updateItemQty = (gearId: string, qty: number) => {
    const item = gear.find(g => g.id === gearId);
    if (!item) return;
    const maxQty = item.totalStock - item.currentlyRented;
    setSelectedItems(selectedItems.map(i => i.gearId === gearId ? { ...i, quantity: Math.min(Math.max(1, qty), maxQty) } : i));
  };

  const removeItemFromOrder = (gearId: string) => {
    setSelectedItems(selectedItems.filter(i => i.gearId !== gearId));
  };

  const handleCreate = () => {
    if (!customerName || !customerPhone || !startDate || !endDate || selectedItems.length === 0) return;
    createOrder({
      type: orderType,
      customerName,
      customerPhone,
      customerEmail,
      items: selectedItems,
      startDate,
      endDate,
      eventType: orderType === 'event_booking' ? eventType : undefined,
      notes: notes || undefined,
    });
    // Reset
    setCustomerName(''); setCustomerPhone(''); setCustomerEmail('');
    setStartDate(''); setEndDate(''); setSelectedItems([]);
    setEventType(''); setNotes('');
    setShowCreate(false);
    reload();
  };

  const handleReceive = (id: string) => { markItemsReturned(id); reload(); };
  const handleSettle = (id: string) => { settleOrder(id); reload(); };

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Active' },
    returned_pending_payment: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Pending Payment' },
    overdue: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Overdue' },
    settled: { bg: 'bg-gray-500/10', text: 'text-gray-400', label: 'Settled' },
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold text-white">Orders</h1>
        <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-xl bg-gold text-obsidian font-bold text-sm">+ Create Order</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'active', 'returned_pending_payment', 'settled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {s === 'all' ? 'All' : s === 'returned_pending_payment' ? 'Pending Payment' : s.charAt(0).toUpperCase() + s.slice(1)}
            {' '}({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {/* Create Order Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-obsidian/90 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowCreate(false)}>
          <div className="bg-dark-surface border border-white/10 rounded-2xl p-6 w-full max-w-2xl my-10" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-6">Create New Order</h2>

            {/* Customer Details */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs text-gold uppercase tracking-wider font-bold">Customer Details</h3>
              <input placeholder="Customer Name *" value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Phone *" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={inputCls} />
                <input placeholder="Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className={inputCls} />
              </div>
              <select value={orderType} onChange={e => setOrderType(e.target.value as any)} className={inputCls + ' appearance-none'}>
                <option value="rental">Gear Rental</option>
                <option value="event_booking">Event Booking</option>
              </select>
              {orderType === 'event_booking' && (
                <input placeholder="Event Type (Wedding, Corporate, etc.)" value={eventType} onChange={e => setEventType(e.target.value)} className={inputCls} />
              )}
            </div>

            {/* Dates */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs text-gold uppercase tracking-wider font-bold">Rental Dates</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Start Date *</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">End Date *</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
                </div>
              </div>
              {days > 0 && <p className="text-gold text-sm font-medium">{days} day{days > 1 ? 's' : ''}</p>}
            </div>

            {/* Select Gear Items */}
            <div className="mb-6">
              <h3 className="text-xs text-gold uppercase tracking-wider font-bold mb-3">Select Items</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {gear.map(g => {
                  const avail = g.totalStock - g.currentlyRented;
                  const isSelected = selectedItems.find(i => i.gearId === g.id);
                  return (
                    <div key={g.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'bg-gold/5 border-gold/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{g.name}</p>
                        <p className="text-gray-500 text-[10px]">{g.brand} • ₹{g.dailyRate}/day • {avail} available</p>
                      </div>
                      {isSelected ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <input
                            type="number" min={1} max={avail}
                            value={isSelected.quantity}
                            onChange={e => updateItemQty(g.id, Number(e.target.value))}
                            className="w-14 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs text-center"
                          />
                          <button onClick={() => removeItemFromOrder(g.id)} className="text-red-400 text-xs px-2">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItemToOrder(g.id)}
                          disabled={avail <= 0}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${avail > 0 ? 'bg-gold/10 text-gold hover:bg-gold/20' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
                        >{avail > 0 ? '+ Add' : 'N/A'}</button>
                      )}
                    </div>
                  );
                })}
                {gear.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No gear items. Add items in Gear page first.</p>}
              </div>
            </div>

            {/* Selected summary */}
            {selectedItems.length > 0 && (
              <div className="mb-6 p-4 bg-gold/5 border border-gold/20 rounded-xl">
                <p className="text-[10px] text-gold uppercase tracking-wider font-bold mb-2">Order Summary</p>
                {selectedItems.map(item => (
                  <div key={item.gearId} className="flex justify-between text-sm text-gray-300 py-1">
                    <span>{item.gearName} ×{item.quantity}</span>
                    <span>₹{(item.dailyRate * item.quantity * days).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-white font-bold text-base mt-2 pt-2 border-t border-gold/20">
                  <span>Total ({days} days)</span>
                  <span className="text-gold">₹{calculatedTotal.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Notes */}
            <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className={inputCls + ' resize-none mb-6'} rows={2} />

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={!customerName || !customerPhone || !startDate || !endDate || selectedItems.length === 0} className="flex-1 py-3 rounded-xl bg-gold text-obsidian font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed">
                Create Order
              </button>
              <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500"><p>No orders found.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(order => {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = order.status === 'active' && order.endDate < today;
            const cfg = isOverdue ? statusConfig.overdue : statusConfig[order.status] || statusConfig.active;

            return (
              <div key={order.id} className={`border rounded-2xl p-5 ${isOverdue ? 'bg-red-500/5 border-red-500/10' : 'bg-white/[0.03] border-white/5'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-white font-semibold">{order.customerName}</h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${cfg.bg} ${cfg.text}`}>
                        {isOverdue ? 'Overdue' : cfg.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">📞 {order.customerPhone} {order.customerEmail && `• ${order.customerEmail}`}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {order.items.map(i => `${i.gearName} ×${i.quantity}`).join(', ')}
                    </p>
                    {order.notes && <p className="text-gray-600 text-xs mt-1 italic">Note: {order.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gold font-bold text-lg">₹{order.totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{order.startDate} → {order.endDate}</p>
                    <p className="text-[10px] text-gray-600">{order.days} day{order.days > 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
                  {order.status === 'active' && (
                    <button onClick={() => handleReceive(order.id)} className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors">
                      ✓ Item Received
                    </button>
                  )}
                  {order.status === 'returned_pending_payment' && (
                    <button onClick={() => handleSettle(order.id)} className="px-4 py-2 rounded-lg bg-gold/10 text-gold text-xs font-bold hover:bg-gold/20 transition-colors">
                      💰 Order Settled
                    </button>
                  )}
                  {order.status === 'settled' && (
                    <span className="px-4 py-2 text-xs text-gray-500">✓ Completed on {order.settledAt ? new Date(order.settledAt).toLocaleDateString() : '—'}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
