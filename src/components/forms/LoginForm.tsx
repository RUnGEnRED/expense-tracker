'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { loginAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setPending(true)
    const result = await loginAction(formData)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    } else if (result?.success) {
      router.push(result.redirectTo || '/pracownik')
      router.refresh()
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
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
        />
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Logowanie...' : 'Zaloguj się'}
      </Button>
    </form>
  )
}
