alter table public.users
  add column birth_date date,
  add column experience_years smallint check (experience_years between 0 and 60),
  add column about text check (char_length(about) <= 500);
