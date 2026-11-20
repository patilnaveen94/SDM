import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useReducedMotion } from 'framer-motion';
import { businessInfo } from '../assetsConfig';
import { getMediaConfig } from '../store/mediaStore';

/** Animated counter component (OnePlus-style stat animation) */
const AnimatedCounter: React.FC<{ value: number; suffix?: string; label: string }> = ({ value, suffix = '', label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(value);
      return;
    }
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
  }, [isInView, shouldReduceMotion, value]);

  return (
    <div ref={ref} className="about-stat-card rounded-2xl border border-white/5 bg-white/[0.025] px-2 py-4 text-center sm:px-4 sm:py-5 md:border-0 md:bg-transparent">
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
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
  const imageRotate = useTransform(scrollYProgress, [0, 0.5], [-2, 0]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['5%', '-5%']);
  const media = getMediaConfig();

  return (
    <section id="about" ref={sectionRef} className="about-section scroll-mt-20 relative overflow-hidden">
      {/* Full-width cinematic stats bar (OnePlus KSP style) */}
      <div className="border-b border-white/5 py-10 sm:py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 sm:gap-4 md:grid-cols-4 md:gap-5">
          <AnimatedCounter value={13} suffix="+" label="Years Experience" />
          <AnimatedCounter value={4} label="Featured Film Credits" />
          <AnimatedCounter value={6} suffix="+" label="Client Organizations" />
          <AnimatedCounter value={3} label="Production Specialties" />
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
            className="about-founder-photo relative mx-auto w-full max-w-lg"
          >
            <div className="relative aspect-[4/4.5] overflow-hidden rounded-3xl sm:aspect-[4/5]">
              <motion.img
                src={media.founderImage}
                alt={businessInfo.founder.name}
                className="about-founder-image w-full h-full object-cover"
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

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <motion.article
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
            whileHover={shouldReduceMotion ? undefined : { y: -5 }}
            className="about-info-card rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Selected Filmography</p>
            <ul className="mt-5 space-y-3">
              {businessInfo.founder.filmography.map(film => (
                <li key={film.title} className="flex flex-col justify-between gap-1 border-b border-white/5 pb-3 last:border-0 sm:flex-row sm:items-center">
                  <span className="font-medium text-white">{film.title}</span>
                  <span className="text-xs text-gray-400">{film.role}</span>
                </li>
              ))}
            </ul>
          </motion.article>

          <motion.article
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
            whileHover={shouldReduceMotion ? undefined : { y: -5 }}
            className="about-info-card rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Core Expertise</p>
            <ul className="mt-5 space-y-3">
              {businessInfo.founder.credentials.map(expertise => (
                <li key={expertise} className="flex gap-3 text-sm leading-6 text-gray-300">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                  {expertise}
                </li>
              ))}
            </ul>
          </motion.article>
        </div>

        <motion.article
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
          className="about-info-card mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:mt-6 sm:p-7"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Premium Clientele & Vendor Portfolio</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businessInfo.founder.clientele.map(clientGroup => (
              <motion.div
                key={clientGroup.category}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.08 }}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                className="about-client-card rounded-xl border border-white/5 bg-black/20 p-4"
              >
                <p className="text-sm font-semibold text-white">{clientGroup.category}</p>
                <p className="mt-2 text-sm leading-6 text-gray-300">{clientGroup.organizations.join(' · ')}</p>
                <p className="mt-2 text-xs text-gray-500">{clientGroup.relationship}</p>
              </motion.div>
            ))}
          </div>
        </motion.article>

        <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
          <motion.article
            initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
            className="about-info-card rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Work History</p>
            <div className="mt-5 space-y-5">
              {businessInfo.founder.workHistory.map(position => (
                <div key={`${position.role}-${position.organization}`} className="border-l border-gold/40 pl-4">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <h3 className="text-sm font-semibold text-white">{position.role}</h3>
                    {position.period && <span className="text-xs text-gray-500">{position.period}</span>}
                  </div>
                  <p className="mt-1 text-xs text-gold">{position.organization}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{position.description}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
            className="about-info-card rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Services & Bookings</p>
            <div className="mt-5 space-y-5">
              {businessInfo.founder.services.map(service => (
                <div key={service.category}>
                  <h3 className="text-sm font-semibold text-white">{service.category}</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {service.offerings.map(offering => (
                      <li key={offering} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">{offering}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Contact</p>
              <p className="mt-2 text-sm text-gray-300">Bengaluru, India · +91 {businessInfo.phone}</p>
              <a href={`mailto:${businessInfo.email}`} className="mt-1 inline-block break-all text-sm text-gold hover:underline">{businessInfo.email}</a>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
};
