import { RegisterForm } from '@/components/forms/RegisterForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Rejestracja</CardTitle>
          <CardDescription>
            Utwórz nowe konto w systemie Expense Tracker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <div className="mt-4 text-center text-sm">
            Masz już konto?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Zaloguj się
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
