import React, { useEffect, useState } from 'react';
import { getPublishedTestimonials, submitTestimonial, Testimonial } from '../store/testimonialStore';

interface FormState {
  name: string;
  phone: string;
  testimony: string;
  photo: File | null;
}

const initialForm: FormState = { name: '', phone: '', testimony: '', photo: null };
const inputClass = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-gold';

export const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    getPublishedTestimonials()
      .then(records => { if (active) setTestimonials(records); })
      .catch(loadFailure => {
        console.error('Unable to load approved testimonials:', loadFailure);
        if (active) setLoadError('Approved testimonials are temporarily unavailable.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreview('');
      return;
    }
    const url = URL.createObjectURL(form.photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.photo]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitted(false);
    const phone = form.phone.replace(/\D/g, '');
    if (phone.length < 10 || phone.length > 15) {
      setError('Enter a valid phone number (10–15 digits).');
      return;
    }
    if (!form.photo) {
      setError('A photo is required to submit your testimony.');
      return;
    }

    setSubmitting(true);
    try {
      await submitTestimonial({
        customerName: form.name,
        customerPhone: phone,
        testimony: form.testimony,
        photo: form.photo,
      });
      setForm(initialForm);
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Your testimony could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="border-t border-white/5 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 max-w-3xl sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-[4px] text-gold">Community</span>
          <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl md:text-5xl">
            Stories from <span className="text-gold-gradient">our customers.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-400">
            Have worked with SDM? Share your experience. Every submission is reviewed by our team before it appears here.
          </p>
        </div>

        {loadError && <p role="status" className="mb-5 text-sm text-amber-300">{loadError}</p>}
        {!loading && testimonials.length > 0 && (
          <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map(testimonial => (
              <article key={testimonial.id} className="light-feature-card rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                <p className="text-sm leading-6 text-gray-300">“{testimonial.testimony}”</p>
                <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
                  <img src={testimonial.photoUrl} alt="" className="h-11 w-11 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonial.customerName}</p>
                    <p className="text-[10px] uppercase tracking-wider text-green-400">Verified publication</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="light-feature-card mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <h3 className="font-heading text-xl font-bold text-white">Write your testimony</h3>
          <p className="mt-2 text-xs leading-5 text-gray-500">Your phone number is private and only visible to SDM admins. Your photo and testimony appear publicly only after approval.</p>

          {submitted ? (
            <div role="status" className="mt-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
              Thank you. Your testimony has been sent for admin review and will appear on the website only if approved.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input required minLength={2} maxLength={100} autoComplete="name" aria-label="Your name" placeholder="Your name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className={inputClass} />
              <input required type="tel" inputMode="tel" autoComplete="tel" aria-label="Phone number (private)" placeholder="Phone number (private to SDM)" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} className={inputClass} />
              <textarea required minLength={10} maxLength={2000} aria-label="Your testimony" placeholder="Tell us about your experience" rows={4} value={form.testimony} onChange={event => setForm({ ...form, testimony: event.target.value })} className={`${inputClass} resize-y`} />
              <label className="block text-xs text-gray-400">
                Your photo (required · JPG, PNG or WebP · up to 5 MB)
                <input required type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setForm({ ...form, photo: event.target.files?.[0] || null })} className="mt-2 block w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gold/10 file:px-3 file:py-2 file:font-semibold file:text-gold" />
              </label>
              {photoPreview && <img src={photoPreview} alt="Selected photo preview" className="h-24 w-24 rounded-xl object-cover" />}
              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
              <button type="submit" disabled={submitting} className="min-h-11 w-full rounded-xl bg-gold px-5 py-3 font-semibold text-obsidian transition-colors hover:bg-gold-light disabled:cursor-wait disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit for approval'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
