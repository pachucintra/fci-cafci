import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { getClient, isConfigured } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isConfigured())

  useEffect(() => {
    if (!isConfigured()) {
      setLoading(false)
      return
    }

    const client = getClient()

    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    const { error } = await getClient().auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string): Promise<void> => {
    const { error } = await getClient().auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async (): Promise<void> => {
    await getClient().auth.signOut()
  }

  return { user, loading, signIn, signUp, signOut }
}
