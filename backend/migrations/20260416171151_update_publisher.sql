-- Modify "publishers" table
ALTER TABLE "public"."publishers" ADD COLUMN "email" character varying NOT NULL, ADD COLUMN "website" character varying NULL;
