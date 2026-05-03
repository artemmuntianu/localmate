-- Coordinates for org center (map centering) + branding
alter table organizations
  add column lat double precision,
  add column lng double precision,
  add column logo_url text,
  add column welcome_text text;

-- Coordinates for café markers
alter table partners
  add column lat double precision,
  add column lng double precision;

-- FAQs knowledge base
create table faqs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  question text not null,
  answer text not null,
  category text,
  created_at timestamptz not null default now()
);
create index faqs_org_id_idx on faqs(org_id);

-- Seed: coordinates for Lisbon dev data
update organizations
  set lat = 38.7169, lng = -9.1399,
      welcome_text = 'Welcome! Explore today''s lunch spots nearby and claim your exclusive bonus.'
  where slug = 'incubator-lx';

update partners set lat = 38.7175, lng = -9.1410 where name = 'Café Central';
update partners set lat = 38.7162, lng = -9.1385 where name = 'O Mercado';

-- Sample FAQs for Incubator Lisboa
insert into faqs (org_id, question, answer, category)
select id, 'What are the coworking hours?', 'Open Mon–Fri 8:00–22:00, weekends 10:00–18:00.', 'access'
  from organizations where slug = 'incubator-lx';

insert into faqs (org_id, question, answer, category)
select id, 'Is there parking available?', 'Yes, underground parking is free for members. Ask reception for a tag.', 'amenities'
  from organizations where slug = 'incubator-lx';

insert into faqs (org_id, question, answer, category)
select id, 'What is the Wi-Fi password?', 'Network: IncubatorLX_5G — Password: posted on every desk QR card.', 'wifi'
  from organizations where slug = 'incubator-lx';

insert into faqs (org_id, question, answer, category)
select id, 'Is there a printer available?', 'Yes, on the 2nd floor. Ask reception for the PIN.', 'amenities'
  from organizations where slug = 'incubator-lx';
