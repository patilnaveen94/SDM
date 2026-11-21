import React, { useState } from 'react';
import { getGearInventory, addGearItem, updateGearItem, deleteGearItem, GearItem } from '../store/dataStore';
import { normalizeDriveImageUrl, uploadPublicMediaImage } from '../store/mediaUpload';

const emptyForm: Omit<GearItem, 'id'> = {
  name: '',
  serialNumber: '',
  category: 'camera',
  brand: '',
  dailyRate: 0,
  description: '',
  specs: [],
  image: '',
  available: true,
  totalStock: 1,
  currentlyRented: 0,
  rentalTier: 'professional',
};

const CATEGORIES: { value: GearItem['category']; label: string; emoji: string }[] = [
  { value: 'camera', label: 'Camera', emoji: '🎥' },
  { value: 'lens', label: 'Lens', emoji: '🔭' },
  { value: 'anamorphic', label: 'Anamorphic', emoji: '🎞️' },
  { value: 'drone', label: 'Drone', emoji: '🚁' },
  { value: 'gimbal', label: 'Gimbal', emoji: '🎯' },
  { value: 'audio', label: 'Audio Equipment', emoji: '🎙️' },
  { value: 'lighting', label: 'Lighting', emoji: '💡' },
  { value: 'accessory', label: 'Accessory', emoji: '🔧' },
];

export const GearPage: React.FC = () => {
  const [gear, setGear] = useState(getGearInventory());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<GearItem, 'id'>>(emptyForm);
  const [specsInput, setSpecsInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formError, setFormError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);

  const refresh = () => setGear(getGearInventory());

  const openCreate = () => {
    setForm(emptyForm);
    setSpecsInput('');
    setFormError('');
    setImagePreviewFailed(false);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item: GearItem) => {
    setForm(item);
    setSpecsInput(item.specs.join(', '));
    setFormError('');
    setImagePreviewFailed(false);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setFormError('Enter an item name.');
      return;
    }
    const serialNumber = form.serialNumber?.trim() || '';
    if (serialNumber && gear.some(item => item.id !== editingId && item.serialNumber?.trim().toLowerCase() === serialNumber.toLowerCase())) {
      setFormError('That serial number is already assigned to another gear item.');
      return;
    }
    const specs = specsInput.split(',').map(s => s.trim()).filter(Boolean);
    const data = { ...form, image: normalizeDriveImageUrl(form.image), serialNumber: serialNumber || undefined, specs };
    if (editingId) {
      updateGearItem(editingId, data);
    } else {
      addGearItem(data);
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
    if (confirm('Delete this item?')) {
      deleteGearItem(id);
      refresh();
    }
  };

  const filteredGear = filterCategory === 'all' ? gear : gear.filter(g => g.category === filterCategory);

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none transition-colors placeholder-gray-500";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-heading font-bold text-white">Gear Inventory</h1>
        <button onClick={openCreate} className="w-full px-5 py-2.5 rounded-xl bg-gold text-obsidian font-bold text-sm hover:bg-gold-light transition-colors sm:w-auto">
          + Add Item
        </button>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilterCategory('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterCategory === 'all' ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          All ({gear.length})
        </button>
        {CATEGORIES.map(c => {
          const count = gear.filter(g => g.category === c.value).length;
          if (count === 0) return null;
          return (
            <button key={c.value} onClick={() => setFilterCategory(c.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${filterCategory === c.value ? 'bg-white text-obsidian' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              <span>{c.emoji}</span>
              <span>{c.label} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-dark-surface border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-lg my-2 sm:my-10" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit' : 'Add'} Gear Item</h2>
            <div className="space-y-3">
              <input placeholder="Item Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputCls} />

              {/* Category select */}
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value as GearItem['category']})} className={inputCls + ' appearance-none'}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>

              {/* Rental Tier */}
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">Rental Tier</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({...form, rentalTier: 'professional'})}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${form.rentalTier === 'professional' || !form.rentalTier ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    🎬 Professional
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({...form, rentalTier: 'hobbyist'})}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${form.rentalTier === 'hobbyist' ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    📷 Casual Hire
                  </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-1.5">
                  {form.rentalTier === 'hobbyist'
                    ? 'Shown under Casual Hire — for hobbyists, one-day shoots, family functions.'
                    : 'Shown under Professional — for commercial productions and film sets.'}
                </p>
              </div>

              <input placeholder="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className={inputCls} />
              <input
                placeholder="Gear serial number (optional)"
                value={form.serialNumber || ''}
                onChange={e => setForm({...form, serialNumber: e.target.value})}
                className={inputCls}
              />
              <input type="number" placeholder="Daily Rate (₹)" value={form.dailyRate || ''} onChange={e => setForm({...form, dailyRate: Number(e.target.value)})} className={inputCls} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className={inputCls + ' resize-none'} />
              <input placeholder="Specs (comma separated, e.g. 4K 120fps, Full Frame)" value={specsInput} onChange={e => setSpecsInput(e.target.value)} className={inputCls} />
              <label className="block text-xs text-gray-400">
                Upload image from this device
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={isUploadingImage} onChange={e => { void handleImageUpload(e.target.files?.[0]); e.currentTarget.value = ''; }} className="mt-2 block w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gold/10 file:px-3 file:py-2 file:font-semibold file:text-gold" />
              </label>
              <input
                type="url"
                placeholder="Image URL or public Google Drive link"
                value={form.image}
                onChange={e => { setForm({...form, image: e.target.value}); setImagePreviewFailed(false); }}
                className={inputCls}
              />
              <p className="text-[10px] leading-5 text-gray-500">Paste a direct image URL or a Google Drive link shared as “Anyone with the link”. Direct image URLs work best.</p>
              {isUploadingImage && <p className="text-xs text-gray-400">Uploading image…</p>}
              {form.image && !imagePreviewFailed && <img src={normalizeDriveImageUrl(form.image)} alt="Gear preview" onError={() => setImagePreviewFailed(true)} className="h-28 w-full rounded-xl object-cover" />}
              {imagePreviewFailed && <p role="alert" className="text-xs text-amber-300">This image could not be previewed. Check that the link is public and points to an image.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="number" placeholder="Total Stock" value={form.totalStock || ''} onChange={e => setForm({...form, totalStock: Number(e.target.value)})} className={inputCls} />
                <input type="number" placeholder="Currently Rented" value={form.currentlyRented || ''} onChange={e => setForm({...form, currentlyRented: Number(e.target.value)})} className={inputCls} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={form.available} onChange={e => setForm({...form, available: e.target.checked})} className="accent-gold" />
                Available for rent
              </label>
            </div>
            {formError && <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{formError}</p>}
            <div className="flex flex-col-reverse gap-3 mt-6 sm:flex-row">
              <button onClick={handleSave} disabled={!form.name.trim() || isUploadingImage} className="flex-1 py-3 rounded-xl bg-gold text-obsidian font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Gear List */}
      {gear.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">🎥</p>
          <p>No gear items yet. Add your first item.</p>
        </div>
      ) : filteredGear.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No items in this category.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGear.map(item => {
            const catInfo = CATEGORIES.find(c => c.value === item.category);
            return (
              <div key={item.id} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden group">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />}
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{catInfo?.emoji || '🎥'}</span>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.brand} • {catInfo?.label || item.category}</p>
                    {item.rentalTier && (
                      <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${item.rentalTier === 'hobbyist' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        {item.rentalTier === 'hobbyist' ? 'Casual' : 'Pro'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm mt-1">{item.name}</h3>
                  {item.serialNumber && <p className="mt-1 text-[10px] text-gray-500">S/N: {item.serialNumber}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-gold font-bold">₹{item.dailyRate.toLocaleString()}/day</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${item.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {item.available ? `${item.totalStock - item.currentlyRented} avail` : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                    <button onClick={() => openEdit(item)} className="flex-1 py-2 rounded-lg bg-white/5 text-gray-300 text-xs hover:bg-white/10 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="px-3 py-2 rounded-lg bg-red-500/5 text-red-400 text-xs hover:bg-red-500/10 transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
