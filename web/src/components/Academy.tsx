import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { businessInfo } from '../assetsConfig';

interface QueryFormData {
  studentName: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

type QueryFormField = keyof QueryFormData;

const learningAreas = [
  {
    number: '01',
    title: 'Photography & camera craft',
    description: 'Build confidence with camera controls, exposure, composition and visual storytelling.',
    accent: 'from-amber-400/20 to-orange-500/5',
  },
  {
    number: '02',
    title: 'Cinematography & lighting',
    description: 'Explore camera movement, lighting setups and practical techniques for production.',
    accent: 'from-violet-400/20 to-blue-500/5',
  },
  {
    number: '03',
    title: 'Editing & post-production',
    description: 'Learn about editing workflows, color and preparing projects for delivery.',
    accent: 'from-teal-400/20 to-cyan-500/5',
  },
];

const initialForm: QueryFormData = {
  studentName: '',
  email: '',
  phone: '',
  interest: '',
  message: '',
};

export const Academy: React.FC = () => {
  const [queryForm, setQueryForm] = useState<QueryFormData>(initialForm);
  const [queryErrors, setQueryErrors] = useState<Partial<Record<QueryFormField, string>>>({});
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-10%' });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Partial<Record<QueryFormField, string>> = {};
    const phone = queryForm.phone.replace(/\D/g, '');

    if (!queryForm.studentName.trim()) errors.studentName = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(queryForm.email)) errors.email = 'Enter a valid email address.';
    if (phone.length !== 10) errors.phone = 'Enter a 10-digit phone number.';
    if (!queryForm.interest) errors.interest = 'Choose an area you are interested in.';
    if (!queryForm.message.trim()) errors.message = 'Add a short message.';

    setQueryErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const message = [
      'Hello SDM, I am interested in training.',
      `Name: ${queryForm.studentName.trim()}`,
      `Email: ${queryForm.email.trim()}`,
      `Phone: ${phone}`,
      `Area of interest: ${queryForm.interest}`,
      `Message: ${queryForm.message.trim()}`,
    ].join('\n');
    const whatsappNumber = businessInfo.whatsapp.replace(/\D/g, '');
    const whatsappWindow = window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      '_blank',
    );

    if (whatsappWindow) {
      whatsappWindow.opener = null;
    } else {
      window.location.assign(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
    }
  };

  const inputClasses = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-gray-500 outline-none transition-colors focus:border-gold sm:px-5';
  const errorMessage = (field: QueryFormField) => queryErrors[field]
    ? <p className="mt-1 text-xs text-red-400" role="alert">{queryErrors[field]}</p>
    : null;

  return (
    <section id="academy" ref={sectionRef} className="scroll-mt-20 border-t border-white/5 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 max-w-3xl sm:mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-[4px] text-gold">Learn with SDM</span>
          <h2 className="mt-3 text-3xl font-heading font-bold leading-tight sm:text-4xl md:text-6xl">
            SDM <span className="text-gold-gradient">Academy.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Practical learning for people who want to grow their skills in visual production.
            Get in touch to discuss your goals and ask about current training options.
          </p>
        </motion.div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mb-16 lg:grid-cols-3">
          {learningAreas.map((area, index) => (
            <motion.article
              key={area.number}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.12 + index * 0.12, duration: 0.7 }}
              className={`light-feature-card rounded-3xl border border-white/5 bg-gradient-to-br ${area.accent} p-6 sm:p-7`}
            >
              <span className="font-mono text-sm text-gold">{area.number}</span>
              <h3 className="mt-5 font-heading text-xl font-bold text-white">{area.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">{area.description}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          id="academy-query"
          className="light-feature-card mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.015] p-5 sm:p-8 md:p-10"
        >
          <div className="mb-7 text-center">
            <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">Tell us what you want to learn</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Share your interests and we’ll help you discuss suitable options, availability and fees.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  autoComplete="name"
                  aria-label="Your name"
                  aria-invalid={Boolean(queryErrors.studentName)}
                  placeholder="Your name"
                  value={queryForm.studentName}
                  onChange={event => setQueryForm({ ...queryForm, studentName: event.target.value })}
                  className={inputClasses}
                />
                {errorMessage('studentName')}
              </div>
              <div>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-label="Phone number"
                  aria-invalid={Boolean(queryErrors.phone)}
                  placeholder="10-digit phone number"
                  value={queryForm.phone}
                  onChange={event => setQueryForm({ ...queryForm, phone: event.target.value })}
                  className={inputClasses}
                />
                {errorMessage('phone')}
              </div>
            </div>
            <div>
              <input
                type="email"
                autoComplete="email"
                aria-label="Email address"
                aria-invalid={Boolean(queryErrors.email)}
                placeholder="Email address"
                value={queryForm.email}
                onChange={event => setQueryForm({ ...queryForm, email: event.target.value })}
                className={inputClasses}
              />
              {errorMessage('email')}
            </div>
            <div>
              <select
                aria-label="Area of interest"
                aria-invalid={Boolean(queryErrors.interest)}
                value={queryForm.interest}
                onChange={event => setQueryForm({ ...queryForm, interest: event.target.value })}
                className={`${inputClasses} appearance-none`}
              >
                <option value="">Area of interest</option>
                {learningAreas.map(area => <option key={area.number} value={area.title}>{area.title}</option>)}
                <option value="Not sure yet">Not sure yet</option>
              </select>
              {errorMessage('interest')}
            </div>
            <div>
              <textarea
                aria-label="Your goals or question"
                aria-invalid={Boolean(queryErrors.message)}
                placeholder="What would you like to learn?"
                value={queryForm.message}
                onChange={event => setQueryForm({ ...queryForm, message: event.target.value })}
                rows={4}
                className={`${inputClasses} resize-y`}
              />
              {errorMessage('message')}
            </div>
            <button type="submit" className="w-full rounded-xl bg-gold px-5 py-3.5 font-bold text-obsidian transition-colors hover:bg-gold-light">
              Continue on WhatsApp <span aria-hidden="true">→</span>
            </button>
            <p className="text-center text-xs leading-5 text-gray-500">
              Your details will be added to a WhatsApp message addressed to SDM. No course enrollment or payment is made here.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
