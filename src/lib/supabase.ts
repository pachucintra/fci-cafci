import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Anon key es público por diseño — seguro hardcodear en cliente
const SUPABASE_URL = 'https://gttkoesrbknyfyvheozq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dGtvZXNyYmtueWZ5dmhlb3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NzIzNDgsImV4cCI6MjA5NDQ0ODM0OH0.1ETBtmEkAPqQu11b2Ll4_aRYzvVVSg2LZToFxcCB9mI'

const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('sb-url') || SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('sb-key') || SUPABASE_ANON_KEY
  return { url, key }
}

export const isConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig()
  return !!url && !!key
}

let _client: SupabaseClient | null = null

export const getClient = (): SupabaseClient => {
  const { url, key } = getSupabaseConfig()
  if (!_client) {
    _client = createClient(url, key)
  }
  return _client
}

export const saveConfig = (url: string, key: string): void => {
  localStorage.setItem('sb-url', url)
  localStorage.setItem('sb-key', key)
  _client = null
}

export const clearConfig = (): void => {
  localStorage.removeItem('sb-url')
  localStorage.removeItem('sb-key')
  _client = null
}
