-- +atlas Up

ALTER TABLE "public"."order_items" ADD COLUMN IF NOT EXISTS "price" double precision NOT NULL DEFAULT 0;
