
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
