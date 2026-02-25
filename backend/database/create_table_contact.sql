CREATE TYPE role AS ENUM ('admin', 'user');

CREATE TABLE user (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255),
                    password_hash VARCHAR(255),
                    role role NOT NULL DEFAULT 'user'
);

CREATE TABLE contact (
                        id SERIAL PRIMARY KEY,
                        first_name VARCHAR(255),
                        last_name VARCHAR(255),
                        email VARCHAR(255),
                        telephone_number VARCHAR(16),
                        custom_fields JSON
);

CREATE TABLE user_contact (
                            user_id INT,
                            contact_id INT,
                            PRIMARY KEY(user_id, contact_id)
);
