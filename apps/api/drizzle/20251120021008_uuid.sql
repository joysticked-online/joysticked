ALTER TABLE "waitlists" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "waitlists" ADD COLUMN "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY;
