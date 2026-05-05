'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { AlertCircle, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  trigger: React.ReactNode
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default'
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmText = 'Potwierdź',
  cancelText = 'Anuluj',
  variant = 'default'
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error('Error during action confirmation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <div className={cn(
           "h-2 w-full",
           variant === 'destructive' ? "bg-red-600" : "bg-blue-600"
        )} />
        
        <div className="p-8">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-2xl shadow-sm shrink-0",
              variant === 'destructive' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            )}>
              {variant === 'destructive' ? <Trash2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
            </div>
            <div className="flex-1 space-y-2">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-gray-900 leading-tight">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 font-medium leading-relaxed">
                  {description}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <DialogClose render={
              <Button variant="outline" className="flex-1 rounded-xl font-bold h-12 border-2">
                {cancelText}
              </Button>
            } />
            <Button 
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "flex-1 rounded-xl font-black h-12 shadow-lg transition-all active:scale-95",
                variant === 'destructive' ? "bg-red-600 hover:bg-red-700 shadow-red-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
              )}
            >
              {isLoading ? 'Przetwarzanie...' : confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
