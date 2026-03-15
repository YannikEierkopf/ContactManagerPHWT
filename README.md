# ContactManagerPHWT

Kontaktverwaltung mit Node.js, Express und PostgreSQL.

## Voraussetzungen

- Node.js LTS
- PostgreSQL (lokal)

## Setup

1. Projektordner in VS Code öffnen.
2. Abhängigkeiten installieren:

```bash
npm install
```

3. PostgreSQL-Datenbank anlegen:
- Name: `contact_manager_db`

4. SQL-Skripte ausführen:
- `backend/database/create_table_contact.sql`
- optional: `backend/database/example_data.sql`
- bei bereits bestehenden Daten: 
```
UPDATE users SET username = lower(trim(username));
```

5. `.env` im Projektroot erstellen:

```env
PORT=3000
DB_USER=postgres
DB_NAME=contact_manager_db
DB_PASSWORD=DEIN_POSTGRES_PASSWORT
SESSION_SECRET=DEIN_LANGES_ZUFAELLIGES_SECRET
SESSION_MAX_AGE_MS=300000
SESSION_TABLE_NAME=user_sessions
```

## Starten

```bash
npm start
```

Erwartete Logs:
- `Server runs: http://localhost:3000`
- `Connected to PostgreSQL database`

App im Browser:
- `http://localhost:3000/`

## Session Management

- Sessions werden serverseitig in PostgreSQL gespeichert.
- Session-Tabelle: `user_sessions` (konfigurierbar über SESSION_TABLE_NAME`).
- Login setzt `req.session.user`.
- Logout zerstört die Session serverseitig.

## Häufige Fehler

- `Passwort-Authentifizierung ... fehlgeschlagen (28P01)`
  - `DB_PASSWORD` in `.env` ist falsch.

- `database "contact_manager_db" does not exist`
  - Datenbank wurde noch nicht angelegt.

- `relation ... does not exist`
  - SQL-Skript `create_table_contact.sql` wurde nicht ausgeführt.

- Port 3000 belegt
  - In `.env` `PORT` anpassen (z. B. `3001`).
