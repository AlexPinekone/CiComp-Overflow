
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