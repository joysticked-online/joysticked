CREATE TABLE "waitlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
