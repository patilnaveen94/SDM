import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { businessInfo, heroAssets } from '../assetsConfig';

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const videoBlur = useTransform(scrollYProgress, [0, 1], [0, 10]);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-[120vh] overflow-hidden"
    >
      {/* Video Background with scroll zoom */}
      <motion.div style={{ scale }} className="absolute inset-0">
        <motion.div style={{ filter: videoBlur.get() > 0 ? `blur(${videoBlur.get()}px)` : 'none' }}>
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
      </motion.div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/30 via-transparent to-obsidian" />

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-4"
      >
        {/* Small badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 backdrop-blur-sm"
        >
          <span className="text-gold text-xs font-medium tracking-widest uppercase">
            Premium Visual Production House
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-heading font-bold leading-[0.9] tracking-tight"
        >
          <span className="block text-white">{businessInfo.name.split(' ')[0]}</span>
          <span className="block text-gold-gradient mt-2">
            {businessInfo.name.split(' ').slice(1).join(' ')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl font-light tracking-wide leading-relaxed"
        >
          {businessInfo.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-12 flex flex-col sm:flex-row gap-4"
        >
          <motion.a
            href="#booking"
            className="group px-10 py-4 rounded-full bg-gold text-obsidian font-bold text-lg relative overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10">Book a Session</span>
            <div className="absolute inset-0 bg-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </motion.a>
          <motion.a
            href="#academy"
            className="px-10 py-4 rounded-full border border-white/20 text-white font-semibold text-lg backdrop-blur-sm hover:border-gold hover:text-gold transition-all duration-500"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Join the Academy
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-gray-500 uppercase tracking-[3px]">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
