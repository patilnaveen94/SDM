import React, { useState } from 'react';
import { getUpdates, addUpdate, updatePost, deleteUpdate, UpdatePost } from '../store/dataStore';
import { normalizeDriveImageUrl, uploadPublicMediaImage } from '../store/mediaUpload';

export const UpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState(getUpdates());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'announcement' as UpdatePost['type'], image: '', videoUrl: '', published: true, showAsPopup: false });
  const [formError, setFormError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);

  const refresh = () => setUpdates(getUpdates());

  const openCreate = () => {
    setForm({ title: '', description: '', type: 'announcement', image: '', videoUrl: '', published: true, showAsPopup: false });
    setFormError('');
    setImagePreviewFailed(false);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (post: UpdatePost) => {
    setForm({ title: post.title, description: post.description, type: post.type, image: post.image || '', videoUrl: post.videoUrl || '', published: post.published, showAsPopup: post.showAsPopup || false });
    setFormError('');
    setImagePreviewFailed(false);
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Add a title and description before saving.');
      return;
    }
    if (editingId) {
      updatePost(editingId, { ...form, title: form.title.trim(), description: form.description.trim(), image: normalizeDriveImageUrl(form.image) });
    } else {
      addUpdate({ ...form, title: form.title.trim(), description: form.description.trim(), image: normalizeDriveImageUrl(form.image) });
    }
    refresh();
    setShowForm(false);
  };

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    setIsUploadingImage(true);
    setFormError('');
    try {
      const { url } = await uploadPublicMediaImage(file);
      setForm(current => ({ ...current, image: url }));
      setImagePreviewFailed(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not upload this image.');
    } finally {
      setIsUploadingImage(false);
    }
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
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Updates & Feed</h1>
          <p className="text-gray-500 text-sm mt-1">Publish achievements, new gear, and recent shoots for your visitors</p>
        </div>
        <button onClick={openCreate} className="w-full px-5 py-2.5 rounded-xl bg-gold text-obsidian font-bold text-sm sm:w-auto">+ New Post</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="my-2 bg-dark-surface border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-lg sm:my-0" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit' : 'New'} Post</h2>
            <div className="space-y-3">
              <select value={form.type} onChange={e => {
                const type = e.target.value as UpdatePost['type'];
                setForm({ ...form, type, showAsPopup: type === 'announcement' || type === 'new_gear' ? form.showAsPopup : false });
              }} className={inputCls + ' appearance-none'}>
                <option value="achievement">🏆 Achievement</option>
                <option value="new_gear">🎥 New Gear Acquired</option>
                <option value="recent_shoot">🎬 Recent Shoot</option>
                <option value="announcement">📢 Announcement</option>
              </select>
              <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputCls} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className={inputCls + ' resize-none'} />
              <label className="block text-xs text-gray-400">
                Upload image from this device
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={isUploadingImage} onChange={e => { void handleImageUpload(e.target.files?.[0]); e.currentTarget.value = ''; }} className="mt-2 block w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gold/10 file:px-3 file:py-2 file:font-semibold file:text-gold" />
              </label>
              <input placeholder="Image URL or public Google Drive link (optional)" value={form.image} onChange={e => { setForm({...form, image: e.target.value}); setImagePreviewFailed(false); }} className={inputCls} />
              <p className="text-[10px] leading-5 text-gray-500">For Google Drive, set sharing to “Anyone with the link”. Direct image URLs work best.</p>
              {isUploadingImage && <p className="text-xs text-gray-400">Uploading image…</p>}
              {form.image && !imagePreviewFailed && <img src={normalizeDriveImageUrl(form.image)} alt="Post preview" onError={() => setImagePreviewFailed(true)} className="max-h-48 w-full rounded-xl object-cover" />}
              {imagePreviewFailed && <p role="alert" className="text-xs text-amber-300">This image could not be previewed. Check that the link is public and points to an image.</p>}
              <input placeholder="Video URL (optional)" value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} className={inputCls} />
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="accent-gold" />
                Publish immediately
              </label>
              {(form.type === 'new_gear' || form.type === 'announcement') && (
                <label className="flex items-start gap-2 rounded-xl border border-gold/20 bg-gold/5 p-3 text-sm text-gray-300">
                  <input type="checkbox" checked={form.showAsPopup} onChange={e => setForm({...form, showAsPopup: e.target.checked})} className="mt-1 accent-gold" />
                  <span><span className="block font-medium text-white">Show as a dismissible website pop-up</span><span className="mt-1 block text-xs text-gray-500">Visitors can close it. It appears only while this post is published.</span></span>
                </label>
              )}
            </div>
            {formError && <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{formError}</p>}
            <div className="flex flex-col-reverse gap-3 mt-6 sm:flex-row">
              <button onClick={handleSave} disabled={isUploadingImage} className="flex-1 py-3 rounded-xl bg-gold text-obsidian font-bold text-sm disabled:opacity-50">Save</button>
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
          {[...updates].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(post => (
            <div key={post.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 sm:flex-row">
              {post.image && <img src={post.image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{typeLabels[post.type]}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${post.published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  {post.showAsPopup && <span className="rounded bg-gold/10 px-2 py-0.5 text-[10px] text-gold">Popup</span>}
                </div>
                <h3 className="text-white font-semibold mt-1">{post.title}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">{post.description}</p>
                <p className="text-[10px] text-gray-600 mt-2">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-col sm:flex-shrink-0">
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
