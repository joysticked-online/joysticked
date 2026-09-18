CREATE INDEX IF NOT EXISTS "game_reviews_game_slug_created_at_idx"
ON "game_reviews" ("game_slug", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "game_activities_game_slug_created_at_idx"
ON "game_activities" ("game_slug", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "game_activities_user_id_type_idx"
ON "game_activities" ("user_id", "type");
