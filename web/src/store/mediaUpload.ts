import { getSupabaseClient } from '../lib/supabase';

const PUBLIC_MEDIA_BUCKET = 'sdm-public-media';
const TESTIMONIAL_BUCKET = 'sdm-testimonial-photos';
const MEDIA_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const TESTIMONIAL_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getExtension(file: File): string {
  const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg');
  if (!extension) throw new Error('Choose a supported image file.');
  return extension;
}

async function uploadImage(file: File, bucket: string, folder: string, maxBytes: number, allowedTypes: Set<string>): Promise<{ path: string; url: string }> {
  if (!allowedTypes.has(file.type)) {
    throw new Error('Choose a JPG, PNG, WebP image' + (bucket === PUBLIC_MEDIA_BUCKET ? ', or GIF.' : '.'));
  }
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error(`Image must be smaller than ${Math.floor(maxBytes / (1024 * 1024))} MB.`);
  }

  const path = `${folder}/${crypto.randomUUID()}.${getExtension(file)}`;
  const client = getSupabaseClient();
  const { error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const url = bucket === PUBLIC_MEDIA_BUCKET
    ? client.storage.from(bucket).getPublicUrl(path).data.publicUrl
    : '';
  return { path, url };
}

export function uploadPublicMediaImage(file: File): Promise<{ path: string; url: string }> {
  return uploadImage(file, PUBLIC_MEDIA_BUCKET, 'media', 10 * 1024 * 1024, MEDIA_IMAGE_TYPES);
}

export function uploadTestimonialPhoto(file: File): Promise<{ path: string; url: string }> {
  return uploadImage(file, TESTIMONIAL_BUCKET, 'submissions', 5 * 1024 * 1024, TESTIMONIAL_IMAGE_TYPES);
}

export async function getTestimonialPhotoUrl(path: string): Promise<string> {
  const { data, error } = await getSupabaseClient().storage.from(TESTIMONIAL_BUCKET).createSignedUrl(path, 60 * 60);
  if (error) throw new Error(`Could not load testimony photo: ${error.message}`);
  return data.signedUrl;
}

export function normalizeDriveImageUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    if (url.hostname !== 'drive.google.com' && url.hostname !== 'www.drive.google.com') return trimmed;

    const pathMatch = url.pathname.match(/\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
    const fileId = pathMatch?.[1] || url.searchParams.get('id');
    return fileId && /^[a-zA-Z0-9_-]{10,}$/.test(fileId)
      ? `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`
      : trimmed;
  } catch {
    return trimmed;
  }
}
