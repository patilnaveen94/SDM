import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { businessInfo } from '../assetsConfig';

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Parallax on the image
  const imageY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);

  return (
    <section id="about" ref={sectionRef} className="scroll-mt-20 py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white">
            Meet the <span className="text-gold-gradient">Visionary</span>
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto rounded-full mt-6" />
        </motion.div>

        {/* Two-column layout: Image + Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Cinematic Image with parallax */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] max-h-[600px]">
              <motion.img
                src={businessInfo.founder.profileImage}
                alt={businessInfo.founder.name}
                className="w-full h-full object-cover"
                style={{ y: imageY, scale: imageScale }}
              />
              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-obsidian/20" />
            </div>

            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-6 -right-4 md:right-6 bg-card-surface/90 backdrop-blur-md border border-border-subtle rounded-xl p-4 shadow-2xl"
            >
              <p className="text-gold font-heading font-bold text-lg">{businessInfo.founder.name}</p>
              <p className="text-gray-400 text-xs mt-1">{businessInfo.founder.title}</p>
            </motion.div>

            {/* Decorative gold border accent */}
            <div className="absolute -top-3 -left-3 w-24 h-24 border-l-2 border-t-2 border-gold/40 rounded-tl-2xl" />
            <div className="absolute -bottom-3 -right-3 w-24 h-24 border-r-2 border-b-2 border-gold/40 rounded-br-2xl" />
          </motion.div>

          {/* Right: Bio + Credentials */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="space-y-6"
          >
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              {businessInfo.founder.bio}
            </p>

            {/* Credentials list */}
            <div className="space-y-3 pt-2">
              {businessInfo.founder.credentials.map((credential, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card-surface/50 border border-border-subtle hover:border-gold/30 transition-colors group"
                >
                  <span className="text-gold text-sm flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">✦</span>
                  <span className="text-sm text-gray-300 leading-snug">{credential}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="pt-4 flex flex-wrap gap-4"
            >
              <a
                href={`tel:${businessInfo.phone}`}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gold text-obsidian font-bold hover:bg-gold-light transition-colors"
              >
                <span>📞</span>
                Connect Now
              </a>
              <a
                href="#portfolio"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-gold/60 text-gold font-semibold hover:bg-gold hover:text-obsidian transition-all"
              >
                View Work →
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
