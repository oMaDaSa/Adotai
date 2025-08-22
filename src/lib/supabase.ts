import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey, serviceRoleKey } from './config';

// Client para operações normais dos usuários
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Client administrativo para operações que precisam bypass do RLS
export const supabaseAdmin = createClient(
  `https://${projectId}.supabase.co`,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export type { User } from '@supabase/supabase-js';
