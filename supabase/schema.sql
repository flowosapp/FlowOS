create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  plan text not null default 'starter',
  status text not null default 'trialing',
  stripe_customer_id text,
  stripe_subscription_id text unique,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stores the full user application state as a single JSON blob.
-- Synced from the Zustand store every 2s (debounced) after any change.
create table if not exists public.flowos_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.flowos_state enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can read own state"
  on public.flowos_state for select
  using (auth.uid() = user_id);

create policy "Users can insert own state"
  on public.flowos_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update own state"
  on public.flowos_state for update
  using (auth.uid() = user_id);
