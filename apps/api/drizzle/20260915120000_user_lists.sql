CREATE TABLE IF NOT EXISTS "user_lists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "is_public" boolean DEFAULT true NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "likes_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_lists_owner_slug_unique" UNIQUE("owner_id", "slug")
);
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
