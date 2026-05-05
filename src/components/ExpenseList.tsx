'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, Trash2, Plus, Search } from 'lucide-react'
import Link from 'next/link'

type Wniosek = {
  id: number
  nazwa: string
  kwota: number
  dataWydatku: string
  kategoria: string
  status: string
  createdAt: string
}

export function ExpenseList({ userRole }: { userRole: string }) {
  const [expenses, setExpenses] = useState<Wniosek[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchExpenses()
  }, [statusFilter])

  async function fetchExpenses() {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter)
      }
      
      const res = await fetch(`/api/wnioski?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Błąd pobierania:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteExpense(id: number) {
    if (!confirm('Czy na pewno chcesz usunąć ten wniosek?')) return
    
    try {
      const res = await fetch(`/api/wnioski/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchExpenses()
      }
    } catch (error) {
      console.error('Błąd usuwania:', error)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'OCZEKUJACY':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Oczekujący</Badge>
      case 'ZAAKCEPTOWANY':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Zaakceptowany</Badge>
      case 'ODRZUCONY':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Odrzucony</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  function getKategoriaLabel(kategoria: string) {
    switch (kategoria) {
      case 'ZAKWATEROWANIE': return 'Zakwaterowanie'
      case 'TRANSPORT': return 'Transport'
      case 'WYZYWIENIE': return 'Wyżywienie'
      case 'INNE': return 'Inne'
      default: return kategoria
    }
  }

  const filteredExpenses = expenses.filter(exp => 
    exp.nazwa.toLowerCase().includes(search.toLowerCase()) ||
    getKategoriaLabel(exp.kategoria).toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-8">Ładowanie...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Szukaj wniosków..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'ALL')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtruj status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Wszystkie</SelectItem>
            <SelectItem value="OCZEKUJACY">Oczekujące</SelectItem>
            <SelectItem value="ZAAKCEPTOWANY">Zaakceptowane</SelectItem>
            <SelectItem value="ODRZUCONY">Odrzucone</SelectItem>
          </SelectContent>
        </Select>
        {userRole === 'PRACOWNIK' && (
          <Link href="/pracownik/wnioski/nowy">
            <Button>
              <Plus size={18} className="mr-2" />
              Nowy wydatek
            </Button>
          </Link>
        )}
      </div>

      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            Brak wniosków do wyświetlenia
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{expense.nazwa}</h3>
                    {getStatusBadge(expense.status)}
                  </div>
                  <div className="text-sm text-gray-500 space-x-4">
                    <span>Kwota: <strong>{expense.kwota.toFixed(2)} PLN</strong></span>
                    <span>Kategoria: {getKategoriaLabel(expense.kategoria)}</span>
                    <span>Data: {new Date(expense.dataWydatku).toLocaleDateString('pl-PL')}</span>
                  </div>
                </div>
                {userRole === 'PRACOWNIK' && expense.status === 'OCZEKUJACY' && (
                  <div className="flex gap-2">
                    <Link href={`/pracownik/wnioski/${expense.id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil size={16} />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                )}
                {userRole === 'KIEROWNIK' && (
                  <Link href={`/kierownik/wnioski/${expense.id}`}>
                    <Button variant="outline" size="sm">
                      Szczegóły
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
