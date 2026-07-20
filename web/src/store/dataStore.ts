/**
 * LocalStorage-backed data store for SDM Camera & Solutions.
 * Manages: Gear inventory, Orders (rentals + event bookings), Updates/Feed.
 * Easily replaceable with Firebase/Supabase by swapping these functions.
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

export interface Order {
  id: string;
  type: 'rental' | 'event_booking';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  // Rental specific
  items?: { gearId: string; gearName: string; days: number; dailyRate: number }[];
  // Event specific
  eventType?: string;
  eventDate?: string;
  eventDetails?: string;
  // Common
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'returned' | 'completed' | 'cancelled';
  createdAt: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
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

// ─── Gear CRUD ───────────────────────────────────────────────────────────────

export function getGearInventory(): GearItem[] {
  return getItem<GearItem>(KEYS.GEAR, []);
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

// ─── Orders CRUD ─────────────────────────────────────────────────────────────

export function getOrders(): Order[] {
  return getItem<Order>(KEYS.ORDERS, []);
}

export function getUpcomingOrders(): Order[] {
  const now = new Date().toISOString();
  return getOrders().filter(o => 
    (o.status === 'pending' || o.status === 'confirmed') && 
    (o.startDate ? o.startDate >= now.split('T')[0] : true)
  ).sort((a, b) => (a.startDate || a.createdAt).localeCompare(b.startDate || b.createdAt));
}

export function getActiveOrders(): Order[] {
  return getOrders().filter(o => o.status === 'active');
}

export function addOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
  const newOrder = { ...order, id: generateId(), createdAt: new Date().toISOString() };
  const all = getOrders();
  all.push(newOrder);
  setItem(KEYS.ORDERS, all);
  return newOrder;
}

export function updateOrderStatus(id: string, status: Order['status'], notes?: string): Order | null {
  const all = getOrders();
  const idx = all.findIndex(o => o.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status, ...(notes ? { notes } : {}) };
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
