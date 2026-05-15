import { useState, useEffect, useCallback } from 'react'
import { getClient } from '../lib/supabase'
import { Patient, PatientFormData } from '../types'

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const client = getClient()
      const { data, error: err } = await client
        .from('patients')
        .select('*, sessions(id, fecha, dolor)')
        .order('apellido', { ascending: true })
      if (err) throw err
      setPatients(data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const createPatient = async (data: PatientFormData): Promise<Patient | null> => {
    try {
      const client = getClient()
      const { data: { user } } = await client.auth.getUser()
      if (!user) throw new Error('No autenticado')
      const { data: created, error: err } = await client
        .from('patients')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single()
      if (err) throw err
      await fetchPatients()
      return created
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : 'Error al crear paciente')
    }
  }

  const updatePatient = async (id: string, data: Partial<PatientFormData>): Promise<void> => {
    try {
      const client = getClient()
      const { error: err } = await client
        .from('patients')
        .update(data)
        .eq('id', id)
      if (err) throw err
      await fetchPatients()
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : 'Error al actualizar paciente')
    }
  }

  const deletePatient = async (id: string): Promise<void> => {
    try {
      const client = getClient()
      const { error: err } = await client
        .from('patients')
        .delete()
        .eq('id', id)
      if (err) throw err
      await fetchPatients()
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : 'Error al eliminar paciente')
    }
  }

  return { patients, loading, error, fetchPatients, createPatient, updatePatient, deletePatient }
}
