import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ExpenseDetailsView } from '@/components/ExpenseDetailsView'

export default async function PracownikWniosekPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params
  
  if (!user || user.rola !== 'PRACOWNIK') {
    redirect('/login')
  }

  const wniosek = await prisma.zgloszenieWydatku.findFirst({
    where: { 
      id: parseInt(id),
      uzytkownikId: user.id
    }
  })

  if (!wniosek) {
    redirect('/pracownik/wnioski')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ExpenseDetailsView wniosek={wniosek} />
    </div>
  )
}
