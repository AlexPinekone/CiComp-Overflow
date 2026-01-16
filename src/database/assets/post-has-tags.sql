
CREATE TABLE IF NOT EXISTS "PostHasTags" (
    "postTagId" uuid not null,
    "postId" uuid not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    PRIMARY KEY ("postTagId", "postId"),
    FOREIGN KEY ("postTagId") REFERENCES "PostTags"("postTagId"),
    FOREIGN KEY ("postId") REFERENCES "Posts"("postId")
);