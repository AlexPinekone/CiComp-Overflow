CREATE TABLE IF NOT EXISTS "Notifications" (
    "notificationId" uuid primary key default gen_random_uuid(),
    type text not null,
    "createdAt" timestamp with time zone default now(),
    "updatedAt" timestamp with time zone default now(),
    "softDelete" boolean default false
);