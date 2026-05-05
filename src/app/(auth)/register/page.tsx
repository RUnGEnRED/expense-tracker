'use client'

import { useState } from 'react'
import { registerAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { UserPlus, Loader2, Wallet, User, Shield } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Rola } from '@prisma/client'
import { VisualToggle } from '@/components/EnumOverhaul'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [rola, setRola] = useState<Rola>('PRACOWNIK')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await registerAction(formData)
    setLoading(false)
    
    if (result?.error) {
      toast.error(result.error)
    }
  }

  const roleOptions = {
    PRACOWNIK: {
      label: 'Pracownik (Zgłaszający)',
      icon: <User className="h-6 w-6" />,
      description: 'Zgłaszaj swoje wydatki i monitoruj status zwrotów kosztów.'
    },
    KIEROWNIK: {
      label: 'Kierownik (Zatwierdzający)',
      icon: <Shield className="h-6 w-6" />,
      description: 'Zarządzaj zespołem, zatwierdzaj wnioski i monitoruj budżet.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-2xl shadow-2xl border-none overflow-hidden rounded-3xl">
        <div className="h-2 bg-blue-600 w-full" />
        <CardHeader className="space-y-4 text-center pt-8">
          <div className="mx-auto bg-blue-600 p-3 rounded-2xl w-fit shadow-lg shadow-blue-200">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter">Załóż konto</CardTitle>
            <CardDescription>Wybierz swoją rolę w systemie Expense Tracker</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form action={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-sm font-black uppercase tracking-widest text-gray-400">Twoja Rola</Label>
              <VisualToggle 
                name="rola" 
                value={rola} 
                onChange={setRola} 
                options={roleOptions} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="imie" className="font-bold">Imię</Label>
                <Input 
                  id="imie" 
                  name="imie" 
                  placeholder="Jan" 
                  required 
                  className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 border-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nazwisko" className="font-bold">Nazwisko</Label>
                <Input 
                  id="nazwisko" 
                  name="nazwisko" 
                  placeholder="Kowalski" 
                  required 
                  className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 border-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold">Email służbowy</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="jan.kowalski@firma.pl" 
                required 
                className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 border-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold">Hasło dostępu</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Minimum 6 znaków" 
                required 
                minLength={6}
                className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 border-gray-100"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 font-black text-lg rounded-2xl mt-4 transition-all hover:scale-[1.02] active:scale-95" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-6 w-6" />
              )}
              Utwórz konto
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t py-8 bg-gray-50/50">
          <p className="text-sm text-center text-gray-500 font-medium">
            Masz już dostęp do systemu?{' '}
            <Link href="/login" className="text-blue-600 font-black hover:underline">
              Zaloguj się tutaj
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
