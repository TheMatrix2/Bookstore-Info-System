-- Modify "users" table
ALTER TABLE "public"."users" ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");
-- Modify "deliveries" table
ALTER TABLE "public"."deliveries" DROP CONSTRAINT "deliveries_pkey", ADD COLUMN "id" uuid NOT NULL DEFAULT gen_random_uuid(), ADD PRIMARY KEY ("id"), ADD CONSTRAINT "deliveries_order_id_key" UNIQUE ("order_id"), ADD CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
