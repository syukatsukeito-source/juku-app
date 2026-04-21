-- 002_create_attendance.sql
-- 出欠記録テーブルの作成

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id text not null,
  date date not null,
  status text not null check (status in ('出席', '遅刻', '欠席')),
  created_at timestamptz default now(),
  unique(user_id, student_id, date)
);

-- Row Level Security
alter table public.attendance enable row level security;

create policy "Attendance: select by owner" on public.attendance
  for select using (auth.uid() = user_id);

create policy "Attendance: insert by owner" on public.attendance
  for insert with check (auth.uid() = user_id);

create policy "Attendance: update by owner" on public.attendance
  for update using (auth.uid() = user_id);

create policy "Attendance: delete by owner" on public.attendance
  for delete using (auth.uid() = user_id);
