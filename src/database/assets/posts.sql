
CREATE TABLE IF NOT EXISTS "Posts" (
    "postId" uuid primary key default gen_random_uuid(),
    title text not null,
    body text not null,
    status text not null default 'PUBLISHED',
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "userId" uuid not null,
    "softDelete" boolean default false,
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);
