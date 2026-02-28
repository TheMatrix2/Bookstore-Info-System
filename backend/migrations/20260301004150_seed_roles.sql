INSERT INTO roles (id, name)
VALUES 
    (gen_random_uuid(), 'admin'),
    (gen_random_uuid(), 'user')
ON CONFLICT (name) DO NOTHING;