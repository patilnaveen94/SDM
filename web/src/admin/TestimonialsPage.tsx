import React, { useEffect, useState } from 'react';
import { deleteTestimonial, getAdminTestimonials, setTestimonialApproval, Testimonial } from '../store/testimonialStore';

export const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const refresh = async () => {
    setError('');
    try {
      setTestimonials(await getAdminTestimonials());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load customer testimonials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const handleApproval = async (testimonial: Testimonial) => {
    setBusyId(testimonial.id);
    setError('');
    try {
      await setTestimonialApproval(testimonial.id, !testimonial.approved);
      await refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Could not update testimonial approval.');
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async (testimonial: Testimonial) => {
    if (!window.confirm(`Permanently delete ${testimonial.customerName}'s testimony and photo?`)) return;
    setBusyId(testimonial.id);
    setError('');
    try {
      await deleteTestimonial(testimonial.id);
      await refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Could not delete this testimonial.');
    } finally {
      setBusyId('');
    }
  };

  const visibleTestimonials = testimonials.filter(testimonial => (
    filter === 'all' || (filter === 'approved' ? testimonial.approved : !testimonial.approved)
  ));
  const pendingCount = testimonials.filter(testimonial => !testimonial.approved).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-white">Customer Testimonials</h1>
        <p className="mt-1 text-sm text-gray-500">Review customer submissions before they appear publicly. Contact details are private to admins.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="mb-5 flex flex-wrap gap-2">
        {(['pending', 'approved', 'all'] as const).map(value => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-xs font-medium ${filter === value ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
            {value === 'pending' ? `Pending approval (${pendingCount})` : value === 'approved' ? 'Approved' : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-gray-500">Loading testimonials…</p>
      ) : visibleTestimonials.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] py-16 text-center text-sm text-gray-500">
          {testimonials.length === 0 ? 'No customer testimonials submitted yet.' : 'No testimonials in this view.'}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleTestimonials.map(testimonial => (
            <article key={testimonial.id} className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 sm:flex-row sm:p-5">
              <img src={testimonial.photoUrl} alt={`${testimonial.customerName}'s submitted photo`} className="h-24 w-24 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-white">{testimonial.customerName}</h2>
                  <span className={`rounded px-2 py-0.5 text-[10px] ${testimonial.approved ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-300'}`}>
                    {testimonial.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <a href={`tel:${testimonial.customerPhone}`} className="mt-1 inline-block text-xs text-blue-300 hover:underline">
                  Private phone: {testimonial.customerPhone}
                </a>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">{testimonial.testimony}</p>
                <p className="mt-2 text-[10px] text-gray-600">{new Date(testimonial.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <button type="button" disabled={busyId === testimonial.id} onClick={() => void handleApproval(testimonial)} className="flex-1 rounded-lg bg-gold/10 px-3 py-2 text-xs font-semibold text-gold disabled:opacity-50 sm:flex-none">
                  {testimonial.approved ? 'Unpublish' : 'Approve & publish'}
                </button>
                <button type="button" disabled={busyId === testimonial.id} onClick={() => void handleDelete(testimonial)} className="flex-1 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 disabled:opacity-50 sm:flex-none">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
