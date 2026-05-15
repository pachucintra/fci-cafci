import { useState, useEffect, useCallback } from 'react'
import { getClient } from '../lib/supabase'
import { Session, SessionFormData } from '../types'

export const useSessions = (patientId?: string) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const client = getClient()
      const { data, error: err } = await client
        .from('sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('fecha', { ascending: true })
      if (err) throw err
      setSessions(data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const createSession = async (data: SessionFormData): Promise<Session | null> => {
    try {
      const client = getClient()
      const { data: created, error: err } = await client
        .from('sessions')
        .insert([data])
        .select()
        .single()
      if (err) throw err
      await fetchSessions()
      return created
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : 'Error al crear sesión')
    }
  }

  const updateSession = async (id: string, data: Partial<SessionFormData>): Promise<void> => {
    try {
      const client = getClient()
      const { error: err } = await client
        .from('sessions')
        .update(data)
        .eq('id', id)
      if (err) throw err
      await fetchSessions()
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : 'Error al actualizar sesión')
    }
  }

  const deleteSession = async (id: string): Promise<void> => {
    try {
      const client = getClient()
      const { error: err } = await client
        .from('sessions')
        .delete()
        .eq('id', id)
      if (err) throw err
      await fetchSessions()
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : 'Error al eliminar sesión')
    }
  }

  return { sessions, loading, error, fetchSessions, createSession, updateSession, deleteSession }
}

export const useAllSessionStats = () => {
  const [stats, setStats] = useState({ total: 0, activeLast30: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const client = getClient()
        const { count: total } = await client
          .from('sessions')
          .select('*', { count: 'exact', head: true })

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const dateStr = thirtyDaysAgo.toISOString().split('T')[0]

        const { data: activePatients } = await client
          .from('sessions')
          .select('patient_id')
          .gte('fecha', dateStr)

        const uniqueActive = new Set(activePatients?.map(s => s.patient_id) || []).size

        setStats({ total: total || 0, activeLast30: uniqueActive })
      } catch {
        setStats({ total: 0, activeLast30: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return { stats, loading }
}
