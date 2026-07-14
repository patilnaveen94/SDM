import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { academyCourses } from '../assetsConfig';

interface QueryFormData { studentName: string; email: string; phone: string; courseInterest: string; message: string; }

export const Academy: React.FC = () => {
  const [queryForm, setQueryForm] = useState<QueryFormData>({ studentName: '', email: '', phone: '', courseInterest: '', message: '' });
  const [queryErrors, setQueryErrors] = useState<Partial<QueryFormData>>({});
  const [querySubmitted, setQuerySubmitted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });

  const validateQuery = (): boolean => {
    const errors: Partial<QueryFormData> = {};
    if (!queryForm.studentName.trim()) errors.studentName = 'Required';
    if (!queryForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Valid email required';
    if (!queryForm.phone.match(/^\d{10}$/)) errors.phone = '10-digit phone required';
    if (!queryForm.courseInterest) errors.courseInterest = 'Select a course';
    if (!queryForm.message.trim()) errors.message = 'Required';
    setQueryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateQuery()) {
      setQuerySubmitted(true);
      setTimeout(() => setQuerySubmitted(false), 4000);
      setQueryForm({ studentName: '', email: '', phone: '', courseInterest: '', message: '' });
    }
  };

  const inputClasses = "w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-all duration-300";

  return (
    <section id="academy" ref={sectionRef} className="scroll-mt-20 py-24 md:py-40 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span className="text-gold text-xs font-bold uppercase tracking-[4px]">Training</span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mt-4 leading-[1.1]">
            SDM <span className="text-gold-gradient">Academy.</span>
          </h2>
          <p className="mt-6 text-gray-400 text-lg max-w-xl">
            Master visual storytelling through government-accredited masterclasses.
          </p>
        </motion.div>

        {/* Course Cards - horizontal scroll on mobile, grid on desktop */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {academyCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.8 }}
              className="group rounded-3xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-gold/20 transition-all duration-500"
            >
              <div className="relative h-52 overflow-hidden">
                <img src={course.image} alt={course.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2.5 py-1 bg-gold rounded-lg text-[10px] font-bold text-obsidian uppercase">{course.level}</span>
                  <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-[10px] text-white">{course.duration}</span>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-obsidian/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <span className="text-gold text-xs">★</span>
                  <span className="text-white text-xs font-medium">{course.rating}</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-heading font-bold text-lg text-white">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{course.description}</p>

                <div className="mt-4 space-y-2">
                  {course.syllabus.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-1 h-1 bg-gold rounded-full flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                  {course.syllabus.length > 3 && <p className="text-[11px] text-gold pl-3">+{course.syllabus.length - 3} more</p>}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <span className="text-gold font-bold text-xl">₹{course.price.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{course.enrolledCount} enrolled</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Query Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-white/[0.03] border border-white/5 rounded-3xl p-8 md:p-10"
        >
          <h3 className="text-2xl font-heading font-bold text-center text-white mb-2">Student Query Portal</h3>
          <p className="text-center text-gray-500 text-sm mb-8">Have questions? We'll respond within 24 hours.</p>

          {querySubmitted ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-12">
              <div className="text-4xl mb-3">✓</div>
              <h4 className="text-lg font-semibold">Query Sent</h4>
              <p className="text-gray-400 mt-1 text-sm">We'll be in touch shortly.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input type="text" placeholder="Your Name" value={queryForm.studentName} onChange={e => setQueryForm({...queryForm, studentName: e.target.value})} className={inputClasses} />
                  {queryErrors.studentName && <p className="text-red-400 text-xs mt-1">{queryErrors.studentName}</p>}
                </div>
                <div>
                  <input type="tel" placeholder="Phone" value={queryForm.phone} onChange={e => setQueryForm({...queryForm, phone: e.target.value})} className={inputClasses} />
                  {queryErrors.phone && <p className="text-red-400 text-xs mt-1">{queryErrors.phone}</p>}
                </div>
              </div>
              <input type="email" placeholder="Email" value={queryForm.email} onChange={e => setQueryForm({...queryForm, email: e.target.value})} className={inputClasses} />
              {queryErrors.email && <p className="text-red-400 text-xs -mt-2">{queryErrors.email}</p>}
              <select value={queryForm.courseInterest} onChange={e => setQueryForm({...queryForm, courseInterest: e.target.value})} className={inputClasses + ' appearance-none'}>
                <option value="">Course of Interest</option>
                {academyCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {queryErrors.courseInterest && <p className="text-red-400 text-xs -mt-2">{queryErrors.courseInterest}</p>}
              <textarea placeholder="Your question..." value={queryForm.message} onChange={e => setQueryForm({...queryForm, message: e.target.value})} rows={4} className={inputClasses + ' resize-none'} />
              {queryErrors.message && <p className="text-red-400 text-xs -mt-2">{queryErrors.message}</p>}
              <button type="submit" className="w-full py-4 rounded-xl bg-gold text-obsidian font-bold hover:bg-gold-light transition-colors">Send Query</button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
