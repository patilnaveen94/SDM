/**
 * LocalStorage-backed data store for SDM Camera & Solutions.
 * Manages: Gear inventory, Orders (rentals + event bookings), Updates/Feed.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GearItem {
  id: string;
  name: string;
  category: 'camera' | 'lens' | 'anamorphic' | 'drone' | 'lighting' | 'accessory';
  brand: string;
  dailyRate: number;
  description: string;
  specs: string[];
  image: string;
  available: boolean;
  totalStock: number;
  currentlyRented: number;
}

export interface OrderItem {
  gearId: string;
  gearName: string;
  quantity: number;
  dailyRate: number;
}

export interface Order {
  id: string;
  type: 'rental' | 'event_booking';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  eventType?: string;
  eventDetails?: string;
  totalAmount: number;
  status: 'active' | 'returned_pending_payment' | 'overdue' | 'settled';
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
  startDate: string;
  endDate: string;
  days: number;
  notes?: string;
  returnedAt?: string;
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

// ─── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  GEAR: 'sdm_gear_inventory',
  ORDERS: 'sdm_orders',
  UPDATES: 'sdm_updates',
};

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

export function calculateOrderTotal(items: OrderItem[], days: number): number {
  return items.reduce((sum, item) => sum + item.dailyRate * item.quantity * days, 0);
}

// ─── Gear CRUD ───────────────────────────────────────────────────────────────

export function getGearInventory(): GearItem[] {
  return getItem<GearItem>(KEYS.GEAR, []);
}

export function getAvailableGear(): GearItem[] {
  return getGearInventory().filter(g => g.available && (g.totalStock - g.currentlyRented) > 0);
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

export function getActiveOrders(): Order[] {
  return getOrders().filter(o => o.status === 'active');
}

export function getOverdueOrders(): Order[] {
  const today = new Date().toISOString().split('T')[0];
  return getOrders().filter(o => o.status === 'active' && o.endDate < today);
}

export function getPendingPaymentOrders(): Order[] {
  return getOrders().filter(o => o.status === 'returned_pending_payment');
}

export function getSettledOrders(): Order[] {
  return getOrders().filter(o => o.status === 'settled');
}

/** Create order — status starts as 'active', gear counts auto-update */
export function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status' | 'paymentStatus' | 'totalAmount' | 'days'>): Order {
  const days = calculateDays(order.startDate, order.endDate);
  const totalAmount = calculateOrderTotal(order.items, days);
  const newOrder: Order = {
    ...order,
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: 'active',
    paymentStatus: 'pending',
    totalAmount,
    days,
  };
  const all = getOrders();
  all.push(newOrder);
  setItem(KEYS.ORDERS, all);
  // Auto-update gear stock
  if (order.type === 'rental') {
    rentOutItems(order.items);
  }
  return newOrder;
}

/** Mark items as received back — moves to returned_pending_payment */
export function markItemsReturned(orderId: string): Order | null {
  const all = getOrders();
  const idx = all.findIndex(o => o.id === orderId);
  if (idx === -1) return null;
  all[idx].status = 'returned_pending_payment';
  all[idx].returnedAt = new Date().toISOString();
  setItem(KEYS.ORDERS, all);
  // Return items to inventory
  if (all[idx].type === 'rental') {
    returnItems(all[idx].items);
  }
  return all[idx];
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

// ─── Auth ────────────────────────────────────────────────────────────────────

const ADMIN_USER = 'SDMTest';
const ADMIN_PASS = 'SDM@1234';

export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    sessionStorage.setItem('sdm_admin_auth', 'true');
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem('sdm_admin_auth') === 'true';
}

export function adminLogout(): void {
  sessionStorage.removeItem('sdm_admin_auth');
}
