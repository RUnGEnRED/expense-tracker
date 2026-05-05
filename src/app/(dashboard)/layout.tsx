import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/app/actions/auth'
import { verifyToken } from '@/lib/auth'
import type { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let user = null
  
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (token) {
    try {
      user = verifyToken(token)
    } catch (e) {
      // Token nieprawidłowy
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold">
              Expense Tracker
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">
                  {user.imie} {user.nazwisko} ({user.rola === 'KIEROWNIK' ? 'Kierownik' : 'Pracownik'})
                </span>
                <form action={logoutAction}>
                  <Button variant="outline" size="sm" type="submit">
                    Wyloguj
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  )
}
