-- 001_create_profiles_and_rls.sql
-- Create profiles table, enable RLS, add policies, and create trigger to auto-populate profile on auth.user_created

-- 1) Create table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2) Enable Row Level Security
alter table public.profiles enable row level security;

-- 3) Policies: allow users to select/insert/update/delete their own profile
-- Allow authenticated users to select rows (they can only see their own)
create policy if not exists "Profiles can be selected by owner" on public.profiles
  for select
  using ( auth.uid() = id );

-- Allow authenticated users to insert only rows with their own id
create policy if not exists "Profiles can be inserted by owner" on public.profiles
  for insert
  with check ( auth.uid() = id );

-- Allow authenticated users to update only their own row
create policy if not exists "Profiles can be updated by owner" on public.profiles
  for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- Allow authenticated users to delete only their own row (optional)
create policy if not exists "Profiles can be deleted by owner" on public.profiles
  for delete
  using ( auth.uid() = id );

-- 4) Create function + trigger to automatically insert profile when a new auth user is created
-- This requires Supabase Auth Webhooks to call or using Postgres trigger on auth.users (supported in Supabase)

-- Function: insert profile for newly created user
create or replace function public.handle_new_user() returns trigger as $$
begin
  -- Insert a minimal profile row for the new user if not exists
  insert into public.profiles (id, full_name, created_at)
  values (new.id, new.raw_user_meta->>'full_name', now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users (Postgres schema 'auth' is used by Supabase)
create trigger if not exists on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Note:
-- - Run this SQL in the Supabase SQL Editor (or psql connected to the project DB).
-- - The trigger will create a minimal profile when a user is created via Supabase Auth.
-- - For email confirmation flows: users created via signUp without immediate session will still trigger this function and get a profile row.
-- - Make sure your project's Service Role key is NOT exposed to the client; run this SQL server-side (Supabase SQL editor).
