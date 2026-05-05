'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, MessageSquare, Info } from 'lucide-react'
import { reviewExpenseAction } from '@/app/actions/expenses'
import { toast } from 'sonner'
import { StatusWniosku, ZgloszenieWydatku } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { KATEGORIA_LABELS, formatDate, formatKwota } from '@/lib/mappings'

interface ReviewButtonsProps {
  expense: ZgloszenieWydatku & { uzytkownik?: { imie: string, nazwisko: string } }
}

export function ReviewButtons({ expense }: ReviewButtonsProps) {
  const [loading, setLoading] = useState<StatusWniosku | null>(null)
  const [comment, setComment] = useState('')
  const [openStatus, setOpenStatus] = useState<StatusWniosku | null>(null)

  async function handleReview(status: StatusWniosku) {
    setLoading(status)
    const result = await reviewExpenseAction(expense.id, status, comment)
    setLoading(null)
    setOpenStatus(null)
    setComment('')

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(status === 'ZAAKCEPTOWANY' ? 'Wniosek zaakceptowany' : 'Wniosek odrzucony')
    }
  }

  return (
    <div className="flex gap-2 w-full">
      {/* Details Button */}
      <Dialog>
        <DialogTrigger
          render={
            <button type="button" className="flex-1 inline-flex items-center justify-center rounded-lg border border-blue-200 bg-background px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
              <Info className="h-3.5 w-3.5 mr-1" /> Szczegóły
            </button>
          }
        />
        <DialogContent className="max-w-2xl border-none shadow-2xl overflow-hidden rounded-2xl p-0">
           <div className="h-2 bg-blue-600 w-full" />
           <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{expense.nazwa}</DialogTitle>
              <DialogDescription>
                Wniosek złożony przez: <span className="font-bold text-gray-900">{expense.uzytkownik?.imie} {expense.uzytkownik?.nazwisko}</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kwota</p>
                  <p className="text-2xl font-black text-blue-600">{formatKwota(expense.kwota)}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategoria</p>
                  <p className="text-xl font-bold">{KATEGORIA_LABELS[expense.kategoria]}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data wydatku</p>
                  <p className="font-semibold">{formatDate(expense.dataWydatku)}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Złożono</p>
                  <p className="font-semibold">{formatDate(expense.createdAt)}</p>
               </div>
            </div>

            <div className="space-y-2">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opis pracownika</p>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-gray-700 leading-relaxed">
                  {expense.opis || "Brak opisu."}
               </div>
            </div>
           </div>
        </DialogContent>
      </Dialog>

      {/* Approval with comment */}
      <Dialog open={openStatus === 'ZAAKCEPTOWANY'} onOpenChange={(open) => setOpenStatus(open ? 'ZAAKCEPTOWANY' : null)}>
        <DialogTrigger
          render={
            <button type="button" className="flex-1 inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-1 text-xs font-bold text-white hover:bg-green-700 transition-all shadow-sm">
              <Check className="h-3.5 w-3.5 mr-1" /> Akceptuj
            </button>
          }
        />
        <DialogContent className="rounded-2xl shadow-2xl border-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Check className="text-green-600 h-6 w-6" /> Potwierdź akceptację
            </DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz zaakceptować wydatek <strong>{expense.nazwa}</strong> na kwotę {formatKwota(expense.kwota)}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MessageSquare className="h-4 w-4" /> Komentarz dla pracownika (opcjonalnie)
            </div>
            <Textarea 
              placeholder="Dobra robota! / Faktura poprawna." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none rounded-xl focus:ring-green-500"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenStatus(null)} className="rounded-xl">Anuluj</Button>
            <Button 
              onClick={() => handleReview('ZAAKCEPTOWANY')} 
              disabled={!!loading}
              className="bg-green-600 hover:bg-green-700 rounded-xl"
            >
              {loading === 'ZAAKCEPTOWANY' ? <Loader2 className="animate-spin h-4 w-4" /> : 'Zatwierdź akceptację'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection with comment */}
      <Dialog open={openStatus === 'ODRZUCONY'} onOpenChange={(open) => setOpenStatus(open ? 'ODRZUCONY' : null)}>
        <DialogTrigger
          render={
            <button type="button" className="flex-1 inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 transition-all shadow-sm">
              <X className="h-3.5 w-3.5 mr-1" /> Odrzuć
            </button>
          }
        />
        <DialogContent className="rounded-2xl shadow-2xl border-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
              <X className="h-6 w-6" /> Potwierdź odrzucenie
            </DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz odrzucić wydatek <strong>{expense.nazwa}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MessageSquare className="h-4 w-4" /> Powód odrzucenia (zalecane)
            </div>
            <Textarea 
              placeholder="Brak faktury / Kwota przekracza limit." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none rounded-xl focus:ring-red-500"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenStatus(null)} className="rounded-xl">Anuluj</Button>
            <Button 
              variant="destructive" 
              onClick={() => handleReview('ODRZUCONY')} 
              disabled={!!loading}
              className="rounded-xl"
            >
              {loading === 'ODRZUCONY' ? <Loader2 className="animate-spin h-4 w-4" /> : 'Odrzuć wniosek'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
