-- GENFIN platform — quote requests (website lead capture)
-- Run this in the Supabase SQL editor (or via CLI migrations).

create table if not exists public.quote_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  email       text,
  plan        text,
  people      text,
  message     text,
  source      text not null default 'website',
  handled     boolean not null default false
);

comment on table public.quote_requests is
  'Quote/lead submissions from the public GENFIN website. Write-only for the public role.';

alter table public.quote_requests enable row level security;

-- The public (anon) role may submit a quote request, nothing else.
create policy "public can submit quote requests"
  on public.quote_requests
  for insert
  to anon
  with check (true);

-- No select/update/delete policies for anon: submissions are write-only
-- from the website. Staff read them via the dashboard or service role.
