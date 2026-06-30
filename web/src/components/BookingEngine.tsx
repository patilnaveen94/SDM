import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { eventPackages, rentalCatalog, RentalGear } from '../../../shared/assetsConfig';

type TabKey = 'events' | 'rental';

interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  date: string;
  message: string;
}

interface CartItem {
  gear: RentalGear;
  startDate: string;
  endDate: string;
  days: number;
}

export const BookingEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('events');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    phone: '',
    email: '',
    eventType: '',
    date: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<BookingFormData>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3000);
      setFormData({ name: '', phone: '', email: '', eventType: '', date: '', message: '' });
    }
  };

  const addToCart = (gear: RentalGear) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setCart((prev) => [...prev, { gear, startDate: today, endDate: tomorrow, days: 1 }]);
  };

  const removeFromCart = (gearId: string) => {
    setCart((prev) => prev.filter((item) => item.gear.id !== gearId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.gear.dailyRate * item.days, 0);

  return (
    <section id="booking" ref={sectionRef} className="scroll-mt-20 py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-heading font-bold">
          Book & <span className="text-gold-gradient">Rent</span>
        </h2>
        <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
          Schedule an event shoot or rent premium cinema-grade equipment at competitive daily rates.
        </p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-card-surface rounded-full p-1 border border-border-subtle">
          {(['events', 'rental'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gold text-obsidian shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'events' ? '📸 Event Photography' : '🎥 Gear Rental'}
            </button>
          ))}
        </div>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* Package Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-semibold text-gold mb-4">Event Packages</h3>
            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {eventPackages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  whileHover={{ scale: 1.02 }}
                  className="glass-card p-4 flex gap-4"
                >
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    loading="lazy"
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{pkg.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{pkg.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gold font-bold text-sm">
                        ₹{pkg.startingPrice.toLocaleString()}+
                      </span>
                      <span className="text-xs text-gray-500">{pkg.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="glass-card p-6 md:p-8">
            <h3 className="text-xl font-heading font-semibold text-gold mb-6">Check Availability</h3>
            {formSubmitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-5xl mb-4">✅</div>
                <h4 className="text-xl font-semibold text-white">Booking Request Sent!</h4>
                <p className="text-gray-400 mt-2">We'll confirm availability within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                  />
                  {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone (10 digits)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                    />
                    {formErrors.phone && <p className="text-red-400 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                    />
                    {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                </div>
                <div>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white focus:border-gold focus:outline-none transition-colors appearance-none"
                  >
                    <option value="">Select Event Type</option>
                    <option value="wedding">Wedding</option>
                    <option value="engagement">Engagement</option>
                    <option value="naming_ceremony">Naming Ceremony</option>
                    <option value="kids_photoshoot">Kids Photoshoot</option>
                    <option value="pre_post_wedding">Pre/Post Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="social_gathering">Social Gathering</option>
                  </select>
                  {formErrors.eventType && <p className="text-red-400 text-xs mt-1">{formErrors.eventType}</p>}
                </div>
                <div>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white focus:border-gold focus:outline-none transition-colors"
                  />
                  {formErrors.date && <p className="text-red-400 text-xs mt-1">{formErrors.date}</p>}
                </div>
                <textarea
                  placeholder="Additional details (optional)"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors resize-none"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-lg bg-gold text-obsidian font-bold text-base hover:bg-gold-light transition-colors"
                >
                  Check Availability & Book
                </motion.button>
              </form>
            )}
          </div>
        </motion.div>
      )}

      {/* Rental Tab */}
      {activeTab === 'rental' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="glass-card p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-gold font-bold">🛒 Cart ({cart.length})</span>
                <span className="text-gray-400">|</span>
                <span className="text-white font-semibold">₹{cartTotal.toLocaleString()}/day</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {cart.map((item) => (
                  <span
                    key={item.gear.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-dark-surface rounded-full text-xs text-gray-300"
                  >
                    {item.gear.name}
                    <button
                      onClick={() => removeFromCart(item.gear.id)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gear Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rentalCatalog.map((gear) => {
              const isInCart = cart.some((item) => item.gear.id === gear.id);
              return (
                <motion.div
                  key={gear.id}
                  whileHover={{ y: -4 }}
                  className="glass-card overflow-hidden group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={gear.image}
                      alt={gear.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-obsidian/80 backdrop-blur-sm rounded text-xs text-gold font-medium capitalize">
                        {gear.category}
                      </span>
                    </div>
                    {!gear.available && (
                      <div className="absolute inset-0 bg-obsidian/70 flex items-center justify-center">
                        <span className="text-red-400 font-bold text-sm">Currently Unavailable</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-white text-sm">{gear.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{gear.brand}</p>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{gear.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {gear.specs.slice(0, 3).map((spec) => (
                        <span key={spec} className="px-2 py-0.5 bg-dark-surface rounded text-[10px] text-gray-400">
                          {spec}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
                      <span className="text-gold font-bold">₹{gear.dailyRate.toLocaleString()}<span className="text-xs text-gray-500">/day</span></span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => isInCart ? removeFromCart(gear.id) : addToCart(gear)}
                        disabled={!gear.available}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isInCart
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : gear.available
                              ? 'bg-gold/20 text-gold hover:bg-gold/30'
                              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {isInCart ? 'Remove' : gear.available ? 'Add to Cart' : 'N/A'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </section>
  );
};
