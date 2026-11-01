import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { businessInfo, webNavItems } from '../assetsConfig';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    const previousBodyOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.getElementById(href.replace('#', ''));
    if (target) {
      const offset = 80;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-obsidian/80 backdrop-blur-2xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3 md:h-20">
            <motion.a href="#hero" aria-label={`${businessInfo.name}, home`} onClick={(e) => handleNavClick(e, '#hero')} whileHover={{ scale: 1.02 }} className="min-w-0">
              <span className="block truncate text-base font-heading font-bold text-white sm:text-lg md:text-xl">
                {businessInfo.name}
              </span>
            </motion.a>

            {/* Desktop */}
            <div className="hidden items-center gap-7 lg:flex xl:gap-9">
              {webNavItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="whitespace-nowrap py-3 text-xs font-medium uppercase tracking-wider text-gray-400 transition-colors duration-300 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`tel:${businessInfo.phone}`}
                className="px-5 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider hover:bg-gold hover:text-obsidian hover:border-gold transition-all duration-500"
              >
                Call Now
              </a>
            </div>

            <a href="#booking" onClick={(e) => handleNavClick(e, '#booking')} className="ml-auto hidden min-h-11 items-center justify-center rounded-full bg-gold px-5 text-xs font-bold uppercase tracking-wider text-obsidian transition-colors hover:bg-gold-light md:inline-flex lg:ml-0">
              Get started
            </a>

            {/* Mobile and tablet navigation */}
            <button
              type="button"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-white/10 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <div className="flex h-4 w-5 flex-col justify-between">
                <span className={`h-px w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-px w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-px w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu - Full screen overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="fixed inset-0 z-[60] flex flex-col bg-obsidian px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24 lg:hidden"
          >
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-2xl text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              ×
            </button>
            <div className="mb-8 border-b border-white/10 pb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Explore SDM</p>
              <p className="mt-2 text-sm text-gray-500">Production, gear rentals and hands-on training.</p>
            </div>
            <nav className="flex flex-col">
              {webNavItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex min-h-14 items-center justify-between border-b border-white/5 py-3 font-heading text-2xl font-medium text-white transition-colors hover:text-gold"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}<span className="text-base text-gold" aria-hidden="true">↗</span>
                </motion.a>
              ))}
            </nav>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
              <a href="#booking" onClick={(e) => handleNavClick(e, '#booking')} className="flex min-h-12 items-center justify-center rounded-full bg-gold px-4 text-sm font-bold text-obsidian">Explore services</a>
              <a href={`tel:${businessInfo.phone}`} className="flex min-h-12 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-semibold text-white">Call us</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
