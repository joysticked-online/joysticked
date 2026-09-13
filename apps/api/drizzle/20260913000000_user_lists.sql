CREATE TABLE IF NOT EXISTS "user_lists" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "is_public" boolean NOT NULL DEFAULT true,
  "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "games" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_lists_owner_slug_unique" ON "user_lists" ("user_id", "slug");
CREATE TABLE IF NOT EXISTS "user_list_likes" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "list_id" uuid NOT NULL REFERENCES "user_lists"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_list_likes_unique" ON "user_list_likes" ("list_id", "user_id");
