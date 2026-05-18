import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Users, Wallet, Clock, History, Search, ShieldCheck } from 'lucide-react'
import { ReviewButtons } from '@/components/ReviewButtons'
import { SearchFilter } from '@/components/SearchFilter'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusWniosku } from '@prisma/client'
import Link from 'next/link'
import { KATEGORIA_LABELS, formatDateTime, formatKwota, formatDate } from '@/lib/mappings'

export default async function KierownikPage({
  searchParams
}: {
  searchParams: Promise<{ query?: string; status?: string }>
}) {
  const user = await getCurrentUser()
  const { query, status } = await searchParams

  if (!user || user.rola !== 'KIEROWNIK') {
    redirect('/login')
  }

  // Global statistics
  const statsGroup = await prisma.zgloszenieWydatku.groupBy({
    by: ['status'],
    _count: true,
    _sum: { kwota: true }
  })

  const pendingCountTotal = statsGroup.find(s => s.status === 'OCZEKUJACY')?._count || 0
  const approvedSum = statsGroup.find(s => s.status === 'ZAAKCEPTOWANY')?._sum.kwota || 0
  const totalUsers = await prisma.uzytkownik.count({ where: { rola: 'PRACOWNIK' } })

  // List filters
  const where: any = {}
  if (query) {
    where.OR = [
      { nazwa: { contains: query } },
      { opis: { contains: query } },
      { uzytkownik: { imie: { contains: query } } },
      { uzytkownik: { nazwisko: { contains: query } } }
    ]
  }

  // Table visibility logic
  const showPendingTable = !status || status === 'ALL' || status === 'OCZEKUJACY'
  const showHistoryTable = !status || status === 'ALL' || status === 'ZAAKCEPTOWANY' || status === 'ODRZUCONY'

  // Pending requests
  const pendingExpenses = showPendingTable ? await prisma.zgloszenieWydatku.findMany({
    where: {
      ...where,
      status: 'OCZEKUJACY'
    },
    include: {
      uzytkownik: { select: { imie: true, nazwisko: true, email: true } }
    },
    orderBy: { createdAt: 'asc' }
  }) : []

  // History
  const historyStatusFilter = (status && status !== 'ALL' && status !== 'OCZEKUJACY')
    ? [status as StatusWniosku]
    : ['ZAAKCEPTOWANY', 'ODRZUCONY'] as StatusWniosku[]

  const historyExpenses = showHistoryTable ? await prisma.zgloszenieWydatku.findMany({
    where: {
      ...where,
      status: { in: historyStatusFilter }
    },
    include: {
      uzytkownik: { select: { imie: true, nazwisko: true } },
      rozpatrzonyPrzez: { select: { imie: true, nazwisko: true } }
    },
    orderBy: { updatedAt: 'desc' },
    take: 50
  }) : []

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 flex items-center gap-3">
            Zarządzanie Zespołem
          </h1>
          <p className="text-gray-500 mt-1 font-medium text-lg">Monitoruj budżet i zatwierdzaj wnioski swoich pracowników.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-white card-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/50 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-110" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-purple-600 uppercase tracking-widest flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Zespół
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-900">{totalUsers}</div>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">Aktywnych osób</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white card-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100/50 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-110" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-yellow-600 uppercase tracking-widest flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Do rozpatrzenia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-900">{pendingCountTotal}</div>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">Wnioski w kolejce</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white card-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/50 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-110" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black text-green-600 uppercase tracking-widest flex items-center">
              <Wallet className="mr-2 h-4 w-4" />
              Łączne wydatki
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-gray-900">{formatKwota(approvedSum || 0)}</div>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">Suma zatwierdzonych</p>
          </CardContent>
        </Card>
      </div>

      <SearchFilter />

      {/* Section: Pending */}
      {showPendingTable && (
        <Card className="shadow-2xl border-none overflow-hidden rounded-3xl animate-in slide-in-from-top duration-500">
          <CardHeader className="bg-amber-50/50 border-b p-8 flex flex-row items-center justify-between space-y-0 min-h-[100px]">
            <div className="flex items-center gap-5">
              <div className="bg-yellow-500 p-3.5 rounded-2xl shadow-xl shadow-yellow-100 border-2 border-white">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-2xl font-black leading-none">Wnioski do rozpatrzenia</CardTitle>
                <CardDescription className="font-bold text-xs text-amber-600 uppercase tracking-widest">
                  {pendingExpenses.length} zgłoszeń oczekujących
                </CardDescription>
              </div>
            </div>
            {pendingExpenses.length > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-black px-4 py-2 rounded-xl animate-pulse shadow-lg shadow-red-200 uppercase tracking-widest">
                Wymaga uwagi
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-amber-200">
            {pendingExpenses.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {pendingExpenses.map((expense) => (
                  <div key={expense.id} className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 hover:bg-amber-50/20 transition-all group">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-xl text-gray-900 group-hover:text-amber-600 transition-colors">{expense.nazwa}</span>
                        <StatusBadge status={expense.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-xl">
                          👤 {expense.uzytkownik.imie} {expense.uzytkownik.nazwisko}
                        </span>
                        <span className="flex items-center gap-1 font-medium">🗓️ {formatDate(expense.dataWydatku)}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-1 rounded-lg self-center">
                          {KATEGORIA_LABELS[expense.kategoria]}
                        </span>
                      </div>
                      {expense.opis && (
                        <p className="text-sm text-gray-600 bg-white p-4 rounded-2xl border border-amber-100 italic border-l-4 border-l-amber-400 shadow-sm">
                          "{expense.opis}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-end gap-4 min-w-[240px] w-full md:w-auto">
                      <div className="text-4xl font-black text-gray-900 mb-1">
                        {formatKwota(expense.kwota)}
                      </div>
                      <ReviewButtons expense={expense} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-gray-50/20">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-8 border-white shadow-xl shadow-green-50">
                  <Clock className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Wszystko gotowe!</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-2 font-medium">
                  Brak wniosków wymagających Twojej decyzji w tej chwili.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section: History */}
      {showHistoryTable && (
        <Card className="shadow-2xl border-none overflow-hidden rounded-3xl animate-in slide-in-from-bottom duration-500">
          <CardHeader className="border-b bg-slate-900 p-8 flex flex-row items-center justify-between space-y-0 min-h-[100px]">
            <div className="flex items-center gap-5">
              <div className="bg-slate-700 p-3.5 rounded-2xl border border-slate-600 shadow-xl shadow-black/20">
                <History className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-2xl font-black text-white leading-none">Historia decyzji</CardTitle>
                <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                  Archiwum rozpatrzonych wniosków
                </CardDescription>
              </div>
            </div>
            {historyExpenses.length > 0 && (
              <div className="text-white text-[11px] font-black uppercase tracking-widest bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 shadow-inner">
                {historyExpenses.length} elementów
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-100">
            {historyExpenses.length > 0 ? (
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="pl-8 py-4">Pracownik</TableHead>
                    <TableHead>Wydatek</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rozpatrzył(a)</TableHead>
                    <TableHead className="pr-8 text-right">Szczegóły decyzji</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyExpenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold pl-8 py-5">
                        {expense.uzytkownik.imie} {expense.uzytkownik.nazwisko}
                      </TableCell>
                      <TableCell className="font-medium">{expense.nazwa}</TableCell>
                      <TableCell className="font-black text-slate-900">{formatKwota(expense.kwota)}</TableCell>
                      <TableCell>
                        <StatusBadge status={expense.status} />
                      </TableCell>
                      <TableCell>
                        {expense.rozpatrzonyPrzez ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                            {expense.rozpatrzonyPrzez.imie} {expense.rozpatrzonyPrzez.nazwisko}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Brak danych</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="space-y-1.5 py-2">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            {formatDateTime(expense.updatedAt)}
                          </p>
                          {expense.komentarzKierownika ? (
                            <div className="inline-block text-xs text-gray-600 italic bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-left max-w-[250px] line-clamp-2 hover:line-clamp-none transition-all cursor-help" title={expense.komentarzKierownika}>
                              "{expense.komentarzKierownika}"
                            </div>
                          ) : (
                            <p className="text-xs text-gray-300 italic">Bez komentarza</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-24 bg-slate-50/10">
                <History className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400">Historia jest pusta</h3>
                <p className="text-slate-400 text-sm italic mt-1">
                  Brak rozpatrzonych wniosków pasujących do wybranych kryteriów.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
