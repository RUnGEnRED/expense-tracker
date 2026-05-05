'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Tag, Wallet, FileText, Trash2, Pencil, MessageCircle, X, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { deleteExpenseAction } from '@/app/actions/expenses'
import { ExpenseEditForm } from '@/components/ExpenseEditForm'
import { ZgloszenieWydatku } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { KATEGORIA_LABELS, formatDate, formatDateTime, formatKwota } from '@/lib/mappings'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface ExpenseDetailsViewProps {
  wniosek: ZgloszenieWydatku & { rozpatrzonyPrzez?: { imie: string, nazwisko: string } | null }
}

export function ExpenseDetailsView({ wniosek }: ExpenseDetailsViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const res = await deleteExpenseAction(wniosek.id)
    if (res?.success) {
      toast.success('Wniosek został pomyślnie usunięty')
      router.push('/pracownik/wnioski')
    } else {
      toast.error(res?.error || 'Wystąpił błąd podczas usuwania wniosku')
    }
  }

  if (isEditing) {
    return (
      <Card className="border-none shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="h-2 bg-blue-600 w-full" />
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-2xl font-black">Edytuj wniosek</CardTitle>
          <CardDescription>Wprowadź poprawki do swojego zgłoszenia</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <ExpenseEditForm expense={wniosek} onCancel={() => setIsEditing(false)} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link href="/pracownik/wnioski">
          <Button variant="ghost" size="sm" className="hover:bg-white/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć do listy
          </Button>
        </Link>
        
        <div className="flex gap-2">
          {wniosek.status === 'OCZEKUJACY' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="shadow-sm border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edytuj
              </Button>

              <ConfirmDialog
                variant="destructive"
                title="Usuń wniosek"
                description={`Czy na pewno chcesz trwale usunąć wniosek "${wniosek.nazwa}"? Tej operacji nie można cofnąć.`}
                confirmText="Tak, usuń wniosek"
                cancelText="Anuluj"
                onConfirm={handleDelete}
                trigger={
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="shadow-sm font-bold rounded-xl"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Usuń
                  </Button>
                }
              />
            </>
          )}
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden card-hover">
        <div className="h-2 bg-blue-600 w-full" />
        <CardHeader className="bg-gray-50/50 border-b">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black">{wniosek.nazwa}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Złożono: {formatDate(wniosek.createdAt)}
              </CardDescription>
            </div>
            <StatusBadge status={wniosek.status} className="scale-125 origin-top-right mt-2" />
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Kwota do zwrotu</p>
                  <p className="text-2xl font-black text-blue-900">{formatKwota(wniosek.kwota)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="bg-gray-400 p-2 rounded-xl">
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Kategoria</p>
                  <p className="text-xl font-bold text-gray-800">{KATEGORIA_LABELS[wniosek.kategoria]}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[140px]">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Opis wydatku
                  </p>
                  <p className="text-gray-700 leading-relaxed italic">
                    {wniosek.opis || "Brak dodatkowego opisu dla tego wniosku."}
                  </p>
               </div>
            </div>
          </div>

          {(wniosek.komentarzKierownika || wniosek.rozpatrzonyPrzez) && (
             <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 mt-4 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Informacja zwrotna</span>
                  </div>
                  {wniosek.rozpatrzonyPrzez && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-blue-100">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-900 uppercase">
                        Decyzja: {wniosek.rozpatrzonyPrzez.imie} {wniosek.rozpatrzonyPrzez.nazwisko}
                      </span>
                    </div>
                  )}
                </div>
                
                {wniosek.komentarzKierownika ? (
                  <p className="text-gray-800 font-medium leading-relaxed italic">
                    "{wniosek.komentarzKierownika}"
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm italic">Brak dodatkowego komentarza.</p>
                )}

                <p className="text-[10px] text-blue-400 mt-4 font-bold uppercase">
                   Ostatnia aktualizacja statusu: {formatDateTime(wniosek.updatedAt)}
                </p>
             </div>
          )}

          <div className="pt-6 border-t flex items-center justify-between text-sm text-gray-400">
            <p>ID Wniosku: #{wniosek.id.toString().padStart(6, '0')}</p>
            <p>Ostatnia aktualizacja: {formatDateTime(wniosek.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {wniosek.status === 'ODRZUCONY' && !wniosek.komentarzKierownika && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex gap-4 items-center animate-in slide-in-from-left duration-500">
          <div className="bg-red-100 p-3 rounded-full shadow-sm">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="font-bold text-red-900 text-lg">Wniosek został odrzucony</p>
            <p className="text-sm text-red-700">Skontaktuj się ze swoim przełożonym, aby poznać przyczynę odrzucenia lub poprawić wniosek.</p>
          </div>
        </div>
      )}
    </div>
  )
}
