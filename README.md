# DWS Backend (Express + Postgres)

## Local
Copy env:
- cp .env.example .env   (PowerShell: Copy-Item .env.example .env)

Install:
- npm install

Run:
- npm run dev

## DB setup (Railway)
Run SQL in:
src/sql/migrations/001_create_users.sql

Seed admin:
- npm run seed:admin

## Endpoints
GET  /health
POST /api/auth/login
GET  /api/auth/me (Bearer token)