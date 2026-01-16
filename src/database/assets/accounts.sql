
CREATE TABLE IF NOT EXISTS "Accounts" (
    "userId" uuid primary key default gen_random_uuid(),
    password text not null,
    mail text not null unique,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);