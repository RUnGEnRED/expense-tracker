import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, ArrowLeft, Eye, FileText, Wallet, ShieldCheck } from 'lucide-react'
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
import { KATEGORIA_LABELS, formatDate, formatKwota } from '@/lib/mappings'

export default async function MojeWnioskiPage({
  searchParams
}: {
  searchParams: Promise<{ query?: string; status?: string }>
}) {
  const user = await getCurrentUser()
  const { query, status } = await searchParams
  
  if (!user || user.rola !== 'PRACOWNIK') {
    redirect('/login')
  }

  const where: any = {
    uzytkownikId: user.id
  }

  if (query) {
    where.OR = [
      { nazwa: { contains: query } },
      { opis: { contains: query } }
    ]
  }

  if (status && status !== 'ALL') {
    where.status = status as StatusWniosku
  }

  const wnioski = await prisma.zgloszenieWydatku.findMany({
    where,
    include: {
      rozpatrzonyPrzez: { select: { imie: true, nazwisko: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/pracownik">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/50 shadow-sm border border-transparent hover:border-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tighter">Moje wnioski</h1>
            <p className="text-sm text-gray-500 font-medium">Przeglądaj i zarządzaj swoimi wydatkami</p>
          </div>
        </div>
        <Link href="/pracownik/wnioski/nowy">
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-bold px-6 h-11">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nowy wniosek
          </Button>
        </Link>
      </div>

      <SearchFilter />

      <Card className="border-none shadow-xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-gray-50/50 border-b p-6">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Lista zgłoszeń {query || status ? '(wyniki wyszukiwania)' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
          {wnioski.length > 0 ? (
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="pl-6">Nazwa</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Kwota</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rozpatrzone przez</TableHead>
                  <TableHead className="text-right pr-6">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wnioski.map((wniosek) => (
                  <TableRow key={wniosek.id} className="hover:bg-blue-50/20 transition-colors">
                    <TableCell className="font-bold pl-6">{wniosek.nazwa}</TableCell>
                    <TableCell>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-gray-100 rounded text-gray-500">
                        {KATEGORIA_LABELS[wniosek.kategoria]}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDate(wniosek.dataWydatku)}
                    </TableCell>
                    <TableCell className="font-black text-blue-900">
                      {formatKwota(wniosek.kwota)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={wniosek.status} />
                    </TableCell>
                    <TableCell>
                      {wniosek.rozpatrzonyPrzez ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                          {wniosek.rozpatrzonyPrzez.imie} {wniosek.rozpatrzonyPrzez.nazwisko}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Oczekiwanie</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <Link href={`/pracownik/wnioski/${wniosek.id}`}>
                          <Button variant="ghost" size="sm" className="hover:bg-blue-600 hover:text-white rounded-xl transition-all">
                            <Eye className="h-4 w-4 mr-2" />
                            Szczegóły
                          </Button>
                       </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-24 bg-white">
               <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                 <Wallet className="h-10 w-10 text-gray-300" />
               </div>
               <h3 className="text-xl font-bold text-gray-900">Brak wniosków</h3>
               <p className="text-gray-500 max-w-sm mx-auto mt-2">
                 {query || status 
                  ? 'Nie znaleźliśmy wniosków pasujących do Twoich kryteriów.' 
                  : 'Nie masz jeszcze żadnych zgłoszonych wydatków.'}
               </p>
               {(query || status) && (
                 <Link href="/pracownik/wnioski">
                   <Button variant="link" className="mt-4 text-blue-600 font-bold">
                     Wyczyść filtry
                   </Button>
                 </Link>
               )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
