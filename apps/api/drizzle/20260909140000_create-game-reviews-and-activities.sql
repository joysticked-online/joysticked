CREATE TABLE "game_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "game_id" text NOT NULL,
  "game_slug" text NOT NULL,
  "game_title" text NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "rating" double precision NOT NULL,
  "review_text" text,
  "platform" text,
  "hours_played" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "game_activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "game_id" text NOT NULL,
  "game_slug" text NOT NULL,
  "game_title" text NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "detail" text,
  "platform" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
