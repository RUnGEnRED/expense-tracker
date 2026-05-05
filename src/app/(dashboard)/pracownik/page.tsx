import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PlusCircle, ListTodo, CheckCircle, Clock, Wallet, ArrowRight, FileText } from 'lucide-react'
import { KATEGORIA_LABELS, formatDate, formatKwota } from '@/lib/mappings'

export default async function PracownikPage() {
  const user = await getCurrentUser()
  
  if (!user || user.rola !== 'PRACOWNIK') {
    redirect('/login')
  }

  // Fetch statistics
  const stats = await prisma.zgloszenieWydatku.groupBy({
    by: ['status'],
    where: { uzytkownikId: user.id },
    _count: true,
  })

  const totalCount = stats.reduce((acc, curr) => acc + curr._count, 0)
  const pendingCount = stats.find(s => s.status === 'OCZEKUJACY')?._count || 0
  const approvedCount = stats.find(s => s.status === 'ZAAKCEPTOWANY')?._count || 0

  // Fetch recent requests
  const recentExpenses = await prisma.zgloszenieWydatku.findMany({
    where: { uzytkownikId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900">
            Witaj, {user.imie}! 👋
          </h1>
          <p className="text-gray-500 mt-1 font-medium text-lg">Zarządzaj swoimi wydatkami służbowymi w jednym miejscu.</p>
        </div>
        <Link href="/pracownik/wnioski/nowy">
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 font-black px-8 h-14 rounded-2xl text-lg transition-all hover:scale-105 active:scale-95">
            <PlusCircle className="mr-2 h-6 w-6" />
            Nowy wniosek
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-none shadow-xl bg-white card-hover overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-[80px] -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center">
              <ListTodo className="mr-2 h-4 w-4" />
              Łącznie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-900">{totalCount}</div>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">Złożonych wniosków</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white card-hover overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-50 rounded-bl-[80px] -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-yellow-600 uppercase tracking-widest flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Oczekujące
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-900">{pendingCount}</div>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">W trakcie weryfikacji</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white card-hover overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-[80px] -mr-4 -mt-4 transition-all group-hover:scale-110" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-green-600 uppercase tracking-widest flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Zatwierdzone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-900">{approvedCount}</div>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">Gotowe do wypłaty</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-2xl border-none overflow-hidden rounded-3xl">
        <CardHeader className="bg-gray-50/50 border-b p-8 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
             <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
                <FileText className="h-5 w-5 text-white" />
             </div>
             <div>
               <CardTitle className="text-2xl font-black leading-none">Ostatnie wnioski</CardTitle>
               <CardDescription className="font-bold text-xs uppercase tracking-widest mt-1">Podgląd 5 najnowszych zgłoszeń</CardDescription>
             </div>
          </div>
          <Link href="/pracownik/wnioski">
            <Button variant="outline" size="sm" className="rounded-xl font-bold border-2 hover:bg-blue-50 hover:text-blue-600 transition-all group">
              Pełna lista
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentExpenses.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentExpenses.map((expense) => (
                <Link 
                  key={expense.id} 
                  href={`/pracownik/wnioski/${expense.id}`}
                  className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-blue-50/20 transition-all group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="font-black text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                        {expense.nazwa}
                      </p>
                      <StatusBadge status={expense.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                      <span className="flex items-center gap-1.5 uppercase tracking-widest text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                        {KATEGORIA_LABELS[expense.kategoria]}
                      </span>
                      <span className="flex items-center gap-1.5">
                        🗓️ {formatDate(expense.dataWydatku)}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-black text-2xl text-blue-900">{formatKwota(expense.kwota)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Wallet className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Brak wniosków</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                Nie masz jeszcze żadnych zgłoszonych wydatków. Kliknij przycisk powyżej, aby dodać swój pierwszy wniosek.
              </p>
            </div>
          )}
        </CardContent>
        {recentExpenses.length > 0 && (
           <div className="p-6 bg-gray-50/50 border-t text-center">
             <Link href="/pracownik/wnioski" className="text-sm font-black text-blue-600 hover:underline uppercase tracking-widest">
                Przejdź do pełnej historii wniosków
             </Link>
           </div>
        )}
      </Card>
    </div>
  )
}
