CREATE TYPE role AS ENUM ('admin', 'user');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role role NOT NULL DEFAULT 'user'
);

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telephone_number VARCHAR(30),
    custom_fields JSON NOT NULL DEFAULT '{}'::json
);

CREATE TABLE user_contacts (
    user_id INT NOT NULL,
    contact_id INT NOT NULL,
    PRIMARY KEY (user_id, contact_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);