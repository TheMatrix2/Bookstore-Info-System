INSERT INTO roles (id, name)
VALUES 
    (gen_random_uuid(), 'user'),
    (gen_random_uuid(), 'admin'),
    (gen_random_uuid(), 'manager'),
    (gen_random_uuid(), 'delivery'),
    (gen_random_uuid(), 'support')
ON CONFLICT (name) DO NOTHING;