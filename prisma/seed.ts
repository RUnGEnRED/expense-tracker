import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient, KategoriaWydatku } from '@prisma/client'
import { hash } from 'bcryptjs'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaBetterSqlite3({ url: connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Rozpoczynam seed danych...')

  // Hashowanie haseł
  const pracownikHaslo = await hash('pracownik123', 10)
  const kierownikHaslo = await hash('kierownik123', 10)

  // Utworzenie pracownika
  const pracownik = await prisma.uzytkownik.upsert({
    where: { email: 'pracownik@expense-tracker.pl' },
    update: {},
    create: {
      imie: 'Jan',
      nazwisko: 'Kowalski',
      email: 'pracownik@expense-tracker.pl',
      haslo: pracownikHaslo,
      rola: 'PRACOWNIK',
    },
  })
  console.log(`Utworzono pracownika: ${pracownik.imie} ${pracownik.nazwisko}`)

  // Utworzenie kierownika
  const kierownik = await prisma.uzytkownik.upsert({
    where: { email: 'kierownik@expense-tracker.pl' },
    update: {},
    create: {
      imie: 'Anna',
      nazwisko: 'Nowak',
      email: 'kierownik@expense-tracker.pl',
      haslo: kierownikHaslo,
      rola: 'KIEROWNIK',
    },
  })
  console.log(`Utworzono kierownika: ${kierownik.imie} ${kierownik.nazwisko}`)

  // Przykładowe wnioski dla pracownika
  const wnioski = [
    {
      nazwa: 'Delegacja do Warszawy',
      kwota: 350.50,
      dataWydatku: new Date('2026-04-15'),
      kategoria: KategoriaWydatku.TRANSPORT,
      opis: 'Bilet kolejowy PKP',
      status: 'ZAAKCEPTOWANY' as const,
      uzytkownikId: pracownik.id,
    },
    {
      nazwa: 'Nocleg w hotelu',
      kwota: 450.00,
      dataWydatku: new Date('2026-04-15'),
      kategoria: KategoriaWydatku.ZAKWATEROWANIE,
      opis: 'Hotel dla biznesu',
      status: 'OCZEKUJACY' as const,
      uzytkownikId: pracownik.id,
    },
    {
      nazwa: 'Obiad służbowy',
      kwota: 120.00,
      dataWydatku: new Date('2026-04-16'),
      kategoria: KategoriaWydatku.WYZYWIENIE,
      opis: 'Restauracja podczas spotkania',
      status: 'ODRZUCONY' as const,
      uzytkownikId: pracownik.id,
    },
  ]

  for (const wniosek of wnioski) {
    await prisma.zgloszenieWydatku.create({
      data: wniosek,
    })
  }
  console.log(`Dodano ${wnioski.length} przykładowych wniosków`)

  console.log('Seed zakończony pomyślnie!')
  console.log('\nDane do logowania:')
  console.log('Pracownik: pracownik@expense-tracker.pl / pracownik123')
  console.log('Kierownik: kierownik@expense-tracker.pl / kierownik123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
