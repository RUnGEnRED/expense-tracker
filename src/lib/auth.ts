import { cookies } from 'next/headers'
import * as jose from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { Rola } from '@prisma/client'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-me'
)

export interface AuthUser {
  id: number
  email: string
  imie: string
  nazwisko: string
  rola: Rola
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function signToken(payload: { userId: number; email: string; rola: string }): Promise<string> {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ userId: number; email: string; rola: Rola } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload as unknown as { userId: number; email: string; rola: Rola }
  } catch {
    return null
  }
}

/**
 * Retrieves the currently logged-in user based on the cookie.
 * Works only in Server Components, Server Actions, and API Routes.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload) return null

    const user = await prisma.uzytkownik.findUnique({
      where: { id: payload.userId },
      select: { 
        id: true, 
        imie: true, 
        nazwisko: true, 
        email: true, 
        rola: true 
      }
    })

    return user as AuthUser | null
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}
