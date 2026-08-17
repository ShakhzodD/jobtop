-- External vacancies are never presented as a real JobTop employer.
-- Workers are sent to the source link, while admins still moderate each job.
alter table public.jobs alter column employer_id drop not null;
alter table public.jobs add column source_name text;
alter table public.jobs add column source_url text;

create table public.ai_job_imports (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  source_external_id text,
  listing_url text,
  raw_text text not null,
  content_hash text not null unique,
  parsed_job jsonb,
  confidence numeric(3,2),
  status text not null default 'pending_review'
    check (status in ('pending_review', 'queued_for_moderation', 'needs_details', 'rejected')),
  job_id uuid references public.jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (source_name, source_external_id)
);

create index ai_job_imports_status_created_idx
  on public.ai_job_imports (status, created_at desc);

alter table public.ai_job_imports enable row level security;
