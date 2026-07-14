'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchClients = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setClients(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  async function createClient_(payload: Omit<Client, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...payload, status: 'active' })
      .select()
      .single()
    if (!error && data) setClients((prev) => [data, ...prev])
    return { data, error }
  }

  async function updateClient(id: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      setClients((prev) => prev.map((c) => (c.id === id ? data : c)))
    }
    return { data, error }
  }

  return { clients, loading, error, refetch: fetchClients, createClient: createClient_, updateClient }
}
