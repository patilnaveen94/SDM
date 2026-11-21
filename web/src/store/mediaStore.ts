import { persistBusinessCollection } from './backend';
import { normalizeDriveImageUrl } from './mediaUpload';

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
  portfolioItems: [],
};

export function getMediaConfig(): MediaConfig {
  try {
    const data = localStorage.getItem(KEY);
    const config: MediaConfig = data
      ? { ...DEFAULT_CONFIG, ...JSON.parse(data) }
      : { ...DEFAULT_CONFIG, portfolioItems: DEFAULT_CONFIG.portfolioItems.map(item => ({ ...item })) };
    return {
      ...config,
      heroFallbackImage: normalizeDriveImageUrl(config.heroFallbackImage),
      founderImage: normalizeDriveImageUrl(config.founderImage),
      portfolioItems: config.portfolioItems.map(item => ({
        ...item,
        thumbnail: normalizeDriveImageUrl(item.thumbnail),
        fullUrl: normalizeDriveImageUrl(item.fullUrl),
      })),
    };
  } catch {
    return { ...DEFAULT_CONFIG, portfolioItems: DEFAULT_CONFIG.portfolioItems.map(item => ({ ...item })) };
  }
}

export function updateMediaConfig(updates: Partial<MediaConfig>): MediaConfig {
  const current = getMediaConfig();
  const updated = { ...current, ...updates };
  localStorage.setItem(KEY, JSON.stringify(updated));
  persistBusinessCollection(KEY, updated);
  return updated;
}

export function addPortfolioItem(item: Omit<MediaConfig['portfolioItems'][0], 'id'>): void {
  const config = getMediaConfig();
  config.portfolioItems.push({ ...item, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) });
  localStorage.setItem(KEY, JSON.stringify(config));
  persistBusinessCollection(KEY, config);
}

export function deletePortfolioItem(id: string): void {
  const config = getMediaConfig();
  config.portfolioItems = config.portfolioItems.filter(p => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(config));
  persistBusinessCollection(KEY, config);
}
