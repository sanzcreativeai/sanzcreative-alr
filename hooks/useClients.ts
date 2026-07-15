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
    setError(null)

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setClients((data ?? []) as Client[])
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  async function createClient_(
    payload: Omit<Client, 'id' | 'created_at' | 'status'>
  ) {
    const insertData = {
      ...payload,
      status: 'active',
    }

    const { data, error } = await supabase
      .from('clients')
      .insert(insertData as never)
      .select()
      .single()

    const newClient = data as Client | null

    if (!error && newClient) {
      setClients((prev) => [newClient, ...prev])
    }

    return {
      data: newClient,
      error,
    }
  }

  async function updateClient(
    id: string,
    updates: Partial<Client>
  ) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single()

    const updatedClient = data as Client | null

    if (!error && updatedClient) {
      setClients((prev) =>
        prev.map((client) =>
          client.id === id ? updatedClient : client
        )
      )
    }

    return {
      data: updatedClient,
      error,
    }
  }

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient: createClient_,
    updateClient,
  }
}