-- SQL Migration: UsuarioAdmin

--
-- "Up" Migration: changes to apply
--
-- Use this section to create tables, add columns, etc.
--
-- For example:
-- CREATE TABLE users (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL
-- );

---

--
-- "Down" Migration: changes to revert
--
-- Use this section to revert the changes from the "up" migration.
-- For example:
-- DROP TABLE users;
--


WITH new_user AS (
    INSERT INTO
        "Users" (name, "lastName", role)
    VALUES
        ('Admin', 'Prueba', 'ADMIN') RETURNING "userId"
),
new_account AS (
    INSERT INTO
        "Accounts" ("userId", password, mail)
    SELECT
        "userId",
        crypt('password123', gen_salt('bf', 10)),
        'admin.prueba@example.com'
    FROM
        new_user RETURNING "userId"
),
new_profile AS (
    INSERT INTO
        "Profiles" ("userId", "userName", photo, description)
    SELECT
        "userId",
        'admin_prueba',
        NULL,
        'Cuenta de prueba para demostrar el rol de administrador'
    FROM
        new_account RETURNING "userId"
)
SELECT * FROM new_profile;