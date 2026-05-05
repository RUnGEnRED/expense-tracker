import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function PracownikPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    redirect('/login')
  }
  
  const user = verifyToken(token)
  if (!user || user.rola !== 'PRACOWNIK') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Pracownika</h1>
        <Link href="/pracownik/wnioski/nowy">
          <Button>Nowy wydatek</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Moje wnioski</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Oczekujące</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Zaakceptowane</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ostatnie wnioski</h2>
          <Link href="/pracownik/wnioski">
            <Button variant="outline" size="sm">Zobacz wszystkie</Button>
          </Link>
        </div>
        <p className="text-gray-500 text-center py-8">
          Brak wniosków do wyświetlenia
        </p>
      </div>
    </div>
  )
}
