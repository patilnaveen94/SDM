import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { getActivePartners } from '../store/dataStore';

export const Partners: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const partners = getActivePartners();

  // Don't render section if no active partners
  if (partners.length === 0) return null;

  return (
    <section id="partners" ref={sectionRef} className="scroll-mt-20 py-20 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="text-gold text-xs font-bold uppercase tracking-[4px]">Trusted By</span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mt-4 leading-[1.1]">
            Associated <span className="text-gold-gradient">Partners.</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base max-w-lg mx-auto">
            Proud to collaborate with industry leaders who share our commitment to visual excellence.
          </p>
        </motion.div>

        {/* Partners grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              {partner.website ? (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-gold/20 hover:bg-white/[0.06] transition-all duration-500"
                  aria-label={partner.name}
                >
                  <PartnerLogo partner={partner} />
                </a>
              ) : (
                <div className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-gold/10 transition-all duration-500">
                  <PartnerLogo partner={partner} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PartnerLogo: React.FC<{ partner: ReturnType<typeof getActivePartners>[0] }> = ({ partner }) => (
  <>
    {partner.logo ? (
      <img
        src={partner.logo}
        alt={partner.name}
        className="h-10 w-auto object-contain filter grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-500"
      />
    ) : (
      <div className="h-10 w-full flex items-center justify-center text-2xl">🤝</div>
    )}
    <span className="text-xs text-gray-500 group-hover:text-gray-300 text-center transition-colors duration-300 leading-snug">
      {partner.name}
    </span>
    {partner.description && (
      <span className="text-[10px] text-gray-600 text-center line-clamp-2">{partner.description}</span>
    )}
  </>
);
