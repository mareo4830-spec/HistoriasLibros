import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MemoryBookOrder = {
  id: string;
  email: string;
  motive: string;
  dedication: string;
  photo_count: number;
  status: 'received' | 'processing' | 'ready';
  created_at: string;
};
