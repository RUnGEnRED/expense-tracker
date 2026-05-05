'use client'

import { useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Wallet, Loader2, LogIn } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await loginAction(formData)
    setLoading(false)
    
    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden rounded-3xl">
        <div className="h-2 bg-blue-600 w-full" />
        <CardHeader className="space-y-4 text-center pt-8">
          <div className="mx-auto bg-blue-600 p-3 rounded-2xl w-fit shadow-lg shadow-blue-200">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter text-gray-900">Witaj ponownie</CardTitle>
            <CardDescription className="font-medium">Zaloguj się do systemu Expense Tracker</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold">Email służbowy</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="twoj.email@firma.pl" 
                required 
                className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50 border-gray-100"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" title="Hasło" className="font-bold">Hasło</Label>
                <Link href="#" className="text-xs text-blue-600 font-bold hover:underline">Zapomniałeś hasła?</Link>
              </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="h-12 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50/50 border-gray-100"
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
                <LogIn className="mr-2 h-6 w-6" />
              )}
              Zaloguj się
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t py-8 bg-gray-50/50">
          <p className="text-sm text-center text-gray-500 font-medium">
            Nie masz jeszcze konta?{' '}
            <Link href="/register" className="text-blue-600 font-black hover:underline">
              Zarejestruj się tutaj
            </Link>
          </p>
          <div className="flex justify-center gap-4 text-[9px] text-gray-300 font-black uppercase tracking-[0.2em]">
            <span>Next.js 15</span>
            <span>Prisma</span>
            <span>SQLite</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
