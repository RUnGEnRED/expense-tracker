'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateExpenseAction } from '@/app/actions/expenses'
import { Loader2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { ZgloszenieWydatku } from '@prisma/client'
import { KATEGORIA_LABELS } from '@/lib/mappings'
import { ChipToggle } from '@/components/EnumOverhaul'
import { KategoriaWydatku } from '@prisma/client'

interface ExpenseEditFormProps {
  expense: ZgloszenieWydatku
  onCancel: () => void
}

export function ExpenseEditForm({ expense, onCancel }: ExpenseEditFormProps) {
  const [loading, setLoading] = useState(false)
  const [kategoria, setKategoria] = useState<KategoriaWydatku>(expense.kategoria)
  const router = useRouter()

  async function clientAction(formData: FormData) {
    setLoading(true)
    const result = await updateExpenseAction(expense.id, formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Wniosek został zaktualizowany!')
      onCancel()
      router.refresh()
    }
  }

  return (
    <form action={clientAction} className="space-y-8">
      <div className="space-y-4">
        <Label className="text-sm font-black uppercase tracking-widest text-gray-400">Kategoria wydatku</Label>
        <ChipToggle 
          name="kategoria" 
          value={kategoria} 
          onChange={setKategoria} 
          options={KATEGORIA_LABELS} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label htmlFor="nazwa" className="font-bold">Nazwa wydatku</Label>
          <Input
            id="nazwa"
            name="nazwa"
            defaultValue={expense.nazwa}
            required
            className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kwota" className="font-bold">Kwota (PLN)</Label>
          <div className="relative">
            <Input
              id="kwota"
              name="kwota"
              type="number"
              step="0.01"
              defaultValue={expense.kwota}
              required
              className="h-12 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">zł</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label htmlFor="dataWydatku" className="font-bold">Data wydatku</Label>
          <Input
            id="dataWydatku"
            name="dataWydatku"
            type="date"
            required
            className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50"
            defaultValue={new Date(expense.dataWydatku).toISOString().split('T')[0]}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="opis" className="font-bold">Opis (opcjonalnie)</Label>
          <Input
            id="opis"
            name="opis"
            defaultValue={expense.opis || ''}
            className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <Button 
          type="submit" 
          disabled={loading}
          className="h-14 flex-1 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 font-black text-lg rounded-2xl transition-all active:scale-95"
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          Zapisz zmiany
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
          className="h-14 flex-1 rounded-2xl font-bold border-2"
        >
          <X className="mr-2 h-5 w-5" />
          Anuluj
        </Button>
      </div>
    </form>
  )
}
