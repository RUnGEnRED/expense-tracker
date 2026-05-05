'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { registerAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

export function RegisterForm() {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setPending(true)
    const result = await registerAction(formData)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    }
    // On success, registerAction redirects automatically
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="imie">Imię</Label>
          <Input
            id="imie"
            name="imie"
            type="text"
            placeholder="Jan"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nazwisko">Nazwisko</Label>
          <Input
            id="nazwisko"
            name="nazwisko"
            type="text"
            placeholder="Kowalski"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="twoj@email.pl"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rola">Rola</Label>
        <Select name="rola" defaultValue="PRACOWNIK">
          <SelectTrigger>
            <SelectValue placeholder="Wybierz rolę" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRACOWNIK">Pracownik</SelectItem>
            <SelectItem value="KIEROWNIK">Kierownik</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Rejestracja...' : 'Zarejestruj się'}
      </Button>
    </form>
  )
}
