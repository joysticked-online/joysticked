WITH ranked_reviews AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, game_id
      ORDER BY updated_at DESC, created_at DESC, id DESC
    ) AS row_number
  FROM game_reviews
)
DELETE FROM game_reviews
WHERE id IN (
  SELECT id
  FROM ranked_reviews
  WHERE row_number > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "game_reviews_user_game_unique"
ON "game_reviews" ("user_id", "game_id");
