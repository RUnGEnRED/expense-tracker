import { LoginForm } from '@/components/forms/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Logowanie</CardTitle>
          <CardDescription>
            Wpisz swoje dane, aby się zalogować
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
          <div className="mt-4 text-center text-sm">
            Nie masz konta?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Zarejestruj się
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
