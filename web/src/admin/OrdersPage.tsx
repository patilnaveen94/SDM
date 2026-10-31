import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getOrders, getGearInventory, getOutstandingOrderItems, createOrder, markItemsPartiallyReturned, markItemsReturned, settleOrder,
  Order, OrderItem, QuoteRequest, calculateDays, calculateEndDateTime, calculateOrderTotal, markQuoteRequestConverted,
  searchCustomersByName, saveCustomerProfile, CustomerProfile,
} from '../store/dataStore';
import { InvoiceModal } from './InvoiceModal';

export const OrdersPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [, setRefresh] = useState(0);
  const reload = () => setRefresh(n => n + 1);
  const [filter, setFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);

  const orders = getOrders();
  const gear = getGearInventory();
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  // ─── Form State ───────────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAadhaar, setCustomerAadhaar] = useState('');
  const [customerPan, setCustomerPan] = useState('');
  const [orderType, setOrderType] = useState<'rental' | 'event_booking'>('rental');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('18:00');
  const [rentalPeriods, setRentalPeriods] = useState(1);
  const [quoteRequestId, setQuoteRequestId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [eventType, setEventType] = useState('');
  const [notes, setNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnNote, setReturnNote] = useState('');
  const [returnError, setReturnError] = useState('');

  // ─── Customer Autocomplete State ──────────────────────────────────────────
  const [nameSuggestions, setNameSuggestions] = useState<CustomerProfile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // ─── Save Customer Prompt ─────────────────────────────────────────────────
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  const selectedTier = selectedItems.length > 0
    ? gear.find(item => item.id === selectedItems[0].gearId)?.rentalTier || 'professional'
    : 'professional';
  const rentalHoursPerPeriod: 12 | 24 = selectedTier === 'hobbyist' ? 24 : 12;
  const rentalEnd = startDate ? calculateEndDateTime(startDate, startTime, rentalPeriods * rentalHoursPerPeriod) : null;
  const orderEndDate = orderType === 'rental' ? rentalEnd?.endDate || '' : endDate;
  const orderEndTime = orderType === 'rental' ? rentalEnd?.endTime || '' : endTime;
  const days = orderType === 'rental'
    ? rentalPeriods
    : startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const calculatedTotal = calculateOrderTotal(selectedItems, days);
  const appliedDiscount = Math.min(Math.max(0, discountAmount), calculatedTotal);
  const orderTotal = calculatedTotal - appliedDiscount;

  useEffect(() => {
    const state = location.state as { quoteRequest?: QuoteRequest } | null;
    const quote = state?.quoteRequest;
    if (!quote) return;
    setCustomerName(quote.customerName);
    setCustomerPhone(quote.customerPhone);
    setCustomerEmail(quote.customerEmail);
    setOrderType('event_booking');
    setEventType(quote.eventType);
    setNotes(quote.message);
    setStartDate(quote.requestedDate);
    setEndDate(quote.requestedDate);
    setStartTime('09:00');
    setEndTime('18:00');
    setQuoteRequestId(quote.id);
    setShowCreate(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  // Handle name input change — search for suggestions
  const handleNameChange = (val: string) => {
    setCustomerName(val);
    if (val.length >= 2) {
      const results = searchCustomersByName(val);
      setNameSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Fill form from saved customer profile
  const fillFromProfile = (profile: CustomerProfile) => {
    setCustomerName(profile.name);
    setCustomerPhone(profile.phone);
    setCustomerEmail(profile.email);
    setCustomerAadhaar(profile.aadhaar || '');
    setCustomerPan(profile.pan || '');
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        nameInputRef.current && !nameInputRef.current.contains(e.target as Node) &&
        suggestionRef.current && !suggestionRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addItemToOrder = (gearId: string) => {
    const item = gear.find(g => g.id === gearId);
    if (!item) return;
    if (selectedItems.find(i => i.gearId === gearId)) return;
    const itemTier = item.rentalTier || 'professional';
    const existingTier = selectedItems.length > 0
      ? gear.find(g => g.id === selectedItems[0].gearId)?.rentalTier || 'professional'
      : itemTier;
    if (itemTier !== existingTier) return;
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

  const resetForm = () => {
    setCustomerName(''); setCustomerPhone(''); setCustomerEmail('');
    setCustomerAadhaar(''); setCustomerPan('');
    setStartDate(''); setStartTime('09:00'); setEndDate(''); setEndTime('18:00'); setRentalPeriods(1);
    setSelectedItems([]); setEventType(''); setNotes(''); setDiscountAmount(0);
    setQuoteRequestId(null);
  };

  const closeCreate = () => {
    setShowCreate(false);
    resetForm();
  };

  const handleCreate = () => {
    if (!customerName || !customerPhone || !startDate || !orderEndDate || selectedItems.length === 0) return;
    const order = createOrder({
      type: orderType,
      customerName,
      customerPhone,
      customerEmail,
      customerAadhaar: customerAadhaar || undefined,
      customerPan: customerPan || undefined,
      items: selectedItems,
      startDate,
      startTime: startTime || undefined,
      endDate: orderEndDate,
      endTime: orderEndTime || undefined,
      eventType: orderType === 'event_booking' ? eventType : undefined,
      notes: notes || undefined,
      discountAmount: appliedDiscount,
      rentalHoursPerPeriod: orderType === 'rental' ? rentalHoursPerPeriod : undefined,
    });
    if (quoteRequestId) markQuoteRequestConverted(quoteRequestId, order.id);
    setQuoteRequestId(null);
    setLastCreatedOrder(order);
    setShowCreate(false);
    setShowSavePrompt(true);
    resetForm();
    reload();
  };

  const handleSaveCustomer = () => {
    if (!lastCreatedOrder) return;
    saveCustomerProfile({
      name: lastCreatedOrder.customerName,
      phone: lastCreatedOrder.customerPhone,
      email: lastCreatedOrder.customerEmail,
      aadhaar: lastCreatedOrder.customerAadhaar,
      pan: lastCreatedOrder.customerPan,
    });
    setShowSavePrompt(false);
    setLastCreatedOrder(null);
  };

  const openPartialReturn = (order: Order) => {
    setReturnOrder(order);
    setReturnQuantities(Object.fromEntries(getOutstandingOrderItems(order).map(item => [item.gearId, 0])));
    setReturnNote('');
    setReturnError('');
  };

  useEffect(() => {
    const state = location.state as { returnOrderId?: string } | null;
    if (!state?.returnOrderId) return;
    const order = getOrders().find(candidate => candidate.id === state.returnOrderId);
    if (order && (order.status === 'active' || order.status === 'partially_returned')) {
      openPartialReturn(order);
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);
  const handlePartialReturn = (closeWithMissingItems = false) => {
    if (!returnOrder) return;
    const returnedItems = Object.entries(returnQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([gearId, quantity]) => ({ gearId, quantity }));
    const hasPreviouslyReturnedItems = Object.values(returnOrder.returnedItems || {}).some(quantity => quantity > 0);
    if (returnedItems.length === 0 && !(closeWithMissingItems && hasPreviouslyReturnedItems)) {
      setReturnError('Enter the quantity received for at least one item.');
      return;
    }
    if (!returnNote.trim()) {
      setReturnError('Add a note about items returned or still missing.');
      return;
    }
    const updated = markItemsPartiallyReturned(returnOrder.id, returnedItems, returnNote, closeWithMissingItems);
    if (!updated) {
      setReturnError('Could not save this return. Check quantities and try again.');
      return;
    }
    setReturnOrder(null);
    reload();
  };
  const handleSettle = (id: string) => { settleOrder(id); reload(); };

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Active' },
    partially_returned: { bg: 'bg-orange-500/10', text: 'text-orange-300', label: 'Partially Returned' },
    returned_pending_payment: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Pending Payment' },
    overdue: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Overdue' },
    settled: { bg: 'bg-gray-500/10', text: 'text-gray-400', label: 'Settled' },
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none transition-colors placeholder-gray-500";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-heading font-bold text-white">Orders</h1>
        <button onClick={() => setShowCreate(true)} className="w-full px-5 py-2.5 rounded-xl bg-gold text-obsidian font-bold text-sm sm:w-auto">+ Create Order</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'active', 'partially_returned', 'returned_pending_payment', 'settled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {s === 'all' ? 'All' : s === 'returned_pending_payment' ? 'Pending Payment' : s === 'partially_returned' ? 'Partially Returned' : s.charAt(0).toUpperCase() + s.slice(1)}
            {' '}({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
          </button>
        ))}
      </div>

      {/* ─── Save Customer Prompt ─────────────────────────────────────────── */}
      {showSavePrompt && lastCreatedOrder && (
        <div className="fixed inset-0 z-50 bg-obsidian/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" onClick={() => { setShowSavePrompt(false); setLastCreatedOrder(null); }}>
          <div className="bg-dark-surface border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="text-3xl text-center mb-3">💾</div>
            <h3 className="text-white font-bold text-base text-center mb-2">Save Customer Details?</h3>
            <p className="text-gray-400 text-sm text-center mb-1">
              Save <span className="text-white font-medium">{lastCreatedOrder.customerName}</span>'s details for future orders?
            </p>
            <p className="text-gray-600 text-xs text-center mb-6">
              Next time you type their name, details will auto-fill.
            </p>
            <button onClick={() => setInvoiceOrder(lastCreatedOrder)} className="w-full py-3 mb-3 rounded-xl border border-blue-400/20 bg-blue-500/5 text-blue-300 text-sm font-medium">
              View / Download Invoice
            </button>
            <div className="flex gap-3">
              <button onClick={handleSaveCustomer} className="flex-1 py-3 rounded-xl bg-gold text-obsidian font-bold text-sm">Yes, Save</button>
              <button onClick={() => { setShowSavePrompt(false); setLastCreatedOrder(null); }} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm">Skip</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Order Modal ───────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-obsidian/90 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-dark-surface border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-2xl my-2 sm:my-10" onClick={e => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">{quoteRequestId ? 'Edit Enquiry as Order' : 'Create New Order'}</h2>
                {quoteRequestId && <p className="mt-1 text-xs text-amber-400">Review and edit the enquiry, add equipment, then create the order.</p>}
              </div>
              <button type="button" onClick={closeCreate} aria-label="Close create order" className="rounded-lg px-2 text-2xl leading-none text-gray-400 hover:bg-white/5 hover:text-white">×</button>
            </div>

            {/* Customer Details */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs text-gold uppercase tracking-wider font-bold">Customer Details</h3>

              {/* Name with autocomplete */}
              <div className="relative">
                <input
                  ref={nameInputRef}
                  placeholder="Customer Name *"
                  value={customerName}
                  onChange={e => handleNameChange(e.target.value)}
                  onFocus={() => customerName.length >= 2 && setShowSuggestions(nameSuggestions.length > 0)}
                  className={inputCls}
                />
                {showSuggestions && (
                  <div ref={suggestionRef} className="absolute z-10 top-full left-0 right-0 mt-1 bg-dark-surface border border-white/10 rounded-xl overflow-hidden shadow-xl">
                    {nameSuggestions.map(profile => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => fillFromProfile(profile)}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <p className="text-white text-sm font-medium">{profile.name}</p>
                        <p className="text-gray-500 text-xs">{profile.phone}{profile.email && ` • ${profile.email}`}</p>
                        {(profile.aadhaar || profile.pan) && (
                          <p className="text-gray-600 text-[10px] mt-0.5">
                            {profile.aadhaar && `Aadhaar: ••••${profile.aadhaar.slice(-4)}`}
                            {profile.aadhaar && profile.pan && ' | '}
                            {profile.pan && `PAN: ${profile.pan}`}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input placeholder="Phone *" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={inputCls} />
                <input placeholder="Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className={inputCls} />
              </div>

              {/* ID documents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Aadhaar Number</label>
                  <input
                    placeholder="XXXX XXXX XXXX"
                    value={customerAadhaar}
                    onChange={e => setCustomerAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    maxLength={12}
                    className={inputCls + ' tracking-widest'}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">PAN Card Number</label>
                  <input
                    placeholder="ABCDE1234F"
                    value={customerPan}
                    onChange={e => setCustomerPan(e.target.value.toUpperCase().slice(0, 10))}
                    maxLength={10}
                    className={inputCls + ' uppercase tracking-widest'}
                  />
                </div>
              </div>

              <select value={orderType} onChange={e => setOrderType(e.target.value as any)} className={inputCls + ' appearance-none'}>
                <option value="rental">Gear Rental</option>
                <option value="event_booking">Event Booking</option>
              </select>
              {orderType === 'event_booking' && (
                <input placeholder="Event Type (Wedding, Corporate, etc.)" value={eventType} onChange={e => setEventType(e.target.value)} className={inputCls} />
              )}
            </div>

            {/* Dates & Times */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs text-gold uppercase tracking-wider font-bold">Date & Time</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Start Date *</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Start Time</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputCls} />
                </div>
              </div>
              {orderType === 'rental' ? (
                <div className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 items-end gap-3">
                    <div>
                      <label htmlFor="rental-periods" className="mb-1 block text-[10px] text-gray-400">Hire periods</label>
                      <input
                        id="rental-periods"
                        type="number"
                        min={1}
                        step={1}
                        value={rentalPeriods}
                        onChange={event => setRentalPeriods(Math.max(1, Math.floor(Number(event.target.value) || 1)))}
                        className={inputCls}
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500">Hire duration</p>
                      <p className="mt-1 text-sm font-bold text-blue-300">{rentalHoursPerPeriod}-hour {selectedTier === 'hobbyist' ? 'casual' : 'professional'} hire</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-400">
                    Due back: <span className="font-semibold text-white">{rentalEnd ? `${rentalEnd.endDate} at ${rentalEnd.endTime}` : 'Select a start date'}</span>
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    Casual hire is 24 hours per period. Professional hire is 12 hours per period. Choose the gear tier below to set the hire duration.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">End Date *</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">End Time</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}
              {days > 0 && startDate && orderEndDate && (
                <div className="flex items-center gap-2 text-gold text-sm font-medium">
                  <span>📅</span>
                  <span>{days} {orderType === 'rental' ? 'hire period' : 'day'}{days > 1 ? 's' : ''}</span>
                  <span className="text-gray-500 text-xs font-normal">{startTime} → {orderEndTime}</span>
                </div>
              )}
            </div>

            {/* Select Gear Items */}
            <div className="mb-6">
              <h3 className="text-xs text-gold uppercase tracking-wider font-bold mb-3">Select Items</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {gear.map(g => {
                  const avail = g.totalStock - g.currentlyRented;
                  const isSelected = selectedItems.find(i => i.gearId === g.id);
                  const itemTier = g.rentalTier || 'professional';
                  const mixedTier = orderType === 'rental' && selectedItems.length > 0 && itemTier !== selectedTier;
                  return (
                    <div key={g.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'bg-gold/5 border-gold/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{g.name}</p>
                        <p className="text-gray-500 text-[10px]">{g.brand} • ₹{g.dailyRate}/{itemTier === 'hobbyist' ? '24hr' : '12hr'} hire • {avail} available</p>
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
                          disabled={avail <= 0 || mixedTier}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${avail > 0 && !mixedTier ? 'bg-gold/10 text-gold hover:bg-gold/20' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
                        >{mixedTier ? 'Different tier' : avail > 0 ? '+ Add' : 'N/A'}</button>
                      )}
                    </div>
                  );
                })}
                {gear.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No gear items. Add items in Gear page first.</p>}
              </div>
            </div>

            {/* Order Summary */}
            {selectedItems.length > 0 && (
              <div className="mb-6 p-4 bg-gold/5 border border-gold/20 rounded-xl">
                <p className="text-[10px] text-gold uppercase tracking-wider font-bold mb-2">Order Summary</p>
                {selectedItems.map(item => (
                  <div key={item.gearId} className="flex justify-between text-sm text-gray-300 py-1">
                    <span>{item.gearName} ×{item.quantity}</span>
                    <span>₹{(item.dailyRate * item.quantity * days).toLocaleString()}</span>
                  </div>
                ))}
                <div className="mt-3 border-t border-gold/20 pt-3">
                  <label htmlFor="order-discount" className="mb-2 block text-xs text-gray-300">Discount amount (₹)</label>
                  <input
                    id="order-discount"
                    type="number"
                    min={0}
                    max={calculatedTotal}
                    step="0.01"
                    value={discountAmount}
                    onChange={event => setDiscountAmount(Math.max(0, Number(event.target.value) || 0))}
                    className={inputCls}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-3">
                  <span>Subtotal ({days} {orderType === 'rental' ? 'hire periods' : 'days'})</span>
                  <span>₹{calculatedTotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-400 mt-1">
                    <span>Discount</span>
                    <span>− ₹{appliedDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-base mt-2 pt-2 border-t border-gold/20">
                  <span>Total</span>
                  <span className="text-gold">₹{orderTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* Notes */}
            <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className={inputCls + ' resize-none mb-6'} rows={2} />

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={handleCreate}
                disabled={!customerName || !customerPhone || !startDate || !orderEndDate || selectedItems.length === 0}
                className="flex-1 py-3 rounded-xl bg-gold text-obsidian font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Create Order
              </button>
              <button onClick={closeCreate} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Orders List ─────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500"><p>No orders found.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(order => {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = (order.status === 'active' || order.status === 'partially_returned') && order.endDate < today;
            const cfg = isOverdue ? statusConfig.overdue : statusConfig[order.status] || statusConfig.active;

            return (
              <div key={order.id} className={`border rounded-2xl p-5 ${isOverdue ? 'bg-red-500/5 border-red-500/10' : 'bg-white/[0.03] border-white/5'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-white font-semibold">{order.customerName}</h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${cfg.bg} ${cfg.text}`}>
                        {isOverdue ? 'Overdue' : cfg.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">📞 {order.customerPhone} {order.customerEmail && `• ${order.customerEmail}`}</p>
                    {(order.customerAadhaar || order.customerPan) && (
                      <p className="text-gray-600 text-[10px] mt-0.5">
                        {order.customerAadhaar && `Aadhaar: ••••${order.customerAadhaar.slice(-4)}`}
                        {order.customerAadhaar && order.customerPan && ' | '}
                        {order.customerPan && `PAN: ${order.customerPan}`}
                      </p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      {order.items.map(i => `${i.gearName} ×${i.quantity}`).join(', ')}
                    </p>
                    {order.status === 'partially_returned' && (
                      <div className="mt-2 rounded-lg border border-orange-400/10 bg-orange-500/5 p-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-300">Still outstanding</p>
                        <p className="mt-1 text-xs text-gray-300">{getOutstandingOrderItems(order).map(item => `${item.gearName} ×${item.quantity}`).join(', ') || 'None'}</p>
                      </div>
                    )}
                    {(order.missingItems?.length || 0) > 0 && (
                      <div className="mt-2 rounded-lg border border-red-400/10 bg-red-500/5 p-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-300">Missing / written off</p>
                        <p className="mt-1 text-xs text-gray-300">{order.missingItems?.map(item => `${item.gearName} ×${item.quantity}`).join(', ')}</p>
                        {order.missingNote && <p className="mt-1 text-[10px] text-gray-500">Closeout note: {order.missingNote}</p>}
                      </div>
                    )}
                    {(order.partialReturns || []).map((entry, index) => (
                      <p key={`${entry.returnedAt}-${index}`} className="mt-1 text-[10px] text-gray-500">
                        Received {new Date(entry.returnedAt).toLocaleString('en-IN')}: {entry.items.map(item => `${item.gearName} ×${item.quantity}`).join(', ')} · Note: {entry.note}
                      </p>
                    ))}
                    {order.notes && <p className="text-gray-600 text-xs mt-1 italic">Note: {order.notes}</p>}
                  </div>
                  <div className="text-left sm:text-right sm:flex-shrink-0">
                    <p className="text-gold font-bold text-lg">₹{order.totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {order.startDate}{order.startTime ? ` ${order.startTime}` : ''} →<br />
                      {order.endDate}{order.endTime ? ` ${order.endTime}` : ''}
                    </p>
                    <p className="text-[10px] text-gray-600">{order.days} day{order.days > 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
                  <button onClick={() => setInvoiceOrder(order)} className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-bold hover:bg-blue-500/20 transition-colors">
                    View / Download Invoice
                  </button>
                  {order.status === 'active' && (
                    <button onClick={() => openPartialReturn(order)} className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors">
                      ✓ Record Return
                    </button>
                  )}
                  {order.status === 'partially_returned' && (
                    <button onClick={() => openPartialReturn(order)} className="px-4 py-2 rounded-lg bg-orange-500/10 text-orange-300 text-xs font-bold hover:bg-orange-500/20 transition-colors">
                      Record More Returned Items
                    </button>
                  )}
                  {order.status === 'returned_pending_payment' && (
                    <button onClick={() => handleSettle(order.id)} className="px-4 py-2 rounded-lg bg-gold/10 text-gold text-xs font-bold hover:bg-gold/20 transition-colors">
                      💰 Order Settled
                    </button>
                  )}
                  {order.status === 'settled' && (
                    <span className="px-4 py-2 rounded-lg bg-gray-500/5 text-gray-500 text-xs">
                      ✓ Completed {order.settledAt ? new Date(order.settledAt).toLocaleDateString('en-IN') : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
      {returnOrder && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-obsidian/90 p-2 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setReturnOrder(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="partial-return-title" className="my-2 w-full max-w-lg rounded-2xl border border-white/10 bg-dark-surface p-4 sm:my-0 sm:p-6" onClick={event => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="partial-return-title" className="text-lg font-bold text-white">Record returned items</h2>
                <p className="mt-1 text-xs text-gray-500">{returnOrder.customerName} · Enter quantities received now.</p>
              </div>
              <button onClick={() => setReturnOrder(null)} aria-label="Close return dialog" className="text-xl text-gray-400 hover:text-white">×</button>
            </div>
            <div className="space-y-3">
              {getOutstandingOrderItems(returnOrder).map(item => (
                <label key={item.gearId} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-sm text-white">{item.gearName}<span className="ml-2 text-xs text-gray-500">{item.quantity} still out</span></span>
                  <input
                    aria-label={`Quantity of ${item.gearName} returned`}
                    type="number"
                    min={0}
                    max={item.quantity}
                    step={1}
                    value={returnQuantities[item.gearId] || 0}
                    onChange={event => setReturnQuantities(current => ({ ...current, [item.gearId]: Math.min(item.quantity, Math.max(0, Math.floor(Number(event.target.value) || 0))) }))}
                    className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-white"
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 block text-xs text-gray-400">
              Return note (record missing or damaged items here) *
              <textarea value={returnNote} onChange={event => { setReturnNote(event.target.value); setReturnError(''); }} rows={3} className={inputCls + ' mt-2 resize-none'} placeholder="E.g. Returned camera body; one battery is still missing." />
            </label>
            {returnError && <p role="alert" className="mt-2 text-xs text-red-400">{returnError}</p>}
            {getOutstandingOrderItems(returnOrder).some(item => item.quantity - (returnQuantities[item.gearId] || 0) > 0) ? (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button onClick={() => handlePartialReturn(false)} className="rounded-xl bg-gold py-3 text-sm font-bold text-obsidian">Save Partial Return</button>
                <button
                  onClick={() => handlePartialReturn(true)}
                  disabled={!Object.values(returnOrder.returnedItems || {}).some(quantity => quantity > 0) && !Object.values(returnQuantities).some(quantity => quantity > 0)}
                  className="rounded-xl border border-orange-400/30 bg-orange-500/10 py-3 text-sm font-bold text-orange-200 enabled:hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >Close Order · Record Missing Items</button>
                <button onClick={() => setReturnOrder(null)} className="rounded-xl border border-white/10 py-3 text-sm text-gray-300 sm:col-span-2">Cancel</button>
              </div>
            ) : (
              <div className="mt-5 flex gap-3">
                <button onClick={() => handlePartialReturn(false)} className="flex-1 rounded-xl bg-gold py-3 text-sm font-bold text-obsidian">Complete Return</button>
                <button onClick={() => setReturnOrder(null)} className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-gray-300">Cancel</button>
              </div>
            )}
            {getOutstandingOrderItems(returnOrder).some(item => item.quantity - (returnQuantities[item.gearId] || 0) > 0) && (
              <p className="mt-3 text-[10px] text-gray-500">Closing with items outstanding moves the order to payment pending. Unreturned items remain unavailable in stock and are listed as missing for audit.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
