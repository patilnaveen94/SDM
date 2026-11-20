import { RentalGear } from './assetsConfig';

interface PublicGearRecord {
  id: string;
  name: string;
  category: RentalGear['category'];
  brand: string;
  dailyRate: number;
  description: string;
  specs: string[];
  image: string;
  available: boolean;
  totalStock: number;
  currentlyRented: number;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export async function fetchPublicRentalCatalog(): Promise<RentalGear[]> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase mobile environment settings are missing.');
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/sdm_get_public_state`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  if (!response.ok) {
    throw new Error(`Could not load live gear inventory (${response.status}).`);
  }

  const publicState = await response.json() as { sdm_gear_inventory?: PublicGearRecord[] };
  if (!Array.isArray(publicState.sdm_gear_inventory)) {
    throw new Error('The live gear catalog response was invalid.');
  }

  return publicState.sdm_gear_inventory.map(gear => ({
    id: gear.id,
    name: gear.name,
    category: gear.category,
    brand: gear.brand,
    dailyRate: gear.dailyRate,
    currency: 'INR',
    description: gear.description,
    specs: gear.specs,
    image: gear.image,
    available: gear.available && gear.totalStock - gear.currentlyRented > 0,
  }));
}
