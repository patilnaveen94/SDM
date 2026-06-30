import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollZoomContainerProps {
  imageUrl: string;
  children: React.ReactNode;
  height?: string;
}

/**
 * Hombale Films-inspired scroll-zoom container.
 * As the user scrolls into this section, the background image dynamically scales
 * and zooms out to smoothly reveal text content beneath, temporarily anchoring
 * the scroll to build cinematic drama.
 * 
 * Fixed: Content overflow handled with scrollable inner container.
 */
export const ScrollZoomContainer: React.FC<ScrollZoomContainerProps> = ({
  imageUrl,
  children,
  height = '200vh',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Image zooms from 1.4x to 1x as user scrolls through section
  const imageScale = useTransform(scrollYProgress, [0, 0.4, 0.8], [1.4, 1.1, 1]);
  // Image fades as content appears
  const imageOpacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 0.6, 0.15]);
  // Content fades in during second half of scroll
  const contentOpacity = useTransform(scrollYProgress, [0.25, 0.5], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.25, 0.6], [60, 0]);
  // Overlay darkens progressively
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [0.2, 0.6, 0.9]);

  return (
    <div ref={containerRef} style={{ height }} className="relative">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">
        {/* Zooming Image */}
        <motion.div
          style={{ scale: imageScale, opacity: imageOpacity }}
          className="absolute inset-0"
        >
          <img
            src={imageUrl}
            alt="Cinematic Background"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Progressive Overlay */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-obsidian"
        />

        {/* Content Reveal — scrollable when content overflows */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 flex-1 flex items-center justify-center overflow-y-auto"
        >
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
