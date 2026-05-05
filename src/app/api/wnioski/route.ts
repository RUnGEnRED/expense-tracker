import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const tylkoOczekujace = searchParams.get('oczekujace') === 'true'

  try {
    let wnioski
    
    if (user.rola === 'KIEROWNIK') {
      const where: any = {}
      if (status) where.status = status
      if (tylkoOczekujace) where.status = 'OCZEKUJACY'
      
      wnioski = await prisma.zgloszenieWydatku.findMany({
        where,
        include: {
          uzytkownik: {
            select: { id: true, imie: true, nazwisko: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      const where: any = { uzytkownikId: user.userId }
      if (status) where.status = status
      
      wnioski = await prisma.zgloszenieWydatku.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(wnioski)
  } catch (error) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user || user.rola !== 'PRACOWNIK') {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { nazwa, kwota, dataWydatku, kategoria, opis } = body

    if (!nazwa || !kwota || !dataWydatku || !kategoria) {
      return NextResponse.json({ error: 'Brak wymaganych pól' }, { status: 400 })
    }

    const wniosek = await prisma.zgloszenieWydatku.create({
      data: {
        nazwa,
        kwota: parseFloat(kwota),
        dataWydatku: new Date(dataWydatku),
        kategoria,
        opis,
        uzytkownikId: user.userId
      }
    })

    return NextResponse.json(wniosek, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
