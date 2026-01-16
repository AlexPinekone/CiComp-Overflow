
CREATE TABLE IF NOT EXISTS "Sessions" (
    "sessionId"  uuid primary key default gen_random_uuid(),
    "userId" uuid not null,
    "loginAttempts" int not null,
    "sessionStatus" text not null,
    "lastAccess" timestamp with time zone default now(),
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);