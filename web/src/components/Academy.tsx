import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { academyCourses } from '../../../shared/assetsConfig';

interface QueryFormData {
  studentName: string;
  email: string;
  phone: string;
  courseInterest: string;
  message: string;
}

export const Academy: React.FC = () => {
  const [queryForm, setQueryForm] = useState<QueryFormData>({
    studentName: '',
    email: '',
    phone: '',
    courseInterest: '',
    message: '',
  });
  const [queryErrors, setQueryErrors] = useState<Partial<QueryFormData>>({});
  const [querySubmitted, setQuerySubmitted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const validateQuery = (): boolean => {
    const errors: Partial<QueryFormData> = {};
    if (!queryForm.studentName.trim()) errors.studentName = 'Name is required';
    if (!queryForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Valid email required';
    if (!queryForm.phone.match(/^\d{10}$/)) errors.phone = 'Valid 10-digit phone required';
    if (!queryForm.courseInterest) errors.courseInterest = 'Select a course';
    if (!queryForm.message.trim()) errors.message = 'Message is required';
    setQueryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateQuery()) {
      setQuerySubmitted(true);
      setTimeout(() => setQuerySubmitted(false), 4000);
      setQueryForm({ studentName: '', email: '', phone: '', courseInterest: '', message: '' });
    }
  };

  return (
    <section id="academy" ref={sectionRef} className="scroll-mt-20 py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-heading font-bold">
          SDM <span className="text-gold-gradient">Academy</span>
        </h2>
        <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
          Master the art of visual storytelling through our government-accredited masterclasses.
        </p>
      </motion.div>

      {/* Course Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {academyCourses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.15 }}
            whileHover={{ y: -6 }}
            className="glass-card overflow-hidden group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-1 bg-gold/90 rounded text-xs font-bold text-obsidian">
                  {course.level}
                </span>
                <span className="px-2 py-1 bg-obsidian/80 backdrop-blur-sm rounded text-xs text-gray-300">
                  {course.duration}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-obsidian/80 backdrop-blur-sm px-2 py-1 rounded">
                <span className="text-gold text-xs">★</span>
                <span className="text-white text-xs font-medium">{course.rating}</span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="font-heading font-semibold text-lg text-white">{course.title}</h3>
              <p className="text-sm text-gray-400 mt-2 line-clamp-3">{course.description}</p>

              {/* Syllabus Preview */}
              <div className="mt-4 space-y-1.5">
                {course.syllabus.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0" />
                    {item}
                  </div>
                ))}
                {course.syllabus.length > 4 && (
                  <p className="text-xs text-gold">+{course.syllabus.length - 4} more modules</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-border-subtle">
                <div>
                  <span className="text-gold font-bold text-lg">₹{course.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 block">{course.enrolledCount} enrolled</span>
                </div>
                <span className="text-xs text-gray-500">by {course.instructor}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Student Query Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto glass-card p-8"
      >
        <h3 className="text-2xl font-heading font-semibold text-center text-gold mb-6">
          Student Query Portal
        </h3>
        <p className="text-center text-gray-400 text-sm mb-8">
          Have questions about our courses? Send us a message and we'll get back within 24 hours.
        </p>

        {querySubmitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-5xl mb-4">📧</div>
            <h4 className="text-xl font-semibold text-white">Query Sent Successfully!</h4>
            <p className="text-gray-400 mt-2">Our team will respond to your inquiry shortly.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleQuerySubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={queryForm.studentName}
                  onChange={(e) => setQueryForm({ ...queryForm, studentName: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                />
                {queryErrors.studentName && <p className="text-red-400 text-xs mt-1">{queryErrors.studentName}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={queryForm.phone}
                  onChange={(e) => setQueryForm({ ...queryForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                />
                {queryErrors.phone && <p className="text-red-400 text-xs mt-1">{queryErrors.phone}</p>}
              </div>
            </div>
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={queryForm.email}
                onChange={(e) => setQueryForm({ ...queryForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
              />
              {queryErrors.email && <p className="text-red-400 text-xs mt-1">{queryErrors.email}</p>}
            </div>
            <div>
              <select
                value={queryForm.courseInterest}
                onChange={(e) => setQueryForm({ ...queryForm, courseInterest: e.target.value })}
                className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white focus:border-gold focus:outline-none transition-colors appearance-none"
              >
                <option value="">Course of Interest</option>
                {academyCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              {queryErrors.courseInterest && <p className="text-red-400 text-xs mt-1">{queryErrors.courseInterest}</p>}
            </div>
            <div>
              <textarea
                placeholder="Your question or message..."
                value={queryForm.message}
                onChange={(e) => setQueryForm({ ...queryForm, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-dark-surface border border-border-subtle rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors resize-none"
              />
              {queryErrors.message && <p className="text-red-400 text-xs mt-1">{queryErrors.message}</p>}
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg bg-gold text-obsidian font-bold hover:bg-gold-light transition-colors"
            >
              Send Query
            </motion.button>
          </form>
        )}
      </motion.div>
    </section>
  );
};
