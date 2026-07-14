-- =============================================
-- SANZCREATIVE ALR — Supabase Database Schema
-- =============================================
-- Run this entire file in Supabase SQL Editor
-- (Database > SQL Editor > New query)
-- =============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =============================================
-- TYPES / ENUMS
-- =============================================

create type user_role as enum ('super_admin', 'client_user');
create type client_status as enum ('active', 'inactive', 'disabled');
create type campaign_status as enum ('active', 'paused', 'completed', 'draft');
create type platform as enum ('facebook', 'instagram', 'both');
create type lead_status as enum (
  'new', 'contacted', 'interested', 'follow_up',
  'converted', 'not_interested', 'invalid'
);
create type connection_status as enum ('connected', 'disconnected', 'pending', 'error');

-- =============================================
-- TABLES
-- =============================================

-- profiles: extends Supabase auth.users
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text not null,
  role        user_role not null default 'client_user',
  client_id   uuid,  -- null for super_admin; set for client users
  created_at  timestamptz not null default now()
);

-- clients
create table if not exists public.clients (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  business_category   text not null,
  contact_person      text not null,
  email               text not null,
  phone               text not null,
  status              client_status not null default 'active',
  created_at          timestamptz not null default now()
);

-- Add FK now that clients table exists
alter table public.profiles
  add constraint fk_profiles_client_id
  foreign key (client_id) references public.clients(id) on delete set null;

-- campaigns
create table if not exists public.campaigns (
  id              uuid primary key default uuid_generate_v4(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  campaign_name   text not null,
  platform        platform not null default 'facebook',
  meta_page_id    text,
  meta_form_id    text,
  status          campaign_status not null default 'active',
  created_at      timestamptz not null default now()
);

-- leads
create table if not exists public.leads (
  id                uuid primary key default uuid_generate_v4(),
  client_id         uuid not null references public.clients(id) on delete cascade,
  campaign_id       uuid references public.campaigns(id) on delete set null,
  meta_lead_id      text unique,  -- prevent duplicate Meta leads
  full_name         text not null,
  phone             text not null,
  email             text,
  source            text not null default 'Manual Entry',
  raw_form_data     jsonb,
  status            lead_status not null default 'new',
  assigned_user_id  uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- lead_notes
create table if not exists public.lead_notes (
  id          uuid primary key default uuid_generate_v4(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  note        text not null,
  created_at  timestamptz not null default now()
);

-- lead_status_history
create table if not exists public.lead_status_history (
  id          uuid primary key default uuid_generate_v4(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  old_status  lead_status,
  new_status  lead_status not null,
  changed_by  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- meta_connections
create table if not exists public.meta_connections (
  id                  uuid primary key default uuid_generate_v4(),
  client_id           uuid not null references public.clients(id) on delete cascade,
  meta_page_id        text not null,
  page_name           text not null,
  connection_status   connection_status not null default 'disconnected',
  token_reference     text,  -- reference key for encrypted token; never store raw token
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (client_id, meta_page_id)
);

-- =============================================
-- INDEXES
-- =============================================

create index if not exists idx_leads_client_id    on public.leads(client_id);
create index if not exists idx_leads_campaign_id  on public.leads(campaign_id);
create index if not exists idx_leads_status       on public.leads(status);
create index if not exists idx_leads_created_at   on public.leads(created_at desc);
create index if not exists idx_leads_meta_lead_id on public.leads(meta_lead_id);
create index if not exists idx_campaigns_client   on public.campaigns(client_id);
create index if not exists idx_notes_lead_id      on public.lead_notes(lead_id);
create index if not exists idx_status_hist_lead   on public.lead_status_history(lead_id);

-- =============================================
-- AUTO-UPDATE updated_at
-- =============================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at
  before update on public.leads
  for each row execute procedure public.handle_updated_at();

create trigger meta_connections_updated_at
  before update on public.meta_connections
  for each row execute procedure public.handle_updated_at();

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client_user')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- CRITICAL: Super Admin sees all data.
-- Client users see ONLY their own client's data.
-- Security is enforced at the database level, not just the frontend.

alter table public.profiles          enable row level security;
alter table public.clients           enable row level security;
alter table public.campaigns         enable row level security;
alter table public.leads             enable row level security;
alter table public.lead_notes        enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.meta_connections  enable row level security;

-- Helper function: is the current user a super admin?
create or replace function public.is_super_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- Helper function: get the client_id of the current user
create or replace function public.my_client_id()
returns uuid language sql security definer as $$
  select client_id from public.profiles where id = auth.uid();
$$;

-- ---- profiles ----
create policy "profiles_select" on public.profiles for select using (
  is_super_admin() or id = auth.uid()
);
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());

-- ---- clients ----
create policy "clients_select" on public.clients for select using (
  is_super_admin() or id = my_client_id()
);
create policy "clients_insert" on public.clients for insert with check (is_super_admin());
create policy "clients_update" on public.clients for update using (is_super_admin());
create policy "clients_delete" on public.clients for delete using (is_super_admin());

-- ---- campaigns ----
create policy "campaigns_select" on public.campaigns for select using (
  is_super_admin() or client_id = my_client_id()
);
create policy "campaigns_insert" on public.campaigns for insert with check (is_super_admin());
create policy "campaigns_update" on public.campaigns for update using (is_super_admin());
create policy "campaigns_delete" on public.campaigns for delete using (is_super_admin());

-- ---- leads ----
create policy "leads_select" on public.leads for select using (
  is_super_admin() or client_id = my_client_id()
);
create policy "leads_insert" on public.leads for insert with check (is_super_admin());
create policy "leads_update" on public.leads for update using (
  is_super_admin() or client_id = my_client_id()
);

-- ---- lead_notes ----
create policy "notes_select" on public.lead_notes for select using (
  is_super_admin() or
  exists (select 1 from public.leads where id = lead_id and client_id = my_client_id())
);
create policy "notes_insert" on public.lead_notes for insert with check (
  user_id = auth.uid() and (
    is_super_admin() or
    exists (select 1 from public.leads where id = lead_id and client_id = my_client_id())
  )
);

-- ---- lead_status_history ----
create policy "status_hist_select" on public.lead_status_history for select using (
  is_super_admin() or
  exists (select 1 from public.leads where id = lead_id and client_id = my_client_id())
);
create policy "status_hist_insert" on public.lead_status_history for insert with check (
  changed_by = auth.uid() and (
    is_super_admin() or
    exists (select 1 from public.leads where id = lead_id and client_id = my_client_id())
  )
);

-- ---- meta_connections ----
create policy "meta_connections_select" on public.meta_connections for select using (
  is_super_admin() or client_id = my_client_id()
);
create policy "meta_connections_all" on public.meta_connections
  for all using (is_super_admin());

-- =============================================
-- DEMO DATA (Development Only)
-- Remove or clear this section before production
-- =============================================

-- Insert demo clients
insert into public.clients (id, name, business_category, contact_person, email, phone, status) values
  ('a0000001-0000-0000-0000-000000000001', 'VTK Citroën',      'Automotive Dealership', 'Ravi Kumar',   'ravi@vtkcars.com',          '+91 98765 43210', 'active'),
  ('a0000001-0000-0000-0000-000000000002', 'Harini Nails',     'Beauty & Wellness',     'Harini Priya', 'harini@harininails.com',     '+91 87654 32109', 'active'),
  ('a0000001-0000-0000-0000-000000000003', 'Prestige Realty',  'Real Estate',           'Suresh Babu',  'suresh@prestigerealty.in',  '+91 76543 21098', 'active')
on conflict (id) do nothing;

-- Insert demo campaigns
insert into public.campaigns (id, client_id, campaign_name, platform, status) values
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Citroën C3 Launch — Jan 2025',   'facebook',  'active'),
  ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Test Drive Offer — Feb 2025',    'instagram', 'active'),
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000002', 'Valentine Nail Art — Feb 2025',  'instagram', 'completed'),
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000002', 'New Branch Opening Offer',       'both',      'active'),
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000003', 'Luxury Apartments — Phase 2',    'facebook',  'active')
on conflict (id) do nothing;

-- Note: Demo leads require user profiles to exist first.
-- After creating your super_admin user via Supabase Auth,
-- insert demo leads by running supabase/demo-leads.sql
