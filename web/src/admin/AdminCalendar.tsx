import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderBalance, Order } from '../store/dataStore';

interface DayActivity {
  order: Order;
  booked: boolean;
  gearOut: boolean;
  dueBack: boolean;
  returnedItems: string[];
  payments: Array<{ amount: number; paidAt: string }>;
}

const formatDateKey = (date: Date) => (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function getDayActivities(orders: Order[], date: string): DayActivity[] {
  return orders.flatMap(order => {
    const booked = order.startDate <= date && order.endDate >= date;
    const gearOut = order.type === 'rental' && order.startDate === date;
    const dueBack = order.type === 'rental' && order.endDate === date;
    const returnedItems = (order.partialReturns || [])
      .filter(entry => entry.returnedAt.slice(0, 10) === date)
      .flatMap(entry => entry.items.map(item => `${item.gearName} ×${item.quantity}`));
    const hasRecordedFinalReturn = !order.partialReturns?.length && order.returnedAt?.slice(0, 10) === date;
    if (hasRecordedFinalReturn) {
      returnedItems.push(...order.items.map(item => `${item.gearName} ×${item.quantity}`));
    }
    const payments = (order.paymentHistory || [])
      .filter(payment => payment.paidAt.slice(0, 10) === date);

    return booked || gearOut || dueBack || returnedItems.length || payments.length
      ? [{ order, booked, gearOut, dueBack, returnedItems, payments }]
      : [];
  });
}

export const AdminCalendar: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(1 - firstOfMonth.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const key = formatDateKey(date);
      return {
        date,
        key,
        activities: getDayActivities(orders, key),
      };
    });
  }, [orders, visibleMonth]);
  const selectedActivities = useMemo(() => getDayActivities(orders, selectedDate), [orders, selectedDate]);

  const moveMonth = (amount: number) => {
    setVisibleMonth(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };
  const showToday = () => {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(formatDateKey(today));
  };

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6" aria-label="Order and gear activity calendar">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-heading font-bold text-white">Bookings &amp; gear calendar</h2>
          <p className="mt-1 text-xs text-gray-500">Daily bookings, gear going out, and returns</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={showToday} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-gold/40 hover:text-gold">
            Today
          </button>
          <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} className="h-9 w-9 rounded-lg border border-white/10 text-gray-300 hover:border-gold/40 hover:text-gold">
            ‹
          </button>
          <h3 className="min-w-32 text-center text-sm font-semibold text-white">
            {visibleMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h3>
          <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} className="h-9 w-9 rounded-lg border border-white/10 text-gray-300 hover:border-gold/40 hover:text-gold">
            ›
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map(({ date, key, activities }) => {
          const gearOutCount = activities.filter(activity => activity.gearOut).length;
          const dueBackCount = activities.filter(activity => activity.dueBack).length;
          const bookedCount = activities.filter(activity => activity.booked).length;
          const paymentDueCount = activities.filter(activity => getOrderBalance(activity.order) > 0).length;
          const paymentReceivedCount = activities.filter(activity => activity.payments.length > 0).length;
          const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
          const isToday = key === formatDateKey(new Date());
          return (
            <button
              type="button"
              key={key}
              onClick={() => setSelectedDate(key)}
              aria-pressed={key === selectedDate}
              aria-label={`${date.toLocaleDateString('en-IN', { dateStyle: 'full' })}: ${bookedCount} bookings, ${gearOutCount} gear going out, ${dueBackCount} due back`}
              className={`min-h-[76px] rounded-lg border p-1.5 text-left transition-colors sm:min-h-[92px] sm:p-2 ${
                key === selectedDate ? 'border-gold/60 bg-gold/10' : 'border-white/5 bg-black/10 hover:border-white/20'
              } ${isCurrentMonth ? 'text-gray-200' : 'text-gray-600'} ${isToday ? 'ring-1 ring-gold/40' : ''}`}
            >
              <span className={`text-xs font-semibold ${isToday ? 'text-gold' : ''}`}>{date.getDate()}</span>
              <span className="mt-1 block space-y-0.5 text-[9px] leading-tight sm:text-[10px]">
                {gearOutCount > 0 && <span className="block truncate text-blue-300">Out {gearOutCount}</span>}
                {dueBackCount > 0 && <span className="block truncate text-green-300">In {dueBackCount}</span>}
                {bookedCount > 0 && <span className="block truncate text-amber-200">Booked {bookedCount}</span>}
                {paymentDueCount > 0 && <span className="block truncate text-purple-300">Pay {paymentDueCount}</span>}
                {paymentReceivedCount > 0 && <span className="block truncate text-emerald-300">Paid {paymentReceivedCount}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/5 pt-4 text-[10px] text-gray-400 sm:text-xs" aria-label="Calendar legend">
        <span><span className="mr-1 text-blue-300">●</span>Gear going out</span>
        <span><span className="mr-1 text-green-300">●</span>Due back</span>
        <span><span className="mr-1 text-amber-200">●</span>Active booking</span>
        <span><span className="mr-1 text-purple-300">●</span>Balance due</span>
      </div>

      <div className="mt-5 border-t border-white/5 pt-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">{formatDate(selectedDate)} activity</h3>
          <span className="text-xs text-gray-500">{selectedActivities.length} order{selectedActivities.length === 1 ? '' : 's'}</span>
        </div>
        {selectedActivities.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-gray-500">No bookings or gear movements for this day.</p>
        ) : (
          <div className="space-y-2">
            {selectedActivities.map(({ order, booked, gearOut, dueBack, returnedItems, payments }) => (
              <div key={order.id} className="rounded-xl border border-white/5 bg-black/10 p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{order.customerName} <span className="text-xs font-normal text-gray-500">· {order.type === 'rental' ? 'Rental' : 'Event booking'}</span></p>
                  <p className="mt-1 text-xs text-gray-400">{order.items.map(item => `${item.gearName} ×${item.quantity}`).join(', ')}</p>
                  <p className="mt-1 text-[10px] text-gray-500">{formatDate(order.startDate)} – {formatDate(order.endDate)} · {order.status.replace(/_/g, ' ')}</p>
                  {(() => {
                    const balance = getOrderBalance(order);
                    const today = formatDateKey(new Date());
                    const fulfillment = order.status === 'settled'
                      ? 'Completed'
                      : order.status === 'returned_pending_payment'
                        ? 'Gear returned · payment outstanding'
                        : order.status === 'partially_returned'
                          ? 'Partially returned · still in progress'
                          : order.endDate < today
                            ? 'Overdue · gear not fully returned'
                            : order.startDate > today
                              ? 'Upcoming · not started'
                              : 'In progress · gear not fully returned';
                    return (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className={`rounded-full px-2 py-1 text-[10px] ${order.status === 'settled' ? 'bg-green-400/10 text-green-200' : order.status === 'partially_returned' ? 'bg-orange-400/10 text-orange-200' : order.endDate < today ? 'bg-red-400/10 text-red-200' : 'bg-yellow-400/10 text-yellow-200'}`}>
                          {fulfillment}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-[10px] ${balance > 0 ? 'bg-purple-400/10 text-purple-200' : 'bg-green-400/10 text-green-200'}`}>
                          {balance > 0 ? `Payment pending · ₹${balance.toLocaleString('en-IN')} due` : 'Payment complete'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div className="mt-2 flex shrink-0 flex-wrap gap-1.5 sm:mt-0 sm:justify-end">
                  {booked && <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] text-amber-200">Booked</span>}
                  {gearOut && <span className="rounded-full bg-blue-400/10 px-2 py-1 text-[10px] text-blue-200">Gear out</span>}
                  {dueBack && <span className="rounded-full bg-green-400/10 px-2 py-1 text-[10px] text-green-200">Due back</span>}
                  {returnedItems.length > 0 && <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-200">Received: {returnedItems.join(', ')}</span>}
                  {payments.map((payment, index) => <span key={`${payment.paidAt}-${index}`} className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-200">Payment received · ₹{payment.amount.toLocaleString('en-IN')}</span>)}
                  <Link to="/admin/orders" className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-gray-300 hover:border-gold/40 hover:text-gold">View orders</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
