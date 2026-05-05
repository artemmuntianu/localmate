-- Bonus type flag on partners
alter table partners
  add column if not exists bonus_reusable boolean not null default false;

-- Persistent bonus codes (no expiry — confirmed_at set by waiter)
create table if not exists bonus_codes (
  id          uuid        primary key default gen_random_uuid(),
  partner_id  uuid        references partners(id) on delete cascade not null,
  code        char(6)     not null,
  created_at  timestamptz not null default now(),
  confirmed_at timestamptz
);

create index if not exists bonus_codes_partner_id_idx on bonus_codes(partner_id);

-- Seed: make Café Central a reusable bonus, O Mercado a one-time bonus
update partners set bonus_reusable = true  where name = 'Café Central';
update partners set bonus_reusable = false where name = 'O Mercado';
