# Manual de instalación y despliegue con Docker Compose

Este manual está basado en el `docker-compose.yml` (servicios: `db`, `migrate`, `next-app`, `redis`).  
Incluye pasos para **instalación, despliegue local y producción**, manejo de **variables de entorno**, **versionado** y **publicación** de la imagen en Docker Hub.

---

## 📑 Índice

1. [Requisitos previos](#-0-requisitos-previos)
2. [Configuración del archivo `.env`](#-1-configuración-del-archivo-env)
3. [Despliegue local (modo desarrollo)](#-2-despliegue-local-modo-desarrollo)
4. [Consideraciones generales](#-3-consideraciones-generales)
    - [Orden de inicio y dependencias](#31-orden-de-inicio-y-dependencias)
    - [Persistencia y backups](#32-persistencia-y-backups)
    - [Seguridad (producción)](#33-seguridad-recomendado-para-producción)
    - [Reinicio automático](#34-reinicio-automático)
5. [Construcción, versionado y push](#-4-construcción-versionado-y-push-de-la-imagen-next-app)
6. [Despliegue en producción](#-5-despliegue-en-producción)
7. [Actualización y rollback](#-6-actualización-y-rollback)
8. [Troubleshooting](#-7-troubleshooting)
9. [Snippets útiles](#-8-snippets-útiles)
10. [Comandos clave resumen](#-9-comandos-clave-resumen)
11. [Recomendación final](#recomendación-final)

---

## 🧱 0) Requisitos previos

- **Docker 24+** y **Docker Compose v2+**
- Acceso a **Docker Hub** (usuario con permisos de push)
- Puertos libres:
    - `80` → Reverse Proxy Gateway

---

## ⚙️ 1) Configuración del archivo `.env`

Crea un archivo `.env` en la raíz con el contenido dentro del archivo `.env.example`.

> `DATABASE_URI` se genera automáticamente dentro del `docker-compose.yml` con las variables anteriores.

---

## 🧪 2) Despliegue local (modo desarrollo)

### 2.1 Levantar el entorno

```bash
docker compose up -d
```

### 2.2 Verificar servicios

```bash
docker compose ps
docker compose logs -f next-app
```

### 2.3 Acceso a la aplicación

Abre en tu navegador:

```
http://localhost:80
```

---

## 🧠 3) Consideraciones generales

### 3.1 Orden de inicio y dependencias

- `db` tiene un **healthcheck** configurado.
- `migrate` espera a que `db` esté saludable.
- `next-app` depende de `db`, `migrate` y `redis`.

Para asegurarte de que `next-app` solo inicie si `migrate` termina correctamente (requiere Docker Compose 2.20+):

```yaml
next-app:
    depends_on:
        db:
            condition: service_healthy
        migrate:
            condition: service_completed_successfully
        redis:
            condition: service_started
```

---

### 3.2 Persistencia y backups

El volumen `db_data` asegura que los datos de PostgreSQL se mantengan entre reinicios.

**Backup de la base de datos:**

```bash
docker exec -t postgres-db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > backup.sql
```

**Restaurar backup:**

```bash
cat backup.sql | docker exec -i postgres-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

---

## 🧩 4) Construcción, versionado y push de la imagen `next-app`

El servicio `next-app` genera la imagen:

```
cicompoverflow/cicompoverflow:v${APP_VERSION}
```

### 4.1 Iniciar sesión en Docker Hub

```bash
docker login -u <tu_usuario>
```

### 4.2 Construir y subir imagen

```bash
docker compose build next-app
docker compose push next-app
```

> Si ves `authorization failed`, asegúrate de:
>
> - Estar logueado como usuario con permisos de escritura
> - Que el repo exista en Docker Hub
> - Que el `image:` coincida con el repositorio correcto

---

## 🚀 5) Despliegue en producción

### Opción A: Usando imagen desde Docker Hub (recomendado)

1. Crea un `.env` en el servidor con valores de producción.
    > Asegúrate de modificar el valor de `APP_VERSION` a la versión actual, ya que la imagen en Docker Hub está etiquetada por esta variable.
2. Ejecuta:
    ```bash
    docker compose pull next-app
    docker compose up -d
    ```
3. Verifica:
    ```bash
    docker compose ps
    docker compose logs -f next-app
    ```

### Opción B: Construir localmente en el servidor

```bash
docker compose build next-app
docker compose up -d
```

> No recomendado si el proceso de build es costoso o se necesita control de versiones.

---

## 🔁 6) Actualización y rollback

**Actualizar versión:**

```bash
APP_VERSION=1.1.0
docker compose build next-app
docker compose push next-app
docker compose pull next-app
docker compose up -d
```

**Rollback:**

```bash
APP_VERSION=1.0.0
docker compose pull next-app
docker compose up -d
```

---

## 🧰 7) Troubleshooting

| Problema                           | Causa probable                           | Solución                                   |
| ---------------------------------- | ---------------------------------------- | ------------------------------------------ |
| `authorization failed`             | Usuario sin permisos o repo inexistente  | Verifica login y namespace                 |
| `migrate` falla                    | Script no ejecutable o rutas incorrectas | Revisa `scripts/migrate/up.sh`             |
| `next-app` arranca antes de migrar | Falta condición en `depends_on`          | Usa `service_completed_successfully`       |
| `port already in use`              | Puerto ocupado                           | Cambia mapeo o libera puerto               |
| Permisos de volumen                | Volumen host con propietario incorrecto  | Ajusta con `chown` o usuario en Dockerfile |

---

---

## 🧾 8) Comandos clave resumen

```bash
# Local
docker compose up -d
docker compose logs -f next-app

# Build y push
docker compose build next-app
docker compose push next-app

# Producción
docker compose pull next-app
docker compose up -d
```

---

📘 **Recomendación final:**  
Si no tienes permisos para `cicompoverflow/...`, solicita los permisos al administrador del sistema actual, el cual te proporcionará acceso al Docker Hub.
