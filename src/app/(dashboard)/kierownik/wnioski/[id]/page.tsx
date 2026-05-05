'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { verifyToken } from '@/lib/auth'

type Wniosek = {
  id: number
  nazwa: string
  kwota: number
  dataWydatku: string
  kategoria: string
  opis?: string
  status: string
  createdAt: string
  uzytkownik?: {
    imie: string
    nazwisko: string
    email: string
  }
}

export default function KierownikWniosekPage({ params }: { params: Promise<{ id: string }> }) {
  const [expense, setExpense] = useState<Wniosek | null>(null)
  const [loading, setLoading] = useState(true)
  const [powod, setPowod] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const resolvedParams = React.use(params)

  // Pobierz dane wniosku
  useEffect(() => {
    fetchExpense()
  }, [])

  async function fetchExpense() {
    try {
      const res = await fetch(`/api/wnioski/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setExpense(data)
      } else {
        toast.error('Nie znaleziono wniosku')
        router.push('/kierownik/wnioski')
      }
    } catch (error) {
      toast.error('Błąd pobierania')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(newStatus: 'ZAAKCEPTOWANY' | 'ODRZUCONY') {
    if (newStatus === 'ODRZUCONY' && !powod.trim()) {
      toast.error('Podaj powód odrzucenia')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/wnioski/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          powodOdrzucenia: newStatus === 'ODRZUCONY' ? powod : undefined
        }),
      })

      if (res.ok) {
        toast.success(newStatus === 'ZAAKCEPTOWANY' ? 'Zaakceptowano wniosek' : 'Odrzucono wniosek')
        fetchExpense()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Błąd aktualizacji')
      }
    } catch (error) {
      toast.error('Błąd połączenia')
    } finally {
      setSaving(false)
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

  if (loading) {
    return <div className="text-center py-8">Ładowanie...</div>
  }

  if (!expense) {
    return <div className="text-center py-8">Nie znaleziono wniosku</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/kierownik/wnioski">
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Wróć do listy
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Szczegóły wniosku #{expense.id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <CardTitle>{expense.nazwa}</CardTitle>
              {getStatusBadge(expense.status)}
            </div>
            <CardDescription>
              Zgłoszony: {new Date(expense.createdAt).toLocaleDateString('pl-PL')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Kwota</h3>
                <p className="text-2xl font-bold">{expense.kwota.toFixed(2)} PLN</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Kategoria</h3>
                <p className="text-lg">{getKategoriaLabel(expense.kategoria)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Data wydatku</h3>
              <p className="text-lg">{new Date(expense.dataWydatku).toLocaleDateString('pl-PL')}</p>
            </div>

            {expense.opis && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Opis</h3>
                <p className="text-lg">{expense.opis}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {expense.uzytkownik && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dane pracownika</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{expense.uzytkownik.imie} {expense.uzytkownik.nazwisko}</p>
                  <p className="text-sm text-gray-500">{expense.uzytkownik.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {expense.status === 'OCZEKUJACY' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Decyzja</CardTitle>
                <CardDescription>
                  Zaakceptuj lub odrzuć wniosek
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {expense.status === 'OCZEKUJACY' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Powód odrzucenia (opcjonalnie)
                    </label>
                    <Textarea
                      placeholder="Podaj powód odrzucenia..."
                      value={powod}
                      onChange={(e) => setPowod(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusChange('ZAAKCEPTOWANY')}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? 'Zapisywanie...' : 'Zaakceptuj'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusChange('ODRZUCONY')}
                    disabled={saving}
                  >
                    {saving ? 'Zapisywanie...' : 'Odrzuć'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
