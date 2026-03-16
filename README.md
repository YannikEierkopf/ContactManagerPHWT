# ContactManagerPHWT

## Kurzbeschreibung

ContactManagerPHWT ist eine **Kontaktverwaltungs‑App** (Monorepo) mit:
- **Frontend**: HTML/CSS/JS-Seiten.
- **Backend**: Node.js + Express + PostgreSQL (REST-API + Session-Management).
- **DB**: Benutzer, Kontakte und Session-Speicherung.

## Projektstruktur (Monorepo)

- `backend/` – Express-Server, API-Routen, PostgreSQL-Zugriff.
- `frontend/` – HTML/JS/CSS individuell pro Segment mit zentraler CSS.
- `backend/database/` – SQL-Skripte für Schema + Beispiel-Daten.

## Umgesetzte Anforderungen

- [MUSS] Als Admin möchte ich statisch User anlegen können, damit Benutzer sich authentifizieren können.

- [MUSS] Als Benutzer möchte ich mich einloggen können, damit ich Zugriff auf meine Kontakte habe.

- [KANN] Als Benutzer möchte ich ausgeloggt werden können, um mein Konto zu schützen.

👥 Contact Management

- [MUSS] Als Benutzer möchte ich neue Kontakte anlegen können, um meine Kontakte zu verwalten.

- [MUSS] Als Benutzer möchte ich Kontakte bearbeiten können, um Änderungen vorzunehmen.

- [MUSS] Als Benutzer möchte ich Kontakte löschen können, damit veraltete oder fehlerhafte Einträge entfernt werden.

- [MUSS] Als Benutzer möchte ich alle meine Kontakte in einer Liste sehen können, um einen Überblick zu haben.

- [MUSS] Als Benutzer möchte ich nach Kontakten suchen können (z. B. nach Name oder E-Mail).

📄 Contact Detail

- [MUSS] Als Benutzer möchte ich eine Detailansicht eines Kontakts sehen können, um alle Informationen einzusehen.

- [MUSS] Als Benutzer möchte ich zu meinen Kontakten eigene Felder hinzufügen können (z. B. Geburtstag, Adresse).

🧪 Validation

- [MUSS] Als Benutzer möchte ich Fehlermeldungen erhalten, wenn Eingabefelder ungültig sind.

## Nicht umgesetzte (Kann-) Anforderungen

[KANN] Als Benutzer möchte ich Kontakte nach Kategorie filtern können (z. B. privat, beruflich), um bestimmte Kontakte schneller zu finden.

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

1. Datenbank anlegen (z.B.):

Datenbank in der postgreSQL-Shell anlegen.

```sql
CREATE DATABASE contact_manager_db;
```

2. Datenbank-Schema erstellen:

Schema anhand des SQL-Skriptes `create_database_schema.sql` in der postgreSQL-Shell anlegen.

```bash
\i "backend/database/create_database_schema.sql";
```

### 3) `.env` anlegen

Kopiere `.env.example` nach `.env` und passe die Werte an.

```env
PORT=3000
DB_USER=DEIN_POSTGRES_USERNAME
DB_NAME=DEIN_DATENBANK_NAME
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
  - `POST /signup` – neuer Benutzer
  - `POST /login` – Login & Session
  - `POST /create/contact` – Kontakt erstellen
  - `POST /edit/contact` – Kontakt bearbeiten
  - `POST /delete/contact` – Kontakt löschen
  - `GET /contacts/:id` – Kontaktdaten (bearbeiten)

### Admin-Funktionen

- Admin kann weitere Benutzer anlegen über das Dashboard mit dem Endpunkt`POST /api/users`.
- Rolle `admin` wird benötigt sowie eine `valide session`, um diesen Endpunkt erfolgreich aufzurufen.

### Session-Verhalten

- Sessions werden in der Tabelle `user_sessions` (konfigurierbar) gespeichert.
- Logout zerstört Session serverseitig und entfernt Cookie.

---

## Häufige Fehler / Troubleshooting

**`Passwort-Authentifizierung ... fehlgeschlagen`**
  - `DB_PASSWORD` in `.env` falsch.

**`database "contact_manager_db" does not exist`**
  - Datenbank wurde nicht angelegt.

**`relation ... does not exist`**
  - SQL-Schema wurde nicht angelegt.
  - Oder in der falschen Datenbank angelegt.

**`Port 3000 belegt`**
  - In `.env` `PORT` anpassen (z. B. `3001`).
