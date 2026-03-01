-- Insert example users
INSERT INTO users (name, password_hash, role) VALUES
('Alice Admin', 'hash_alice', 'admin'),
('Bob Boss', 'hash_bob', 'admin'),
('Charlie User', 'hash_charlie', 'user'),
('Diana User', 'hash_diana', 'user'),
('Eve User', 'hash_eve', 'user');

INSERT INTO contacts (first_name, last_name, email, telephone_number, custom_fields) VALUES
('Max', 'Mustermann', 'max@example.com', '+49111111111', '{"company": "ACME"}'),
('Erika', 'Musterfrau', 'erika@example.com', '+49222222222', '{"notes": "VIP"}'),
('John', 'Doe', 'john@example.com', '+49333333333', '{}'),
('Jane', 'Doe', 'jane@example.com', '+49444444444', '{"tags": ["lead"]}'),
('Peter', 'Parker', 'peter@example.com', '+49555555555', '{"city": "New York"}'),
('Bruce', 'Wayne', 'bruce@example.com', '+49666666666', '{"priority": "high"}'),
('Clark', 'Kent', 'clark@example.com', '+49777777777', '{}'),
('Tony', 'Stark', 'tony@example.com', '+49888888888', '{"company": "Stark Industries"}');

INSERT INTO user_contacts (user_id, contact_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 4),
(2, 5),
(3, 6),
(4, 1),
(4, 4),
(4, 7),
(4, 8);