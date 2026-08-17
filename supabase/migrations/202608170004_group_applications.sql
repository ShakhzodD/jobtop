create type public.group_application_status as enum ('pending_members', 'ready', 'selected', 'cancelled');
create type public.group_member_status as enum ('leader', 'pending', 'accepted', 'declined');

create table public.group_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  leader_id uuid not null references public.users(id),
  status public.group_application_status not null default 'pending_members',
  member_count smallint not null check (member_count between 2 and 20),
  created_at timestamptz not null default now()
);

create table public.group_application_members (
  group_application_id uuid not null references public.group_applications(id) on delete cascade,
  user_id uuid not null references public.users(id),
  status public.group_member_status not null,
  created_at timestamptz not null default now(),
  primary key (group_application_id, user_id)
);

create index group_applications_job_idx on public.group_applications(job_id, status);
create index group_application_members_user_idx on public.group_application_members(user_id, status);

alter table public.group_applications enable row level security;
alter table public.group_application_members enable row level security;
