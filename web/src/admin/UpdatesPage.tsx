import React, { useState } from 'react';
import { getUpdates, addUpdate, updatePost, deleteUpdate, UpdatePost } from '../store/dataStore';

export const UpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState(getUpdates());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'announcement' as UpdatePost['type'], image: '', videoUrl: '', published: true });

  const refresh = () => setUpdates(getUpdates());

  const openCreate = () => {
    setForm({ title: '', description: '', type: 'announcement', image: '', videoUrl: '', published: true });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (post: UpdatePost) => {
    setForm({ title: post.title, description: post.description, type: post.type, image: post.image || '', videoUrl: post.videoUrl || '', published: post.published });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingId) {
      updatePost(editingId, form);
    } else {
      addUpdate(form);
    }
    refresh();
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this update?')) { deleteUpdate(id); refresh(); }
  };

  const togglePublish = (id: string, published: boolean) => {
    updatePost(id, { published: !published });
    refresh();
  };

  const typeLabels: Record<string, string> = { achievement: '🏆 Achievement', new_gear: '🎥 New Gear', recent_shoot: '🎬 Recent Shoot', announcement: '📢 Announcement' };
  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Updates & Feed</h1>
          <p className="text-gray-500 text-sm mt-1">Publish achievements, new gear, and recent shoots for your visitors</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-gold text-obsidian font-bold text-sm">+ New Post</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-dark-surface border border-white/10 rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit' : 'New'} Post</h2>
            <div className="space-y-3">
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className={inputCls + ' appearance-none'}>
                <option value="achievement">🏆 Achievement</option>
                <option value="new_gear">🎥 New Gear Acquired</option>
                <option value="recent_shoot">🎬 Recent Shoot</option>
                <option value="announcement">📢 Announcement</option>
              </select>
              <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputCls} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className={inputCls + ' resize-none'} />
              <input placeholder="Image URL (optional)" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className={inputCls} />
              <input placeholder="Video URL (optional)" value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} className={inputCls} />
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="accent-gold" />
                Publish immediately
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-gold text-obsidian font-bold text-sm">Save</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {updates.length === 0 ? (
        <div className="text-center py-20 text-gray-500"><p className="text-4xl mb-3">📢</p><p>No posts yet. Create your first update.</p></div>
      ) : (
        <div className="space-y-4">
          {updates.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(post => (
            <div key={post.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex gap-4">
              {post.image && <img src={post.image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{typeLabels[post.type]}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${post.published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="text-white font-semibold mt-1">{post.title}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{post.description}</p>
                <p className="text-[10px] text-gray-600 mt-2">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => openEdit(post)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-xs">Edit</button>
                <button onClick={() => togglePublish(post.id, post.published)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-xs">{post.published ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => handleDelete(post.id)} className="px-3 py-1.5 rounded-lg bg-red-500/5 text-red-400 text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
