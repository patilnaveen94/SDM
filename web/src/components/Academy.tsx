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
    <section id="academy" ref={sectionRef} className="scroll-mt-20 border-t border-white/5 py-16 sm:py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 sm:mb-14"
        >
          <span className="text-gold text-xs font-bold uppercase tracking-[4px]">Training</span>
          <h2 className="mt-3 text-3xl font-heading font-bold leading-tight sm:text-4xl md:text-6xl lg:text-7xl">
            SDM <span className="text-gold-gradient">Academy.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-gray-400 sm:text-base sm:leading-7">
            Master visual storytelling through government-accredited masterclasses.
          </p>
        </motion.div>

        {/* Course Cards - horizontal scroll on mobile, grid on desktop */}
        <div className="mb-16 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mb-20 lg:grid-cols-3 lg:gap-6">
          {academyCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.8 }}
              className="group overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-gold/20"
            >
              <div className="relative h-44 overflow-hidden sm:h-52">
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

              <div className="p-4 sm:p-6">
                <h3 className="font-heading text-base font-bold text-white sm:text-lg">{course.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{course.description}</p>

                <div className="mt-4 space-y-2.5">
                  {course.syllabus.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs leading-5 text-gray-400">
                      <div className="w-1 h-1 bg-gold rounded-full flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                  {course.syllabus.length > 3 && <p className="text-[11px] text-gold pl-3">+{course.syllabus.length - 3} more</p>}
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/5 pt-4">
                  <span className="text-lg font-bold text-gold sm:text-xl">₹{course.price.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{course.enrolledCount} enrolled</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQueryForm(current => ({ ...current, courseInterest: course.id }));
                    document.getElementById('academy-query')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl border border-white/10 text-sm font-semibold text-white transition-colors hover:border-gold/40 hover:text-gold"
                >
                  Ask about this course <span className="ml-2" aria-hidden="true">→</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Query Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="academy-query"
          className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.015] p-5 sm:p-7 md:p-10"
        >
          <h3 className="mb-2 text-center font-heading text-xl font-bold text-white sm:text-2xl">Let’s plan your learning</h3>
          <p className="mb-6 text-center text-sm leading-6 text-gray-500 sm:mb-8">Tell us what you’re interested in and our team will help you find the right course.</p>

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
                  <input type="text" autoComplete="name" aria-label="Your name" placeholder="Your Name" value={queryForm.studentName} onChange={e => setQueryForm({...queryForm, studentName: e.target.value})} className={inputClasses} />
                  {queryErrors.studentName && <p className="text-red-400 text-xs mt-1">{queryErrors.studentName}</p>}
                </div>
                <div>
                  <input type="tel" inputMode="numeric" autoComplete="tel" aria-label="Phone number" placeholder="Phone" value={queryForm.phone} onChange={e => setQueryForm({...queryForm, phone: e.target.value})} className={inputClasses} />
                  {queryErrors.phone && <p className="text-red-400 text-xs mt-1">{queryErrors.phone}</p>}
                </div>
              </div>
              <input type="email" autoComplete="email" aria-label="Email address" placeholder="Email" value={queryForm.email} onChange={e => setQueryForm({...queryForm, email: e.target.value})} className={inputClasses} />
              {queryErrors.email && <p className="text-red-400 text-xs -mt-2">{queryErrors.email}</p>}
              <select value={queryForm.courseInterest} onChange={e => setQueryForm({...queryForm, courseInterest: e.target.value})} className={inputClasses + ' appearance-none'}>
                <option value="">Course of Interest</option>
                {academyCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {queryErrors.courseInterest && <p className="text-red-400 text-xs -mt-2">{queryErrors.courseInterest}</p>}
              <textarea aria-label="Your question" placeholder="Your question..." value={queryForm.message} onChange={e => setQueryForm({ ...queryForm, message: e.target.value })} rows={4} className={inputClasses + ' resize-y'} />
              {queryErrors.message && <p className="text-red-400 text-xs -mt-2">{queryErrors.message}</p>}
              <button type="submit" className="w-full py-4 rounded-xl bg-gold text-obsidian font-bold hover:bg-gold-light transition-colors">Send Query</button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
