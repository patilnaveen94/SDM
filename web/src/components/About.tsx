import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { businessInfo } from '../assetsConfig';

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
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-6xl font-heading font-bold text-gold-gradient">
        {count}{suffix}
      </div>
      <div className="text-sm text-gray-400 mt-2 uppercase tracking-wider">{label}</div>
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

  return (
    <section id="about" ref={sectionRef} className="scroll-mt-20 relative overflow-hidden">
      {/* Full-width cinematic stats bar (OnePlus KSP style) */}
      <div className="py-20 md:py-28 border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          <AnimatedCounter value={10} suffix="+" label="Years Experience" />
          <AnimatedCounter value={500} suffix="+" label="Events Captured" />
          <AnimatedCounter value={200} suffix="+" label="Students Trained" />
          <AnimatedCounter value={50} suffix="+" label="Gear Collection" />
        </div>
      </div>

      {/* Main About Content */}
      <div className="py-24 md:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="text-gold text-xs font-bold uppercase tracking-[4px]">About the Founder</span>
        </motion.div>

        {/* Big Title */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1] max-w-4xl"
        >
          The Vision Behind <br/>
          <span className="text-gold-gradient">Every Frame.</span>
        </motion.h2>

        {/* Two-col layout */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mt-16 items-center">
          {/* Image with parallax + scale */}
          <motion.div
            ref={imageRef}
            style={{ scale: imageScale, rotate: imageRotate }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5]">
              <motion.img
                src={businessInfo.founder.profileImage}
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
              className="absolute -bottom-6 left-6 right-6 bg-dark-surface/90 backdrop-blur-xl border border-border-subtle rounded-2xl p-5"
            >
              <div className="text-xl font-heading font-bold text-white">{businessInfo.founder.name}</div>
              <div className="text-sm text-gold mt-1">{businessInfo.founder.title}</div>
            </motion.div>
          </motion.div>

          {/* Text content with staggered reveals */}
          <div className="space-y-8 lg:pt-10">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg md:text-xl text-gray-300 leading-relaxed"
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
                  <div className="w-8 h-px bg-gold group-hover:w-12 transition-all duration-500" />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">{credential}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1 }}
              className="pt-6 flex flex-wrap gap-4"
            >
              <a
                href={`tel:${businessInfo.phone}`}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gold text-obsidian font-bold text-base hover:shadow-lg hover:shadow-gold/20 transition-all duration-500"
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
