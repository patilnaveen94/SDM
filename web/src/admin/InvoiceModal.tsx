import React from 'react';
import { businessInfo } from '../assetsConfig';
import { calculateOrderTotal, Order } from '../store/dataStore';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const subtotal = calculateOrderTotal(order.items, order.days);
  const discount = order.discountAmount || 0;
  const invoiceDate = order.settledAt || order.createdAt;
  const isPaid = order.paymentStatus === 'paid';
  const hireHours = order.rentalHoursPerPeriod || 24;
  const periodLabel = order.rentalHoursPerPeriod
    ? `${hireHours}-hour hire period${order.days === 1 ? '' : 's'}`
    : `day${order.days === 1 ? '' : 's'}`;
  const rateLabel = order.rentalHoursPerPeriod ? `Rate / ${hireHours} hr` : 'Rate / day';

  return (
    <div className="invoice-modal-backdrop fixed inset-0 z-[70] bg-obsidian/90 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-3xl my-2 sm:my-6" onClick={event => event.stopPropagation()}>
        <div className="invoice-actions flex flex-wrap justify-end gap-2 mb-3">
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-gold text-obsidian text-sm font-bold">
            Download / Print PDF
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 text-sm">
            Close
          </button>
        </div>

        <section className="invoice-print overflow-hidden rounded-xl bg-white text-gray-900 shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-blue-950 via-blue-700 to-amber-400" />
          <div className="p-4 sm:p-10">
            <header className="flex flex-col justify-between gap-6 border-b border-gray-200 pb-6 sm:flex-row">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-lg font-black tracking-tight text-white">SDM</div>
                  <div>
                    <p className="text-xl font-bold tracking-tight text-gray-950">{businessInfo.name}</p>
                    <p className="text-xs font-medium text-blue-800">{businessInfo.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{businessInfo.address}</p>
                <p className="text-sm text-gray-600">Call +91 {businessInfo.phone} <span className="px-1 text-gray-300">|</span> WhatsApp +91 {businessInfo.whatsapp}</p>
                <p className="text-sm text-gray-600">{businessInfo.email}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-800">Customer copy</p>
                <h1 className="mt-1 text-4xl font-bold tracking-tight text-gray-950">INVOICE</h1>
                <p className="mt-2 text-sm text-gray-600">Invoice no. <span className="font-semibold text-gray-900">SDM-{order.id.toUpperCase()}</span></p>
                <p className="text-sm text-gray-600">Issued {new Date(invoiceDate).toLocaleDateString('en-IN')}</p>
              </div>
            </header>

            <div className={`my-6 flex flex-col justify-between gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center ${isPaid ? 'border-green-200 bg-green-50' : 'border-amber-300 bg-amber-50'}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.16em] ${isPaid ? 'text-green-800' : 'text-amber-800'}`}>
                  {isPaid ? 'Payment received' : 'Payment pending'}
                </p>
                <p className={`mt-0.5 text-sm ${isPaid ? 'text-green-700' : 'text-amber-800'}`}>
                  {isPaid ? 'This invoice has been paid in full.' : 'Please arrange payment for the outstanding invoice total.'}
                </p>
              </div>
              <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${isPaid ? 'bg-green-700 text-white' : 'bg-amber-500 text-white'}`}>
                {isPaid ? 'Paid' : 'Payment pending'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Bill to</p>
                <p className="font-semibold text-gray-950">{order.customerName}</p>
                <p className="text-sm text-gray-600">{order.customerPhone}</p>
                {order.customerEmail && <p className="text-sm text-gray-600">{order.customerEmail}</p>}
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:text-right">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Order details</p>
                <p className="text-sm font-semibold text-gray-900">{order.type === 'rental' ? 'Equipment rental' : `Event booking${order.eventType ? ` · ${order.eventType}` : ''}`}</p>
                <p className="text-sm text-gray-600">{order.startDate}{order.startTime ? ` ${order.startTime}` : ''} – {order.endDate}{order.endTime ? ` ${order.endTime}` : ''}</p>
                <p className="mt-1 text-sm font-bold text-blue-900">
                  Hire duration: {order.days} {periodLabel}
                  {order.rentalHoursPerPeriod ? ` (${order.days * hireHours} hours total)` : ''}
                </p>
              </div>
            </div>

            <div className="mt-7">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-700">Itemized charges</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-blue-950 text-left text-[9px] uppercase tracking-[0.08em] text-white sm:text-[10px] sm:tracking-[0.12em]">
                    <th className="rounded-l-lg px-3 py-3">Description</th>
                    <th className="px-2 py-3 text-right">Qty</th>
                    <th className="px-2 py-3 text-right">{order.rentalHoursPerPeriod ? 'Periods' : 'Days'}</th>
                    <th className="px-2 py-3 text-right">{rateLabel}</th>
                    <th className="rounded-r-lg px-3 py-3 text-right">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={`${item.gearId}-${index}`} className="border-b border-gray-200">
                      <td className="px-3 py-4 font-medium text-gray-900">{item.gearName}</td>
                      <td className="px-2 py-4 text-right text-gray-700">{item.quantity}</td>
                      <td className="px-2 py-4 text-right text-gray-700">{order.days} {order.rentalHoursPerPeriod ? 'periods' : 'days'}</td>
                      <td className="px-2 py-4 text-right text-gray-700">₹{item.dailyRate.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-4 text-right font-semibold text-gray-900">₹{(item.dailyRate * item.quantity * order.days).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Line total is calculated as <span className="font-semibold text-gray-700">quantity × hire periods × rate per hire period</span>. {order.rentalHoursPerPeriod ? `Each period is ${hireHours} hours.` : 'Rates are per day.'} All rates are in INR (₹).
              </p>
            </div>

            <div className="flex justify-end py-5">
              <div className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>− ₹{discount.toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between border-t border-gray-300 pt-3 text-lg font-bold text-gray-950">
                  <span>Invoice total</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                {!isPaid && (
                  <div className="flex justify-between rounded-lg bg-amber-50 px-3 py-2 font-semibold text-amber-800">
                    <span>Balance due</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {order.notes && <p className="mt-2 border-t border-gray-200 pt-4 text-sm text-gray-600">Notes: {order.notes}</p>}

            <footer className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-gray-200 pt-6 sm:flex-row">
              <div className="text-center text-xs text-gray-500 sm:text-left">
                <p className="font-semibold text-gray-700">Thank you for choosing {businessInfo.name}.</p>
                <p className="mt-1">This invoice was generated electronically.</p>
              </div>
              <div className="sdm-invoice-seal" role="img" aria-label="SDM Camera and Solutions, Bengaluru, verified business seal">
                <svg viewBox="0 0 160 160" aria-hidden="true">
                  <circle cx="80" cy="80" r="73" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="80" cy="80" r="66" fill="none" stroke="currentColor" strokeWidth="1" />
                  <text className="seal-arc" textAnchor="middle">
                    <textPath href="#sdm-seal-top" startOffset="50%">SDM CAMERA &amp; SOLUTIONS</textPath>
                  </text>
                  <path id="sdm-seal-top" d="M29 80a51 51 0 0 1 102 0" fill="none" />
                  <text x="80" y="77" textAnchor="middle" className="seal-main">SDM</text>
                  <text x="80" y="94" textAnchor="middle" className="seal-sub">OFFICIAL</text>
                  <path d="M45 105h70" stroke="currentColor" strokeWidth="1" />
                  <text x="80" y="120" textAnchor="middle" className="seal-location">BENGALURU · INDIA</text>
                  <path d="m49 48 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z" fill="currentColor" />
                  <path d="m111 48 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z" fill="currentColor" />
                </svg>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
};
