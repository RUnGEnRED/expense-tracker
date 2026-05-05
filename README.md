# Expense Tracker - System Zarządzania Wydatkami

Nowoczesna aplikacja webowa do zarządzania i rozliczania wydatków służbowych.

## 🚀 O Projekcie

System umożliwia pracownikom szybkie zgłaszanie wydatków, a kierownikom efektywne ich rozpatrywanie. Aplikacja stawia na przejrzystość danych, bezpieczeństwo oraz nowoczesny interfejs użytkownika typu SaaS.

### Kluczowe Funkcjonalności

#### Panel Pracownika
- **Zgłaszanie wniosków**: Formularz z wyborem kategorii, kwoty i daty.
- **Historia wydatków**: Przejrzysta lista z możliwością wyszukiwania i filtrowania po statusie.
- **Szczegóły wniosku**: Podgląd decyzji kierownika wraz z ewentualnym komentarzem.
- **Edycja i usuwanie**: Możliwość poprawy wniosku, dopóki nie zostanie on rozpatrzony.

#### Panel Kierownika
- **Centrum decyzyjne**: Dashboard z listą wniosków oczekujących na zatwierdzenie.
- **Zarządzanie budżetem**: Statystyki wydatków zespołu i liczba aktywnych pracowników.
- **System recenzji**: Akceptowanie lub odrzucanie wniosków z opcjonalnym komentarzem.
- **Historia decyzji**: Archiwum wszystkich rozpatrzonych zgłoszeń z zaawansowanym filtrowaniem.

#### Bezpieczeństwo i UX
- **Autoryzacja JWT**: Bezpieczne logowanie i zarządzanie sesją.
- **Middleware**: Ochrona tras i walidacja uprawnień na poziomie serwera.
- **Responsive Design**: Pełna obsługa urządzeń mobilnych.
- **Modern UI**: Wykorzystanie animacji Framer Motion oraz komponentów Base UI.

## 🛠️ Stos Technologiczny

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Baza danych**: [SQLite](https://www.sqlite.org/) z [Prisma ORM](https://www.prisma.io/)
- **Stylizacja**: [Tailwind CSS](https://tailwindcss.com/)
- **Ikony**: [Lucide React](https://lucide.dev/)
- **Autentykacja**: [Jose](https://github.com/panva/jose) (JWT)
- **Komponenty**: Radix UI / Base UI

## 📦 Instalacja i Uruchomienie

### Wymagania
- Node.js 18.x lub nowszy
- npm lub yarn

### Kroki instalacji

1. **Sklonuj repozytorium**:
   ```bash
   git clone <url-repozytorium>
   cd expense-tracker
   ```

2. **Skonfiguruj system automatycznie** (Zalecane):
   Uruchom skrypt, który zajmie się wszystkim za Ciebie:
   ```bash
   npm run setup
   ```
   *Skrypt utworzy `.env`, zainstaluje zależności oraz zainicjuje bazę danych.*

3. **Alternatywnie - konfiguracja ręczna**:
   - Zainstaluj paczki: `npm install`
   - Skopiuj `.env.example` do `.env`
   - Zainicjuj bazę: `npx prisma db push`

4. **Uruchom serwer**:
   ```bash
   npm run dev
   ```

### Czyszczenie systemu
Jeśli chcesz zresetować bazę danych i usunąć artefakty budowania, użyj:
```bash
npm run clean
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

## 📂 Struktura Projektu

- `src/app`: Logika tras i stron (App Router).
- `src/components`: Reużywalne komponenty interfejsu.
- `src/lib`: Konfiguracja Prisma, autoryzacji oraz mapowania danych.
- `src/proxy.ts`: Globalna ochrona tras i weryfikacja ról.
- `prisma/`: Schemat bazy danych i migracje.

## Licencja

[MIT](LICENSE)