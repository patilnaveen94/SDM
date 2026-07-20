import React, { useState } from 'react';
import { getGearInventory, addGearItem, updateGearItem, deleteGearItem, GearItem } from '../store/dataStore';

const emptyForm: Omit<GearItem, 'id'> = {
  name: '', category: 'camera', brand: '', dailyRate: 0, description: '',
  specs: [], image: '', available: true, totalStock: 1, currentlyRented: 0,
};

export const GearPage: React.FC = () => {
  const [gear, setGear] = useState(getGearInventory());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [specsInput, setSpecsInput] = useState('');

  const refresh = () => setGear(getGearInventory());

  const openCreate = () => {
    setForm(emptyForm);
    setSpecsInput('');
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item: GearItem) => {
    setForm(item);
    setSpecsInput(item.specs.join(', '));
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = () => {
    const specs = specsInput.split(',').map(s => s.trim()).filter(Boolean);
    const data = { ...form, specs };
    if (editingId) {
      updateGearItem(editingId, data);
    } else {
      addGearItem(data);
    }
    refresh();
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this item?')) {
      deleteGearItem(id);
      refresh();
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-heading font-bold text-white">Gear Inventory</h1>
        <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-gold text-obsidian font-bold text-sm hover:bg-gold-light transition-colors">
          + Add Item
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-dark-surface border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit' : 'Add'} Gear Item</h2>
            <div className="space-y-3">
              <input placeholder="Item Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputCls} />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value as any})} className={inputCls + ' appearance-none'}>
                <option value="camera">Camera</option><option value="lens">Lens</option>
                <option value="anamorphic">Anamorphic</option><option value="drone">Drone</option>
                <option value="lighting">Lighting</option><option value="accessory">Accessory</option>
              </select>
              <input placeholder="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className={inputCls} />
              <input type="number" placeholder="Daily Rate (₹)" value={form.dailyRate || ''} onChange={e => setForm({...form, dailyRate: Number(e.target.value)})} className={inputCls} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className={inputCls + ' resize-none'} />
              <input placeholder="Specs (comma separated)" value={specsInput} onChange={e => setSpecsInput(e.target.value)} className={inputCls} />
              <input placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Total Stock" value={form.totalStock || ''} onChange={e => setForm({...form, totalStock: Number(e.target.value)})} className={inputCls} />
                <input type="number" placeholder="Currently Rented" value={form.currentlyRented || ''} onChange={e => setForm({...form, currentlyRented: Number(e.target.value)})} className={inputCls} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={form.available} onChange={e => setForm({...form, available: e.target.checked})} className="accent-gold" />
                Available for rent
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-gold text-obsidian font-bold text-sm">Save</button>
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
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gear.map(item => (
            <div key={item.id} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden group">
              {item.image && <img src={item.image} alt={item.name} className="w-full h-36 object-cover" />}
              <div className="p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.brand} • {item.category}</p>
                <h3 className="text-white font-semibold text-sm mt-1">{item.name}</h3>
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
          ))}
        </div>
      )}
    </div>
  );
};
