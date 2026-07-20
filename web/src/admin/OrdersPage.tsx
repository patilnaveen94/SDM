import React, { useState } from 'react';
import { getOrders, updateOrderStatus, addOrder, Order } from '../store/dataStore';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState(getOrders());
  const [filter, setFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newOrder, setNewOrder] = useState({ customerName: '', customerPhone: '', customerEmail: '', type: 'rental' as 'rental' | 'event_booking', eventType: '', startDate: '', endDate: '', totalAmount: 0, notes: '' });

  const refresh = () => setOrders(getOrders());

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleStatusChange = (id: string, status: Order['status']) => {
    updateOrderStatus(id, status);
    refresh();
  };

  const handleCreate = () => {
    addOrder({
      ...newOrder,
      status: 'pending',
      items: [],
    });
    refresh();
    setShowCreate(false);
    setNewOrder({ customerName: '', customerPhone: '', customerEmail: '', type: 'rental', eventType: '', startDate: '', endDate: '', totalAmount: 0, notes: '' });
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    confirmed: 'bg-blue-500/10 text-blue-400',
    active: 'bg-green-500/10 text-green-400',
    returned: 'bg-purple-500/10 text-purple-400',
    completed: 'bg-gray-500/10 text-gray-400',
    cancelled: 'bg-red-500/10 text-red-400',
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold text-white">Orders</h1>
        <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-xl bg-gold text-obsidian font-bold text-sm">+ New Order</button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'active', 'returned', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)} {s !== 'all' ? `(${orders.filter(o => o.status === s).length})` : `(${orders.length})`}
          </button>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-dark-surface border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">Create Order</h2>
            <div className="space-y-3">
              <input placeholder="Customer Name" value={newOrder.customerName} onChange={e => setNewOrder({...newOrder, customerName: e.target.value})} className={inputCls} />
              <input placeholder="Phone" value={newOrder.customerPhone} onChange={e => setNewOrder({...newOrder, customerPhone: e.target.value})} className={inputCls} />
              <input placeholder="Email" value={newOrder.customerEmail} onChange={e => setNewOrder({...newOrder, customerEmail: e.target.value})} className={inputCls} />
              <select value={newOrder.type} onChange={e => setNewOrder({...newOrder, type: e.target.value as any})} className={inputCls + ' appearance-none'}>
                <option value="rental">Gear Rental</option><option value="event_booking">Event Booking</option>
              </select>
              {newOrder.type === 'event_booking' && <input placeholder="Event Type" value={newOrder.eventType} onChange={e => setNewOrder({...newOrder, eventType: e.target.value})} className={inputCls} />}
              <div className="grid grid-cols-2 gap-3">
                <input type="date" placeholder="Start" value={newOrder.startDate} onChange={e => setNewOrder({...newOrder, startDate: e.target.value})} className={inputCls} />
                <input type="date" placeholder="End" value={newOrder.endDate} onChange={e => setNewOrder({...newOrder, endDate: e.target.value})} className={inputCls} />
              </div>
              <input type="number" placeholder="Total Amount (₹)" value={newOrder.totalAmount || ''} onChange={e => setNewOrder({...newOrder, totalAmount: Number(e.target.value)})} className={inputCls} />
              <textarea placeholder="Notes" value={newOrder.notes} onChange={e => setNewOrder({...newOrder, notes: e.target.value})} className={inputCls + ' resize-none'} rows={2} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-gold text-obsidian font-bold text-sm">Create</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500"><p>No orders found.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(order => (
            <div key={order.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-semibold">{order.customerName}</h3>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${statusColors[order.status]}`}>{order.status}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {order.type === 'rental' ? '🎥 Gear Rental' : '📸 ' + order.eventType} • {order.customerPhone}
                  </p>
                  {order.items && order.items.length > 0 && (
                    <p className="text-gray-400 text-xs mt-1">Items: {order.items.map(i => i.gearName).join(', ')}</p>
                  )}
                  {order.notes && <p className="text-gray-500 text-xs mt-1 italic">{order.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-gold font-bold">₹{order.totalAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{order.startDate} → {order.endDate || '—'}</p>
                </div>
              </div>

              {/* Status actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatusChange(order.id, 'confirmed')} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium">Confirm</button>
                    <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium">Cancel</button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => handleStatusChange(order.id, 'active')} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium">Mark as Active (Handed Out)</button>
                )}
                {order.status === 'active' && (
                  <button onClick={() => handleStatusChange(order.id, order.type === 'rental' ? 'returned' : 'completed')} className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-medium">
                    {order.type === 'rental' ? '✓ Received Back' : '✓ Mark Complete'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
