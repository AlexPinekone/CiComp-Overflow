
CREATE TABLE IF NOT EXISTS "UserPostVotes" (
    "userId" uuid not null,
    "postId" uuid not null,
    status text not null default 'UPVOTE',
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    PRIMARY KEY ("userId", "postId"),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId"),
    FOREIGN KEY ("postId") REFERENCES "Posts"("postId")
);