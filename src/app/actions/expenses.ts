'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { KategoriaWydatku, StatusWniosku } from '@prisma/client'

export async function createExpenseAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.rola !== 'PRACOWNIK') {
    return { error: 'Brak uprawnień' }
  }

  const nazwa = formData.get('nazwa') as string
  const kwota = parseFloat(formData.get('kwota') as string)
  const dataWydatku = new Date(formData.get('dataWydatku') as string)
  const kategoria = formData.get('kategoria') as KategoriaWydatku
  const opis = formData.get('opis') as string

  if (!nazwa || isNaN(kwota) || !dataWydatku || !kategoria) {
    return { error: 'Nieprawidłowe dane formularza' }
  }

  if (kwota <= 0) {
    return { error: 'Kwota wydatku musi być większa od zera' }
  }

  try {
    await prisma.zgloszenieWydatku.create({
      data: {
        nazwa,
        kwota,
        dataWydatku,
        kategoria,
        opis,
        uzytkownikId: user.id,
        status: 'OCZEKUJACY'
      }
    })

    revalidatePath('/pracownik')
    revalidatePath('/pracownik/wnioski')
  } catch (error) {
    console.error('Błąd tworzenia wydatku:', error)
    return { error: 'Błąd bazy danych' }
  }

  redirect('/pracownik/wnioski')
}

export async function updateExpenseAction(id: number, formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.rola !== 'PRACOWNIK') {
    return { error: 'Brak uprawnień' }
  }

  try {
    const expense = await prisma.zgloszenieWydatku.findUnique({
      where: { id }
    })

    if (!expense) return { error: 'Nie znaleziono wydatku' }
    if (expense.uzytkownikId !== user.id) return { error: 'Brak uprawnień' }
    if (expense.status !== 'OCZEKUJACY') return { error: 'Nie można edytować rozpatrzonego wniosku' }

    const nazwa = formData.get('nazwa') as string
    const kwota = parseFloat(formData.get('kwota') as string)
    const dataWydatku = new Date(formData.get('dataWydatku') as string)
    const kategoria = formData.get('kategoria') as KategoriaWydatku
    const opis = formData.get('opis') as string

    await prisma.zgloszenieWydatku.update({
      where: { id },
      data: {
        nazwa,
        kwota,
        dataWydatku,
        kategoria,
        opis
      }
    })

    revalidatePath('/pracownik')
    revalidatePath('/pracownik/wnioski')
    revalidatePath(`/pracownik/wnioski/${id}`)
    
    return { success: true }
  } catch (error) {
    return { error: 'Błąd serwera' }
  }
}

export async function deleteExpenseAction(id: number) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Brak autoryzacji' }

  try {
    const expense = await prisma.zgloszenieWydatku.findUnique({
      where: { id }
    })

    if (!expense) return { error: 'Nie znaleziono wydatku' }

    if (user.rola === 'PRACOWNIK') {
      if (expense.uzytkownikId !== user.id) return { error: 'Brak uprawnień' }
      if (expense.status !== 'OCZEKUJACY') return { error: 'Nie można usunąć rozpatrzonego wniosku' }
    }

    await prisma.zgloszenieWydatku.delete({
      where: { id }
    })

    revalidatePath('/pracownik')
    revalidatePath('/pracownik/wnioski')
    revalidatePath('/kierownik')
    
    return { success: true }
  } catch (error) {
    return { error: 'Błąd serwera' }
  }
}

export async function reviewExpenseAction(id: number, status: StatusWniosku, komentarz?: string) {
  const user = await getCurrentUser()
  if (!user || user.rola !== 'KIEROWNIK') {
    return { error: 'Tylko kierownik może rozpatrywać wnioski' }
  }

  try {
    const expense = await prisma.zgloszenieWydatku.findUnique({
      where: { id }
    })

    if (!expense) return { error: 'Nie znaleziono wniosku' }
    if (expense.status !== 'OCZEKUJACY') return { error: 'Ten wniosek został już rozpatrzony' }
    
    // Prevent self-approval (if a manager submitted a request as an employee)
    if (expense.uzytkownikId === user.id) {
      return { error: 'Nie możesz rozpatrywać własnego wniosku' }
    }

    await prisma.zgloszenieWydatku.update({
      where: { id },
      data: { 
        status,
        komentarzKierownika: komentarz,
        rozpatrzonyPrzezId: user.id
      }
    })

    revalidatePath('/kierownik')
    revalidatePath('/pracownik')
    revalidatePath('/pracownik/wnioski')
    revalidatePath(`/pracownik/wnioski/${id}`)
    
    return { success: true }
  } catch (error) {
    return { error: 'Błąd serwera' }
  }
}
