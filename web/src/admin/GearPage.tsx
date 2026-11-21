import React, { useState } from 'react';
import { getGearInventory, getGearInventoryBreakdown, addGearItem, updateGearItem, deleteGearItem, GearItem } from '../store/dataStore';
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
  const [search, setSearch] = useState('');
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

  const inventory = getGearInventoryBreakdown();
  const inventoryByGearId = new Map(inventory.map(item => [item.gear.id, item]));
  const totals = inventory.reduce((summary, item) => ({
    available: summary.available + item.available,
    out: summary.out + item.out,
    blocked: summary.blocked + item.blocked,
    missing: summary.missing + item.missing,
  }), { available: 0, out: 0, blocked: 0, missing: 0 });
  const totalUnits = gear.reduce((sum, item) => sum + item.totalStock, 0);
  const filteredGear = gear.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const searchText = `${item.name} ${item.brand} ${item.category} ${item.serialNumber || ''}`.toLowerCase();
    return matchesCategory && searchText.includes(search.trim().toLowerCase());
  });

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none transition-colors placeholder-gray-500";

  return (
    <div className="gear-workspace">
      <div data-theme-contrast className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 shadow-xl shadow-indigo-950/20 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Equipment workspace
            </p>
            <h1 className="text-2xl font-heading font-bold text-white sm:text-3xl">Gear inventory</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Keep your rental catalogue organized. See stock at a glance and update gear details in one place.</p>
          </div>
          <button onClick={openCreate} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:from-cyan-200 hover:to-sky-300 focus:outline-none focus:ring-2 focus:ring-cyan-200 sm:w-auto">
            <span className="text-lg leading-none">＋</span> Add gear
          </button>
        </div>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Gear models', value: gear.length, icon: '🎥', detail: `${totalUnits} total units`, tone: 'from-cyan-500/20 via-blue-500/10 to-blue-500/5', border: 'border-cyan-300/15', iconBg: 'bg-cyan-300/15', color: 'text-cyan-200' },
          { label: 'Available now', value: totals.available, icon: '✓', detail: 'Ready to rent', tone: 'from-emerald-500/20 via-teal-500/10 to-teal-500/5', border: 'border-emerald-300/15', iconBg: 'bg-emerald-300/15', color: 'text-emerald-200' },
          { label: 'Currently out', value: totals.out, icon: '↗', detail: 'On active rentals', tone: 'from-orange-500/20 via-amber-500/10 to-amber-500/5', border: 'border-orange-300/15', iconBg: 'bg-orange-300/15', color: 'text-orange-200' },
          { label: 'Reserved ahead', value: totals.blocked, icon: '◷', detail: 'Blocked for bookings', tone: 'from-violet-500/20 via-fuchsia-500/10 to-fuchsia-500/5', border: 'border-violet-300/15', iconBg: 'bg-violet-300/15', color: 'text-violet-200' },
        ].map(stat => (
          <article key={stat.label} className={`gear-stat-card group relative overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.tone} p-4 shadow-lg shadow-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="gear-stat-label text-xs font-medium text-slate-300">{stat.label}</p>
                <p className={`gear-stat-value mt-2 text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
                <p className="gear-stat-detail mt-1 text-[10px] text-slate-400">{stat.detail}</p>
              </div>
              <span className={`gear-stat-icon grid h-10 w-10 place-items-center rounded-xl ${stat.iconBg} text-lg ${stat.color}`}>{stat.icon}</span>
            </div>
          </article>
        ))}
      </div>

      <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Your equipment</h2>
            <p className="mt-1 text-xs text-gray-500">{filteredGear.length} of {gear.length} gear items</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">⌕</span>
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, brand, serial…" aria-label="Search gear" className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/10" />
          </label>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterCategory('all')} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${filterCategory === 'all' ? 'bg-cyan-300 text-slate-950 shadow-md shadow-cyan-950/20' : 'border border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-white'}`}>
            All gear <span className="ml-1 opacity-70">{gear.length}</span>
          </button>
        {CATEGORIES.map(c => {
          const count = gear.filter(g => g.category === c.value).length;
          if (count === 0) return null;
          return (
            <button key={c.value} onClick={() => setFilterCategory(c.value)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${filterCategory === c.value ? 'bg-cyan-300 text-slate-950 shadow-md shadow-cyan-950/20' : 'border border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-white'}`}>
              <span>{c.emoji}</span>
              <span>{c.label}</span><span className="opacity-70">{count}</span>
            </button>
          );
        })}
        </div>
      </section>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-dark-surface border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-lg my-2 sm:my-10" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">{editingId ? 'Catalogue update' : 'New catalogue entry'}</p>
                <h2 className="mt-1 text-xl font-bold text-white">{editingId ? 'Edit gear' : 'Add gear'}</h2>
                <p className="mt-1 text-xs text-gray-500">Add clear details so your team can identify and manage this item.</p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-300/20 to-violet-400/20 text-xl">{CATEGORIES.find(category => category.value === form.category)?.emoji || '🎥'}</span>
            </div>
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
        <div className="rounded-3xl border border-dashed border-cyan-300/20 bg-gradient-to-br from-cyan-500/[0.06] via-white/[0.02] to-violet-500/[0.06] px-5 py-16 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300/20 to-violet-400/20 text-3xl">🎥</span>
          <h2 className="mt-5 text-lg font-semibold text-white">Your gear catalogue starts here</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-400">Add your first camera, lens, or accessory to start building your rental inventory.</p>
          <button onClick={openCreate} className="mt-5 rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">Add your first gear item</button>
        </div>
      ) : filteredGear.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center">
          <p className="text-2xl">🔎</p>
          <p className="mt-3 text-sm font-medium text-white">No gear matches this view</p>
          <p className="mt-1 text-xs text-gray-500">Try another category or change your search.</p>
          <button onClick={() => { setFilterCategory('all'); setSearch(''); }} className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-cyan-300/30 hover:text-cyan-200">Clear filters</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {filteredGear.map(item => {
            const catInfo = CATEGORIES.find(c => c.value === item.category);
            const stock = inventoryByGearId.get(item.id);
            const available = stock?.available ?? Math.max(0, item.totalStock - item.currentlyRented);
            const stockPercentage = item.totalStock > 0 ? Math.min(100, (available / item.totalStock) * 100) : 0;
            return (
              <article key={item.id} className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.02] shadow-lg shadow-black/5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:shadow-xl hover:shadow-cyan-950/10">
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900">
                  <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_25%_15%,rgba(34,211,238,.18),transparent_48%),radial-gradient(ellipse_at_80%_90%,rgba(167,139,250,.16),transparent_52%)] text-5xl opacity-80 transition duration-500 group-hover:scale-105">{catInfo?.emoji || '🎥'}</div>
                  {item.image && <img src={item.image} alt={item.name} onError={event => { event.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/90 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/65 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">{catInfo?.emoji} {catInfo?.label || item.category}</span>
                  <span className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${item.available ? 'border-emerald-300/20 bg-emerald-950/70 text-emerald-200' : 'border-rose-300/20 bg-rose-950/70 text-rose-200'}`}>
                    <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${item.available ? 'bg-emerald-300' : 'bg-rose-300'}`} />{item.available ? 'Listed for rent' : 'Unavailable'}
                  </span>
                  <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300">{item.brand || 'Unbranded'}</p>
                      <h3 className="mt-0.5 truncate text-lg font-bold text-white">{item.name}</h3>
                    </div>
                    {item.rentalTier && <span className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${item.rentalTier === 'hobbyist' ? 'bg-sky-300/15 text-sky-200' : 'bg-violet-300/15 text-violet-200'}`}>{item.rentalTier === 'hobbyist' ? 'Casual' : 'Pro'}</span>}
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-bold tracking-tight text-white">₹{item.dailyRate.toLocaleString('en-IN')}<span className="ml-1 text-[10px] font-medium text-gray-500">/ day</span></p>
                    <span className="text-right text-[10px] font-medium text-gray-400"><span className={available > 0 ? 'text-emerald-300' : 'text-orange-300'}>{available} available</span> <span className="text-gray-600">/ {item.totalStock} units</span></span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className={`h-full rounded-full transition-all ${stockPercentage > 50 ? 'bg-gradient-to-r from-emerald-400 to-teal-300' : stockPercentage > 0 ? 'bg-gradient-to-r from-amber-400 to-orange-300' : 'bg-gradient-to-r from-rose-500 to-orange-400'}`} style={{ width: `${stockPercentage}%` }} />
                  </div>
                  {(item.serialNumber || item.description || item.specs.length > 0) && (
                    <div className="mt-3 space-y-2">
                      {item.serialNumber && <p className="truncate text-[10px] text-gray-500">Serial no. <span className="font-medium text-gray-300">{item.serialNumber}</span></p>}
                      {item.description && <p className="line-clamp-2 text-xs leading-5 text-gray-400">{item.description}</p>}
                      {item.specs.length > 0 && <div className="flex flex-wrap gap-1.5">{item.specs.slice(0, 3).map(spec => <span key={spec} className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[9px] text-gray-400">{spec}</span>)}{item.specs.length > 3 && <span className="px-1 py-1 text-[9px] text-gray-500">+{item.specs.length - 3}</span>}</div>}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2 border-t border-white/[0.07] pt-3">
                    <button onClick={() => openEdit(item)} className="gear-edit-button flex-1 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] py-2.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/30 hover:bg-cyan-300/10">Edit details</button>
                    <button onClick={() => handleDelete(item.id)} aria-label={`Delete ${item.name}`} className="rounded-xl border border-rose-300/10 bg-rose-400/[0.04] px-3 py-2.5 text-xs font-medium text-rose-300 transition hover:border-rose-300/25 hover:bg-rose-400/10">Delete</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
