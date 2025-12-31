import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertTriangle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isSecurity = variant === 'security'
        
        return (
          <Toast key={id} variant={variant} {...props}>
            {isSecurity && (
              <div className="flex-shrink-0 mr-3">
                <AlertTriangle 
                  className="h-6 w-6 text-[#ea5c2a] animate-pulse" 
                  strokeWidth={2.5}
                />
              </div>
            )}
            <div className="grid gap-1 flex-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
