
CREATE TABLE IF NOT EXISTS "UserCommentVotes" (
    "userId" uuid not null,
    "commentId" uuid not null,
    "postId" uuid not null,
    status text not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    PRIMARY KEY ("userId", "commentId", "postId"),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId"),
    FOREIGN KEY ("postId") REFERENCES "Posts"("postId"),
    FOREIGN KEY ("commentId") REFERENCES "Comments"("commentId")
);