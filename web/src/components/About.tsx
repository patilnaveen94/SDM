import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { businessInfo } from '../assetsConfig';
import { getMediaConfig } from '../store/mediaStore';

/** Animated counter component (OnePlus-style stat animation) */
const AnimatedCounter: React.FC<{ value: number; suffix?: string; label: string }> = ({ value, suffix = '', label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <div ref={ref} className="rounded-2xl border border-white/5 bg-white/[0.025] px-2 py-4 text-center sm:px-4 sm:py-5 md:border-0 md:bg-transparent">
      <div className="text-3xl font-heading font-bold text-gold-gradient sm:text-4xl md:text-6xl">
        {count}{suffix}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-gray-400 sm:mt-2 sm:text-xs md:text-sm">{label}</div>
    </div>
  );
};

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-15%' });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.5], [-2, 0]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);
  const media = getMediaConfig();

  return (
    <section id="about" ref={sectionRef} className="scroll-mt-20 relative overflow-hidden">
      {/* Full-width cinematic stats bar (OnePlus KSP style) */}
      <div className="border-b border-white/5 py-10 sm:py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 sm:gap-4 md:grid-cols-4 md:gap-5">
          <AnimatedCounter value={10} suffix="+" label="Years Experience" />
          <AnimatedCounter value={500} suffix="+" label="Events Captured" />
          <AnimatedCounter value={200} suffix="+" label="Students Trained" />
          <AnimatedCounter value={150} suffix="+" label="Gear Collection" />
        </div>
      </div>

      {/* Main About Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-4 sm:mb-6"
        >
          <span className="text-gold text-xs font-bold uppercase tracking-[4px]">About the Founder</span>
        </motion.div>

        {/* Big Title */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl text-3xl font-heading font-bold leading-tight sm:text-4xl md:text-6xl lg:text-7xl"
        >
          The Vision Behind{' '}
          <span className="text-gold-gradient">Every Frame.</span>
        </motion.h2>

        {/* Two-col layout */}
        <div className="mt-10 grid items-center gap-12 sm:mt-14 lg:grid-cols-2 lg:gap-20">
          {/* Image with parallax + scale */}
          <motion.div
            ref={imageRef}
            style={{ scale: imageScale, rotate: imageRotate }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="relative aspect-[4/4.5] overflow-hidden rounded-3xl sm:aspect-[4/5]">
              <motion.img
                src={media.founderImage}
                alt={businessInfo.founder.name}
                className="w-full h-full object-cover"
                style={{ y: parallaxY }}
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 via-transparent to-transparent" />
            </div>

            {/* Floating name badge (OnePlus style floating elements) */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute -bottom-5 left-3 right-3 rounded-2xl border border-white/10 bg-dark-surface/95 p-4 shadow-xl backdrop-blur-xl sm:-bottom-6 sm:left-6 sm:right-6 sm:p-5"
            >
              <div className="text-xl font-heading font-bold text-white">{businessInfo.founder.name}</div>
              <div className="text-sm text-gold mt-1">{businessInfo.founder.title}</div>
            </motion.div>
          </motion.div>

          {/* Text content with staggered reveals */}
          <div className="space-y-6 sm:space-y-8 lg:pt-6">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-base leading-7 text-gray-300 sm:text-lg sm:leading-8"
            >
              {businessInfo.founder.bio}
            </motion.p>

            {/* Credentials with horizontal reveal lines (OnePlus spec-style) */}
            <div className="space-y-4 pt-4">
              {businessInfo.founder.credentials.map((credential, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4 group"
                >
                  <div className="h-px w-6 flex-shrink-0 bg-gold transition-all duration-500 group-hover:w-10 sm:w-8" />
                  <span className="text-sm leading-6 text-gray-300 transition-colors duration-300 group-hover:text-white">{credential}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1 }}
              className="pt-2 sm:pt-4"
            >
              <a
                href={`tel:${businessInfo.phone}`}
                className="group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-obsidian transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
              >
                <span>Connect Now</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
