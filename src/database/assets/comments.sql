
CREATE TABLE IF NOT EXISTS "Comments" (
    "commentId" uuid primary key default gen_random_uuid(),
    body text not null,
    "postId" uuid not null,
    "userId" uuid not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    FOREIGN KEY ("postId") REFERENCES "Posts"("postId")
);