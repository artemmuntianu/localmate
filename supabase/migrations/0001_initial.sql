-- organizations (coworkings / hostels)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  location_geo point
);

-- partners (cafes / restaurants) linked to one org
create table partners (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  description text,
  logo_url text,
  credit_balance int not null default 50,
  bonus_info text
);

-- daily menus (one per partner per day)
create table daily_menus (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id) on delete cascade,
  menu_text text not null,
  date date not null default current_date,
  unique(partner_id, date)
);

-- redemptions (leads)
create table redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  partner_id uuid references partners(id) on delete cascade,
  created_at timestamptz default now()
);

-- RPC: atomically decrement credit and record redemption
create or replace function claim_bonus(p_partner_id uuid, p_user_id text)
returns void language plpgsql as $$
begin
  update partners
  set credit_balance = credit_balance - 1
  where id = p_partner_id and credit_balance > 0;

  if not found then
    raise exception 'no_credits';
  end if;

  insert into redemptions(user_id, partner_id)
  values (p_user_id, p_partner_id);
end;
$$;

-- Seed data for local dev
insert into organizations (name, slug) values
  ('Incubator Lisboa', 'incubator-lx'),
  ('Tech Hub Porto', 'techhub-pt');

insert into partners (org_id, name, description, bonus_info, credit_balance)
select id, 'Café Central', 'Cozy café just around the corner', 'Free coffee with any lunch order', 50
from organizations where slug = 'incubator-lx';

insert into partners (org_id, name, description, bonus_info, credit_balance)
select id, 'O Mercado', 'Home-style Portuguese cuisine', '10% off lunch', 50
from organizations where slug = 'incubator-lx';

insert into daily_menus (partner_id, menu_text)
select id,
'🥗 Soup of the day: Tomato cream soup with basil
🍝 Main: Pasta carbonara / Grilled cod
🍰 Dessert: Pastel de nata
💶 Set menu: 10.50€'
from partners where name = 'Café Central';

insert into daily_menus (partner_id, menu_text)
select id,
'🍲 Soup: Caldo verde
🍖 Main: Beef with rice / Roasted sweet potato (vegan)
🥧 Dessert: Fruit salad
💶 Set menu: 9.00€'
from partners where name = 'O Mercado';
