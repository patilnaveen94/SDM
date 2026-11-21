import React, { useState } from 'react';
import { getMediaConfig, updateMediaConfig, addPortfolioItem, deletePortfolioItem, MediaConfig } from '../store/mediaStore';
import { normalizeDriveImageUrl, uploadPublicMediaImage } from '../store/mediaUpload';

export const MediaPage: React.FC = () => {
  const [config, setConfig] = useState(getMediaConfig());
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', category: 'wedding', type: 'image' as 'image' | 'video', thumbnail: '', fullUrl: '', description: '' });
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [uploadingTarget, setUploadingTarget] = useState('');

  const refresh = () => setConfig(getMediaConfig());

  const handleSaveGeneral = () => {
    updateMediaConfig({
      heroVideoUrl: config.heroVideoUrl,
      heroFallbackImage: normalizeDriveImageUrl(config.heroFallbackImage),
      founderImage: normalizeDriveImageUrl(config.founderImage),
    });
    refresh();
    setSaved('General settings saved!');
    setTimeout(() => setSaved(''), 2000);
  };

  const handleAddPortfolio = () => {
    if (!newItem.title.trim() || !newItem.thumbnail.trim()) {
      setError('Add a title and an image before saving this portfolio item.');
      return;
    }
    const thumbnail = normalizeDriveImageUrl(newItem.thumbnail);
    addPortfolioItem({ ...newItem, title: newItem.title.trim(), thumbnail, fullUrl: normalizeDriveImageUrl(newItem.fullUrl || thumbnail) });
    setNewItem({ title: '', category: 'wedding', type: 'image', thumbnail: '', fullUrl: '', description: '' });
    setShowPortfolioForm(false);
    setError('');
    refresh();
  };

  const handleImageUpload = async (file: File | undefined, target: 'hero' | 'founder' | 'portfolio') => {
    if (!file) return;
    setUploadingTarget(target);
    setError('');
    try {
      const { url } = await uploadPublicMediaImage(file);
      if (target === 'hero') setConfig(current => ({ ...current, heroFallbackImage: url }));
      if (target === 'founder') setConfig(current => ({ ...current, founderImage: url }));
      if (target === 'portfolio') setNewItem(current => ({ ...current, thumbnail: url, fullUrl: url }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.');
    } finally {
      setUploadingTarget('');
    }
  };

  const handleDeletePortfolio = (id: string) => {
    if (confirm('Delete this portfolio item?')) { deletePortfolioItem(id); refresh(); }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none transition-colors";

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-white mb-2">Media & Content</h1>
      <p className="text-gray-500 text-sm mb-8">Manage all images and videos displayed on the website</p>

      {saved && <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{saved}</div>}
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      {/* General Media Settings */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 sm:p-6 mb-8">
        <h2 className="text-base font-bold text-white mb-4">🎬 Hero Section</h2>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Hero Video URL</label>
            <input value={config.heroVideoUrl} onChange={e => setConfig({...config, heroVideoUrl: e.target.value})} className={inputCls} placeholder="https://..." />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Hero Fallback Image</label>
            <input value={config.heroFallbackImage} onChange={e => setConfig({...config, heroFallbackImage: e.target.value})} className={inputCls} placeholder="https://..." />
            <label className="mt-2 block text-xs text-gray-400">
              Or upload from this device
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploadingTarget === 'hero'} onChange={e => { void handleImageUpload(e.target.files?.[0], 'hero'); e.currentTarget.value = ''; }} className="mt-2 block w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gold/10 file:px-3 file:py-2 file:font-semibold file:text-gold" />
            </label>
          </div>
          {config.heroFallbackImage && <img src={config.heroFallbackImage} alt="Preview" className="w-full h-32 object-cover rounded-xl mt-2" />}
        </div>

        <h2 className="text-base font-bold text-white mb-4 mt-8">👤 Founder Section</h2>
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Founder Profile Image</label>
          <input value={config.founderImage} onChange={e => setConfig({...config, founderImage: e.target.value})} className={inputCls} placeholder="https://..." />
          <label className="mt-2 block text-xs text-gray-400">
            Or upload from this device
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploadingTarget === 'founder'} onChange={e => { void handleImageUpload(e.target.files?.[0], 'founder'); e.currentTarget.value = ''; }} className="mt-2 block w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gold/10 file:px-3 file:py-2 file:font-semibold file:text-gold" />
          </label>
        </div>
        {config.founderImage && <img src={config.founderImage} alt="Preview" className="w-24 h-24 object-cover rounded-xl mt-2" />}

        <button onClick={handleSaveGeneral} className="mt-6 px-6 py-3 rounded-xl bg-gold text-obsidian font-bold text-sm hover:bg-gold-light transition-colors">
          Save Changes
        </button>
      </div>

      {/* Portfolio Items */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-base font-bold text-white">📸 Portfolio Items ({config.portfolioItems.length})</h2>
          <button onClick={() => setShowPortfolioForm(true)} className="px-4 py-2 rounded-xl bg-gold text-obsidian font-bold text-xs">+ Add Item</button>
        </div>

        {/* Add form */}
        {showPortfolioForm && (
          <div className="mb-6 p-4 bg-gold/5 border border-gold/20 rounded-xl space-y-3">
            <input placeholder="Title" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className={inputCls + ' appearance-none'}>
                <option value="wedding">Wedding</option><option value="corporate">Corporate</option>
                <option value="rental_gear">Gear</option><option value="videos">Videos</option>
              </select>
              <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className={inputCls + ' appearance-none'}>
                <option value="image">Image</option><option value="video">Video</option>
              </select>
            </div>
            <input placeholder="Thumbnail URL" value={newItem.thumbnail} onChange={e => setNewItem({...newItem, thumbnail: e.target.value})} className={inputCls} />
            <label className="block text-xs text-gray-400">
              Or upload an image from this device
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploadingTarget === 'portfolio'} onChange={e => { void handleImageUpload(e.target.files?.[0], 'portfolio'); e.currentTarget.value = ''; }} className="mt-2 block w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gold/10 file:px-3 file:py-2 file:font-semibold file:text-gold" />
            </label>
            <p className="text-[10px] leading-5 text-gray-500">Google Drive images must be shared with “Anyone with the link”. Direct image URLs or uploaded files are more reliable.</p>
            {uploadingTarget === 'portfolio' && <p className="text-xs text-gray-400">Uploading image…</p>}
            {newItem.thumbnail && <img src={normalizeDriveImageUrl(newItem.thumbnail)} alt="Portfolio preview" className="max-h-48 w-full rounded-xl object-cover" />}
            <input placeholder="Full URL (hi-res image or video URL)" value={newItem.fullUrl} onChange={e => setNewItem({...newItem, fullUrl: e.target.value})} className={inputCls} />
            <input placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className={inputCls} />
            <div className="flex gap-2">
              <button onClick={handleAddPortfolio} disabled={uploadingTarget === 'portfolio'} className="px-4 py-2 rounded-lg bg-gold text-obsidian text-xs font-bold disabled:opacity-50">Add</button>
              <button onClick={() => setShowPortfolioForm(false)} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-xs">Cancel</button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {config.portfolioItems.map(item => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square bg-dark-surface">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/70 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button onClick={() => handleDeletePortfolio(item.id)} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold">Delete</button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-obsidian/80">
                <p className="text-[10px] text-white truncate">{item.title}</p>
                <p className="text-[8px] text-gray-400">{item.category} • {item.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
