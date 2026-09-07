-- Adapt Phase 2 schema to public, auth-free access.
-- Review before applying. Does not drop auth.users; only project tables and policies.

-- ---------------------------------------------------------------------------
-- Drop user-scoped policies and auth-coupled objects
-- ---------------------------------------------------------------------------

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

drop policy if exists classes_read_authenticated on public.microstructure_classes;
drop policy if exists models_read_authenticated on public.ml_models;

drop policy if exists images_select_own on public.images;
drop policy if exists images_insert_own on public.images;
drop policy if exists images_update_own on public.images;
drop policy if exists images_delete_own on public.images;

drop policy if exists analyses_select_own on public.analyses;
drop policy if exists analyses_delete_own on public.analyses;

drop policy if exists predictions_select_own_analysis on public.predictions;

drop policy if exists storage_images_select_own on storage.objects;
drop policy if exists storage_images_insert_own on storage.objects;
drop policy if exists storage_images_update_own on storage.objects;
drop policy if exists storage_images_delete_own on storage.objects;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop trigger if exists profiles_set_updated_at on public.profiles;
drop function if exists public.set_updated_at();

drop table if exists public.predictions cascade;
drop table if exists public.analyses cascade;
drop table if exists public.images cascade;
drop table if exists public.profiles cascade;

-- Do NOT delete storage.buckets here: Supabase blocks direct DELETE on storage
-- tables. Remove the unused bucket `microstructure-images` from the Dashboard
-- (Storage) or via the Storage API if it still exists.

-- ---------------------------------------------------------------------------
-- Align class catalog with alphabetical official names
-- ---------------------------------------------------------------------------

update public.microstructure_classes
set
    slug = 'cementita-perlita',
    name = 'Cementita + Perlita',
    scientific_description = 'Microestructura en la que coexisten regiones de cementita y perlita.'
where slug = 'perlita-cementita';

-- ---------------------------------------------------------------------------
-- Anonymous academic analyses (no personal data, no stored images)
-- ---------------------------------------------------------------------------

create table public.analyses (
    id uuid primary key default gen_random_uuid(),
    predicted_class_id uuid not null references public.microstructure_classes (id),
    confidence numeric(6, 5) not null check (confidence between 0 and 1),
    model_id uuid not null references public.ml_models (id),
    created_at timestamptz not null default now()
);

create table public.predictions (
    id uuid primary key default gen_random_uuid(),
    analysis_id uuid not null references public.analyses (id) on delete cascade,
    microstructure_class_id uuid not null references public.microstructure_classes (id),
    probability numeric(6, 5) not null check (probability between 0 and 1),
    created_at timestamptz not null default now(),
    unique (analysis_id, microstructure_class_id)
);

create index analyses_created_idx on public.analyses (created_at desc);
create index analyses_class_idx on public.analyses (predicted_class_id);
create index predictions_analysis_idx on public.predictions (analysis_id);

-- ---------------------------------------------------------------------------
-- RLS: public read for catalogs; writes reserved to service role
-- ---------------------------------------------------------------------------

alter table public.microstructure_classes enable row level security;
alter table public.ml_models enable row level security;
alter table public.analyses enable row level security;
alter table public.predictions enable row level security;

create policy classes_read_public
on public.microstructure_classes for select
to anon, authenticated
using (true);

create policy models_read_public
on public.ml_models for select
to anon, authenticated
using (true);

create policy analyses_read_public
on public.analyses for select
to anon, authenticated
using (true);

create policy predictions_read_public
on public.predictions for select
to anon, authenticated
using (true);

-- Inserts/updates remain available only via the backend service_role key,
-- which bypasses RLS by default in Supabase.
