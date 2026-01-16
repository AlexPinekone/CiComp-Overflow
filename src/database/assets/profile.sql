

CREATE TABLE IF NOT EXISTS "Profiles" (
    "profileId" uuid primary key default gen_random_uuid(),
    "userId" uuid unique not null,
    "userName" text not null default gen_random_uuid(),
    photo text,
    description text,
    status text not null default 'ACTIVE',
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);