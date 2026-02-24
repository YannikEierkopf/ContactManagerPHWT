CREATE TABLE contacts (
                          id SERIAL PRIMARY KEY,
                          first_name VARCHAR(255),
                          last_name VARCHAR(255),
                          email VARCHAR(255),
                          telephone_number VARCHAR(50),
                          custom_fields JSONB
);