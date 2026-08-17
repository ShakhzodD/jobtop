alter table public.users
  add column worker_categories text[] not null default '{}';

create index users_worker_categories_idx
  on public.users using gin (worker_categories);
