CREATE TABLE IF NOT EXISTS "PostTags" (
    "postTagId" uuid primary key default gen_random_uuid(),
    name text not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false
);