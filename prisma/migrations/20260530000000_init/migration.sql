CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "UserRole" AS ENUM ('RIFLER', 'AWPER', 'OPENER', 'IGL');

CREATE TABLE "User" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "steamId64" varchar(32) NOT NULL UNIQUE,
  "steamPersonaName" varchar(80),
  "steamAvatarUrl" text,
  "username" varchar(80),
  "email" varchar(254) UNIQUE,
  "role" "UserRole",
  "onboardingCompleted" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "Session" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tokenHash" text NOT NULL UNIQUE,
  "userId" uuid NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "lastSeenAt" timestamptz NOT NULL DEFAULT now(),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

CREATE TABLE "Team" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(30) NOT NULL,
  "tag" varchar(4),
  "avatarUrl" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "UserTeam" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL,
  "teamId" uuid NOT NULL,
  "roleUsersTeam" "UserRole" NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "UserTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE,
  CONSTRAINT "UserTeam_userId_teamId_key" UNIQUE ("userId", "teamId")
);

CREATE INDEX "UserTeam_userId_idx" ON "UserTeam"("userId");
CREATE INDEX "UserTeam_teamId_idx" ON "UserTeam"("teamId");