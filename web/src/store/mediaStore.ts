/**
 * Media/Content configuration store.
 * Admin can change hero video, portfolio images, about photo, etc.
 */

export interface MediaConfig {
  heroVideoUrl: string;
  heroFallbackImage: string;
  founderImage: string;
  portfolioItems: { id: string; title: string; category: string; type: 'image' | 'video'; thumbnail: string; fullUrl: string; description: string }[];
}

const KEY = 'sdm_media_config';

const DEFAULT_CONFIG: MediaConfig = {
  heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-setting-up-a-camera-on-a-tripod-34490-large.mp4',
  heroFallbackImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&q=90',
  founderImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  portfolioItems: [
    { id: 'p1', title: 'Royal Palace Wedding', category: 'wedding', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', fullUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=90', description: 'A grand wedding celebration captured in cinematic glory.' },
    { id: 'p2', title: 'Beach Sunset Ceremony', category: 'wedding', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80', fullUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1600&q=90', description: 'Intimate beachside vows captured during golden hour.' },
    { id: 'p3', title: 'Tech Summit 2024', category: 'corporate', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80', fullUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=90', description: 'Full-day coverage of a leading technology summit.' },
    { id: 'p4', title: 'Product Launch Event', category: 'corporate', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80', fullUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1600&q=90', description: 'High-energy product launch with stage lighting.' },
    { id: 'p5', title: 'Cinema Rig Setup', category: 'rental_gear', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=400&q=80', fullUrl: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=1600&q=90', description: 'Our premium Sony FX6 rigged for a documentary shoot.' },
    { id: 'p6', title: 'Drone Fleet', category: 'rental_gear', type: 'image', thumbnail: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80', fullUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1600&q=90', description: 'DJI Inspire 3 ready for aerial cinema operations.' },
    { id: 'p7', title: 'Wedding Highlight Film', category: 'videos', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80', fullUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', description: 'A cinematic wedding highlight film.' },
    { id: 'p8', title: 'Behind the Scenes', category: 'videos', type: 'video', thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80', fullUrl: 'https://www.w3schools.com/html/movie.mp4', description: 'A look behind the camera at our production workflow.' },
  ],
};

export function getMediaConfig(): MediaConfig {
  try {
    const data = localStorage.getItem(KEY);
    return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function updateMediaConfig(updates: Partial<MediaConfig>): MediaConfig {
  const current = getMediaConfig();
  const updated = { ...current, ...updates };
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function addPortfolioItem(item: Omit<MediaConfig['portfolioItems'][0], 'id'>): void {
  const config = getMediaConfig();
  config.portfolioItems.push({ ...item, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) });
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function deletePortfolioItem(id: string): void {
  const config = getMediaConfig();
  config.portfolioItems = config.portfolioItems.filter(p => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(config));
}
