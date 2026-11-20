import React, { useState, useRef } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { businessInfo, eventPackages, EventPackage } from '../assetsConfig';
import { submitPublicQuoteRequest, calculateDays, getGearInventory as getAdminGear } from '../store/dataStore';

type TabKey = 'events' | 'rental';

// ── Event sub-category groupings ──────────────────────────────────────────────
type EventGroup = 'all' | 'wedding' | 'corporate_shoot' | 'documentary' | 'social';

const EVENT_GROUPS: { key: EventGroup; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '✦' },
  { key: 'wedding', label: 'Wedding & Family', emoji: '💍' },
  { key: 'corporate_shoot', label: 'Corporate Shoot', emoji: '🏢' },
  { key: 'documentary', label: 'Documentary', emoji: '🎬' },
  { key: 'social', label: 'Social & Events', emoji: '🎉' },
];

function getEventGroup(category: EventPackage['category']): EventGroup {
  if (['wedding', 'engagement', 'naming_ceremony', 'kids_photoshoot', 'pre_post_wedding'].includes(category)) return 'wedding';
  if (['corporate', 'podcast', 'testimonials', 'brand_shoot', 'product_shoot', 'events_vertical'].includes(category)) return 'corporate_shoot';
  if (['documentary_news_events', 'documentary_add', 'documentary_movies'].includes(category)) return 'documentary';
  if (['social_gathering'].includes(category)) return 'social';
  return 'all';
}

function getCategoryLabel(category: EventPackage['category']): string {
  const map: Record<string, string> = {
    wedding: 'Wedding',
    engagement: 'Engagement',
    naming_ceremony: 'Naming Ceremony',
    kids_photoshoot: 'Kids Photoshoot',
    pre_post_wedding: 'Pre/Post Wedding',
    corporate: 'Corporate Event',
    social_gathering: 'Social Gathering',
    podcast: 'Podcast',
    testimonials: 'Testimonials',
    brand_shoot: 'Brand Shoot',
    product_shoot: 'Product Shoot',
    events_vertical: 'Events (Vertical)',
    documentary_news_events: 'News & Events',
    documentary_add: 'Ads & Promos',
    documentary_movies: 'Movie Shoot',
  };
  return map[category] || category;
}

// ── Rental tier types ─────────────────────────────────────────────────────────
type RentalTier = 'all' | 'professional' | 'hobbyist';

interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  date: string;
  message: string;
}

interface CartItem {
  id: string;
  name: string;
  brand: string;
  dailyRate: number;
  category: string;
  image: string;
  quantity: number;
  availableQuantity: number;
}

export const BookingEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('rental');
  const [eventGroup, setEventGroup] = useState<EventGroup>('all');
  const [rentalTier, setRentalTier] = useState<RentalTier>('all');
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({ name: '', phone: '', email: '', eventType: '', date: '', message: '' });
  const [formErrors, setFormErrors] = useState<Partial<BookingFormData>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [rentalErrors, setRentalErrors] = useState<Record<string, string>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [rentalSubmitted, setRentalSubmitted] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });

  // Use admin-managed gear (from dataStore / localStorage)
  const adminGear = getAdminGear();
  const mergedGear = adminGear.map(g => ({
    id: g.id,
    name: g.name,
    brand: g.brand,
    dailyRate: g.dailyRate,
    category: g.category,
    image: g.image,
    available: g.available && (g.totalStock - g.currentlyRented) > 0,
    availableQuantity: Math.max(0, g.totalStock - g.currentlyRented),
    rentalTier: g.rentalTier,
  }));

  const filteredGear = rentalTier === 'all'
    ? mergedGear
    : rentalTier === 'professional'
    ? mergedGear.filter(g => !g.rentalTier || g.rentalTier === 'professional')
    : mergedGear.filter(g => g.rentalTier === 'hobbyist');

  const filteredPackages = eventGroup === 'all'
    ? eventPackages
    : eventPackages.filter(p => getEventGroup(p.category) === eventGroup);

  const validateForm = (): boolean => {
    const errors: Partial<BookingFormData> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.phone.match(/^\d{10}$/)) errors.phone = 'Valid 10-digit phone required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Valid email required';
    if (!formData.eventType) errors.eventType = 'Select an event type';
    if (!formData.date) errors.date = 'Select a date';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmittingRequest(true);
    setSubmitError('');
    try {
      await submitPublicQuoteRequest({
        customerName: formData.name.trim(),
        customerPhone: formData.phone,
        customerEmail: formData.email,
        eventType: formData.eventType,
        requestedDate: formData.date,
        message: formData.message.trim(),
      });
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3000);
      setFormData({ name: '', phone: '', email: '', eventType: '', date: '', message: '' });
      setSelectedPackage(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Your request could not be sent. Please try again or call us.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const addToCart = (item: typeof mergedGear[0]) => {
    if (!cart.find(c => c.id === item.id)) {
      setCart(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const updateCartQuantity = (id: string, quantity: number) => {
    setCart(current => current.map(item => item.id === id
      ? { ...item, quantity: Math.min(item.availableQuantity, Math.max(1, quantity)) }
      : item));
  };
  const cartDays = rentalStartDate && rentalEndDate ? calculateDays(rentalStartDate, rentalEndDate) : 0;
  const cartDailyTotal = cart.reduce((sum, item) => sum + item.dailyRate * item.quantity, 0);
  const cartTotal = cartDays > 0 ? cartDailyTotal * cartDays : 0;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const handleRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Enter your name';
    if (!/^\d{10}$/.test(formData.phone.trim())) errors.phone = 'Enter a valid 10-digit mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Enter a valid email address';
    if (!rentalStartDate) errors.startDate = 'Choose a pickup date';
    if (!rentalEndDate) errors.endDate = 'Choose a return date';
    if (rentalStartDate && rentalStartDate < todayString) errors.startDate = 'Choose today or a future date';
    if (rentalStartDate && rentalEndDate && rentalEndDate < rentalStartDate) errors.endDate = 'Return date must be on or after pickup';
    if (cart.length === 0) errors.cart = 'Add at least one gear item to your enquiry';
    setRentalErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmittingRequest(true);
    setSubmitError('');
    try {
      await submitPublicQuoteRequest({
        requestType: 'rental',
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerEmail: formData.email.trim(),
        eventType: 'Gear Rental',
        requestedDate: rentalStartDate,
        requestedEndDate: rentalEndDate,
        rentalItems: cart.map(item => ({
          gearId: item.id,
          gearName: item.name,
          quantity: item.quantity,
          dailyRate: item.dailyRate,
        })),
        estimatedTotal: cartTotal,
        message: formData.message.trim(),
      });
      setRentalSubmitted(true);
      setCart([]);
      setFormData({ name: '', phone: '', email: '', eventType: '', date: '', message: '' });
      setRentalErrors({});
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Your request could not be sent. Please try again or call us.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setRentalSubmitted(false);
  };

  const inputClasses = "w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:bg-white/[0.07] focus:outline-none transition-all duration-300";

  return (
    <section id="booking" ref={sectionRef} className="scroll-mt-20 py-16 sm:py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {submitError && <p role="alert" className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{submitError}</p>}
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-9 sm:mb-12"
        >
          <span className="text-gold text-xs font-bold uppercase tracking-[4px]">Equipment & Services Offered</span>
          <h2 className="mt-3 text-3xl font-heading font-bold leading-tight sm:text-4xl md:text-6xl lg:text-7xl">
            Book & <span className="text-gold-gradient">Rent.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-gray-400 sm:text-base sm:leading-7">
            Explore camera, lens, drone, lighting and audio rentals, alongside wedding, family, corporate, documentary and event photography and videography services.
          </p>
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="mb-8 inline-flex max-w-full gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 sm:mb-10"
        >
          {(['events', 'rental'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={`relative isolate min-h-11 rounded-full px-4 py-2.5 text-xs font-semibold transition-colors duration-300 sm:px-6 sm:py-3 sm:text-sm ${
                activeTab === tab ? 'text-obsidian' : 'text-gray-400 hover:text-white'
              }`}
            >
              {activeTab === tab && <motion.span layoutId="booking-tab" className="absolute inset-0 -z-10 rounded-full bg-gold" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              {tab === 'events' ? '📸 Book Events' : '🎥 Gear Rental'}
            </button>
          ))}
        </motion.div>

        {/* ── EVENTS TAB ──────────────────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Event Group Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {EVENT_GROUPS.map(g => (
                <button
                  key={g.key}
                  onClick={() => setEventGroup(g.key)}
                  className={`flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold transition-all duration-300 sm:px-4 sm:text-xs ${
                    eventGroup === g.key
                      ? 'bg-gold text-obsidian'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{g.emoji}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>

            {/* Corporate Shoot sub-section label */}
            {(eventGroup === 'all' || eventGroup === 'corporate_shoot') && (
              <div className="mb-4">
                {eventGroup === 'all' && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1 bg-white/5" />
                      <span className="text-xs font-bold text-gold uppercase tracking-[3px]">🏢 Corporate Shoot</span>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {eventPackages.filter(p => getEventGroup(p.category) === 'corporate_shoot').map((pkg, i) => (
                        <PackageCard key={pkg.id} pkg={pkg} index={i} onSelect={() => { setSelectedPackage(pkg); setFormData(f => ({ ...f, eventType: pkg.category })); }} selected={selectedPackage?.id === pkg.id} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
              {/* Left: Package cards */}
              <div>
                {/* If "all", show grouped sections; if specific group, show flat */}
                {eventGroup !== 'all' ? (
                  <div className="space-y-3 max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredPackages.map((pkg, i) => (
                      <PackageCard key={pkg.id} pkg={pkg} index={i} onSelect={() => { setSelectedPackage(pkg); setFormData(f => ({ ...f, eventType: pkg.category })); }} selected={selectedPackage?.id === pkg.id} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
                    {/* Wedding & Family */}
                    <GroupSection label="💍 Wedding & Family" packages={eventPackages.filter(p => getEventGroup(p.category) === 'wedding')} onSelect={(pkg) => { setSelectedPackage(pkg); setFormData(f => ({ ...f, eventType: pkg.category })); }} selectedId={selectedPackage?.id} />
                    {/* Documentary */}
                    <GroupSection label="🎬 Documentary" packages={eventPackages.filter(p => getEventGroup(p.category) === 'documentary')} onSelect={(pkg) => { setSelectedPackage(pkg); setFormData(f => ({ ...f, eventType: pkg.category })); }} selectedId={selectedPackage?.id} />
                    {/* Social & Events */}
                    <GroupSection label="🎉 Social & Events" packages={eventPackages.filter(p => getEventGroup(p.category) === 'social')} onSelect={(pkg) => { setSelectedPackage(pkg); setFormData(f => ({ ...f, eventType: pkg.category })); }} selectedId={selectedPackage?.id} />
                  </div>
                )}
              </div>

              {/* Right: Booking Form */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7 lg:p-8">
                <h3 className="text-xl font-heading font-semibold text-white mb-2">Check Availability</h3>
                {selectedPackage && (
                  <div className="mb-5 px-3 py-2 bg-gold/10 border border-gold/20 rounded-xl flex items-center gap-2">
                    <span className="text-gold text-xs">✦</span>
                    <span className="text-gold text-xs font-medium">{selectedPackage.title}</span>
                    <button onClick={() => setSelectedPackage(null)} className="ml-auto text-gray-500 text-xs hover:text-white">✕</button>
                  </div>
                )}
                {formSubmitted ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-16">
                    <div className="text-5xl mb-4">✓</div>
                    <h4 className="text-xl font-semibold">Request Sent</h4>
                    <p className="text-gray-400 mt-2 text-sm">We'll confirm within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClasses} />
                    {formErrors.name && <p className="text-red-400 text-xs -mt-2">{formErrors.name}</p>}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input type="tel" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClasses} />
                        {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                      </div>
                      <div>
                        <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClasses} />
                        {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                      </div>
                    </div>
                    <select value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} className={inputClasses + ' appearance-none'}>
                      <option value="">Select Service Type</option>
                      <optgroup label="Wedding & Family">
                        <option value="wedding">Wedding</option>
                        <option value="engagement">Engagement</option>
                        <option value="naming_ceremony">Naming Ceremony</option>
                        <option value="kids_photoshoot">Kids Photoshoot</option>
                        <option value="pre_post_wedding">Pre/Post Wedding</option>
                      </optgroup>
                      <optgroup label="Corporate Shoot">
                        <option value="corporate">Corporate Event</option>
                        <option value="podcast">Podcast</option>
                        <option value="testimonials">Testimonials</option>
                        <option value="brand_shoot">Brand Shoot</option>
                        <option value="product_shoot">Product Shoot</option>
                        <option value="events_vertical">Events (Vertical / Social Media)</option>
                      </optgroup>
                      <optgroup label="Documentary">
                        <option value="documentary_news_events">News & Events</option>
                        <option value="documentary_add">Ads & Promos</option>
                        <option value="documentary_movies">Movie Shoot</option>
                      </optgroup>
                      <optgroup label="Social & Events">
                        <option value="social_gathering">Social Gathering</option>
                      </optgroup>
                    </select>
                    {formErrors.eventType && <p className="text-red-400 text-xs -mt-2">{formErrors.eventType}</p>}
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={inputClasses} />
                    {formErrors.date && <p className="text-red-400 text-xs -mt-2">{formErrors.date}</p>}
                    <textarea placeholder="Additional details (optional)" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={3} className={inputClasses + ' resize-none'} />
                    <button type="submit" disabled={isSubmittingRequest} className="w-full py-4 rounded-xl bg-gold text-obsidian font-bold text-base hover:bg-gold-light transition-colors disabled:cursor-wait disabled:opacity-70">
                      {isSubmittingRequest ? 'Sending…' : 'Check Availability'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RENTAL TAB ──────────────────────────────────────────────────────── */}
        {activeTab === 'rental' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Rental Tier Filter */}
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-2xl font-heading font-semibold text-white">Find your rental kit</h3>
                <p className="mt-1 text-sm text-gray-500">Choose your gear, dates and send a no-obligation enquiry.</p>
              </div>
              <p className="text-xs text-gray-500">No payment required to enquire</p>
            </div>
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setRentalTier('all')}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${rentalTier === 'all' ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
              >
                All Gear
              </button>
              <button
                onClick={() => setRentalTier('professional')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${rentalTier === 'professional' ? 'bg-gold text-obsidian' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
              >
                <span>🎬</span>
                <span>Professional</span>
              </button>
              <button
                onClick={() => setRentalTier('hobbyist')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${rentalTier === 'hobbyist' ? 'bg-gold text-obsidian' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
              >
                <span>📷</span>
                <span>Casual Hire</span>
              </button>
            </div>

            {/* Tier descriptions */}
            <div className="mb-7 grid gap-3 sm:mb-9 sm:grid-cols-2 sm:gap-4">
              <div className={`rounded-2xl border p-4 transition-all duration-300 ${rentalTier === 'professional' ? 'bg-gold/5 border-gold/30' : 'bg-white/[0.02] border-white/5'}`}>
                <p className="text-white font-semibold text-sm">🎬 Professional Tier</p>
                <p className="text-gray-500 text-xs mt-1">Cinema-grade equipment for commercial productions, films, and large-scale events. Requires proof of experience.</p>
              </div>
              <div className={`rounded-2xl border p-4 transition-all duration-300 ${rentalTier === 'hobbyist' ? 'bg-gold/5 border-gold/30' : 'bg-white/[0.02] border-white/5'}`}>
                <p className="text-white font-semibold text-sm">📷 Casual Hire</p>
                <p className="text-gray-500 text-xs mt-1">Perfect for one-day shoots, hobby projects, family functions, and small gatherings. No experience required.</p>
              </div>
            </div>

            {/* Gear grid */}
            {filteredGear.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-4xl mb-3">🎥</p>
                <p>No gear available in this category yet.</p>
                <p className="text-xs mt-2 text-gray-600">The admin will add gear items soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {filteredGear.map((gear, i) => {
                  const inCart = cart.some(c => c.id === gear.id);
                  const tierLabel = gear.rentalTier === 'hobbyist' ? '📷 Casual' : '🎬 Pro';
                  return (
                    <motion.div
                      key={gear.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-gold/20"
                    >
                      <div className="relative h-28 overflow-hidden min-[420px]:h-36 sm:h-44">
                        {gear.image ? (
                          <img src={gear.image} alt={gear.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl">🎥</div>
                        )}
                        <span className="absolute left-2 top-2 max-w-[52%] truncate rounded-lg bg-obsidian/70 px-1.5 py-1 text-[8px] font-bold uppercase tracking-wider text-gold backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]">{gear.category}</span>
                        <span className="absolute right-2 top-2 rounded-lg bg-obsidian/70 px-1.5 py-1 text-[8px] text-gray-300 backdrop-blur-sm sm:right-3 sm:top-3 sm:px-2.5 sm:text-[10px]">{tierLabel}</span>
                        {!gear.available && <div className="absolute inset-0 bg-obsidian/70 flex items-center justify-center"><span className="text-red-400 text-xs font-bold">Unavailable</span></div>}
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="truncate text-[9px] uppercase tracking-wider text-gray-500 sm:text-[10px]">{gear.brand}</p>
                        <h4 className="mt-1 line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-white sm:text-sm">{gear.name}</h4>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 sm:mt-4">
                          <span className="text-xs font-bold text-gold sm:text-sm">₹{gear.dailyRate.toLocaleString()}<span className="text-[9px] font-normal text-gray-500 sm:text-[10px]">/day</span></span>
                          <button
                            onClick={() => inCart ? removeFromCart(gear.id) : addToCart(gear)}
                            disabled={!gear.available}
                            className={`min-h-9 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-300 sm:px-3 sm:text-xs ${
                              inCart ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              gear.available ? 'bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20' : 'bg-white/5 text-gray-600 cursor-not-allowed'
                            }`}
                          >{inCart ? 'Remove' : gear.available ? 'Add' : 'N/A'}</button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {cartItemCount > 0 && !isCartOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.75, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: 24 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open rental enquiry, ${cartItemCount} items`}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-white/15 bg-gold px-5 py-4 text-obsidian shadow-2xl shadow-black/40 sm:bottom-8 sm:right-8"
          >
            <span className="text-xl" aria-hidden="true">🛒</span>
            <span className="text-sm font-bold">Your gear</span>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-obsidian px-1.5 text-xs font-bold text-gold">{cartItemCount}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-obsidian/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="rental-cart-title"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-dark-surface p-5 shadow-2xl sm:rounded-3xl sm:p-8"
              onClick={event => event.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Rental enquiry</p>
                  <h3 id="rental-cart-title" className="mt-2 text-2xl font-heading font-bold text-white">
                    {rentalSubmitted ? 'Request received' : 'Review your gear'}
                  </h3>
                  {!rentalSubmitted && <p className="mt-1 text-sm text-gray-500">Check your items and rental dates before sending.</p>}
                </div>
                <button type="button" onClick={closeCart} aria-label="Close rental cart" className="rounded-full border border-white/10 px-3 py-1 text-xl text-gray-400 transition-colors hover:text-white">×</button>
              </div>

              {rentalSubmitted ? (
                <motion.div role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl text-green-300">✓</div>
                  <h4 className="text-xl font-semibold text-white">Your enquiry has been sent</h4>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400">
                    We’ll review your gear and dates and update you by email. Need help sooner? Call us directly.
                  </p>
                  <a href={`tel:${businessInfo.phone}`} className="mt-6 inline-flex rounded-full border border-gold/30 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold/20">
                    Call +91 {businessInfo.phone}
                  </a>
                  <button type="button" onClick={closeCart} className="mt-6 block w-full text-sm text-gray-500 hover:text-white">Close</button>
                </motion.div>
              ) : (
                <form onSubmit={handleRentalSubmit} className="space-y-6">
                  <div className="space-y-3">
                    {cart.length === 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
                        <p className="text-sm text-gray-400">Your gear list is empty.</p>
                        <button type="button" onClick={closeCart} className="mt-3 text-sm font-semibold text-gold hover:text-gold-light">Back to gear</button>
                      </div>
                    )}
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:gap-4 sm:p-4">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover sm:h-20 sm:w-20" />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 text-2xl sm:h-20 sm:w-20" aria-hidden="true">🎥</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-gray-500">{item.brand} · {item.category}</p>
                          <h4 className="mt-1 truncate text-sm font-semibold text-white">{item.name}</h4>
                          <p className="mt-1 text-xs text-gold">₹{item.dailyRate.toLocaleString('en-IN')} / day / item</p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => updateCartQuantity(item.id, item.quantity - 1)} aria-label={`Remove one ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/10">−</button>
                              <span className="min-w-5 text-center text-sm text-white">{item.quantity}</span>
                              <button type="button" onClick={() => updateCartQuantity(item.id, item.quantity + 1)} aria-label={`Add one ${item.name}`} disabled={item.quantity >= item.availableQuantity} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40">+</button>
                            </div>
                            <button type="button" onClick={() => removeFromCart(item.id)} className="text-xs text-red-300 hover:text-red-200">Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {rentalErrors.cart && <p role="alert" className="text-xs text-red-300">{rentalErrors.cart}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-medium text-gray-400">
                      Pickup date
                      <input type="date" min={todayString} value={rentalStartDate} onChange={event => setRentalStartDate(event.target.value)} className={`${inputClasses} mt-2`} />
                      {rentalErrors.startDate && <span role="alert" className="mt-1 block text-red-300">{rentalErrors.startDate}</span>}
                    </label>
                    <label className="text-xs font-medium text-gray-400">
                      Return date
                      <input type="date" min={rentalStartDate || todayString} value={rentalEndDate} onChange={event => setRentalEndDate(event.target.value)} className={`${inputClasses} mt-2`} />
                      {rentalErrors.endDate && <span role="alert" className="mt-1 block text-red-300">{rentalErrors.endDate}</span>}
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-medium text-gray-400">
                      Full name
                      <input type="text" autoComplete="name" value={formData.name} onChange={event => setFormData({ ...formData, name: event.target.value })} placeholder="Your name" className={`${inputClasses} mt-2`} />
                      {rentalErrors.name && <span role="alert" className="mt-1 block text-red-300">{rentalErrors.name}</span>}
                    </label>
                    <label className="text-xs font-medium text-gray-400">
                      Mobile number
                      <input type="tel" inputMode="numeric" autoComplete="tel-national" value={formData.phone} onChange={event => setFormData({ ...formData, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit number" className={`${inputClasses} mt-2`} />
                      {rentalErrors.phone && <span role="alert" className="mt-1 block text-red-300">{rentalErrors.phone}</span>}
                    </label>
                    <label className="text-xs font-medium text-gray-400 sm:col-span-2">
                      Email address
                      <input type="email" autoComplete="email" value={formData.email} onChange={event => setFormData({ ...formData, email: event.target.value })} placeholder="you@example.com" className={`${inputClasses} mt-2`} />
                      {rentalErrors.email && <span role="alert" className="mt-1 block text-red-300">{rentalErrors.email}</span>}
                    </label>
                  </div>
                  <label className="block text-xs font-medium text-gray-400">
                    Anything else we should know? <span className="font-normal text-gray-600">(optional)</span>
                    <textarea value={formData.message} onChange={event => setFormData({ ...formData, message: event.target.value })} rows={2} placeholder="Tell us about your shoot or special requirements" className={`${inputClasses} mt-2 resize-none`} />
                  </label>

                  <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-gray-300">{cartDays > 0 ? `${cartDays} rental day${cartDays === 1 ? '' : 's'}` : 'Select dates for an estimate'}</span>
                      <span className="font-bold text-gold">{cartDays > 0 ? `₹${cartTotal.toLocaleString('en-IN')} estimated` : `₹${cartDailyTotal.toLocaleString('en-IN')} / day`}</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-gray-500">This is an enquiry, not a confirmed booking. Final availability and pricing will be confirmed by our team.</p>
                  </div>

                  <button type="submit" disabled={isSubmittingRequest} className="w-full rounded-xl bg-gold px-5 py-4 text-sm font-bold text-obsidian transition-colors hover:bg-gold-light disabled:cursor-wait disabled:opacity-70">
                    {isSubmittingRequest ? 'Sending…' : 'Send rental enquiry'}
                  </button>
                </form>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const PackageCard: React.FC<{ pkg: EventPackage; index: number; onSelect: () => void; selected: boolean }> = ({ pkg, index, onSelect, selected }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.06 }}
    onClick={onSelect}
    className={`flex gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${selected ? 'bg-gold/5 border-gold/40' : 'bg-white/[0.03] border-white/5 hover:border-gold/20 hover:bg-white/[0.05]'}`}
  >
    {pkg.image && (
      <img src={pkg.image} alt={pkg.title} loading="lazy" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-white text-sm leading-snug">{pkg.title}</h4>
        {selected && <span className="text-gold text-xs flex-shrink-0">✓</span>}
      </div>
      <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{pkg.description}</p>
      <div className="flex items-center justify-end mt-2">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{pkg.duration}</span>
      </div>
    </div>
  </motion.div>
);

const GroupSection: React.FC<{ label: string; packages: EventPackage[]; onSelect: (pkg: EventPackage) => void; selectedId?: string }> = ({ label, packages, onSelect, selectedId }) => (
  <div>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-[3px] mb-3">{label}</p>
    <div className="space-y-2">
      {packages.map((pkg, i) => (
        <PackageCard key={pkg.id} pkg={pkg} index={i} onSelect={() => onSelect(pkg)} selected={selectedId === pkg.id} />
      ))}
    </div>
  </div>
);
