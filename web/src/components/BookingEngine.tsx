import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { eventPackages, rentalCatalog, RentalGear } from '../assetsConfig';

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
  days: number;
}

export const BookingEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('events');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({ name: '', phone: '', email: '', eventType: '', date: '', message: '' });
  const [formErrors, setFormErrors] = useState<Partial<BookingFormData>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });

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
    if (!cart.find(i => i.gear.id === gear.id)) setCart(prev => [...prev, { gear, days: 1 }]);
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.gear.id !== id));
  const cartTotal = cart.reduce((s, i) => s + i.gear.dailyRate * i.days, 0);

  const inputClasses = "w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:bg-white/[0.07] focus:outline-none transition-all duration-300";

  return (
    <section id="booking" ref={sectionRef} className="scroll-mt-20 py-24 md:py-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="text-gold text-xs font-bold uppercase tracking-[4px]">Services</span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mt-4 leading-[1.1]">
            Book & <span className="text-gold-gradient">Rent.</span>
          </h2>
          <p className="mt-6 text-gray-400 text-lg max-w-xl">
            Schedule an event shoot or rent premium cinema-grade equipment at competitive daily rates.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-12"
        >
          {(['events', 'rental'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-500 ${
                activeTab === tab ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {tab === 'events' ? 'Event Photography' : 'Gear Rental'}
            </button>
          ))}
        </motion.div>

        {/* Events */}
        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-3 max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
              {eventPackages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-gold/30 hover:bg-white/[0.05] transition-all duration-500 group"
                >
                  <img src={pkg.image} alt={pkg.title} loading="lazy" className="w-20 h-20 rounded-xl object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm">{pkg.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pkg.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gold font-bold text-sm">₹{pkg.startingPrice.toLocaleString()}+</span>
                      <span className="text-[10px] text-gray-600 uppercase tracking-wider">{pkg.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8">
              <h3 className="text-xl font-heading font-semibold text-white mb-6">Check Availability</h3>
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
                    <option value="">Select Event Type</option>
                    <option value="wedding">Wedding</option><option value="engagement">Engagement</option>
                    <option value="naming_ceremony">Naming Ceremony</option><option value="kids_photoshoot">Kids Photoshoot</option>
                    <option value="pre_post_wedding">Pre/Post Wedding</option><option value="corporate">Corporate</option>
                    <option value="social_gathering">Social Gathering</option>
                  </select>
                  {formErrors.eventType && <p className="text-red-400 text-xs -mt-2">{formErrors.eventType}</p>}
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={inputClasses} />
                  {formErrors.date && <p className="text-red-400 text-xs -mt-2">{formErrors.date}</p>}
                  <textarea placeholder="Additional details (optional)" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={3} className={inputClasses + ' resize-none'} />
                  <button type="submit" className="w-full py-4 rounded-xl bg-gold text-obsidian font-bold text-base hover:bg-gold-light transition-colors">
                    Check Availability
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* Rental */}
        {activeTab === 'rental' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {cart.length > 0 && (
              <div className="mb-8 p-4 rounded-2xl bg-gold/5 border border-gold/20 flex flex-wrap items-center justify-between gap-4">
                <span className="text-gold font-bold">Cart ({cart.length}) — ₹{cartTotal.toLocaleString()}/day</span>
                <div className="flex gap-2 flex-wrap">
                  {cart.map(item => (
                    <span key={item.gear.id} className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300">
                      {item.gear.name}<button onClick={() => removeFromCart(item.gear.id)} className="text-red-400 ml-1">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rentalCatalog.map((gear, i) => {
                const inCart = cart.some(c => c.gear.id === gear.id);
                return (
                  <motion.div
                    key={gear.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-gold/20 transition-all duration-500"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img src={gear.image} alt={gear.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-obsidian/70 backdrop-blur-sm rounded-lg text-[10px] text-gold font-bold uppercase tracking-wider">{gear.category}</span>
                      {!gear.available && <div className="absolute inset-0 bg-obsidian/70 flex items-center justify-center"><span className="text-red-400 text-xs font-bold">Unavailable</span></div>}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{gear.brand}</p>
                      <h4 className="font-semibold text-white text-sm mt-1">{gear.name}</h4>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                        <span className="text-gold font-bold">₹{gear.dailyRate.toLocaleString()}<span className="text-[10px] text-gray-500">/day</span></span>
                        <button
                          onClick={() => inCart ? removeFromCart(gear.id) : addToCart(gear)}
                          disabled={!gear.available}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
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
          </motion.div>
        )}
      </div>
    </section>
  );
};
