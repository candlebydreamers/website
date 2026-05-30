# Candles by Dreamers

Premium hand-poured scented candles e-commerce store built with React, TypeScript, and Supabase.

## Tech Stack

- **Frontend** — React 18, TypeScript, Vite, TailwindCSS
- **Backend** — Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments** — Razorpay (server-side order creation + HMAC signature verification)
- **Animations** — Framer Motion
- **Routing** — React Router v6
- **Deployment** — Vercel (frontend), Supabase Cloud (backend)

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase CLI (for edge function deployment)
- A Supabase project
- A Razorpay account

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/candlebydreamers/website.git
cd website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Admin Credentials
VITE_ADMIN_EMAIL=
VITE_ADMIN_PASSWORD=

# Razorpay (public key only — secret key goes in Supabase Edge Function Secrets)
VITE_RAZORPAY_KEY_ID=
```

> **Important:** The Razorpay secret key is never stored in `.env`. It is set as a Supabase Edge Function secret via the Supabase Dashboard.

### 4. Set up the database

Run the SQL migration files from `supabase/migrations/` in your Supabase SQL Editor in order:

1. `20260528000000_init_candles_by_dreamers.sql` — Creates all tables, RLS policies, and seeds initial data
2. `20260530000000_secure_order_rls.sql` — Tightens order security for Razorpay integration

### 5. Deploy Edge Functions

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy create-razorpay-order --no-verify-jwt
supabase functions deploy verify-razorpay-payment --no-verify-jwt
```

Also set these secrets in the Supabase Dashboard under **Edge Functions → Secrets**:

| Secret Name | Description |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key |

### 6. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 7. Build for production

```bash
npm run build
```

## Environment Variables Reference

| Variable | Where It's Used | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anonymous/public key |
| `VITE_ADMIN_EMAIL` | Frontend | Admin panel login email |
| `VITE_ADMIN_PASSWORD` | Frontend | Admin panel login password |
| `VITE_RAZORPAY_KEY_ID` | Frontend | Razorpay public key (opens checkout popup) |
| `RAZORPAY_KEY_ID` | Edge Functions | Razorpay Key ID (server-side) |
| `RAZORPAY_KEY_SECRET` | Edge Functions | Razorpay Secret Key (server-side, never in browser) |

## Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, banners, logos
│   ├── components/        # Reusable UI components
│   ├── context/           # React context (Cart)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Supabase client, utilities
│   └── pages/             # Route pages
├── supabase/
│   ├── functions/         # Edge Functions (Razorpay integration)
│   └── migrations/        # SQL migration files
└── index.html
```

## License

All rights reserved. © 2026 Candles by Dreamers.
