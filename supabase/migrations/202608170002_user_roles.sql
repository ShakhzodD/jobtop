create type public.user_role as enum ('worker', 'employer');

alter table public.users
  add column active_role public.user_role not null default 'worker';

create table public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index user_roles_user_idx on public.user_roles (user_id);

insert into public.user_roles (user_id, role)
select id, 'worker'::public.user_role from public.users
on conflict do nothing;

alter table public.user_roles enable row level security;
