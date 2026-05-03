-- Café detail fields
alter table partners
  add column phone text,
  add column hours jsonb,
  add column cover_photo_url text,
  add column photos jsonb;

-- Seed detail data for Incubator Lisboa partners
update partners
set
  phone = '+351 21 312 3456',
  cover_photo_url = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  photos = '["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80","https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&q=80","https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"]'::jsonb,
  hours = '[{"days":"Mon–Fri","hours":"08:00–22:00"},{"days":"Saturday","hours":"09:00–20:00"},{"days":"Sunday","hours":"Closed"}]'::jsonb
where name = 'Café Central';

update partners
set
  phone = '+351 21 456 7890',
  cover_photo_url = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  photos = '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80","https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80","https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80"]'::jsonb,
  hours = '[{"days":"Mon–Sat","hours":"09:00–21:00"},{"days":"Sunday","hours":"10:00–17:00"}]'::jsonb
where name = 'O Mercado';
