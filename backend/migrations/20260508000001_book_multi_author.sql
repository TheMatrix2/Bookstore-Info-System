-- +atlas Up

-- Create book_to_author junction table
CREATE TABLE "public"."book_to_author" (
 "book_id" uuid NOT NULL,
 "author_id" uuid NOT NULL,
 PRIMARY KEY ("book_id", "author_id"),
 CONSTRAINT "book_to_author_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
 CONSTRAINT "book_to_author_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Migrate existing single-author data to junction table
INSERT INTO "public"."book_to_author" ("book_id", "author_id")
SELECT "id", "author_id" FROM "public"."books" WHERE "author_id" IS NOT NULL;

-- Drop FK constraint and column from books
ALTER TABLE "public"."books" DROP CONSTRAINT "books_author_id_fkey";
ALTER TABLE "public"."books" DROP COLUMN "author_id";
