BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "Users" (
    "userId" uuid primary key default gen_random_uuid(),
    name text not null,
    "lastName" text not null,
    role text not null default 'USER',
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false
);

CREATE TABLE IF NOT EXISTS "Notifications" (
    "notificationId" uuid primary key default gen_random_uuid(),
    type text not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false
);

CREATE TABLE IF NOT EXISTS "PostTags" (
    "postTagId" uuid primary key default gen_random_uuid(),
    name text not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false
);

CREATE TABLE IF NOT EXISTS "Tags" (
    "tagId" uuid primary key default gen_random_uuid(),
    "tagName" text not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false
);

CREATE TABLE IF NOT EXISTS "Accounts" (
    "userId" uuid primary key default gen_random_uuid(),
    password text not null,
    mail text not null unique,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);

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

CREATE TABLE IF NOT EXISTS "UserHasSession" (
    "userId" uuid not null,
    "sessionId" uuid not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    PRIMARY KEY ("userId", "sessionId"),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId"),
    FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId")
);

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

CREATE TABLE IF NOT EXISTS "UserNotifications" (
    "userNotificationId"  uuid primary key default gen_random_uuid(),
    "userId" uuid not null,
    type text not null,
    "referenceId" uuid not null,
    status text not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false,
    "createdByUserId" uuid not null,  
    FOREIGN KEY ("userId") REFERENCES "Users"("userId"),
    FOREIGN KEY ("createdByUserId") REFERENCES "Users"("userId") 
);

CREATE INDEX IF NOT EXISTS "idx_Posts_userId" ON "Posts" ("userId");
CREATE INDEX IF NOT EXISTS "idx_Comments_postId" ON "Comments" ("postId");
CREATE INDEX IF NOT EXISTS "idx_Comments_userId" ON "Comments" ("userId");
CREATE INDEX IF NOT EXISTS "idx_Sessions_userId" ON "Sessions" ("userId");
CREATE INDEX IF NOT EXISTS "idx_Profiles_userId" ON "Profiles" ("userId");
CREATE INDEX IF NOT EXISTS "idx_Accounts_userId" ON "Accounts" ("userId");
CREATE INDEX IF NOT EXISTS "idx_Requests_userId" ON "Requests" ("userId");
CREATE INDEX IF NOT EXISTS "idx_UserNotifications_userId" ON "UserNotifications" ("userId");
CREATE INDEX IF NOT EXISTS "idx_UserNotifications_createdByUserId" ON "UserNotifications" ("createdByUserId");
CREATE INDEX IF NOT EXISTS "idx_UserPostVotes_postId" ON "UserPostVotes" ("postId");
CREATE INDEX IF NOT EXISTS "idx_UserPostVotes_userId" ON "UserPostVotes" ("userId");
CREATE INDEX IF NOT EXISTS "idx_UserCommentVotes_commentId" ON "UserCommentVotes" ("commentId");
CREATE INDEX IF NOT EXISTS "idx_UserCommentVotes_postId" ON "UserCommentVotes" ("postId");
CREATE INDEX IF NOT EXISTS "idx_UserCommentVotes_userId" ON "UserCommentVotes" ("userId");
CREATE INDEX IF NOT EXISTS "idx_UserHasSession_sessionId" ON "UserHasSession" ("sessionId");
CREATE INDEX IF NOT EXISTS "idx_PostHasTags_postId" ON "PostHasTags" ("postId");
CREATE INDEX IF NOT EXISTS "idx_PostHasTags_postTagId" ON "PostHasTags" ("postTagId");

COMMIT;