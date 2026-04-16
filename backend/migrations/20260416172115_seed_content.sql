-- +atlas Up

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (id, name) VALUES
(gen_random_uuid(), 'Фантастика'),
(gen_random_uuid(), 'Классика'),
(gen_random_uuid(), 'Детектив'),
(gen_random_uuid(), 'Философия'),
(gen_random_uuid(), 'Научная литература');

-- =========================
-- AUTHORS (5)
-- =========================
INSERT INTO authors (id, surname, name, patronymic) VALUES
(gen_random_uuid(), 'Толстой', 'Лев', 'Николаевич'),
(gen_random_uuid(), 'Достоевский', 'Фёдор', 'Михайлович'),
(gen_random_uuid(), 'Булгаков', 'Михаил', 'Афанасьевич'),
(gen_random_uuid(), 'Пелевин', 'Виктор', 'Олегович'),
(gen_random_uuid(), 'Стругацкий', 'Аркадий', 'Натанович');

-- =========================
-- PUBLISHERS (3 реальных)
-- =========================
INSERT INTO publishers (id, name, address, email, website) VALUES
(gen_random_uuid(), 'Эксмо', 'Москва, Россия', 'info@eksmo.ru', 'https://eksmo.ru'),
(gen_random_uuid(), 'АСТ', 'Москва, Россия', 'info@ast.ru', 'https://ast.ru'),
(gen_random_uuid(), 'Питер', 'Санкт-Петербург, Россия', 'info@piter.com', 'https://piter.com');

-- =========================
-- BOOKS (10)
-- =========================
INSERT INTO books (id, title, price, stock, author_id, publisher_id)
VALUES
-- Толстой
(gen_random_uuid(), 'Война и мир', 1200, 10,
 (SELECT id FROM authors WHERE surname='Толстой'),
 (SELECT id FROM publishers WHERE name='Эксмо')),

(gen_random_uuid(), 'Анна Каренина', 900, 8,
 (SELECT id FROM authors WHERE surname='Толстой'),
 (SELECT id FROM publishers WHERE name='АСТ')),

-- Достоевский
(gen_random_uuid(), 'Преступление и наказание', 800, 12,
 (SELECT id FROM authors WHERE surname='Достоевский'),
 (SELECT id FROM publishers WHERE name='Эксмо')),

(gen_random_uuid(), 'Братья Карамазовы', 950, 7,
 (SELECT id FROM authors WHERE surname='Достоевский'),
 (SELECT id FROM publishers WHERE name='АСТ')),

-- Булгаков
(gen_random_uuid(), 'Мастер и Маргарита', 850, 15,
 (SELECT id FROM authors WHERE surname='Булгаков'),
 (SELECT id FROM publishers WHERE name='Эксмо')),

-- Пелевин
(gen_random_uuid(), 'Generation П', 700, 9,
 (SELECT id FROM authors WHERE surname='Пелевин'),
 (SELECT id FROM publishers WHERE name='АСТ')),

(gen_random_uuid(), 'Чапаев и Пустота', 750, 6,
 (SELECT id FROM authors WHERE surname='Пелевин'),
 (SELECT id FROM publishers WHERE name='Эксмо')),

-- Стругацкий
(gen_random_uuid(), 'Пикник на обочине', 780, 11,
 (SELECT id FROM authors WHERE surname='Стругацкий'),
 (SELECT id FROM publishers WHERE name='Питер')),

(gen_random_uuid(), 'Трудно быть богом', 820, 10,
 (SELECT id FROM authors WHERE surname='Стругацкий'),
 (SELECT id FROM publishers WHERE name='АСТ')),

(gen_random_uuid(), 'Обитаемый остров', 770, 13,
 (SELECT id FROM authors WHERE surname='Стругацкий'),
 (SELECT id FROM publishers WHERE name='Эксмо'));

-- =========================
-- BOOK -> CATEGORY (M2M)
-- =========================

-- Фантастика
INSERT INTO book_to_category (book_id, category_id)
SELECT b.id, c.id
FROM books b, categories c
WHERE b.title IN ('Пикник на обочине', 'Трудно быть богом', 'Обитаемый остров')
  AND c.name = 'Фантастика';

-- Классика
INSERT INTO book_to_category (book_id, category_id)
SELECT b.id, c.id
FROM books b, categories c
WHERE b.title IN ('Война и мир', 'Анна Каренина', 'Преступление и наказание', 'Братья Карамазовы')
  AND c.name = 'Классика';

-- Философия
INSERT INTO book_to_category (book_id, category_id)
SELECT b.id, c.id
FROM books b, categories c
WHERE b.title IN ('Чапаев и Пустота')
  AND c.name = 'Философия';

-- Детектив (условно)
INSERT INTO book_to_category (book_id, category_id)
SELECT b.id, c.id
FROM books b, categories c
WHERE b.title IN ('Преступление и наказание')
  AND c.name = 'Детектив';
