-- SQL schema for Supabase

-- Enable RLS (Row Level Security)
alter table auth.users enable row level security;

-- Create profiles table with role-based user info
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  role text not null check (role in ('brand', 'creator')),
  name text not null,
  email text not null,
  avatar_url text,
  created_at timestamp with time zone default now() not null
);

-- Create brand_profiles table for additional brand-specific info
create table public.brand_profiles (
  id uuid references profiles(id) on delete cascade not null primary key,
  company_name text not null,
  industry text,
  website text,
  description text,
  updated_at timestamp with time zone default now() not null
);

-- Create creator_profiles table for additional creator-specific info
create table public.creator_profiles (
  id uuid references profiles(id) on delete cascade not null primary key,
  bio text,
  specialties text[],
  social_links jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default now() not null
);

-- Create portfolio_items table for creator portfolio
create table public.portfolio_items (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  created_at timestamp with time zone default now() not null
);

-- Create briefs table for brand content requests
create table public.briefs (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  requirements text not null,
  budget numeric(10, 2) not null,
  deadline timestamp with time zone not null,
  status text not null check (status in ('draft', 'published', 'closed')),
  created_at timestamp with time zone default now() not null
);

-- Create applications table for creators applying to briefs
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  brief_id uuid references briefs(id) on delete cascade not null,
  creator_id uuid references profiles(id) on delete cascade not null,
  proposal text not null,
  portfolio_items uuid[] default '{}'::uuid[],
  status text not null check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone default now() not null,
  unique (brief_id, creator_id)
);

-- RLS Policies

-- Profiles: users can read all profiles but only update their own
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Brand profiles: viewable by everyone, updatable by owner
create policy "Brand profiles are viewable by everyone"
  on brand_profiles for select using (true);

create policy "Brand can update own profile"
  on brand_profiles for update using (auth.uid() = id);

-- Creator profiles: viewable by everyone, updatable by owner
create policy "Creator profiles are viewable by everyone"
  on creator_profiles for select using (true);

create policy "Creator can update own profile"
  on creator_profiles for update using (auth.uid() = id);

-- Portfolio items: viewable by everyone, manageable by owner
create policy "Portfolio items are viewable by everyone"
  on portfolio_items for select using (true);

create policy "Creators can insert their portfolio items"
  on portfolio_items for insert with check (auth.uid() = creator_id);

create policy "Creators can update their portfolio items"
  on portfolio_items for update using (auth.uid() = creator_id);

create policy "Creators can delete their portfolio items"
  on portfolio_items for delete using (auth.uid() = creator_id);

-- Briefs: viewable by everyone, manageable by brand owner
create policy "Briefs are viewable by everyone"
  on briefs for select using (true);

create policy "Brands can insert their briefs"
  on briefs for insert with check (auth.uid() = brand_id);

create policy "Brands can update their briefs"
  on briefs for update using (auth.uid() = brand_id);

create policy "Brands can delete their briefs"
  on briefs for delete using (auth.uid() = brand_id);

-- Applications: viewable by related brand and creator, insertable by creators, updatable by brands
create policy "Creators can view their applications"
  on applications for select using (auth.uid() = creator_id);

create policy "Brands can view applications to their briefs"
  on applications for select using (
    auth.uid() IN (
      SELECT brand_id FROM briefs WHERE id = brief_id
    )
  );

create policy "Creators can insert applications"
  on applications for insert with check (auth.uid() = creator_id);

create policy "Brands can update application status"
  on applications for update using (
    auth.uid() IN (
      SELECT brand_id FROM briefs WHERE id = brief_id
    )
  ) with check (
    -- Only allow updating the status field
    (select jsonb_object_keys((to_jsonb(old.*) - to_jsonb(new.*)) || (to_jsonb(new.*) - to_jsonb(old.*))) @> 'status')
  );

-- Function to get user profile by ID
create or replace function get_profile_by_id(user_id uuid)
returns jsonb
language plpgsql security definer
as $$
declare
  user_profile jsonb;
  user_role text;
begin
  select role into user_role from profiles where id = user_id;
  
  if user_role = 'brand' then
    select 
      jsonb_build_object(
        'id', p.id,
        'role', p.role,
        'name', p.name,
        'email', p.email,
        'avatar_url', p.avatar_url,
        'company_name', bp.company_name,
        'industry', bp.industry,
        'website', bp.website,
        'description', bp.description
      )
    into user_profile
    from profiles p
    left join brand_profiles bp on p.id = bp.id
    where p.id = user_id;
  elsif user_role = 'creator' then
    select 
      jsonb_build_object(
        'id', p.id,
        'role', p.role,
        'name', p.name,
        'email', p.email,
        'avatar_url', p.avatar_url,
        'bio', cp.bio,
        'specialties', cp.specialties,
        'social_links', cp.social_links
      )
    into user_profile
    from profiles p
    left join creator_profiles cp on p.id = cp.id
    where p.id = user_id;
  end if;
  
  return user_profile;
end;
$$;