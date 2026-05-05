'use server'

import { PrismaClient } from '@prisma/client'
import { hashPassword, verifyPassword, signToken, setAuthCookie, removeAuthCookie } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email i hasło są wymagane' }
  }

  const user = await prisma.uzytkownik.findUnique({
    where: { email }
  })

  if (!user) {
    return { error: 'Nieprawidłowy email lub hasło' }
  }

  const isValid = await verifyPassword(password, user.haslo)
  if (!isValid) {
    return { error: 'Nieprawidłowy email lub hasło' }
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    rola: user.rola
  })

  // Ustaw ciasteczko
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })

  // Przekieruj w zależności od roli
  if (user.rola === 'KIEROWNIK') {
    redirect('/kierownik')
  } else {
    redirect('/pracownik')
  }
}

export async function registerAction(formData: FormData) {
  const imie = formData.get('imie') as string
  const nazwisko = formData.get('nazwisko') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rola = formData.get('rola') as 'PRACOWNIK' | 'KIEROWNIK'

  if (!imie || !nazwisko || !email || !password) {
    return { error: 'Wszystkie pola są wymagane' }
  }

  // Sprawdź czy użytkownik już istnieje
  const existingUser = await prisma.uzytkownik.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: 'Użytkownik z tym emailem już istnieje' }
  }

  const hashedPassword = await hashPassword(password)

  const user = await prisma.uzytkownik.create({
    data: {
      imie,
      nazwisko,
      email,
      haslo: hashedPassword,
      rola: rola || 'PRACOWNIK'
    }
  })

  const token = signToken({
    userId: user.id,
    email: user.email,
    rola: user.rola
  })

  // Ustaw ciasteczko
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })

  if (user.rola === 'KIEROWNIK') {
    redirect('/kierownik')
  } else {
    redirect('/pracownik')
  }
}

export async function logoutAction() {
  'use server'
  const cookieStore = await cookies()
  cookieStore.delete('token')
  redirect('/login')
}

  const user = await prisma.uzytkownik.findUnique({
    where: { email }
  })

  if (!user) {
    return { error: 'Nieprawidłowy email lub hasło' }
  }

  const isValid = await verifyPassword(password, user.haslo)
  if (!isValid) {
    return { error: 'Nieprawidłowy email lub hasło' }
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    rola: user.rola
  })

  // Przekieruj w zależności od roli
  const redirectTo = user.rola === 'KIEROWNIK' ? '/kierownik' : '/pracownik'
  
  // Zwróć wynik do formularza
  return { success: true, redirectTo, token }
}

export async function registerAction(formData: FormData) {
  const imie = formData.get('imie') as string
  const nazwisko = formData.get('nazwisko') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rola = formData.get('rola') as 'PRACOWNIK' | 'KIEROWNIK'

  if (!imie || !nazwisko || !email || !password) {
    return { error: 'Wszystkie pola są wymagane' }
  }

  // Sprawdź czy użytkownik już istnieje
  const existingUser = await prisma.uzytkownik.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: 'Użytkownik z tym emailem już istnieje' }
  }

  const hashedPassword = await hashPassword(password)

  const user = await prisma.uzytkownik.create({
    data: {
      imie,
      nazwisko,
      email,
      haslo: hashedPassword,
      rola: rola || 'PRACOWNIK'
    }
  })

  const token = signToken({
    userId: user.id,
    email: user.email,
    rola: user.rola
  })

  const redirectTo = user.rola === 'KIEROWNIK' ? '/kierownik' : '/pracownik'
  return { success: true, redirectTo, token }
}

export async function logoutAction() {
  redirect('/login')
}
