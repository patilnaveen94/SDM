import React, { useState } from 'react';
import { getPartners, addPartner, updatePartner, deletePartner, Partner } from '../store/dataStore';

const emptyForm: Omit<Partner, 'id'> = {
  name: '',
  logo: '',
  website: '',
  description: '',
  displayOrder: 0,
  active: true,
};

export const PartnersPage: React.FC = () => {
  const [partners, setPartners] = useState(getPartners());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Partner, 'id'>>(emptyForm);

  const refresh = () => setPartners(getPartners());

  const openCreate = () => {
    setForm({ ...emptyForm, displayOrder: partners.length });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: Partner) => {
    setForm({ name: p.name, logo: p.logo, website: p.website || '', description: p.description || '', displayOrder: p.displayOrder, active: p.active });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updatePartner(editingId, form);
    } else {
      addPartner(form);
    }
    refresh();
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this partner?')) {
      deletePartner(id);
      refresh();
    }
  };

  const toggleActive = (p: Partner) => {
    updatePartner(p.id, { active: !p.active });
    refresh();
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none transition-colors placeholder-gray-500";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Associated Partners</h1>
          <p className="text-gray-500 text-sm mt-1">These appear on the public "Partners" section of the website.</p>
        </div>
        <button onClick={openCreate} className="w-full px-5 py-2.5 rounded-xl bg-gold text-obsidian font-bold text-sm hover:bg-gold-light transition-colors sm:w-auto">
          + Add Partner
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-dark-surface border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-md my-2 sm:my-10" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit' : 'Add'} Partner</h2>
            <div className="space-y-3">
              <input placeholder="Partner / Brand Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputCls} />
              <input placeholder="Logo Image URL" value={form.logo} onChange={e => setForm({...form, logo: e.target.value})} className={inputCls} />
              {form.logo && (
                <div className="p-3 bg-white/5 rounded-xl flex items-center gap-3">
                  <img src={form.logo} alt="logo preview" className="h-10 w-auto object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                  <span className="text-gray-500 text-xs">Logo preview</span>
                </div>
              )}
              <input placeholder="Website URL (optional)" value={form.website} onChange={e => setForm({...form, website: e.target.value})} className={inputCls} />
              <textarea placeholder="Short description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className={inputCls + ' resize-none'} />
              <input type="number" placeholder="Display Order" value={form.displayOrder} onChange={e => setForm({...form, displayOrder: Number(e.target.value)})} className={inputCls} />
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="accent-gold" />
                Visible on website
              </label>
            </div>
            <div className="flex flex-col-reverse gap-3 mt-6 sm:flex-row">
              <button onClick={handleSave} disabled={!form.name.trim()} className="flex-1 py-3 rounded-xl bg-gold text-obsidian font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Partners List */}
      {partners.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">🤝</p>
          <p>No partners added yet.</p>
          <p className="text-xs mt-2 text-gray-600">Add your first associated partner or sponsor.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map(p => (
            <div key={p.id} className={`rounded-2xl border p-5 transition-all ${p.active ? 'bg-white/[0.03] border-white/5' : 'bg-white/[0.01] border-white/3 opacity-50'}`}>
              <div className="flex items-start gap-4">
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="h-12 w-12 object-contain rounded-xl bg-white/5 p-1 flex-shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">🤝</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm">{p.name}</h3>
                  {p.website && <p className="text-gold text-[11px] mt-0.5 truncate">{p.website}</p>}
                  {p.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{p.description}</p>}
                  <p className="text-gray-600 text-[10px] mt-2">Order: {p.displayOrder}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                <button onClick={() => toggleActive(p)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${p.active ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                  {p.active ? '● Visible' : '○ Hidden'}
                </button>
                <button onClick={() => openEdit(p)} className="flex-1 py-2 rounded-lg bg-white/5 text-gray-300 text-xs hover:bg-white/10 transition-colors">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="px-3 py-2 rounded-lg bg-red-500/5 text-red-400 text-xs hover:bg-red-500/10 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
