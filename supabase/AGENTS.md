# Database Schema & Migrations Layer (`supabase`)

This directory owns SQL migration files and schema definitions for Supabase database tables.

## Structure

- `migrations/` — Sequential SQL migration scripts applied to Supabase database.

## Rules

1. Treat existing SQL migration files as append-only.
2. New tables, columns, or triggers must be introduced as new numbered `.sql` migration files.
