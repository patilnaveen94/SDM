import React from 'react';
import { getGearInventory, getOrders, getActiveOrders, getUpcomingOrders } from '../store/dataStore';

export const DashboardPage: React.FC = () => {
  const gear = getGearInventory();
  const orders = getOrders();
  const activeOrders = getActiveOrders();
  const upcomingOrders = getUpcomingOrders();

  const totalRevenue = orders.filter(o => o.status === 'completed' || o.status === 'returned').reduce((s, o) => s + o.totalAmount, 0);
  const itemsOut = gear.reduce((s, g) => s + g.currentlyRented, 0);

  const stats = [
    { label: 'Total Gear Items', value: gear.length, icon: '🎥' },
    { label: 'Items Currently Out', value: itemsOut, icon: '📦' },
    { label: 'Active Orders', value: activeOrders.length, icon: '🔥' },
    { label: 'Upcoming Orders', value: upcomingOrders.length, icon: '📅' },
    { label: 'Total Orders', value: orders.length, icon: '📋' },
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-white mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active Rentals */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Active Rentals (Items Out)</h2>
        {activeOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No active rentals right now.</p>
        ) : (
          <div className="space-y-3">
            {activeOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName}</p>
                  <p className="text-gray-500 text-xs">{order.items?.map(i => i.gearName).join(', ') || order.eventType}</p>
                </div>
                <div className="text-right">
                  <p className="text-gold font-bold text-sm">₹{order.totalAmount.toLocaleString()}</p>
                  <p className="text-gray-500 text-[10px]">Due: {order.endDate || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Upcoming Orders</h2>
        {upcomingOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming orders.</p>
        ) : (
          <div className="space-y-3">
            {upcomingOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName}</p>
                  <p className="text-gray-500 text-xs">{order.type === 'rental' ? 'Gear Rental' : 'Event: ' + order.eventType}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">{order.status}</span>
                  <p className="text-gray-500 text-[10px] mt-1">{order.startDate}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
