# SANZCREATIVE ALR — Supabase Setup Guide

## Step-by-step instructions to connect your database

---

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization, name the project `sanzcreative-alr`, set a strong database password
4. Select a region close to your users (e.g. `ap-south-1` for India)
5. Click **Create new project** — wait ~2 minutes

---

### 2. Get your API keys

In your Supabase project:
1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Server only

---

### 3. Run the database schema

1. In Supabase → **SQL Editor → New query**
2. Paste and run the entire contents of `supabase/schema.sql`
3. You should see: ✅ Success — all tables, enums, RLS policies created

---

### 4. Create your Super Admin user

In Supabase → **Authentication → Users → Add user**:
- Email: `admin@sanzcreative.com` (or your real email)
- Password: strong password
- Click **Create user**

Then in **SQL Editor**:
```sql
update public.profiles
set role = 'super_admin'
where email = 'admin@sanzcreative.com';
```

---

### 5. Load demo data (optional)

In **SQL Editor**, paste and run `supabase/demo-leads.sql`

This adds 8 demo leads across 3 clients and 5 campaigns.

---

### 6. Create client users (optional)

For each client who needs their own login:

1. **Authentication → Users → Add user** with their email
2. Get their profile ID from the `profiles` table
3. Run:
```sql
update public.profiles
set
  role = 'client_user',
  client_id = 'a0000001-0000-0000-0000-000000000001'  -- replace with real client UUID
where email = 'client@example.com';
```

Client users will automatically only see their own leads.

---

### 7. Configure environment variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 8. Test locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

Log in with your super admin credentials.

---

### 9. Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo to Vercel and add the environment variables in:
**Vercel → Project → Settings → Environment Variables**

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (set to your production URL)

---

### Generating TypeScript types (optional but recommended)

After any schema changes, regenerate types:

```bash
npx supabase gen types typescript \
  --project-id your-project-id \
  > types/database.types.ts
```

---

### Troubleshooting

**"Failed to fetch" on login** — Check `NEXT_PUBLIC_SUPABASE_URL` is set correctly.

**"User not found" after login** — The trigger that creates a profile may not have fired. Manually insert:
```sql
insert into public.profiles (id, email, full_name, role)
values (auth.uid(), 'your@email.com', 'Your Name', 'super_admin');
```

**Client user sees other clients' data** — Check RLS is enabled on all tables. Run `schema.sql` again if needed.

**Webhook not receiving Meta leads** — Phase 2. See README.md for Meta integration steps.
