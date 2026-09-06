-- Initial relational schema for CarbonSteelClassifier.
-- Review this file before applying it to any Supabase project.

create extension if not exists "pgcrypto";

create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text check (
        full_name is null
        or char_length(btrim(full_name)) between 1 and 120
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.microstructure_classes (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    slug text not null unique,
    scientific_description text not null,
    created_at timestamptz not null default now()
);

create table public.ml_models (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    version text not null,
    framework text not null,
    accuracy numeric(6, 5) check (accuracy between 0 and 1),
    file_path text not null,
    is_active boolean not null default false,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    unique (name, version)
);

create unique index ml_models_one_active_idx
    on public.ml_models (is_active)
    where is_active;

create table public.images (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    file_name text not null,
    storage_path text not null unique,
    file_size bigint not null check (file_size > 0 and file_size <= 26214400),
    mime_type text not null check (
        mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/tiff')
    ),
    created_at timestamptz not null default now(),
    unique (id, user_id)
);

create table public.analyses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    image_id uuid not null,
    predicted_class_id uuid not null references public.microstructure_classes (id),
    confidence numeric(6, 5) not null check (confidence between 0 and 1),
    model_id uuid not null references public.ml_models (id),
    created_at timestamptz not null default now(),
    constraint analyses_image_owner_fk
        foreign key (image_id, user_id)
        references public.images (id, user_id)
        on delete cascade
);

create table public.predictions (
    id uuid primary key default gen_random_uuid(),
    analysis_id uuid not null references public.analyses (id) on delete cascade,
    microstructure_class_id uuid not null references public.microstructure_classes (id),
    probability numeric(6, 5) not null check (probability between 0 and 1),
    created_at timestamptz not null default now(),
    unique (analysis_id, microstructure_class_id)
);

create index images_user_created_idx
    on public.images (user_id, created_at desc);
create index analyses_user_created_idx
    on public.analyses (user_id, created_at desc);
create index predictions_analysis_idx
    on public.predictions (analysis_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $function$
begin
    new.updated_at = now();
    return new;
end;
$function$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
    insert into public.profiles (id, full_name)
    values (
        new.id,
        nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '')
    )
    on conflict (id) do nothing;
    return new;
end;
$function$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.microstructure_classes enable row level security;
alter table public.ml_models enable row level security;
alter table public.images enable row level security;
alter table public.analyses enable row level security;
alter table public.predictions enable row level security;

create policy profiles_select_own
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy profiles_insert_own
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy classes_read_authenticated
on public.microstructure_classes for select to authenticated
using (true);

create policy models_read_authenticated
on public.ml_models for select to authenticated
using (true);

create policy images_select_own
on public.images for select to authenticated
using ((select auth.uid()) = user_id);

create policy images_insert_own
on public.images for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy images_update_own
on public.images for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy images_delete_own
on public.images for delete to authenticated
using ((select auth.uid()) = user_id);

create policy analyses_select_own
on public.analyses for select to authenticated
using ((select auth.uid()) = user_id);

create policy analyses_delete_own
on public.analyses for delete to authenticated
using ((select auth.uid()) = user_id);

create policy predictions_select_own_analysis
on public.predictions for select to authenticated
using (
    exists (
        select 1
        from public.analyses
        where analyses.id = predictions.analysis_id
          and analyses.user_id = (select auth.uid())
    )
);

insert into storage.buckets (
    id, name, public, file_size_limit, allowed_mime_types
)
values (
    'microstructure-images',
    'microstructure-images',
    false,
    26214400,
    array['image/jpeg', 'image/png', 'image/webp', 'image/tiff']::text[]
)
on conflict (id) do nothing;

create policy storage_images_select_own
on storage.objects for select to authenticated
using (
    bucket_id = 'microstructure-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy storage_images_insert_own
on storage.objects for insert to authenticated
with check (
    bucket_id = 'microstructure-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy storage_images_update_own
on storage.objects for update to authenticated
using (
    bucket_id = 'microstructure-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
    bucket_id = 'microstructure-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy storage_images_delete_own
on storage.objects for delete to authenticated
using (
    bucket_id = 'microstructure-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
);
