create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  gpa numeric,
  sat integer,
  home_city text,
  home_state text,
  home_zip text,
  radius_miles integer default 200,
  budget integer,
  broad_area text,
  interests jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.saved_colleges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles(id) on delete cascade,
  college_unitid bigint,
  college_name text not null,
  status text not null default 'Researching',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.student_profiles enable row level security;
alter table public.saved_colleges enable row level security;

grant select, insert, update, delete on public.student_profiles to authenticated;
grant select, insert, update, delete on public.saved_colleges to authenticated;

create policy "student_profiles_select_own" on public.student_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "student_profiles_insert_own" on public.student_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "student_profiles_update_own" on public.student_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "student_profiles_delete_own" on public.student_profiles for delete to authenticated using ((select auth.uid()) = user_id);

create policy "saved_colleges_select_own" on public.saved_colleges for select to authenticated using ((select auth.uid()) = user_id);
create policy "saved_colleges_insert_own" on public.saved_colleges for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "saved_colleges_update_own" on public.saved_colleges for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "saved_colleges_delete_own" on public.saved_colleges for delete to authenticated using ((select auth.uid()) = user_id);
