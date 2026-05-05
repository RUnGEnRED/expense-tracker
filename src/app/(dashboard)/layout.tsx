import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/app/actions/auth'
import { getCurrentUser } from '@/lib/auth'
import type { ReactNode } from 'react'
import { Wallet, LogOut, User as UserIcon, Shield } from 'lucide-react'
import { ROLA_LABELS } from '@/lib/mappings'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3 group">
            <div className="bg-blue-600 p-2.5 rounded-xl group-hover:rotate-12 transition-transform shadow-xl shadow-blue-200">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <Link
              href={user?.rola === 'KIEROWNIK' ? '/kierownik' : '/pracownik'}
              className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity"
            >
              <span className="text-blue-600">EXPENSE</span>TRACKER
            </Link>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            {user && (
              <>
                <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm transition-all hover:bg-gray-100/50">
                  <div className="flex flex-col items-end">
                    <span className="text-sm sm:text-base font-black text-gray-900">
                      {user.imie} {user.nazwisko}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        user.rola === 'KIEROWNIK' ? "bg-purple-500" : "bg-blue-500"
                      )} />
                      <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">
                        {ROLA_LABELS[user.rola]}
                      </span>
                    </div>
                  </div>

                  <div className={cn(
                    "p-2 rounded-xl hidden sm:block shadow-inner",
                    user.rola === 'KIEROWNIK' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {user.rola === 'KIEROWNIK' ? (
                      <Shield className="h-5 w-5" />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </div>
                </div>

                <form action={logoutAction}>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="submit"
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl h-12 px-4 transition-all flex items-center gap-3 group font-bold"
                  >
                    <span className="hidden lg:inline text-sm">Wyloguj</span>
                    <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-10 px-4 sm:px-8">
        {children}
      </main>

      <footer className="border-t bg-white py-10">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1.5 rounded-lg">
              <Wallet className="h-4 w-4 text-gray-400" />
            </div>
            <p>© 2026 Expense Tracker System.</p>
          </div>
          <div className="flex items-center gap-8">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Centrum pomocy</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Prywatność</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Kontakt</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
