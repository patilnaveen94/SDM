/**
 * LocalStorage-backed data store for SDM Camera & Solutions.
 * Manages: Gear inventory, Orders (rentals + event bookings), Updates/Feed, Customer profiles.
 */

import {
  isAdminSessionActive,
  persistBusinessCollection,
  persistBusinessCollectionsBatch,
  signInAdmin,
  signOutAdmin,
  submitQuoteRequest as submitQuoteRequestToBackend,
} from './backend';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GearItem {
  id: string;
  name: string;
  category: 'camera' | 'lens' | 'anamorphic' | 'drone' | 'lighting' | 'gimbal' | 'audio' | 'accessory';
  brand: string;
  dailyRate: number;
  description: string;
  specs: string[];
  image: string;
  available: boolean;
  totalStock: number;
  currentlyRented: number;
  /** 'professional' for pro rental, 'hobbyist' for casual/family shoot rental */
  rentalTier?: 'professional' | 'hobbyist';
}

export interface GearInventoryBreakdown {
  gear: GearItem;
  available: number;
  out: number;
  blocked: number;
  missing: number;
}

export interface OrderItem {
  gearId: string;
  gearName: string;
  quantity: number;
  dailyRate: number;
}

export interface PartialReturnEntry {
  returnedAt: string;
  items: OrderItem[];
  note: string;
}

export interface Order {
  id: string;
  type: 'rental' | 'event_booking';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAadhaar?: string;
  customerPan?: string;
  items: OrderItem[];
  eventType?: string;
  eventDetails?: string;
  discountAmount?: number;
  rentalHoursPerPeriod?: 12 | 24;
  totalAmount: number;
  status: 'active' | 'partially_returned' | 'returned_pending_payment' | 'overdue' | 'settled';
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  days: number;
  notes?: string;
  returnedAt?: string;
  returnedItems?: Record<string, number>;
  partialReturns?: PartialReturnEntry[];
  missingItems?: OrderItem[];
  missingNote?: string;
  settledAt?: string;
}

export interface UpdatePost {
  id: string;
  type: 'achievement' | 'new_gear' | 'recent_shoot' | 'announcement';
  title: string;
  description: string;
  image?: string;
  videoUrl?: string;
  createdAt: string;
  published: boolean;
}

/** Saved customer profile for future autocomplete */
export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  aadhaar?: string;
  pan?: string;
  lastUpdated: string;
}

export interface QuoteRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  requestedDate: string;
  requestedEndDate?: string;
  message: string;
  createdAt: string;
  requestType?: 'event_booking' | 'rental';
  rentalItems?: OrderItem[];
  estimatedTotal?: number;
  status?: 'pending' | 'approved';
  approvedAt?: string;
  convertedOrderId?: string;
}

export interface QuotationLine {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface QuotationDraft {
  requestId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string;
  requestedDate: string;
  message: string;
  lines: QuotationLine[];
  discount: number;
  validUntil: string;
  terms: string;
}

export interface SavedQuotation extends QuotationDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** Partner/Sponsor added by admin visible on public site */
export interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  GEAR: 'sdm_gear_inventory',
  ORDERS: 'sdm_orders',
  UPDATES: 'sdm_updates',
  CUSTOMERS: 'sdm_customer_profiles',
  QUOTE_REQUESTS: 'sdm_quote_requests',
  QUOTATIONS: 'sdm_quotations',
  PARTNERS: 'sdm_partners',
};
let businessStateBatchDepth = 0;
const pendingBusinessStateWrites = new Map<string, unknown>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getItem<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
  if (businessStateBatchDepth > 0 && key !== KEYS.QUOTE_REQUESTS) {
    pendingBusinessStateWrites.set(key, data);
  } else {
    persistBusinessCollection(key, data);
  }
}

function withBusinessStateBatch<T>(operation: () => T): T {
  businessStateBatchDepth += 1;
  try {
    return operation();
  } finally {
    businessStateBatchDepth -= 1;
    if (businessStateBatchDepth === 0 && pendingBusinessStateWrites.size > 0) {
      const entries = Array.from(pendingBusinessStateWrites, ([key, data]) => ({ key, data }));
      pendingBusinessStateWrites.clear();
      persistBusinessCollectionsBatch(entries);
    }
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}

export function calculateEndDateTime(startDate: string, startTime: string, durationHours: number): { endDate: string; endTime: string } {
  const [year, month, day] = startDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  const end = new Date(year, month - 1, day, hours, minutes + durationHours * 60);
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    endDate: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
    endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
  };
}

export function calculateOrderTotal(items: OrderItem[], days: number): number {
  return items.reduce((sum, item) => sum + item.dailyRate * item.quantity * days, 0);
}

export function isFutureOrderStart(order: Pick<Order, 'startDate' | 'startTime'>, now = new Date()): boolean {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (order.startDate !== today) return order.startDate > today;
  if (!order.startTime) return false;
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return order.startTime > currentTime;
}

// ─── Gear CRUD ───────────────────────────────────────────────────────────────

export function getGearInventory(): GearItem[] {
  return getItem<GearItem>(KEYS.GEAR, []);
}

export function getAvailableGear(): GearItem[] {
  return getGearInventory().filter(g => g.available && (g.totalStock - g.currentlyRented) > 0);
}

export function getGearInventoryBreakdown(): GearInventoryBreakdown[] {
  const rentals = getOrders().filter(order => order.type === 'rental');

  return getGearInventory().map(gear => {
    let out = 0;
    let blocked = 0;
    let missing = 0;
    let closedMissing = 0;

    rentals.forEach(order => {
      if (order.status === 'returned_pending_payment' || order.status === 'settled') {
        const closedOrderMissing = order.missingItems
          ?.filter(item => item.gearId === gear.id)
          .reduce((sum, item) => sum + item.quantity, 0) || 0;
        missing += closedOrderMissing;
        closedMissing += closedOrderMissing;
        return;
      }
      if (order.status !== 'active' && order.status !== 'partially_returned') return;
      const quantity = order.items
        .filter(item => item.gearId === gear.id)
        .reduce((sum, item) => sum + item.quantity - (order.returnedItems?.[item.gearId] || 0), 0);
      missing += order.missingItems
        ?.filter(item => item.gearId === gear.id)
        .reduce((sum, item) => sum + item.quantity, 0) || 0;
      if (isFutureOrderStart(order)) {
        blocked += quantity;
      } else {
        out += quantity;
      }
    });

    return {
      gear,
      available: Math.max(0, gear.totalStock - out - blocked - closedMissing),
      out,
      blocked,
      missing,
    };
  });
}

export function addGearItem(item: Omit<GearItem, 'id'>): GearItem {
  const gear = { ...item, id: generateId() };
  const all = getGearInventory();
  all.push(gear);
  setItem(KEYS.GEAR, all);
  return gear;
}

export function updateGearItem(id: string, updates: Partial<GearItem>): GearItem | null {
  const all = getGearInventory();
  const idx = all.findIndex(g => g.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  setItem(KEYS.GEAR, all);
  return all[idx];
}

export function deleteGearItem(id: string): boolean {
  const all = getGearInventory();
  const filtered = all.filter(g => g.id !== id);
  if (filtered.length === all.length) return false;
  setItem(KEYS.GEAR, filtered);
  return true;
}

/** Increase currentlyRented count for items when order is created */
function rentOutItems(items: OrderItem[]): void {
  const all = getGearInventory();
  items.forEach(orderItem => {
    const idx = all.findIndex(g => g.id === orderItem.gearId);
    if (idx !== -1) {
      all[idx].currentlyRented += orderItem.quantity;
      if (all[idx].currentlyRented >= all[idx].totalStock) {
        all[idx].available = false;
      }
    }
  });
  setItem(KEYS.GEAR, all);
}

/** Decrease currentlyRented count when items are returned */
function returnItems(items: OrderItem[]): void {
  const all = getGearInventory();
  items.forEach(orderItem => {
    const idx = all.findIndex(g => g.id === orderItem.gearId);
    if (idx !== -1) {
      all[idx].currentlyRented = Math.max(0, all[idx].currentlyRented - orderItem.quantity);
      if (all[idx].currentlyRented < all[idx].totalStock) {
        all[idx].available = true;
      }
    }
  });
  setItem(KEYS.GEAR, all);
}

// ─── Orders CRUD ─────────────────────────────────────────────────────────────

export function getOrders(): Order[] {
  return getItem<Order>(KEYS.ORDERS, []);
}

export function getQuoteRequests(): QuoteRequest[] {
  return getItem<QuoteRequest>(KEYS.QUOTE_REQUESTS, []);
}

function saveQuoteRequest(request: Omit<QuoteRequest, 'id' | 'createdAt' | 'convertedOrderId' | 'status' | 'approvedAt'>): QuoteRequest {
  const newRequest: QuoteRequest = { ...request, status: 'pending', id: generateId(), createdAt: new Date().toISOString() };
  const all = getQuoteRequests();
  all.push(newRequest);
  setItem(KEYS.QUOTE_REQUESTS, all);
  return newRequest;
}

export function addQuoteRequest(request: Omit<QuoteRequest, 'id' | 'createdAt' | 'convertedOrderId' | 'status' | 'approvedAt'>): QuoteRequest {
  return saveQuoteRequest(request);
}

export async function submitPublicQuoteRequest(request: Omit<QuoteRequest, 'id' | 'createdAt' | 'convertedOrderId' | 'status' | 'approvedAt'>): Promise<QuoteRequest> {
  const pendingRequest: QuoteRequest = {
    ...request,
    status: 'pending',
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const savedRequest = await submitQuoteRequestToBackend(pendingRequest);
  const all = getQuoteRequests();
  all.push(savedRequest);
  setItem(KEYS.QUOTE_REQUESTS, all);
  return savedRequest;
}

export function markQuoteRequestApproved(id: string): QuoteRequest | null {
  const all = getQuoteRequests();
  const index = all.findIndex(request => request.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], status: 'approved', approvedAt: new Date().toISOString() };
  setItem(KEYS.QUOTE_REQUESTS, all);
  return all[index];
}

export function getQuotations(): SavedQuotation[] {
  return getItem<SavedQuotation>(KEYS.QUOTATIONS, []);
}

export function saveQuotation(draft: QuotationDraft, id?: string): SavedQuotation {
  const all = getQuotations();
  const now = new Date().toISOString();
  const index = id ? all.findIndex(quotation => quotation.id === id) : -1;
  const quotation: SavedQuotation = index >= 0
    ? { ...all[index], ...draft, updatedAt: now }
    : { ...draft, id: generateId(), createdAt: now, updatedAt: now };
  if (index >= 0) all[index] = quotation;
  else all.push(quotation);
  setItem(KEYS.QUOTATIONS, all);
  return quotation;
}

export function markQuoteRequestConverted(id: string, orderId: string): QuoteRequest | null {
  const all = getQuoteRequests();
  const index = all.findIndex(request => request.id === id);
  if (index === -1) return null;
  all[index].convertedOrderId = orderId;
  setItem(KEYS.QUOTE_REQUESTS, all);
  return all[index];
}

export function getActiveOrders(): Order[] {
  return getOrders().filter(o => o.status === 'active' || o.status === 'partially_returned');
}

export function getOverdueOrders(): Order[] {
  const today = new Date().toISOString().split('T')[0];
  return getOrders().filter(o => (o.status === 'active' || o.status === 'partially_returned') && o.endDate < today);
}

export function getPendingPaymentOrders(): Order[] {
  return getOrders().filter(o => o.status === 'returned_pending_payment');
}

export function getPartiallyReturnedOrders(): Order[] {
  return getOrders().filter(order => order.status === 'partially_returned');
}

export function getSettledOrders(): Order[] {
  return getOrders().filter(o => o.status === 'settled');
}

export function getOutstandingOrderItems(order: Order): OrderItem[] {
  return order.items.flatMap(item => {
    const quantity = item.quantity - (order.returnedItems?.[item.gearId] || 0);
    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
}

/** Create order — status starts as 'active', gear counts auto-update */
export function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus' | 'totalAmount' | 'days'>): Order {
  return withBusinessStateBatch(() => {
    const days = order.rentalHoursPerPeriod && order.startTime && order.endTime
      ? Math.max(1, Math.ceil(((new Date(`${order.endDate}T${order.endTime}`).getTime() - new Date(`${order.startDate}T${order.startTime}`).getTime()) / 3600000) / order.rentalHoursPerPeriod))
      : calculateDays(order.startDate, order.endDate);
    const subtotal = calculateOrderTotal(order.items, days);
    const discountAmount = Math.min(Math.max(0, order.discountAmount || 0), subtotal);
    const totalAmount = subtotal - discountAmount;
    const newOrder: Order = {
      ...order,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'active',
      paymentStatus: 'pending',
      discountAmount,
      totalAmount,
      days,
    };
    const all = getOrders();
    all.push(newOrder);
    setItem(KEYS.ORDERS, all);
    if (order.type === 'rental') {
      rentOutItems(order.items);
    }
    return newOrder;
  });
}

/** Mark items as received back — moves to returned_pending_payment */
export function markItemsReturned(orderId: string): Order | null {
  return withBusinessStateBatch(() => {
    const all = getOrders();
    const idx = all.findIndex(o => o.id === orderId);
    if (idx === -1 || (all[idx].status !== 'active' && all[idx].status !== 'partially_returned')) return null;
    const outstandingItems = getOutstandingOrderItems(all[idx]);
    if (outstandingItems.length === 0) return null;
    all[idx].status = 'returned_pending_payment';
    all[idx].returnedAt = new Date().toISOString();
    setItem(KEYS.ORDERS, all);
    if (all[idx].type === 'rental') {
      returnItems(outstandingItems);
    }
    return all[idx];
  });
}

export function markItemsPartiallyReturned(
  orderId: string,
  returnedItems: Array<{ gearId: string; quantity: number }>,
  note: string,
  recordMissingItems = false,
): Order | null {
  return withBusinessStateBatch(() => {
    const all = getOrders();
    const index = all.findIndex(order => order.id === orderId);
    if (index === -1) return null;
    const order = all[index];
    if (order.status !== 'active' && order.status !== 'partially_returned') return null;

    const existingReturned = order.returnedItems || {};
    const validItems = returnedItems.filter(item => {
      const orderedQuantity = order.items.find(orderItem => orderItem.gearId === item.gearId)?.quantity || 0;
      const remaining = orderedQuantity - (existingReturned[item.gearId] || 0);
      return Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= remaining;
    });
    if (
      validItems.length !== returnedItems.length
      || (!validItems.length && !recordMissingItems)
      || !note.trim()
    ) return null;

    const updatedReturned = { ...existingReturned };
    const gearItems: OrderItem[] = validItems.map(item => {
      updatedReturned[item.gearId] = (updatedReturned[item.gearId] || 0) + item.quantity;
      const orderItem = order.items.find(candidate => candidate.gearId === item.gearId)!;
      return { ...orderItem, quantity: item.quantity };
    });
    const outstanding = order.items.some(item => (updatedReturned[item.gearId] || 0) < item.quantity);
    const outstandingItems = order.items.flatMap(item => {
      const quantity = item.quantity - (updatedReturned[item.gearId] || 0);
      return quantity > 0 ? [{ ...item, quantity }] : [];
    });

    order.returnedItems = updatedReturned;
    if (gearItems.length > 0) {
      order.partialReturns = [...(order.partialReturns || []), {
        returnedAt: new Date().toISOString(),
        items: gearItems,
        note: note.trim(),
      }];
    }
    order.notes = [order.notes, `Return update: ${note.trim()}`].filter(Boolean).join('\n');
    order.status = outstanding ? 'partially_returned' : 'returned_pending_payment';
    if (recordMissingItems && outstanding) {
      order.missingItems = outstandingItems;
      order.missingNote = note.trim();
    } else if (outstanding && order.missingItems?.length) {
      const newlyReturned = new Map(gearItems.map(item => [item.gearId, item.quantity]));
      order.missingItems = order.missingItems.flatMap(item => {
        const quantity = Math.min(
          outstandingItems.find(outstandingItem => outstandingItem.gearId === item.gearId)?.quantity || 0,
          Math.max(0, item.quantity - (newlyReturned.get(item.gearId) || 0)),
        );
        return quantity > 0 ? [{ ...item, quantity }] : [];
      });
      if (order.missingItems.length === 0) order.missingNote = undefined;
    } else if (!outstanding) {
      order.missingItems = [];
      order.missingNote = undefined;
    }
    order.returnedAt = outstanding ? undefined : new Date().toISOString();
    setItem(KEYS.ORDERS, all);
    if (order.type === 'rental') returnItems(gearItems);
    return order;
  });
}

/** Mark order as fully settled (payment received) */
export function settleOrder(orderId: string): Order | null {
  const all = getOrders();
  const idx = all.findIndex(o => o.id === orderId);
  if (idx === -1) return null;
  all[idx].status = 'settled';
  all[idx].paymentStatus = 'paid';
  all[idx].settledAt = new Date().toISOString();
  setItem(KEYS.ORDERS, all);
  return all[idx];
}

// ─── Updates/Feed CRUD ───────────────────────────────────────────────────────

export function getUpdates(): UpdatePost[] {
  return getItem<UpdatePost>(KEYS.UPDATES, []);
}

export function getPublishedUpdates(): UpdatePost[] {
  return getUpdates().filter(u => u.published).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addUpdate(post: Omit<UpdatePost, 'id' | 'createdAt'>): UpdatePost {
  const newPost = { ...post, id: generateId(), createdAt: new Date().toISOString() };
  const all = getUpdates();
  all.push(newPost);
  setItem(KEYS.UPDATES, all);
  return newPost;
}

export function updatePost(id: string, updates: Partial<UpdatePost>): UpdatePost | null {
  const all = getUpdates();
  const idx = all.findIndex(u => u.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  setItem(KEYS.UPDATES, all);
  return all[idx];
}

export function deleteUpdate(id: string): boolean {
  const all = getUpdates();
  const filtered = all.filter(u => u.id !== id);
  if (filtered.length === all.length) return false;
  setItem(KEYS.UPDATES, filtered);
  return true;
}

// ─── Customer Profiles CRUD ──────────────────────────────────────────────────

export function getCustomerProfiles(): CustomerProfile[] {
  return getItem<CustomerProfile>(KEYS.CUSTOMERS, []);
}

/** Search customers by name prefix (case-insensitive) */
export function searchCustomersByName(query: string): CustomerProfile[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return getCustomerProfiles().filter(c => c.name.toLowerCase().includes(q)).slice(0, 5);
}

/** Save or update a customer profile. Matches by phone number. */
export function saveCustomerProfile(profile: Omit<CustomerProfile, 'id' | 'lastUpdated'>): CustomerProfile {
  const all = getCustomerProfiles();
  const existingIdx = all.findIndex(c => c.phone === profile.phone);
  const now = new Date().toISOString();
  if (existingIdx !== -1) {
    all[existingIdx] = { ...all[existingIdx], ...profile, lastUpdated: now };
    setItem(KEYS.CUSTOMERS, all);
    return all[existingIdx];
  } else {
    const newProfile: CustomerProfile = { ...profile, id: generateId(), lastUpdated: now };
    all.push(newProfile);
    setItem(KEYS.CUSTOMERS, all);
    return newProfile;
  }
}

export function deleteCustomerProfile(id: string): boolean {
  const all = getCustomerProfiles();
  const filtered = all.filter(c => c.id !== id);
  if (filtered.length === all.length) return false;
  setItem(KEYS.CUSTOMERS, filtered);
  return true;
}

// ─── Partners CRUD ───────────────────────────────────────────────────────────

export function getPartners(): Partner[] {
  return getItem<Partner>(KEYS.PARTNERS, []).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getActivePartners(): Partner[] {
  return getPartners().filter(p => p.active);
}

export function addPartner(partner: Omit<Partner, 'id'>): Partner {
  const all = getPartners();
  const newPartner: Partner = { ...partner, id: generateId() };
  all.push(newPartner);
  setItem(KEYS.PARTNERS, all);
  return newPartner;
}

export function updatePartner(id: string, updates: Partial<Partner>): Partner | null {
  const all = getPartners();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  setItem(KEYS.PARTNERS, all);
  return all[idx];
}

export function deletePartner(id: string): boolean {
  const all = getPartners();
  const filtered = all.filter(p => p.id !== id);
  if (filtered.length === all.length) return false;
  setItem(KEYS.PARTNERS, filtered);
  return true;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  return signInAdmin(email, password);
}

export function isAdminLoggedIn(): boolean {
  return isAdminSessionActive();
}

export async function adminLogout(): Promise<void> {
  await signOutAdmin();
}
