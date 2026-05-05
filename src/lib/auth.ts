import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const prisma = new PrismaClient()

export interface AuthUser {
  id: number
  email: string
  imie: string
  nazwisko: string
  rola: string
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function signToken(payload: { userId: number; email: string; rola: string }): string {
  const secret = process.env.JWT_SECRET!
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const secret = process.env.JWT_SECRET!
    const decoded = jwt.verify(token, secret) as { userId: number; email: string; rola: string }
    
    return {
      id: decoded.userId,
      email: decoded.email,
      imie: '',
      nazwisko: '',
      rola: decoded.rola
    }
  } catch {
    return null
  }
}

export async function getAuthenticatedUser(token: string): Promise<AuthUser | null> {
  try {
    const secret = process.env.JWT_SECRET!
    const decoded = jwt.verify(token, secret) as { userId: number; email: string; rola: string }
    
    const user = await prisma.uzytkownik.findUnique({
      where: { id: decoded.userId },
      select: { id: true, imie: true, nazwisko: true, email: true, rola: true }
    })
    
    return user
  } catch {
    return null
  }
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

export function removeAuthCookie(response: NextResponse): void {
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
}

export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  
  return await getAuthenticatedUser(token)
}
