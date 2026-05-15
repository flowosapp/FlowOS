alter table public.flowos_state
  add column if not exists state jsonb not null default '{}'::jsonb;
