import { getSupabaseClient } from '../lib/supabase';
import { getTestimonialPhotoUrl, uploadTestimonialPhoto } from './mediaUpload';

export interface Testimonial {
  id: string;
  customerName: string;
  customerPhone?: string;
  testimony: string;
  photoPath: string;
  photoUrl: string;
  createdAt: string;
  approved: boolean;
}

interface PublicTestimonialRow {
  id: string;
  customer_name: string;
  testimony: string;
  photo_path: string;
  created_at: string;
}

interface AdminTestimonialRow extends PublicTestimonialRow {
  customer_phone: string;
  approved: boolean;
}

async function toPublicTestimonial(row: PublicTestimonialRow): Promise<Testimonial> {
  const photoUrl = await getTestimonialPhotoUrl(row.photo_path);
  return {
    id: row.id,
    customerName: row.customer_name,
    testimony: row.testimony,
    photoPath: row.photo_path,
    photoUrl,
    createdAt: row.created_at,
    approved: true,
  };
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await getSupabaseClient()
    .from('sdm_public_testimonials')
    .select('id,customer_name,testimony,photo_path,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Promise.all(((data || []) as PublicTestimonialRow[]).map(toPublicTestimonial));
}

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await getSupabaseClient()
    .from('sdm_testimonials')
    .select('id,customer_name,customer_phone,testimony,photo_path,created_at,approved')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Promise.all(((data || []) as AdminTestimonialRow[]).map(async row => ({
    ...await toPublicTestimonial(row),
    customerPhone: row.customer_phone,
    approved: row.approved,
  })));
}

export async function submitTestimonial(input: {
  customerName: string;
  customerPhone: string;
  testimony: string;
  photo: File;
}): Promise<void> {
  const uploadedPhoto = await uploadTestimonialPhoto(input.photo);
  const client = getSupabaseClient();
  const { error } = await client.rpc('sdm_submit_testimonial', {
    p_customer_name: input.customerName.trim(),
    p_customer_phone: input.customerPhone.replace(/\D/g, ''),
    p_testimony: input.testimony.trim(),
    p_photo_path: uploadedPhoto.path,
  });
  if (error) {
    const { error: cleanupError } = await client.storage.from('sdm-testimonial-photos').remove([uploadedPhoto.path]);
    if (cleanupError) console.error('Unable to remove the unsubmitted testimonial photo:', cleanupError);
    throw error;
  }
}

export async function setTestimonialApproval(id: string, approved: boolean): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('sdm_testimonials')
    .update({ approved })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const client = getSupabaseClient();
  const { error: readError, data } = await client
    .from('sdm_testimonials')
    .select('photo_path')
    .eq('id', id)
    .single();
  if (readError) throw readError;

  const { error: deleteError } = await client.from('sdm_testimonials').delete().eq('id', id);
  if (deleteError) throw deleteError;

  const { error: photoError } = await client.storage.from('sdm-testimonial-photos').remove([data.photo_path]);
  if (photoError) throw photoError;
}
