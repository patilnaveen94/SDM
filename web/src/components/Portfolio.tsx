import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { portfolioItems, PortfolioCategory } from '../assetsConfig';

const categories: { label: string; value: PortfolioCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Weddings', value: 'wedding' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'Rental Gear', value: 'rental_gear' },
  { label: 'Videos', value: 'videos' },
];

export const Portfolio: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory>('all');
  const [selectedItem, setSelectedItem] = useState<typeof portfolioItems[0] | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const filteredItems = activeFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === activeFilter);

  return (
    <section id="portfolio" ref={sectionRef} className="scroll-mt-20 py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-heading font-bold">
          Our <span className="text-gold-gradient">Portfolio</span>
        </h2>
        <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
          A curated collection of our finest work across weddings, events, and cinema production.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveFilter(cat.value)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === cat.value
                ? 'bg-gold text-obsidian shadow-lg shadow-gold/20'
                : 'bg-card-surface text-gray-300 hover:bg-border-subtle hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Masonry Grid */}
      <motion.div
        layout
        className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              className="break-inside-avoid group cursor-pointer relative rounded-xl overflow-hidden"
              onClick={() => setSelectedItem(item)}
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                  {item.type === 'video' && (
                    <span className="inline-flex items-center mt-2 text-gold text-xs font-medium">
                      ▶ Play Video
                    </span>
                  )}
                </div>
              </div>
              {/* Video Badge */}
              {item.type === 'video' && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gold/90 flex items-center justify-center">
                  <span className="text-obsidian text-xs">▶</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative max-w-5xl w-full max-h-[90vh] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'video' ? (
                <video
                  autoPlay
                  controls
                  className="w-full h-auto max-h-[80vh] object-contain bg-black rounded-2xl"
                >
                  <source src={selectedItem.fullUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={selectedItem.fullUrl}
                  alt={selectedItem.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-obsidian/90 to-transparent">
                <h3 className="text-xl font-heading font-bold text-white">{selectedItem.title}</h3>
                <p className="text-gray-300 mt-1">{selectedItem.description}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card-surface/80 text-white flex items-center justify-center hover:bg-gold hover:text-obsidian transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
