-- =========================================================
-- Fallo Productions inventory — database schema
-- Paste this whole file into Supabase → SQL Editor → Run.
-- =========================================================

-- ---------- Equipment ----------
create table if not exists items (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text not null,
  department      text not null default 'Other'
                  check (department in ('Lighting','Audio','Rigging','Power & Cable','Video','Other')),
  category        text,
  manufacturer    text,
  model           text,
  serial_number   text,
  quantity        integer not null default 1 check (quantity >= 0),
  status          text not null default 'Available'
                  check (status in ('Available','In repair','Lost','Retired')),
  condition       text not null default 'Good'
                  check (condition in ('New','Good','Fair','Poor','Broken')),
  location        text,
  case_label      text,
  weight_kg       numeric check (weight_kg >= 0),
  power_w         numeric check (power_w >= 0),
  dmx_channels    integer check (dmx_channels >= 0),
  purchase_date   date,
  purchase_price  numeric check (purchase_price >= 0),
  last_service    date,
  next_service    date,
  notes           text
);

-- ---------- Jobs / bookings ----------
create table if not exists jobs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  client      text,
  venue       text,
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'Planned'
              check (status in ('Planned','Confirmed','Out','Returned','Cancelled')),
  notes       text,
  check (end_date >= start_date)
);

-- ---------- Equipment booked on a job ----------
create table if not exists job_items (
  id        uuid primary key default gen_random_uuid(),
  job_id    uuid not null references jobs(id)  on delete cascade,
  item_id   uuid not null references items(id) on delete cascade,
  quantity  integer not null default 1 check (quantity > 0),
  unique (job_id, item_id)
);

-- ---------- Service / repair / safety-test history ----------
create table if not exists service_log (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  item_id      uuid not null references items(id) on delete cascade,
  date         date not null default current_date,
  type         text not null default 'Service'
               check (type in ('Service','Repair','Safety test','Inspection','Note')),
  description  text,
  cost         numeric check (cost >= 0),
  created_by   text
);

create index if not exists job_items_job_idx  on job_items (job_id);
create index if not exists job_items_item_idx on job_items (item_id);
create index if not exists service_item_idx   on service_log (item_id);

-- ---------- Security ----------
-- Only signed-in users can read or write. Visitors to the public
-- website (anonymous) get nothing. Turn OFF public sign-ups in
-- Supabase so only people you invite can sign in.
alter table items       enable row level security;
alter table jobs        enable row level security;
alter table job_items   enable row level security;
alter table service_log enable row level security;

drop policy if exists "staff access" on items;
drop policy if exists "staff access" on jobs;
drop policy if exists "staff access" on job_items;
drop policy if exists "staff access" on service_log;

create policy "staff access" on items       for all to authenticated using (true) with check (true);
create policy "staff access" on jobs        for all to authenticated using (true) with check (true);
create policy "staff access" on job_items   for all to authenticated using (true) with check (true);
create policy "staff access" on service_log for all to authenticated using (true) with check (true);
