CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "user_role" AS ENUM (
  'RIFLER',
  'AWPER',
  'OPENER',
  'IGL'
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "steamid64" varchar(32) UNIQUE NOT NULL,
  "steam_persona_name" varchar(80),
  "steam_avatar_url" text,
  "username" varchar(80),
  "email" varchar(254) UNIQUE,
  "role" user_role,
  "onboarding_completed" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "token_hash" text UNIQUE NOT NULL,
  "user_id" uuid NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL DEFAULT (now()),
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "teams" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar(30) NOT NULL,
  "tag" varchar(4),
  "avatar_url" text,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "users_team" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "team_id" uuid NOT NULL,
  "role_users_team" user_role NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "users_team_user_id_team_id_key" UNIQUE ("user_id", "team_id")
);

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "users_team" ADD CONSTRAINT "users_team_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "users_team" ADD CONSTRAINT "users_team_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE;

CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id");
CREATE INDEX "sessions_expires_at_idx" ON "sessions" ("expires_at");
CREATE INDEX "users_team_user_id_idx" ON "users_team" ("user_id");
CREATE INDEX "users_team_team_id_idx" ON "users_team" ("team_id");
