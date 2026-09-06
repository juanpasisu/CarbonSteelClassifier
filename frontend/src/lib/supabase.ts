import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function buildSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch {
    return null
  }
}

export const supabase = buildSupabaseClient()
export const isSupabaseConfigured = supabase !== null
