-- Create "authors" table
CREATE TABLE "public"."authors" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "surname" character varying NOT NULL,
 "name" character varying NOT NULL,
 "patronymic" character varying NOT NULL,
 PRIMARY KEY ("id")
);
-- Create "deliveries" table
CREATE TABLE "public"."deliveries" (
 "order_id" uuid NOT NULL,
 "address" character varying NOT NULL,
 "status" character varying NOT NULL DEFAULT 'Waiting',
 "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY ("order_id")
);
-- Create "publishers" table
CREATE TABLE "public"."publishers" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "name" character varying NOT NULL,
 "address" character varying NOT NULL,
 PRIMARY KEY ("id"),
 CONSTRAINT "publishers_name_key" UNIQUE ("name")
);
-- Create "books" table
CREATE TABLE "public"."books" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "title" character varying NOT NULL,
 "description" character varying NULL,
 "price" double precision NOT NULL DEFAULT 0,
 "stock" bigint NOT NULL DEFAULT 0,
 "author_id" uuid NOT NULL,
 "publisher_id" uuid NOT NULL,
 "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY ("id"),
 CONSTRAINT "books_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
 CONSTRAINT "books_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "categories" table
CREATE TABLE "public"."categories" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "name" character varying NOT NULL,
 PRIMARY KEY ("id")
);
-- Create "book_to_category" table
CREATE TABLE "public"."book_to_category" (
 "book_id" uuid NOT NULL,
 "category_id" uuid NOT NULL,
 PRIMARY KEY ("book_id", "category_id"),
 CONSTRAINT "book_to_category_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
 CONSTRAINT "book_to_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "roles" table
CREATE TABLE "public"."roles" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "name" character varying NOT NULL,
 PRIMARY KEY ("id"),
 CONSTRAINT "roles_name_key" UNIQUE ("name")
);
-- Create "users" table
CREATE TABLE "public"."users" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "username" character varying NOT NULL,
 "email" character varying NOT NULL,
 "phone" character varying NULL,
 "password_hash" character varying NOT NULL,
 "role_id" uuid NOT NULL,
 PRIMARY KEY ("id"),
 CONSTRAINT "users_email_key" UNIQUE ("email"),
 CONSTRAINT "users_username_key" UNIQUE ("username"),
 CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "carts" table
CREATE TABLE "public"."carts" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "user_id" uuid NOT NULL,
 PRIMARY KEY ("id"),
 CONSTRAINT "carts_user_id_key" UNIQUE ("user_id"),
 CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "cart_items" table
CREATE TABLE "public"."cart_items" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "cart_id" uuid NOT NULL,
 "book_id" uuid NOT NULL,
 "quantity" bigint NOT NULL DEFAULT 1,
 PRIMARY KEY ("id"),
 CONSTRAINT "cart_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
 CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "orders" table
CREATE TABLE "public"."orders" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "user_id" uuid NOT NULL,
 "total_price" double precision NOT NULL DEFAULT 0,
 "status" character varying NOT NULL DEFAULT 'New',
 "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY ("id"),
 CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "order_items" table
CREATE TABLE "public"."order_items" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "order_id" uuid NOT NULL,
 "book_id" uuid NOT NULL,
 "quantity" bigint NOT NULL DEFAULT 1,
 PRIMARY KEY ("id"),
 CONSTRAINT "order_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
 CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "payments" table
CREATE TABLE "public"."payments" (
 "id" uuid NOT NULL DEFAULT gen_random_uuid(),
 "order_id" uuid NOT NULL,
 "amount" double precision NOT NULL,
 "method" character varying NOT NULL,
 "status" character varying NOT NULL DEFAULT 'Not paid',
 "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY ("id"),
 CONSTRAINT "payments_order_id_key" UNIQUE ("order_id"),
 CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
