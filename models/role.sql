CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    salary NUMERIC(10,2) NOT Null,
    depertment_id INTEGER REFERENCES department(id)
);