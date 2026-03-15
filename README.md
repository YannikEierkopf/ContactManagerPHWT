# ContactManagerPHWT

## Kurzbeschreibung

ContactManagerPHWT ist eine **Kontaktverwaltungs‑App** (Monorepo) mit:
- **Frontend**: statische HTML/CSS/JS-Seiten (keine Frameworks).
- **Backend**: Node.js + Express + PostgreSQL (REST-API + Session-Management).
- **DB**: Benutzer, Kontakte und Session-Speicherung.

## Projektstruktur (Monorepo)

- `backend/` – Express-Server, API-Routen, PostgreSQL-Zugriff.
- `frontend/` – HTML/JS/CSS für Login, Dashboard, Kontakte, Footer.
- `backend/database/` – SQL-Skripte für Schema + Beispiel-Daten.

## Umgesetzte Anforderungen

- Benutzerregistrierung (Signup) + Login (Sessions).
- Sessions werden serverseitig in PostgreSQL (`connect-pg-simple`) gespeichert.
- Sichere Passwortspeicherung mit `bcrypt`.
- Rollen: `admin` + `user` (Admin kann weitere User/Admins anlegen).
- CRUD für Kontakte (Erstellen / Bearbeiten / Löschen / Auflisten).
- Jeder Nutzer sieht nur eigene Kontakte (Zugriffsprüfung in API).
- Rate limiting für Authentifizierung (Brute‑Force‑Schutz).
- SQL-Prepared-Statements (keine SQL-Injection).
- `.gitignore` vorhanden (keine sensiblen Daten wie `.env`).

## Nicht umgesetzte (Kann-) Anforderungen

- Als Benutzer besteht nicht die Möglichkeit Kontakte nach Kategorie filtern zu können (z. B. privat, beruflich), um bestimmte Kontakte schneller zu finden.

---

## Lokale Installation & Start

### 1) Repository klonen

```bash
git clone https://github.com/YannikEierkopf/ContactManagerPHWT.git
cd ContactManagerPHWT
```

### 2) Abhängigkeiten installieren

```bash
npm install
```

### 3) PostgreSQL-Datenbank einrichten

1. Datenbank anlegen (z. B.):

```sql
CREATE DATABASE contact_manager_db;
```

2. Datenbank-Schema erstellen:


### 3) `.env` anlegen

Kopiere `.env.example` nach `.env` und passe die Werte an.

```env
PORT=3000
DB_USER=postgres
DB_NAME=contact_manager_db
DB_PASSWORD=DEIN_POSTGRES_PASSWORT
SESSION_SECRET=DEIN_LANGES_ZUFÄLLIGES_SECRET
SESSION_MAX_AGE_MS=300000
```

### 4) Anwendung starten

```bash
node backend/server.js
```

Erwartete Logs:
- `Server runs: http://localhost:3000`
- `Connected to PostgreSQL database`

---

## Nutzung / Hinweise zur Anwendung

- Startseite: `http://localhost:3000/` (Login).
- Nach Login: Dashboard (Kontakte verwalten).
- Kontaktfelder: Standardfelder + eigene Zusatzfelder (dynamisch als JSON gespeichert).
- API-Endpunkte (Beispiele):
  - `POST /api/signup` – neuer Benutzer
  - `POST /login` – Login & Session
  - `POST /create/contact` – Kontakt erstellen
  - `POST /edit/contact` – Kontakt bearbeiten
  - `POST /delete/contact` – Kontakt löschen
  - `GET /api/contacts/:id` – Kontaktdaten (bearbeiten)

### Admin-Funktionen

- Admin kann weitere Benutzer anlegen über das Dashboard mit dem Endpunkt`POST /api/users`.
- Rolle `admin` wird benötigt sowie eine `valide session`, um diesen Endpunkt erfolgreich aufzurufen.

### Session-Verhalten

- Sessions werden in der Tabelle `user_sessions` (konfigurierbar) gespeichert.
- Logout zerstört Session serverseitig und entfernt Cookie.

---

## Häufige Fehler / Troubleshooting

- **`Passwort-Authentifizierung ... fehlgeschlagen`**
  - `DB_PASSWORD` in `.env` falsch.

- **`database "contact_manager_db" does not exist`**
  - Datenbank wurde nicht angelegt.

- **`relation ... does not exist`**
  - SQL-Schema wurde nicht angelegt.

- **Port 3000 belegt**
  - In `.env` `PORT` anpassen (z. B. `3001`).
