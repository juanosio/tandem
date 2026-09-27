-- Tándem: corre esto en el SQL Editor de Supabase (una sola vez).
-- Luego crea dos usuarios en Authentication → Users, con "Auto Confirm":
--   juan@tandem.app     contraseña = PIN de 6 números de Juan
--   marian@tandem.app   contraseña = PIN de 6 números de Marian
-- En Authentication → Providers → Email, desactiva "Confirm email".

create table if not exists public.weights (
  profile text not null,
  exercise_id text not null,
  peso double precision not null,
  updated_at timestamptz not null,
  primary key (profile, exercise_id)
);

create table if not exists public.history (
  profile text not null,
  exercise_id text not null,
  date text not null,
  peso double precision not null,
  updated_at timestamptz not null,
  primary key (profile, exercise_id, date)
);

create table if not exists public.checks (
  profile text not null,
  key text not null,
  done boolean not null,
  updated_at timestamptz not null,
  primary key (profile, key)
);

create table if not exists public.sessions (
  id text primary key,
  profile text not null,
  date text not null,
  dia text not null,
  start_ts bigint not null,
  end_ts bigint,
  done_ex int not null default 0,
  total_ex int not null default 0,
  updated_at timestamptz not null
);

create table if not exists public.weeks (
  profile text primary key,
  week int not null,
  updated_at timestamptz not null
);

create table if not exists public.swaps (
  profile text not null,
  slot_key text not null,
  chosen_key text not null,
  updated_at timestamptz not null,
  primary key (profile, slot_key)
);

create table if not exists public.prefs (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null
);

do $$
declare t text;
begin
  foreach t in array array['weights','history','checks','sessions','weeks','swaps','prefs']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists tandem_rw on public.%I', t);
    execute format(
      'create policy tandem_rw on public.%I for all to authenticated using (true) with check (true)',
      t
    );
    execute format('revoke all on table public.%I from anon', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
  end loop;
end $$;
