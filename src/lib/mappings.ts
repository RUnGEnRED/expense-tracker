import { Rola, StatusWniosku, KategoriaWydatku } from '@prisma/client'

export const ROLA_LABELS: Record<Rola, string> = {
  PRACOWNIK: 'Pracownik',
  KIEROWNIK: 'Kierownik',
}

export const STATUS_LABELS: Record<StatusWniosku, string> = {
  OCZEKUJACY: 'Oczekujący',
  ZAAKCEPTOWANY: 'Zaakceptowany',
  ODRZUCONY: 'Odrzucony',
}

export const KATEGORIA_LABELS: Record<KategoriaWydatku, string> = {
  TRANSPORT: 'Transport',
  ZAKWATEROWANIE: 'Zakwaterowanie',
  WYZYWIENIE: 'Wyżywienie',
  INNE: 'Inne',
}

export function formatKwota(kwota: number) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(kwota)
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('pl-PL')
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString('pl-PL')
}
