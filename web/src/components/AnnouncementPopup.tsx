import React, { useEffect, useState } from 'react';
import { getPublishedUpdates, UpdatePost } from '../store/dataStore';

const DISMISSED_POPUPS_KEY = 'sdm_dismissed_update_popups';

function getDismissedPopupIds(): Set<string> {
  const raw = localStorage.getItem(DISMISSED_POPUPS_KEY);
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(value => typeof value === 'string')) return new Set(parsed);
    console.error('Ignoring invalid dismissed announcement list in browser storage.');
  } catch (error) {
    console.error('Could not read dismissed announcements from browser storage:', error);
  }
  return new Set();
}

function getNextPopup(): UpdatePost | null {
  const dismissed = getDismissedPopupIds();
  return getPublishedUpdates().find(post => post.showAsPopup && !dismissed.has(post.id)) || null;
}

export const AnnouncementPopup: React.FC = () => {
  const [post, setPost] = useState<UpdatePost | null>(getNextPopup);

  useEffect(() => {
    if (!post) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePopup();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [post]);

  const closePopup = () => {
    if (!post) return;
    const dismissed = getDismissedPopupIds();
    dismissed.add(post.id);
    try {
      localStorage.setItem(DISMISSED_POPUPS_KEY, JSON.stringify(Array.from(dismissed).slice(-100)));
      setPost(null);
    } catch (error) {
      console.error('Could not save dismissed announcement state:', error);
      setPost(null);
    }
  };

  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-obsidian/75 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={event => { if (event.target === event.currentTarget) closePopup(); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="announcement-title" className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-dark-surface shadow-2xl">
        <button type="button" onClick={closePopup} aria-label="Close announcement" className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-xl text-white backdrop-blur hover:bg-black/80">
          ×
        </button>
        {post.image && <img src={post.image} alt="" className="max-h-64 w-full object-cover" />}
        <div className="p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{post.type === 'new_gear' ? 'New at SDM' : 'Announcement'}</p>
          <h2 id="announcement-title" className="mt-2 font-heading text-2xl font-bold text-white">{post.title}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-400">{post.description}</p>
          <button type="button" onClick={closePopup} className="mt-6 min-h-11 w-full rounded-xl bg-gold px-5 py-3 font-semibold text-obsidian transition-colors hover:bg-gold-light">
            Got it
          </button>
        </div>
      </section>
    </div>
  );
};
