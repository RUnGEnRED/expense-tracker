import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ExpenseList } from '@/components/ExpenseList'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function KierownikWnioskiPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    redirect('/login')
  }
  
  const user = verifyToken(token)
  if (!user || user.rola !== 'KIEROWNIK') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wnioski pracowników</h1>
        <p className="text-gray-500">Przeglądaj i zarządzaj wnioskami o zwrot kosztów</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtrowanie</CardTitle>
          <CardDescription>Wybierz status wniosków do wyświetlenia</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <Select name="status" defaultValue={searchParams.status || 'ALL'}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Wszystkie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Wszystkie</SelectItem>
                <SelectItem value="OCZEKUJACY">Oczekujące</SelectItem>
                <SelectItem value="ZAAKCEPTOWANY">Zaakceptowane</SelectItem>
                <SelectItem value="ODRZUCONY">Odrzucone</SelectItem>
              </SelectContent>
            </Select>
          </form>
        </CardContent>
      </Card>

      <ExpenseList userRole="KIEROWNIK" />
    </div>
  )
}
