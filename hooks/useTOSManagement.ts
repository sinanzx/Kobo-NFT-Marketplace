import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface TOSItem {
  type: string
  version: string
  url: string
  description: string
}

interface TOSStatus {
  platform: {
    accepted: boolean
    acceptedAt: string | null
    version: string | null
  }
  engines: Record<string, {
    accepted: boolean
    acceptedAt: string | null
    currentVersion: string
    acceptedVersion: string | null
    needsUpdate: boolean
    tosUrl: string
    requiresAcceptance: boolean
  }>
}

export function useTOSManagement() {
  const [requiredTOS, setRequiredTOS] = useState<TOSItem[]>([])
  const [tosStatus, setTosStatus] = useState<TOSStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasOutstanding, setHasOutstanding] = useState(false)

  useEffect(() => {
    checkRequiredTOS()
  }, [])

  const checkRequiredTOS = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('tos-management/required')

      if (error) throw error

      setRequiredTOS(data.requiredTOS || [])
      setHasOutstanding(data.hasOutstanding || false)
    } catch (err) {
      console.error('Failed to check required TOS:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTOSStatus = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('tos-management/status')

      if (error) throw error

      setTosStatus(data.tosStatus)
    } catch (err) {
      console.error('Failed to fetch TOS status:', err)
    } finally {
      setLoading(false)
    }
  }

  const acceptTOS = async (tosType: string, tosVersion: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('tos-management/accept', {
        body: {
          tosType,
          tosVersion,
          userAgent: navigator.userAgent,
        },
      })

      if (error) throw error

      // Refresh required TOS after acceptance
      await checkRequiredTOS()

      return { success: true, data }
    } catch (err: any) {
      console.error('Failed to accept TOS:', err)
      return { success: false, error: err.message }
    }
  }

  const checkSpecificTOS = async (tosType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        `tos-management/status?tosType=${tosType}`
      )

      if (error) throw error

      return data
    } catch (err) {
      console.error('Failed to check specific TOS:', err)
      return null
    }
  }

  return {
    requiredTOS,
    tosStatus,
    hasOutstanding,
    loading,
    checkRequiredTOS,
    fetchTOSStatus,
    acceptTOS,
    checkSpecificTOS,
  }
}
