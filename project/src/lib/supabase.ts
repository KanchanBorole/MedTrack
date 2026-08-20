import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Role = 'user' | 'ngo' | 'hospital';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  phone: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  created_at: string;
}

export interface Medicine {
  id: string;
  owner_id: string;
  name: string;
  generic_name: string | null;
  category: string | null;
  quantity: number;
  expiry_date: string | null;
  listing_type: 'donate' | 'request';
  status: 'available' | 'reserved' | 'fulfilled';
  notes: string | null;
  created_at: string;
}

export interface MedicineWithOwner extends Medicine {
  owner: Pick<Profile, 'id' | 'full_name' | 'role' | 'phone' | 'city' | 'address' | 'latitude' | 'longitude'> | null;
}

export const MEDICINE_CATEGORIES = [
  'Pain Relief',
  'Antibiotics',
  'Vitamins & Supplements',
  'Diabetes',
  'Cardiac',
  'Respiratory',
  'Gastrointestinal',
  'Dermatology',
  'Mental Health',
  'Women & Child Health',
  'First Aid',
  'Other',
] as const;
