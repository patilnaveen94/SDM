import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { businessInfo, heroAssets } from '../assetsConfig';

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Video Background */}
      <motion.div style={{ scale }} className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster={heroAssets.fallbackImage}
        >
          <source src={heroAssets.videoUrl} type="video/mp4" />
        </video>
      </motion.div>

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 cinematic-overlay" />

      {/* Grain Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}
      />

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-tight">
            <span className="text-white">{businessInfo.name.split(' ')[0]}</span>{' '}
            <span className="text-gold-gradient">
              {businessInfo.name.split(' ').slice(1).join(' ')}
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl font-light tracking-wide"
        >
          {businessInfo.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <motion.a
            href="#booking"
            className="px-8 py-4 rounded-full bg-gold text-obsidian font-bold text-base md:text-lg animate-gold-pulse hover:bg-gold-light transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Book a Session
          </motion.a>
          <motion.a
            href="#academy"
            className="px-8 py-4 rounded-full border-2 border-gold text-gold font-semibold text-base md:text-lg hover:bg-gold hover:text-obsidian transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Join the Academy
          </motion.a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="w-6 h-10 rounded-full border-2 border-gold/50 flex items-start justify-center pt-2"
          >
            <div className="w-1.5 h-3 bg-gold rounded-full" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
