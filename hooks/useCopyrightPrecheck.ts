import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface CopyrightPrecheckParams {
  promptText: string
  aiEngine: string
  outputType: 'image' | 'video' | 'audio'
  outputUrl?: string
  isRemix?: boolean
  parentOutputId?: string
}

interface CopyrightPrecheckResult {
  success: boolean
  outputId?: string
  complianceStatus?: string
  error?: string
  errorType?: 'TOS_NOT_ACCEPTED' | 'RESTRICTED_CONTENT' | 'COPYRIGHT_VIOLATION'
  tosRequired?: any[]
  flaggedTerms?: string[]
  categories?: string[]
  scanResult?: any
}

export function useCopyrightPrecheck() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performPrecheck = async (params: CopyrightPrecheckParams): Promise<CopyrightPrecheckResult> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('copyright-precheck', {
        body: params,
      })

      if (invokeError) {
        throw invokeError
      }

      if (!data.success) {
        setError(data.message || data.error)
        return {
          success: false,
          error: data.message || data.error,
          errorType: data.error,
          tosRequired: data.tosRequired,
          flaggedTerms: data.flaggedTerms,
          categories: data.categories,
          scanResult: data.scanResult,
        }
      }

      return {
        success: true,
        outputId: data.outputId,
        complianceStatus: data.complianceStatus,
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Copyright pre-check failed'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    performPrecheck,
    loading,
    error,
    clearError,
  }
}
