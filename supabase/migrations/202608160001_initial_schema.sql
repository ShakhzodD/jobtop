create type public.job_status as enum ('draft', 'pending_moderation', 'published', 'filled', 'completed', 'cancelled', 'expired');
create type public.application_status as enum ('pending', 'selected', 'rejected', 'withdrawn');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  phone text unique,
  telegram_username text,
  full_name text not null,
  avatar_url text,
  district text,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.users(id),
  category text not null,
  title text not null,
  description text not null,
  district text not null,
  address text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  pay_amount integer not null check (pay_amount > 0),
  openings integer not null check (openings > 0),
  status public.job_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  worker_id uuid not null references public.users(id),
  note text,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (job_id, worker_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id),
  author_id uuid not null references public.users(id),
  recipient_id uuid not null references public.users(id),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (job_id, author_id)
);

create index jobs_feed_idx on public.jobs (status, starts_at, district);
create index applications_job_idx on public.applications (job_id, status);

-- Mini App never accesses the database directly. The Next.js server validates
-- Telegram initData first, then uses a server-only Supabase client.
alter table public.users enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.reviews enable row level security;
