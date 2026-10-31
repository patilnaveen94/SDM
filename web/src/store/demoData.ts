import type {
  CustomerProfile,
  GearItem,
  Order,
  Partner,
  QuoteRequest,
  SavedQuotation,
  UpdatePost,
} from './dataStore';

export interface DemoDataset {
  gear: GearItem[];
  orders: Order[];
  customers: CustomerProfile[];
  quoteRequests: QuoteRequest[];
  quotations: SavedQuotation[];
  updates: UpdatePost[];
  partners: Partner[];
}

function localDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function timestamp(offsetDays = 0, hour = 12): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function makeOrder(input: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: Order['items'];
  days: number;
  startOffset: number;
  endOffset: number;
  createdOffset: number;
  status: Order['status'];
  paymentStatus: Order['paymentStatus'];
  startTime?: string;
  endTime?: string;
  discountAmount?: number;
  returnedItems?: Record<string, number>;
  partialReturns?: Order['partialReturns'];
  missingItems?: Order['missingItems'];
  missingNote?: string;
  returnedOffset?: number;
  settledOffset?: number;
  eventType?: string;
  notes?: string;
}): Order {
  const subtotal = input.items.reduce((sum, item) => sum + item.dailyRate * item.quantity * input.days, 0);
  return {
    id: input.id,
    type: input.eventType ? 'event_booking' : 'rental',
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    items: input.items,
    eventType: input.eventType,
    discountAmount: input.discountAmount || 0,
    totalAmount: subtotal - (input.discountAmount || 0),
    status: input.status,
    paymentStatus: input.paymentStatus,
    createdAt: timestamp(input.createdOffset),
    startDate: localDate(input.startOffset),
    startTime: input.startTime || '10:00',
    endDate: localDate(input.endOffset),
    endTime: input.endTime || '10:00',
    days: input.days,
    notes: input.notes,
    returnedAt: input.returnedOffset === undefined ? undefined : timestamp(input.returnedOffset, 16),
    returnedItems: input.returnedItems,
    partialReturns: input.partialReturns,
    missingItems: input.missingItems,
    missingNote: input.missingNote,
    settledAt: input.settledOffset === undefined ? undefined : timestamp(input.settledOffset, 17),
    rentalHoursPerPeriod: 12,
  };
}

export function createDemoDataset(): DemoDataset {
  const gear: GearItem[] = [
    { id: 'demo-fx6', name: 'Sony FX6 Cinema Camera', category: 'camera', brand: 'Sony', dailyRate: 8500, description: 'Full-frame cinema camera package.', specs: ['4K 120fps', 'Full frame', 'XLR audio'], image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', available: true, totalStock: 10, currentlyRented: 0, rentalTier: 'professional' },
    { id: 'demo-a7s3', name: 'Sony A7S III', category: 'camera', brand: 'Sony', dailyRate: 4500, description: 'Compact full-frame video camera.', specs: ['4K 120fps', 'Full frame'], image: 'https://images.unsplash.com/photo-1510127034890-1e589b88a8f4?w=800&q=80', available: true, totalStock: 6, currentlyRented: 0, rentalTier: 'hobbyist' },
    { id: 'demo-lens', name: '24–70mm f/2.8 GM II', category: 'lens', brand: 'Sony', dailyRate: 1800, description: 'Standard professional zoom lens.', specs: ['E-mount', 'Constant f/2.8'], image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80', available: true, totalStock: 8, currentlyRented: 0, rentalTier: 'professional' },
    { id: 'demo-drone', name: 'DJI Inspire 3', category: 'drone', brand: 'DJI', dailyRate: 12000, description: 'Professional aerial cinema platform.', specs: ['8K RAW', 'Dual operator'], image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80', available: true, totalStock: 3, currentlyRented: 0, rentalTier: 'professional' },
    { id: 'demo-audio', name: 'Wireless Mic Kit', category: 'audio', brand: 'Rode', dailyRate: 900, description: 'Two-channel wireless microphone kit.', specs: ['2 transmitters', 'Lavaliers included'], image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80', available: true, totalStock: 6, currentlyRented: 0, rentalTier: 'hobbyist' },
    { id: 'demo-light', name: 'Aputure 600D Pro', category: 'lighting', brand: 'Aputure', dailyRate: 2500, description: 'Daylight point-source LED fixture.', specs: ['600W', 'Bowens mount'], image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80', available: true, totalStock: 5, currentlyRented: 0, rentalTier: 'professional' },
    { id: 'demo-gimbal', name: 'DJI RS 4 Pro', category: 'gimbal', brand: 'DJI', dailyRate: 1600, description: 'Professional camera stabilizer.', specs: ['4.5 kg payload', 'LiDAR focus'], image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80', available: true, totalStock: 4, currentlyRented: 0, rentalTier: 'professional' },
    { id: 'demo-anamorphic', name: '1.8x Anamorphic Set', category: 'anamorphic', brand: 'Sirui', dailyRate: 3200, description: 'Three-lens anamorphic prime set.', specs: ['35 / 50 / 75mm', 'E-mount'], image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80', available: true, totalStock: 3, currentlyRented: 0, rentalTier: 'professional' },
    { id: 'demo-accessory', name: 'V-Mount Battery Kit', category: 'accessory', brand: 'IDX', dailyRate: 700, description: 'Battery and charger kit.', specs: ['2 batteries', 'Dual charger'], image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80', available: true, totalStock: 8, currentlyRented: 0, rentalTier: 'hobbyist' },
  ];

  const fx6 = { gearId: 'demo-fx6', gearName: 'Sony FX6 Cinema Camera', quantity: 1, dailyRate: 8500 };
  const a7s3 = { gearId: 'demo-a7s3', gearName: 'Sony A7S III', quantity: 1, dailyRate: 4500 };
  const lens = { gearId: 'demo-lens', gearName: '24–70mm f/2.8 GM II', quantity: 1, dailyRate: 1800 };
  const audio = { gearId: 'demo-audio', gearName: 'Wireless Mic Kit', quantity: 1, dailyRate: 900 };
  const requests: QuoteRequest[] = [
    { id: 'demo-quote-request-1', customerName: 'Aarav Mehta', customerPhone: '9000000101', customerEmail: 'aarav@example.com', eventType: 'Corporate product launch', requestedDate: localDate(12), message: 'Please quote a two-camera setup and event audio.', createdAt: timestamp(-1) },
    { id: 'demo-quote-request-2', customerName: 'Mira Shah', customerPhone: '9000000102', customerEmail: 'mira@example.com', eventType: 'Wedding coverage', requestedDate: localDate(20), message: 'Ceremony and reception coverage.', createdAt: timestamp(-3), convertedOrderId: 'DEMO-ORD-008' },
  ];

  const orders: Order[] = [
    makeOrder({ id: 'DEMO-ORD-001', customerName: 'Rohan Kapoor', customerPhone: '9000000103', customerEmail: 'rohan@example.com', items: [fx6], days: 2, startOffset: -1, endOffset: 1, createdOffset: -2, status: 'active', paymentStatus: 'pending', notes: 'Current professional rental.' }),
    makeOrder({ id: 'DEMO-ORD-002', customerName: 'Aarav Mehta', customerPhone: '9000000101', customerEmail: 'aarav@example.com', items: [fx6], days: 1, startOffset: 0, endOffset: 1, createdOffset: -1, status: 'active', paymentStatus: 'pending', startTime: '23:45', endTime: '23:45', notes: 'Scheduled for delivery today.' }),
    makeOrder({ id: 'DEMO-ORD-003', customerName: 'Nisha Rao', customerPhone: '9000000104', customerEmail: 'nisha@example.com', items: [fx6, lens], days: 1, startOffset: -1, endOffset: 0, createdOffset: -2, status: 'active', paymentStatus: 'pending', endTime: '20:00', notes: 'Due for return today.' }),
    makeOrder({ id: 'DEMO-ORD-004', customerName: 'Kabir Anand', customerPhone: '9000000105', customerEmail: 'kabir@example.com', items: [a7s3], days: 2, startOffset: -4, endOffset: -2, createdOffset: -5, status: 'active', paymentStatus: 'pending', notes: 'Overdue return scenario.' }),
    makeOrder({
      id: 'DEMO-ORD-005', customerName: 'Isha Verma', customerPhone: '9000000106', customerEmail: 'isha@example.com',
      items: [{ ...fx6, quantity: 2 }], days: 2, startOffset: -1, endOffset: 1, createdOffset: -2, status: 'partially_returned', paymentStatus: 'pending',
      returnedItems: { 'demo-fx6': 1 },
      partialReturns: [{ returnedAt: timestamp(0, 10), items: [fx6], note: 'One camera body received; second unit due tomorrow.' }],
      notes: 'Partial return is awaiting remaining gear.',
    }),
    makeOrder({ id: 'DEMO-ORD-006', customerName: 'Devika Nair', customerPhone: '9000000107', customerEmail: 'devika@example.com', items: [{ ...fx6, quantity: 2 }], days: 1, startOffset: 4, endOffset: 5, createdOffset: 0, status: 'active', paymentStatus: 'pending', notes: 'Upcoming reservation blocked from available stock.' }),
    makeOrder({
      id: 'DEMO-ORD-007', customerName: 'Sameer Joshi', customerPhone: '9000000108', customerEmail: 'sameer@example.com',
      items: [{ ...a7s3, quantity: 2 }], days: 2, startOffset: -5, endOffset: -3, createdOffset: -6, status: 'returned_pending_payment', paymentStatus: 'pending',
      returnedItems: { 'demo-a7s3': 1 }, returnedOffset: -2, missingItems: [a7s3], missingNote: 'One camera body was not returned; customer notified.',
      partialReturns: [{ returnedAt: timestamp(-2), items: [a7s3], note: 'One camera received; second unit missing.' }],
    }),
    makeOrder({
      id: 'DEMO-ORD-008', customerName: 'Mira Shah', customerPhone: '9000000102', customerEmail: 'mira@example.com',
      items: [audio, lens], days: 1, startOffset: -6, endOffset: -5, createdOffset: -8, status: 'returned_pending_payment', paymentStatus: 'pending',
      returnedItems: { 'demo-audio': 1, 'demo-lens': 1 }, returnedOffset: -4, discountAmount: 300, notes: 'All equipment returned; payment remains pending.',
    }),
    makeOrder({
      id: 'DEMO-ORD-009', customerName: 'Leela Iyer', customerPhone: '9000000109', customerEmail: 'leela@example.com',
      items: [fx6, lens, audio], days: 1, startOffset: -14, endOffset: -13, createdOffset: -15, status: 'settled', paymentStatus: 'paid',
      returnedItems: { 'demo-fx6': 1, 'demo-lens': 1, 'demo-audio': 1 }, returnedOffset: -12, settledOffset: -11, discountAmount: 1200,
      partialReturns: [{ returnedAt: timestamp(-12), items: [fx6, lens, audio], note: 'All items inspected and returned in good condition.' }],
    }),
    makeOrder({
      id: 'DEMO-ORD-010', customerName: 'Vikram Sethi', customerPhone: '9000000110', customerEmail: 'vikram@example.com',
      items: [audio], days: 1, startOffset: -65, endOffset: -64, createdOffset: -66, status: 'returned_pending_payment', paymentStatus: 'pending',
      returnedItems: { 'demo-audio': 1 }, returnedOffset: -63, notes: 'Older unpaid order for pending-collection reporting.',
    }),
    makeOrder({
      id: 'DEMO-ORD-011', customerName: 'Northstar Films', customerPhone: '9000000111', customerEmail: 'accounts@northstar.example',
      items: [fx6, lens, audio], days: 1, startOffset: 3, endOffset: 3, createdOffset: -1, status: 'active', paymentStatus: 'pending',
      eventType: 'Corporate video production', notes: 'Event booking scenario with a corporate customer.',
    }),
  ];

  for (const item of gear) {
    item.currentlyRented = orders.reduce((quantity, order) => {
      if (order.type !== 'rental') return quantity;
      if (order.status === 'active' || order.status === 'partially_returned') {
        return quantity + order.items
          .filter(orderItem => orderItem.gearId === item.id)
          .reduce((sum, orderItem) => sum + orderItem.quantity - (order.returnedItems?.[item.id] || 0), 0);
      }
      if (order.status === 'returned_pending_payment' || order.status === 'settled') {
        return quantity + (order.missingItems || [])
          .filter(missingItem => missingItem.gearId === item.id)
          .reduce((sum, missingItem) => sum + missingItem.quantity, 0);
      }
      return quantity;
    }, 0);
    item.available = item.currentlyRented < item.totalStock;
  }

  const customers: CustomerProfile[] = [
    { id: 'demo-customer-1', name: 'Aarav Mehta', phone: '9000000101', email: 'aarav@example.com', lastUpdated: timestamp(-1) },
    { id: 'demo-customer-2', name: 'Mira Shah', phone: '9000000102', email: 'mira@example.com', lastUpdated: timestamp(-3) },
    { id: 'demo-customer-3', name: 'Rohan Kapoor', phone: '9000000103', email: 'rohan@example.com', lastUpdated: timestamp(-2) },
    { id: 'demo-customer-4', name: 'Isha Verma', phone: '9000000106', email: 'isha@example.com', lastUpdated: timestamp(-2) },
  ];

  const quotations: SavedQuotation[] = [{
    id: 'demo-saved-quotation-001',
    requestId: requests[0].id,
    customerName: requests[0].customerName,
    customerPhone: requests[0].customerPhone,
    customerEmail: requests[0].customerEmail,
    eventType: requests[0].eventType,
    requestedDate: requests[0].requestedDate,
    message: requests[0].message,
    lines: [
      { id: 'demo-line-1', description: 'Sony FX6 Cinema Camera', quantity: 2, unit: 'hire period', unitPrice: 8500 },
      { id: 'demo-line-2', description: 'Wireless Mic Kit', quantity: 1, unit: 'hire period', unitPrice: 900 },
      { id: 'demo-line-3', description: 'On-site camera operator', quantity: 1, unit: 'service', unitPrice: 6000 },
    ],
    discount: 1000,
    validUntil: localDate(14),
    terms: 'Includes equipment hire and on-site support. Booking is confirmed after written approval and advance payment.',
    createdAt: timestamp(-1),
    updatedAt: timestamp(0),
  }];

  const updates: UpdatePost[] = [
    { id: 'demo-update-1', type: 'new_gear', title: 'New Sony FX6 packages available', description: 'Our cinema camera kits now include a complete production-ready accessory package.', image: gear[0].image, createdAt: timestamp(-2), published: true },
    { id: 'demo-update-2', type: 'recent_shoot', title: 'Corporate launch film delivered', description: 'A multi-camera production for a Bengaluru technology brand.', image: gear[5].image, createdAt: timestamp(-5), published: true },
    { id: 'demo-update-3', type: 'announcement', title: 'Weekend rental slots open', description: 'Contact the team to reserve cameras and lighting for your next shoot.', createdAt: timestamp(-1), published: false },
  ];

  const partners: Partner[] = [
    { id: 'demo-partner-1', name: 'Northstar Films', logo: '', website: 'https://example.com/northstar', description: 'Production partner for commercial and documentary work.', displayOrder: 0, active: true },
    { id: 'demo-partner-2', name: 'FrameWorks Studio', logo: '', website: 'https://example.com/frameworks', description: 'Studio and post-production collaboration partner.', displayOrder: 1, active: true },
    { id: 'demo-partner-3', name: 'Demo Hidden Partner', logo: '', description: 'Inactive partner example for admin controls.', displayOrder: 2, active: false },
  ];

  return { gear, orders, customers, quoteRequests: requests, quotations, updates, partners };
}
