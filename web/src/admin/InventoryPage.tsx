import React, { useState } from 'react';
import { getGearInventoryBreakdown, getOrders, isFutureOrderStart } from '../store/dataStore';

type InventoryFilter = 'all' | 'available' | 'out' | 'blocked' | 'missing';

export const InventoryPage: React.FC = () => {
  const [filter, setFilter] = useState<InventoryFilter>('all');
  const inventory = getGearInventoryBreakdown();
  const allOrders = getOrders();
  const orders = allOrders.filter(order => order.type === 'rental' && order.status === 'active' && isFutureOrderStart(order));
  const missingOrders = allOrders.filter(order => order.type === 'rental' && (order.status === 'returned_pending_payment' || order.status === 'settled') && (order.missingItems?.length || 0) > 0);
  const totals = inventory.reduce((summary, item) => ({
    available: summary.available + item.available,
    out: summary.out + item.out,
    blocked: summary.blocked + item.blocked,
    missing: summary.missing + item.missing,
  }), { available: 0, out: 0, blocked: 0, missing: 0 });

  const filteredInventory = inventory.filter(item => {
    if (filter === 'available') return item.available > 0;
    if (filter === 'out') return item.out > 0;
    if (filter === 'blocked') return item.blocked > 0;
    if (filter === 'missing') return item.missing > 0;
    return true;
  });

  const filterOptions: { key: InventoryFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All gear', count: inventory.length },
    { key: 'available', label: 'Available', count: totals.available },
    { key: 'out', label: 'Currently out', count: totals.out },
    { key: 'missing', label: 'Missing / written off', count: totals.missing },
    { key: 'blocked', label: 'Blocked for future orders', count: totals.blocked },
  ];

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-white mb-2">Inventory</h1>
      <p className="text-gray-500 text-sm mb-8">Track available equipment, active rentals, and upcoming reservations.</p>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: 'Available now', value: totals.available, color: 'text-green-400' },
          { label: 'Currently out', value: totals.out, color: 'text-orange-400' },
          { label: 'Missing / written off', value: totals.missing, color: 'text-red-400' },
          { label: 'Blocked for future orders', value: totals.blocked, color: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label} units</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map(option => (
          <button
            key={option.key}
            onClick={() => setFilter(option.key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filter === option.key ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {filteredInventory.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No gear matches this inventory view.</div>
      ) : (
        <div className="space-y-3">
          {filteredInventory.map(({ gear, available, out, blocked, missing }) => {
            const futureReservations = orders.flatMap(order => {
              const quantity = order.items
                .filter(item => item.gearId === gear.id)
                .reduce((sum, item) => sum + item.quantity, 0);
              return quantity > 0 ? [{ order, quantity }] : [];
            });

            return (
              <article key={gear.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-white font-semibold">{gear.name}</h2>
                    <p className="text-gray-500 text-xs mt-1">{gear.brand} · {gear.category} · {gear.totalStock} total units</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-center">
                    <div><p className="text-green-400 font-bold">{available}</p><p className="text-[10px] text-gray-500">Available</p></div>
                    <div><p className="text-orange-400 font-bold">{out}</p><p className="text-[10px] text-gray-500">Out</p></div>
                    <div><p className="text-blue-400 font-bold">{blocked}</p><p className="text-[10px] text-gray-500">Blocked</p></div>
                    <div><p className="text-red-400 font-bold">{missing}</p><p className="text-[10px] text-gray-500">Missing</p></div>
                  </div>
                </div>
                {futureReservations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-wider text-blue-300 font-bold mb-2">Upcoming reservations</p>
                    <div className="space-y-1">
                      {futureReservations.map(({ order, quantity }) => (
                        <p key={order.id} className="text-xs text-gray-400">
                          {order.startDate} – {order.endDate} · {quantity} unit{quantity === 1 ? '' : 's'} · {order.customerName}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {missingOrders.some(order => order.missingItems?.some(item => item.gearId === gear.id)) && (
                  <div className="mt-4 border-t border-red-500/10 pt-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-300">Missing / written-off unit history</p>
                    <div className="space-y-1">
                      {missingOrders.flatMap(order => (order.missingItems || [])
                        .filter(item => item.gearId === gear.id)
                        .map(item => (
                          <p key={`${order.id}-${item.gearId}`} className="text-xs text-gray-400">
                            {item.quantity} unit{item.quantity === 1 ? '' : 's'} · {order.customerName} · Order {order.id} · {order.endDate}
                            {order.missingNote && ` · ${order.missingNote}`}
                          </p>
                        )))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
