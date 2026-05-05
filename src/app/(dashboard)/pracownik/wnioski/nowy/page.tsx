import { ExpenseForm } from '@/components/ExpenseForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NowyWydatekPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pracownik/wnioski">
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Wróć do listy
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nowy wydatek</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dodaj nowy wydatek</CardTitle>
          <CardDescription>
            Wypełnij formularz, aby zgłosić nowy wydatek służbowy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>
    </div>
  )
}
