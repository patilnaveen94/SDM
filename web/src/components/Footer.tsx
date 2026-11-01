import React from 'react';
import { motion } from 'framer-motion';
import { businessInfo, webNavItems } from '../assetsConfig';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        {/* Big CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-left sm:mb-16 sm:text-center md:mb-20"
        >
          <h3 className="text-3xl font-heading font-bold leading-tight sm:text-4xl md:text-5xl">
            Ready to create <span className="text-gold-gradient">something extraordinary?</span>
          </h3>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4">
            <a href={`tel:${businessInfo.phone}`} className="flex min-h-12 items-center justify-center rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-obsidian transition-colors hover:bg-gold-light sm:px-8 sm:py-4">
              📞 +91 {businessInfo.phone}
            </a>
            <a href={`https://wa.me/91${businessInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 px-6 py-3.5 text-sm font-semibold text-green-300 transition-colors hover:bg-green-500/20 sm:px-8 sm:py-4">
              WhatsApp +91 {businessInfo.whatsapp}
            </a>
            <a href={`mailto:${businessInfo.email}`} className="flex min-h-12 items-center justify-center rounded-full border border-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-gold hover:text-gold sm:px-8 sm:py-4">
              ✉️ {businessInfo.email}
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-10 md:grid-cols-4 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-heading font-bold text-white sm:text-xl">{businessInfo.name}</h4>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">{businessInfo.tagline}</p>
            <h5 className="mt-6 text-xs font-bold uppercase tracking-[3px] text-gray-400">Contact & Location Details</h5>
            <div className="mt-3 space-y-3 text-sm text-gray-500">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`SDM Camera Rentals ${businessInfo.address}`)}`} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 transition-colors hover:text-gold">
                <span aria-hidden="true">📍</span><span>{businessInfo.address} · Get directions</span>
              </a>
              <a href={`tel:${businessInfo.phone}`} className="flex min-h-11 items-center gap-2 transition-colors hover:text-gold">
                <span aria-hidden="true">📞</span><span>+91 {businessInfo.phone}</span>
              </a>
              <a href={`https://wa.me/91${businessInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 transition-colors hover:text-green-300">
                <span aria-hidden="true">💬</span><span>WhatsApp: +91 {businessInfo.whatsapp}</span>
              </a>
              <a href={`mailto:${businessInfo.email}`} className="flex min-h-11 items-center gap-2 break-all transition-colors hover:text-gold">
                <span aria-hidden="true">✉️</span><span>{businessInfo.email}</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-[3px] mb-4">Navigate</h5>
            <nav className="space-y-1">
              {webNavItems.map(item => (
                <a key={item.href} href={item.href} className="flex min-h-10 items-center text-sm text-gray-500 transition-colors hover:text-white">{item.label}</a>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div>
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-[3px] mb-4">Follow</h5>
            <div className="flex flex-wrap gap-3">
              {[
                { href: businessInfo.socials.instagram, label: 'IG', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { href: businessInfo.socials.youtube, label: 'YT', icon: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                { href: businessInfo.socials.linkedin, label: 'LI', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-all duration-300 hover:border-gold hover:text-gold" aria-label={s.label}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-white/5 pt-6 sm:mt-16 sm:flex-row sm:items-center sm:gap-3 sm:pt-8">
          <p className="text-[11px] text-gray-600">© {new Date().getFullYear()} {businessInfo.name}. All rights reserved.</p>
          <p className="text-[11px] text-gray-700">Crafted for cinematic excellence.</p>
        </div>
      </div>
    </footer>
  );
};
