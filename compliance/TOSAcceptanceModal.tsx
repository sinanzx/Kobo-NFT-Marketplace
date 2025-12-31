import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExternalLink, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface TOSItem {
  type: string
  version: string
  url: string
  description: string
}

interface TOSAcceptanceModalProps {
  open: boolean
  onClose: () => void
  onAccepted: () => void
  requiredTOS?: TOSItem[]
}

export function TOSAcceptanceModal({ open, onClose, onAccepted, requiredTOS }: TOSAcceptanceModalProps) {
  const [acceptances, setAcceptances] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tosItems, setTosItems] = useState<TOSItem[]>(requiredTOS || [])

  useEffect(() => {
    if (open && !requiredTOS) {
      fetchRequiredTOS()
    }
  }, [open, requiredTOS])

  const fetchRequiredTOS = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('tos-management/required')
      
      if (error) throw error
      
      if (data.requiredTOS && data.requiredTOS.length > 0) {
        setTosItems(data.requiredTOS)
      } else {
        // No outstanding TOS, close modal
        onAccepted()
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAcceptAll = async () => {
    setLoading(true)
    setError(null)

    try {
      // Accept all required TOS
      for (const tos of tosItems) {
        const { error } = await supabase.functions.invoke('tos-management/accept', {
          body: {
            tosType: tos.type,
            tosVersion: tos.version,
            ipAddress: null, // Could be fetched from a service
            userAgent: navigator.userAgent,
          },
        })

        if (error) throw error
      }

      onAccepted()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const allAccepted = tosItems.every(tos => acceptances[tos.type])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Terms of Service Acceptance Required
          </DialogTitle>
          <DialogDescription>
            You must accept the following terms of service before proceeding.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {tosItems.map((tos) => (
              <div key={tos.type} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{tos.description}</h3>
                    <p className="text-sm text-muted-foreground">Version {tos.version}</p>
                  </div>
                  {tos.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(tos.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`tos-${tos.type}`}
                    checked={acceptances[tos.type] || false}
                    onCheckedChange={(checked) =>
                      setAcceptances(prev => ({ ...prev, [tos.type]: checked as boolean }))
                    }
                  />
                  <label
                    htmlFor={`tos-${tos.type}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read and agree to the {tos.description}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAcceptAll} disabled={!allAccepted || loading}>
            {loading ? 'Accepting...' : 'Accept All & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
