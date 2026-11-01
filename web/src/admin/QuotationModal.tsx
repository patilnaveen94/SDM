import React, { useMemo, useState } from 'react';
import { businessInfo } from '../assetsConfig';
import { getGearInventory, QuoteRequest, QuotationLine, SavedQuotation, saveQuotation } from '../store/dataStore';

interface QuotationModalProps {
  request: QuoteRequest;
  quotation?: SavedQuotation;
  onClose: () => void;
  onSaved?: () => void;
}

function getValidityDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 15);
  return date.toISOString().split('T')[0];
}

export const QuotationModal: React.FC<QuotationModalProps> = ({ request, quotation, onClose, onSaved }) => {
  const gear = getGearInventory();
  const [savedQuotation, setSavedQuotation] = useState(quotation);
  const [saveMessage, setSaveMessage] = useState('');
  const [customerName, setCustomerName] = useState(quotation?.customerName || request.customerName);
  const [customerPhone, setCustomerPhone] = useState(quotation?.customerPhone || request.customerPhone);
  const [customerEmail, setCustomerEmail] = useState(quotation?.customerEmail || request.customerEmail);
  const [eventType, setEventType] = useState(quotation?.eventType || request.eventType);
  const [requestedDate, setRequestedDate] = useState(quotation?.requestedDate || request.requestedDate);
  const [lines, setLines] = useState<QuotationLine[]>([{
    ...(quotation?.lines[0] || {
      id: `${Date.now()}-service`,
      description: request.eventType.replace(/_/g, ' '),
      quantity: 1,
      unit: 'service',
      unitPrice: 0,
    }),
  }, ...(quotation?.lines.slice(1) || [])]);
  const [discount, setDiscount] = useState(quotation?.discount || 0);
  const [validUntil, setValidUntil] = useState(quotation?.validUntil || getValidityDate);
  const [terms, setTerms] = useState(quotation?.terms || 'This quotation is valid until the date shown above. Work will be scheduled after customer approval.');
  const message = quotation?.message ?? request.message;

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
    [lines],
  );
  const appliedDiscount = Math.min(Math.max(0, discount), subtotal);
  const total = subtotal - appliedDiscount;
  const inputCls = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-gold focus:outline-none';

  const updateLine = (id: string, updates: Partial<QuotationLine>) => {
    setLines(current => current.map(line => line.id === id ? { ...line, ...updates } : line));
  };

  const addLine = (description = '', unit = 'service', unitPrice = 0) => {
    setLines(current => [...current, {
      id: `${Date.now()}-${Math.random()}`,
      description,
      quantity: 1,
      unit,
      unitPrice,
    }]);
  };

  const addGearLine = (gearId: string) => {
    const item = gear.find(candidate => candidate.id === gearId);
    if (!item) return;
    addLine(item.name, 'hire period', item.dailyRate);
  };

  const handleSave = () => {
    const saved = saveQuotation({
      requestId: request.id,
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      requestedDate,
      message,
      lines,
      discount: appliedDiscount,
      validUntil,
      terms,
    }, savedQuotation?.id);
    setSavedQuotation(saved);
    setSaveMessage('Quotation saved. You can reopen it from the dashboard.');
    onSaved?.();
  };

  return (
    <div className="quotation-modal-backdrop fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-obsidian/90 p-2 backdrop-blur-sm sm:p-4">
      <div className="my-2 w-full max-w-4xl sm:my-4" onClick={event => event.stopPropagation()}>
        <div className="quotation-actions mb-3 flex flex-wrap justify-end gap-2">
          <button onClick={() => window.print()} className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-obsidian">
            Download / Print quotation
          </button>
          <button onClick={handleSave} className="rounded-lg border border-blue-300/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-200">
            {savedQuotation ? 'Save changes' : 'Save quotation'}
          </button>
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300">
            Close
          </button>
        </div>
        {saveMessage && <p role="status" className="mb-3 text-right text-xs text-green-300">{saveMessage}</p>}

        <section className="quotation-print overflow-hidden rounded-xl bg-white text-gray-900 shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-blue-950 via-blue-700 to-amber-400" />
          <div className="p-4 sm:p-10">
            <header className="flex flex-col justify-between gap-5 border-b border-gray-200 pb-6 sm:flex-row">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-lg font-black text-white">SDM</div>
                  <div>
                    <p className="text-xl font-bold text-gray-950">{businessInfo.name}</p>
                    <p className="text-xs text-blue-800">{businessInfo.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{businessInfo.address}</p>
                <p className="text-sm text-gray-600">Call +91 {businessInfo.phone} · WhatsApp +91 {businessInfo.whatsapp}</p>
                <p className="text-sm text-gray-600">{businessInfo.email}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-800">Prepared for customer</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">QUOTATION</h1>
                <p className="mt-2 text-sm text-gray-600">Quote no. <span className="font-semibold text-gray-900">SDM-Q-{(savedQuotation?.id || request.id).toUpperCase()}</span></p>
                <p className="text-sm text-gray-600">Issued {new Date(savedQuotation?.createdAt || Date.now()).toLocaleDateString('en-IN')}</p>
                <p className="text-sm font-semibold text-amber-800">Valid until {new Date(`${validUntil}T00:00:00`).toLocaleDateString('en-IN')}</p>
              </div>
            </header>

            <div className="quotation-editor my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Prepared for</p>
                <input aria-label="Customer or company name" placeholder="Customer / company name" value={customerName} onChange={event => setCustomerName(event.target.value)} className="mb-2 w-full rounded border border-gray-300 bg-white px-2 py-1 font-semibold text-gray-950" />
                <input aria-label="Customer phone" placeholder="Phone number" value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} className="mb-2 w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700" />
                <input aria-label="Customer email" placeholder="Email address" value={customerEmail} onChange={event => setCustomerEmail(event.target.value)} className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700" />
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:text-right">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Enquiry</p>
                <input aria-label="Quotation service or project" placeholder="Service or project" value={eventType} onChange={event => setEventType(event.target.value)} className="mb-2 w-full rounded border border-gray-300 bg-white px-2 py-1 text-right font-semibold capitalize text-gray-900" />
                <label className="flex items-center justify-end gap-2 text-sm text-gray-600">
                  Requested date
                  <input aria-label="Requested date" type="date" value={requestedDate} onChange={event => setRequestedDate(event.target.value)} className="rounded border border-gray-300 bg-white px-2 py-1 text-gray-800" />
                </label>
              </div>
            </div>
            <div className="quotation-customer my-6 hidden grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Prepared for</p>
                <p className="font-semibold text-gray-950">{customerName || 'Customer / company name'}</p>
                {customerPhone && <p className="text-sm text-gray-600">{customerPhone}</p>}
                {customerEmail && <p className="text-sm text-gray-600">{customerEmail}</p>}
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Project</p>
                <p className="font-semibold capitalize text-gray-900">{eventType || 'Quotation'}</p>
                {requestedDate && <p className="text-sm text-gray-600">Requested date: {requestedDate}</p>}
                {message && <p className="mt-1 text-sm text-gray-600">{message}</p>}
              </div>
            </div>

            <div className="quotation-editor mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">Build the quotation</p>
                  <p className="text-xs text-gray-600">Edit descriptions, quantities and rates before sharing.</p>
                </div>
                {gear.length > 0 && (
                  <select
                    aria-label="Add equipment from inventory"
                    defaultValue=""
                    onChange={event => {
                      if (event.target.value) addGearLine(event.target.value);
                      event.target.value = '';
                    }}
                    className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-gray-800"
                  >
                    <option value="">+ Add gear from inventory</option>
                    {gear.map(item => <option key={item.id} value={item.id}>{item.name} · ₹{item.dailyRate}/hire period</option>)}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                {lines.map(line => (
                  <div key={line.id} className="grid grid-cols-2 gap-2 sm:grid-cols-12">
                    <input
                      aria-label="Quotation item description"
                      value={line.description}
                      onChange={event => updateLine(line.id, { description: event.target.value })}
                      placeholder="Service or item description"
                      className={`${inputCls} col-span-2 !bg-white !text-gray-900 sm:col-span-5`}
                    />
                    <input
                      aria-label="Quotation quantity"
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={event => updateLine(line.id, { quantity: Math.max(1, Number(event.target.value) || 1) })}
                      className={`${inputCls} col-span-1 !bg-white !text-gray-900 sm:col-span-2`}
                    />
                    <input
                      aria-label="Quotation unit"
                      value={line.unit}
                      onChange={event => updateLine(line.id, { unit: event.target.value })}
                      placeholder="unit"
                      className={`${inputCls} col-span-1 !bg-white !text-gray-900 sm:col-span-2`}
                    />
                    <input
                      aria-label="Quotation rate"
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unitPrice}
                      onChange={event => updateLine(line.id, { unitPrice: Math.max(0, Number(event.target.value) || 0) })}
                      className={`${inputCls} col-span-1 !bg-white !text-gray-900 sm:col-span-2`}
                    />
                    <button
                      aria-label={`Remove ${line.description || 'quotation line'}`}
                      onClick={() => setLines(current => current.filter(candidate => candidate.id !== line.id))}
                      className="col-span-2 text-sm text-red-600 hover:text-red-800 sm:col-span-1"
                    >×</button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <button onClick={() => addLine()} className="text-xs font-semibold text-blue-800 hover:text-blue-950">+ Add custom service</button>
                <label className="text-xs text-gray-700">
                  Valid until
                  <input type="date" value={validUntil} onChange={event => setValidUntil(event.target.value)} className="ml-2 rounded border border-gray-300 bg-white px-2 py-1 text-gray-900" />
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-950 text-left text-[10px] uppercase tracking-wider text-white">
                    <th className="rounded-l-lg px-3 py-3">Description</th>
                    <th className="px-3 py-3 text-right">Qty</th>
                    <th className="px-3 py-3 text-right">Rate / unit</th>
                    <th className="rounded-r-lg px-3 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map(line => (
                    <tr key={line.id} className="border-b border-gray-200">
                      <td className="px-3 py-3 font-medium capitalize text-gray-900">{line.description || '—'} <span className="text-xs font-normal text-gray-500">({line.unit})</span></td>
                      <td className="px-3 py-3 text-right text-gray-700">{line.quantity}</td>
                      <td className="px-3 py-3 text-right text-gray-700">₹{line.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900">₹{(line.quantity * line.unitPrice).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end py-5">
              <div className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <label className="quotation-editor flex items-center justify-between gap-3 text-gray-600">
                  <span>Discount (₹)</span>
                  <input type="number" min={0} step="0.01" value={discount} onChange={event => setDiscount(Math.max(0, Number(event.target.value) || 0))} className="w-28 rounded border border-gray-300 px-2 py-1 text-right text-gray-900" />
                </label>
                {appliedDiscount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>− ₹{appliedDiscount.toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between border-t border-gray-300 pt-3 text-lg font-bold text-gray-950"><span>Quoted total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            <label className="quotation-editor mb-5 block text-xs text-gray-600">
              Quotation terms
              <textarea value={terms} onChange={event => setTerms(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-800" />
            </label>
            <p className="quotation-terms hidden text-sm text-gray-600">{terms}</p>

            <footer className="mt-5 flex flex-col items-center justify-between gap-5 border-t border-gray-200 pt-5 sm:flex-row">
              <div className="text-center text-xs text-gray-500 sm:text-left">
                <p className="font-semibold text-gray-700">Thank you for considering {businessInfo.name}.</p>
                <p className="mt-1">To approve this quotation, call +91 {businessInfo.phone} or WhatsApp +91 {businessInfo.whatsapp}.</p>
                <p className="mt-2">Share the downloaded PDF via email or your preferred messaging channel.</p>
              </div>
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-[3px] border-double border-blue-700 text-center text-blue-800">
                <span className="text-[8px] font-bold tracking-widest">SDM OFFICIAL</span>
                <span className="my-1 text-sm font-black">SDM</span>
                <span className="text-[8px] font-bold tracking-wider">BENGALURU</span>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
};
