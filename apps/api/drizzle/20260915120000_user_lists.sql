ALTER TABLE "user_lists" ADD COLUMN IF NOT EXISTS "owner_id" uuid;
UPDATE "user_lists" SET "owner_id" = "user_id" WHERE "owner_id" IS NULL;
ALTER TABLE "user_lists" ALTER COLUMN "owner_id" SET NOT NULL;
ALTER TABLE "user_lists" ADD COLUMN IF NOT EXISTS "likes_count" integer DEFAULT 0 NOT NULL;

DO $$ BEGIN
  ALTER TABLE "user_lists"
    ADD CONSTRAINT "user_lists_owner_id_users_id_fk"
    FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "user_list_games" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "list_id" uuid NOT NULL REFERENCES "user_lists"("id") ON DELETE CASCADE,
  "game_id" text NOT NULL,
  "game_slug" text NOT NULL,
  "game" jsonb NOT NULL,
  "position" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_list_games_list_game_unique" UNIQUE("list_id", "game_id")
);
CREATE TABLE IF NOT EXISTS "user_list_likes" (
  "list_id" uuid NOT NULL REFERENCES "user_lists"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_list_likes_unique" UNIQUE("list_id", "user_id")
);
CREATE INDEX IF NOT EXISTS "user_lists_owner_idx" ON "user_lists" ("owner_id", "updated_at" DESC);
CREATE INDEX IF NOT EXISTS "user_list_games_list_position_idx" ON "user_list_games" ("list_id", "position");
