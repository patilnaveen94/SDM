import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { businessInfo } from '../assetsConfig';
import { getMediaConfig } from '../store/mediaStore';

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const media = getMediaConfig();
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
      className="relative min-h-[100svh] w-full overflow-hidden"
    >
      {/* Video Background with scroll zoom */}
      <motion.div style={{ scale }} className="absolute inset-0">
        <motion.div style={{ filter: videoBlur.get() > 0 ? `blur(${videoBlur.get()}px)` : 'none' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-[100svh] min-h-[620px] w-full object-cover"
            poster={media.heroFallbackImage}
          >
            <source src={media.heroVideoUrl} type="video/mp4" />
          </video>
        </motion.div>
      </motion.div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/30 via-transparent to-obsidian" />

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-5 pb-24 pt-28 text-center sm:px-8"
      >
        {/* Small badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 rounded-full border border-gold/30 bg-black/30 px-4 py-2 backdrop-blur-sm sm:mb-8"
        >
          <span className="text-gold text-xs font-medium tracking-widest uppercase">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gold align-middle" />
            Premium visual production · Bengaluru
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl text-[clamp(3.25rem,12vw,8.5rem)] font-heading font-bold leading-[0.94] tracking-tight"
        >
          <span className="block text-white">{businessInfo.name.split(' ')[0]}</span>
          <span className="mt-1 block text-gold-gradient sm:mt-2">
            {businessInfo.name.split(' ').slice(1).join(' ')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 max-w-2xl text-sm font-light leading-7 tracking-wide text-gray-200/80 sm:mt-7 sm:text-lg sm:leading-8"
        >
          {businessInfo.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4"
        >
          <motion.a
            href="#booking"
            className="group relative min-h-12 overflow-hidden rounded-full bg-gold px-8 py-3.5 text-center text-base font-bold text-obsidian sm:px-9 sm:py-4 sm:text-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10">Explore gear &amp; services <span aria-hidden="true">→</span></span>
            <div className="absolute inset-0 bg-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </motion.a>
          <motion.a
            href="#academy"
            className="min-h-12 rounded-full border border-white/25 bg-black/15 px-8 py-3.5 text-center text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-gold hover:text-gold sm:px-9 sm:py-4 sm:text-lg"
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
          className="absolute bottom-7 hidden sm:block"
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
