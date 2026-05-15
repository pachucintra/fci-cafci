import { createClient, SupabaseClient } from '@supabase/supabase-js'

const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('sb-url') || ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('sb-key') || ''
  return { url, key }
}

export const isConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig()
  return !!url && !!key
}

let _client: SupabaseClient | null = null

export const getClient = (): SupabaseClient => {
  const { url, key } = getSupabaseConfig()
  if (!url || !key) throw new Error('Supabase no configurado')
  if (!_client || _client.supabaseUrl !== url) {
    _client = createClient(url, key)
  }
  return _client
}

export const saveConfig = (url: string, key: string): void => {
  localStorage.setItem('sb-url', url)
  localStorage.setItem('sb-key', key)
  _client = null // reset client so it gets recreated
}

export const clearConfig = (): void => {
  localStorage.removeItem('sb-url')
  localStorage.removeItem('sb-key')
  _client = null
}
