
CREATE TABLE IF NOT EXISTS "Users" (
    "userId" uuid primary key default gen_random_uuid(),
    name text not null,
    "lastName" text not null,
    role text not null default 'USER',
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false
);

