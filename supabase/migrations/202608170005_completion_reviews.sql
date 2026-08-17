create table public.job_participant_confirmations (
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.users(id),
  confirmed_at timestamptz not null default now(),
  primary key (job_id, user_id)
);

create index job_participant_confirmations_user_idx on public.job_participant_confirmations(user_id);
alter table public.job_participant_confirmations enable row level security;

alter table public.reviews drop constraint reviews_job_id_author_id_key;
alter table public.reviews add constraint reviews_job_author_recipient_key unique (job_id, author_id, recipient_id);
