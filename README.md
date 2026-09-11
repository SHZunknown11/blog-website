# Ink Wave

A blog built with Express and EJS. Posts live in SQLite so nothing gets lost on restart.

## Getting started

```sh
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Login

```
username: admin
password: 1234
```

Logging in lets you write, edit, and delete posts. You can change these via `ADMIN_USER` and `ADMIN_PASS` env vars if you want.

## Stack

- **Express 5** + **EJS** on the backend
- **SQLite** (`better-sqlite3`) for persistence
- **express-session** for login sessions
- Vanilla CSS and JS — no frameworks