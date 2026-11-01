import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { getMediaConfig } from '../store/mediaStore';

type PortfolioCategory = 'all' | 'wedding' | 'corporate' | 'rental_gear' | 'videos';

const categories: { label: string; value: PortfolioCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Weddings', value: 'wedding' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'Gear', value: 'rental_gear' },
  { label: 'Videos', value: 'videos' },
];

export const Portfolio: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });

  const media = getMediaConfig();
  const portfolioItems = media.portfolioItems;

  const filteredItems = activeFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === activeFilter);

  return (
    <section id="portfolio" ref={sectionRef} className="scroll-mt-20 border-t border-white/5 py-16 sm:py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-9 sm:mb-12"
        >
          <span className="text-gold text-xs font-bold uppercase tracking-[4px]">Our Work</span>
          <h2 className="mt-3 text-3xl font-heading font-bold leading-tight sm:text-4xl md:text-6xl lg:text-7xl">
            Crafted with <span className="text-gold-gradient">Precision.</span>
          </h2>
        </motion.div>

        {/* Filter Tabs - OnePlus style minimal pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-2 sm:mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              aria-pressed={activeFilter === cat.value}
              className={`min-h-10 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 sm:px-5 sm:text-xs ${
                activeFilter === cat.value
                  ? 'bg-white text-obsidian'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Grid - OnePlus style mixed sizes */}
        {filteredItems.length === 0 ? (
          <p className="rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-12 text-center text-sm text-gray-500">More work is on the way. Check back soon.</p>
        ) : (
        <motion.div layout className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 lg:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => (
              <motion.button
                type="button"
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                aria-label={`View ${item.title}${item.type === 'video' ? ', video' : ''}`}
                className={`group relative overflow-hidden rounded-xl text-left focus-visible:outline-gold sm:rounded-2xl ${
                  i === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-square'
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-transparent transition-colors duration-300 sm:bg-obsidian/0 sm:group-hover:bg-obsidian/50">
                  <div className="w-full p-3 transition-all duration-300 sm:translate-y-3 sm:p-5 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                    <h3 className="text-xs font-semibold leading-5 text-white sm:text-base">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-300 sm:text-xs">{item.description}</p>
                  </div>
                </div>
                {item.type === 'video' && (
                  <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:right-4 sm:top-4 sm:h-9 sm:w-9">
                    <span className="ml-0.5 text-xs text-white" aria-hidden="true">▶</span>
                  </div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-2xl flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.title}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 30 }}
              className="relative max-w-5xl w-full rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'video' ? (
                <video autoPlay controls className="w-full max-h-[80vh] object-contain bg-black rounded-3xl">
                  <source src={selectedItem.fullUrl} type="video/mp4" />
                </video>
              ) : (
                <img src={selectedItem.fullUrl} alt={selectedItem.title} className="w-full max-h-[80vh] object-contain" />
              )}
              <button
                type="button"
                aria-label="Close portfolio preview"
                onClick={() => setSelectedItem(null)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
