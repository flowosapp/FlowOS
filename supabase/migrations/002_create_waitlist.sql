CREATE TABLE IF NOT EXISTS public.waitlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  name        text,
  plan        text NOT NULL DEFAULT 'starter',
  source      text NOT NULL DEFAULT 'launch_page',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON public.waitlist (created_at DESC);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_count" ON public.waitlist
  FOR SELECT USING (true);

CREATE POLICY "service_role_insert" ON public.waitlist
  FOR INSERT WITH CHECK (true);
