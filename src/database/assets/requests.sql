
CREATE TABLE IF NOT EXISTS "Requests" (
    "requestId" uuid primary key default gen_random_uuid(),
    "userId" uuid not null,
    "referencePostId" uuid,
    "referenceCommentId" uuid,
    "referenceUserId" uuid, 
    "type" text NOT NULL CHECK ("type" IN ('post', 'comment', 'user', 'general')),
    body text not null,
    title text not null,
    status text not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);