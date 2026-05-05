import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function IndexPage() {
  const user = await getCurrentUser()
  
  if (user) {
    if (user.rola === 'KIEROWNIK') {
      redirect('/kierownik')
    } else {
      redirect('/pracownik')
    }
  } else {
    redirect('/login')
  }
}
