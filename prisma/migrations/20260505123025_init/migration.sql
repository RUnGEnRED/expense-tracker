-- CreateTable
CREATE TABLE "uzytkownicy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imie" TEXT NOT NULL,
    "nazwisko" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "haslo" TEXT NOT NULL,
    "rola" TEXT NOT NULL DEFAULT 'PRACOWNIK',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "zgloszenia_wydatkow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nazwa" TEXT NOT NULL,
    "kwota" REAL NOT NULL,
    "dataWydatku" DATETIME NOT NULL,
    "kategoria" TEXT NOT NULL,
    "opis" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OCZEKUJACY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "uzytkownikId" INTEGER NOT NULL,
    CONSTRAINT "zgloszenia_wydatkow_uzytkownikId_fkey" FOREIGN KEY ("uzytkownikId") REFERENCES "uzytkownicy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "uzytkownicy_email_key" ON "uzytkownicy"("email");
