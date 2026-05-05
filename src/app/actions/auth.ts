'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, signToken } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

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

  const token = await signToken({
    userId: user.id,
    email: user.email,
    rola: user.rola
  })

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })

  // Redirect based on role
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

  // Check if user already exists
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

  const token = await signToken({
    userId: user.id,
    email: user.email,
    rola: user.rola
  })

  // Set cookie
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
  const cookieStore = await cookies()
  cookieStore.delete('token')
  redirect('/login')
}
