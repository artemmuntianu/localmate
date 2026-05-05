-- Add slug to partners (nullable first so existing rows don't fail)
alter table partners
  add column if not exists slug text unique;

-- Seed known partners
update partners set slug = 'cafe-central' where name = 'Café Central';
update partners set slug = 'o-mercado'    where name = 'O Mercado';

-- Enforce NOT NULL — will fail if any partner row still has a NULL slug
alter table partners alter column slug set not null;
