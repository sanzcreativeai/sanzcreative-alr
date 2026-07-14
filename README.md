# SANZCREATIVE ALR
### Automated Lead Records — v1.0 Phase 1

A production-ready multi-client lead management platform built for SANZCREATIVE digital marketing agency. Manages Facebook and Instagram Lead Ads across multiple clients.

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd sanzcreative-alr
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, **never expose to browser**

### 3. Set up Supabase database

1. Open your Supabase project → SQL Editor
2. Run `supabase/schema.sql` — creates all tables, indexes, RLS policies, and demo clients/campaigns
3. Create your first user via Supabase Auth → Authentication → Add user
4. Set that user as super_admin:
   ```sql
   update public.profiles set role = 'super_admin' where email = 'your@email.com';
   ```
5. Run `supabase/demo-leads.sql` to add demo lead records

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
sanzcreative-alr/
├── app/
│   ├── login/           # Login page
│   ├── dashboard/       # Admin dashboard with stats
│   ├── leads/           # Leads table + [id] detail view
│   ├── clients/         # Client management
│   ├── campaigns/       # Campaign management
│   ├── settings/        # Settings + Meta integration placeholder
│   └── api/
│       ├── meta/
│       │   ├── webhook/ # Meta webhook receiver (Phase 2)
│       │   ├── leads/   # Meta Graph API caller (Phase 2)
│       │   └── connect/ # Meta OAuth flow (Phase 2)
│       └── leads/       # Supabase CRUD for leads
├── components/
│   ├── layout/          # Sidebar, Header, AppLayout
│   ├── ui/              # StatusBadge, EmptyState, LoadingSpinner, PlatformBadge
│   └── dashboard/       # StatCard
├── lib/
│   ├── supabase/        # client.ts + server.ts (never mix these up!)
│   ├── demo-data.ts     # Demo data (development only)
│   └── utils.ts         # cn(), formatDate(), status helpers
├── types/index.ts       # All TypeScript types
├── supabase/
│   ├── schema.sql       # Full database schema + RLS
│   └── demo-leads.sql   # Demo lead records
└── middleware.ts        # Auth-protected routes
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Super Admin** | All clients, all leads, all campaigns, settings, user management |
| **Client User** | Only their own client's leads and campaigns |

Security is enforced by **Supabase Row Level Security (RLS)** at the database level — not just the frontend.

---

## 🔗 Meta Integration (Phase 2)

The backend API routes are scaffolded and ready for Phase 2 connection:

| Route | Purpose |
|---|---|
| `GET /api/meta/webhook` | Webhook verification handshake |
| `POST /api/meta/webhook` | Receive lead events from Meta |
| `POST /api/meta/leads` | Retrieve lead data from Meta Graph API |
| `GET /api/meta/connect` | Initiate Meta OAuth flow |

**Phase 2 steps:**
1. Create a Meta App in [developers.facebook.com](https://developers.facebook.com)
2. Add `META_APP_ID`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN` to environment variables
3. Configure webhook URL in Meta App: `https://your-domain.com/api/meta/webhook`
4. Subscribe to `leadgen` events on each client's Facebook Page
5. Connect client pages via Settings → Meta Integration

---

## 🔐 Security Notes

- ✅ Supabase RLS enforced on all tables
- ✅ `SUPABASE_SERVICE_ROLE_KEY` only used in server-side API routes
- ✅ Meta tokens referenced by key only — raw tokens never stored in the DB
- ✅ Middleware protects all routes (redirects unauthenticated users to `/login`)
- ✅ `meta_lead_id` unique constraint prevents duplicate leads
- ✅ Client users can never see another client's data (DB level, not just UI)

---

## 🌐 Deploy to Vercel

```bash
vercel deploy
```

Add all environment variables in Vercel → Project Settings → Environment Variables.

---

## 📊 Database Schema

7 tables with full RLS:
- `profiles` — User accounts linked to Supabase Auth
- `clients` — Agency clients
- `campaigns` — Lead ad campaigns with Meta IDs
- `leads` — Individual leads with Meta form data (JSONB)
- `lead_notes` — Internal follow-up notes
- `lead_status_history` — Immutable audit log of status changes
- `meta_connections` — Meta page OAuth connections (Phase 2)

---

*SANZCREATIVE ALR · Phase 1 Complete · Ready for Supabase connection*
