import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 })
  }

  const { id } = await params

  try {
    const wniosek = await prisma.zgloszenieWydatku.findFirst({
      where: { id: parseInt(id) },
      include: {
        uzytkownik: {
          select: { id: true, imie: true, nazwisko: true, email: true }
        }
      }
    })

    if (!wniosek) {
      return NextResponse.json({ error: 'Nie znaleziono wniosku' }, { status: 404 })
    }

    if (user.rola === 'PRACOWNIK' && wniosek.uzytkownikId !== user.userId) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
    }

    return NextResponse.json(wniosek)
  } catch (error) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Nieprawidłowy token' }, { status: 401 })
  }

  const { id } = await params

  try {
    const wniosek = await prisma.zgloszenieWydatku.findFirst({
      where: { id: parseInt(id) }
    })

    if (!wniosek) {
      return NextResponse.json({ error: 'Nie znaleziono wniosku' }, { status: 404 })
    }

    const body = await request.json()

    if (user.rola === 'KIEROWNIK') {
      const { status } = body
      if (!status || !['ZAAKCEPTOWANY', 'ODRZUCONY'].includes(status)) {
        return NextResponse.json({ error: 'Nieprawidłowy status' }, { status: 400 })
      }

      const zaktualizowany = await prisma.zgloszenieWydatku.update({
        where: { id: parseInt(id) },
        data: { status }
      })

      return NextResponse.json(zaktualizowany)
    }

    if (wniosek.uzytkownikId !== user.userId) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
    }

    if (wniosek.status !== 'OCZEKUJACY') {
      return NextResponse.json({ error: 'Można edytować tylko wnioski o statusie OCZEKUJACY' }, { status: 400 })
    }

    const { nazwa, kwota, dataWydatku, kategoria, opis } = body

    const zaktualizowany = await prisma.zgloszenieWydatku.update({
      where: { id: parseInt(id) },
      data: {
        ...(nazwa && { nazwa }),
        ...(kwota && { kwota: parseFloat(kwota) }),
        ...(dataWydatku && { dataWydatku: new Date(dataWydatku) }),
        ...(kategoria && { kategoria }),
        ...(opis !== undefined && { opis })
      }
    })

    return NextResponse.json(zaktualizowany)
  } catch (error) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const user = await verifyToken(token)
  if (!user || user.rola !== 'PRACOWNIK') {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
  }

  const { id } = await params

  try {
    const wniosek = await prisma.zgloszenieWydatku.findFirst({
      where: { id: parseInt(id) }
    })

    if (!wniosek) {
      return NextResponse.json({ error: 'Nie znaleziono wniosku' }, { status: 404 })
    }

    if (wniosek.uzytkownikId !== user.userId) {
      return NextResponse.json({ error: 'Brak uprawnień' }, { status: 403 })
    }

    if (wniosek.status !== 'OCZEKUJACY') {
      return NextResponse.json({ error: 'Można anulować tylko wnioski o statusie OCZEKUJACY' }, { status: 400 })
    }

    await prisma.zgloszenieWydatku.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
