import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { getPublishedUpdates } from '../store/dataStore';

const typeIcons: Record<string, string> = {
  achievement: '🏆',
  new_gear: '🎥',
  recent_shoot: '🎬',
  announcement: '📢',
};

const typeLabels: Record<string, string> = {
  achievement: 'Achievement',
  new_gear: 'New Gear',
  recent_shoot: 'Recent Shoot',
  announcement: 'Announcement',
};

export const UpdatesFeed: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });
  const updates = getPublishedUpdates();

  if (updates.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-24 md:py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <span className="text-gold text-xs font-bold uppercase tracking-[4px]">What's New</span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mt-4 leading-[1.1]">
            Latest <span className="text-gold-gradient">Updates.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {updates.slice(0, 6).map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.7 }}
              className="group rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-gold/20 transition-all duration-500"
            >
              {post.image && (
                <div className="relative h-44 overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {post.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-obsidian/30">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white ml-0.5">▶</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{typeIcons[post.type]}</span>
                  <span className="text-[10px] text-gold uppercase tracking-wider font-bold">{typeLabels[post.type]}</span>
                </div>
                <h3 className="text-white font-semibold text-base">{post.title}</h3>
                <p className="text-gray-500 text-sm mt-2 line-clamp-3">{post.description}</p>
                <p className="text-[10px] text-gray-600 mt-3">{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
