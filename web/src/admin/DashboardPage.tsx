import React, { useState } from 'react';
import { getGearInventory, getOrders, getActiveOrders, getOverdueOrders, getPendingPaymentOrders, markItemsReturned, settleOrder } from '../store/dataStore';

export const DashboardPage: React.FC = () => {
  const [, setRefresh] = useState(0);
  const reload = () => setRefresh(n => n + 1);

  const gear = getGearInventory();
  const orders = getOrders();
  const activeOrders = getActiveOrders();
  const overdueOrders = getOverdueOrders();
  const pendingPayment = getPendingPaymentOrders();
  const settled = orders.filter(o => o.status === 'settled');

  const totalRevenue = settled.reduce((s, o) => s + o.totalAmount, 0);
  const pendingAmount = [...activeOrders, ...pendingPayment].reduce((s, o) => s + o.totalAmount, 0);
  const itemsOut = gear.reduce((s, g) => s + g.currentlyRented, 0);

  const handleReceiveItem = (id: string) => { markItemsReturned(id); reload(); };
  const handleSettle = (id: string) => { settleOrder(id); reload(); };

  const stats = [
    { label: 'Items Currently Out', value: itemsOut, icon: '📦', color: 'text-orange-400' },
    { label: 'Active Orders', value: activeOrders.length, icon: '🔥', color: 'text-green-400' },
    { label: 'Overdue Returns', value: overdueOrders.length, icon: '⚠️', color: 'text-red-400' },
    { label: 'Pending Payments', value: pendingPayment.length, icon: '💳', color: 'text-yellow-400' },
    { label: 'Total Gear Items', value: gear.length, icon: '🎥', color: 'text-blue-400' },
    { label: 'Revenue Collected', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: 'text-gold' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Overview of your business at a glance</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending revenue alert */}
      {pendingAmount > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
          <p className="text-yellow-400 font-medium text-sm">💰 Pending collections: ₹{pendingAmount.toLocaleString()}</p>
        </div>
      )}

      {/* Overdue Orders — needs attention */}
      {overdueOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-red-400 mb-4">⚠️ Overdue — Item Not Returned</h2>
          <div className="space-y-3">
            {overdueOrders.map(order => (
              <div key={order.id} className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName} <span className="text-gray-500">• {order.customerPhone}</span></p>
                  <p className="text-gray-400 text-xs mt-1">{order.items.map(i => `${i.gearName} ×${i.quantity}`).join(', ')}</p>
                  <p className="text-red-400 text-[10px] mt-1">Due: {order.endDate} • {Math.ceil((Date.now() - new Date(order.endDate).getTime()) / 86400000)} days overdue</p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => handleReceiveItem(order.id)} className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors">✓ Item Received</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Payments — items returned but not paid */}
      {pendingPayment.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">💳 Pending Payments — Items Returned</h2>
          <div className="space-y-3">
            {pendingPayment.map(order => (
              <div key={order.id} className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName} <span className="text-gray-500">• {order.customerPhone}</span></p>
                  <p className="text-gray-400 text-xs mt-1">{order.items.map(i => `${i.gearName} ×${i.quantity}`).join(', ')}</p>
                  <p className="text-yellow-400 text-xs mt-1">Amount: ₹{order.totalAmount.toLocaleString()} ({order.days} days)</p>
                </div>
                <button onClick={() => handleSettle(order.id)} className="px-4 py-2 rounded-lg bg-gold/10 text-gold text-xs font-bold hover:bg-gold/20 transition-colors">💰 Payment Received</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Orders — currently out */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">🔥 Active Orders — Items Out</h2>
        {activeOrders.length === 0 ? (
          <p className="text-gray-500 text-sm py-6">No active orders. All items are back.</p>
        ) : (
          <div className="space-y-3">
            {activeOrders.filter(o => !overdueOrders.find(ov => ov.id === o.id)).map(order => (
              <div key={order.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName} <span className="text-gray-500">• {order.customerPhone}</span></p>
                  <p className="text-gray-400 text-xs mt-1">{order.items.map(i => `${i.gearName} ×${i.quantity}`).join(', ')}</p>
                  <p className="text-gray-500 text-[10px] mt-1">{order.startDate} → {order.endDate} ({order.days} days) • ₹{order.totalAmount.toLocaleString()}</p>
                </div>
                <button onClick={() => handleReceiveItem(order.id)} className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors whitespace-nowrap">✓ Item Received</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
