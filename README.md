# Ilya Like That - A Personal Wishlist

The goal of this project was to create a simple website with a personal wishlist. It allows authorized users (friends and family) to "book" a gift, ensuring that presents aren't duplicated.

## Features

🎁 Gift Booking System: To avoid duplicates, guests can "book" a gift, marking it as reserved for everyone else to see.

🔄 Flexible Reservation Management: Changed your mind or found something better? You can easily cancel your reservation on an item at any time.

🎉 No Limits: Guests are welcome to reserve as many gifts as they wish, with no limitations.

## Tech Stack

- Framework: Next.js
- UI Library: React
- Authentication: NextAuth.js
- CMS & Database: Payload CMS with Postgres - stores gifts and their booking status
- Styling: Tailwind CSS, Radix UI, Lucide React

## Environment Variables

All required environment variables are listed in [`.env.example`](.env.example). To set up the project on a new machine or server:

```bash
cp .env.example .env
```

Then replace the placeholder values with real ones. The real `.env` is git-ignored and must never be committed. When you add a new environment variable, add it to `.env.example` as well.

### Local overrides

`.env` holds the production values used on deploy. To use different values locally, put them in `.env.development.local`. `npm run dev` loads it on top of `.env`, but production builds (`next build` / Docker) ignore it. It is git-ignored too. Payload's CLI (`npm run migrate`) reads it as well.

```bash
# .env.development.local
# So Google login returns to your machine instead of production
NEXTAUTH_URL=http://localhost:3000
# Local Postgres from docker-compose.yml (production builds its own from DB_* values)
DATABASE_URI=postgres://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME>
```

## Running the Project

### Local development (Mac)

`docker-compose.yml` starts only Postgres, exposed on `localhost:5432` so you can connect with DB tools. Next.js runs on the host:

```bash
docker compose up -d
npm run dev
```

In `.env.development.local`, `DATABASE_URI` should point to `localhost:5432` (see [Local overrides](#local-overrides)).

### Production (Hetzner server)

`docker-compose.prod.yml` builds the app in production mode and serves it on port `3005`. The database has no published ports, so it is not reachable from the internet. `DATABASE_URI` is overridden automatically to use the internal `db` host.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
