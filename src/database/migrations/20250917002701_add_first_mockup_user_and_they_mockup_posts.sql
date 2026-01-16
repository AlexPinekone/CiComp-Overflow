BEGIN;

WITH new_user AS (
    INSERT INTO
        "Users" (name, "lastName", role)
    VALUES
        ('Usuario', 'Prueba', 'USER') RETURNING "userId"
),
new_account AS (
    INSERT INTO
        "Accounts" ("userId", password, mail)
    SELECT
        "userId",
        crypt('password123', gen_salt('bf', 10)),
        'usuario.prueba@example.com'
    FROM
        new_user RETURNING "userId"
),
new_profile AS (
    INSERT INTO
        "Profiles" ("userId", "userName", photo, description)
    SELECT
        "userId",
        'usuario_prueba',
        NULL,
        'Cuenta de prueba para demostrar el uso de la plataforma'
    FROM
        new_account RETURNING "userId"
)
INSERT INTO
    "Posts" (title, body, "userId")
SELECT
    'Bienvenido a la plataforma',
    'Esta es una aplicación tipo foro donde puedes consultar publicaciones de la comunidad. El acceso es público.',
    "userId"
FROM
    new_profile
UNION
ALL
SELECT
    'Cómo crear una cuenta',
    'Si deseas registrarte, contacta a los encargados en el 6to piso del edificio T.',
    "userId"
FROM
    new_profile
UNION
ALL
SELECT
    'Cómo funciona la página',
    'Puedes navegar por las publicaciones y comentarios. Si eres usuario registrado, puedes crear tus propios posts y comentar.',
    "userId"
FROM
    new_profile
UNION
ALL
SELECT
    'Normas básicas',
    'Respeta a la comunidad, no publiques spam y mantén las conversaciones dentro del tema.',
    "userId"
FROM
    new_profile;

COMMIT;