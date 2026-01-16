# Documento de Pruebas - CiComp Overflow

Este documento incluye las pruebas realizadas para el proyecto **CiComp Overflow**, una plataforma web educativa para estudiantes del área de Ciencias de la Computación, inspirada en Stack Overflow, donde los usuarios pueden compartir y resolver dudas académicas.

---

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Configuración y Ejecución](#configuración-y-ejecución)
3. [Pruebas Unitarias](#pruebas-unitarias)
4. [Pruebas de Funcionalidad](#pruebas-de-funcionalidad)
5. [Pruebas de Caja Negra](#pruebas-de-caja-negra)
6. [Pruebas de Caja Blanca](#pruebas-de-caja-blanca)
7. [Cobertura de Código](#cobertura-de-código)

---

## Resumen Ejecutivo

### Estadísticas Generales

| Métrica | Backend | Frontend | Total |
|---------|---------|----------|-------|
| **Archivos de Prueba** | 12 | 8 | 20 |
| **Test Suites** | 12 passed | 8 passed | 20 passed |
| **Pruebas Ejecutadas** | 232 | 26 | 258 |
| **Pruebas Exitosas** | 232 (100%) | 26 (100%) | 258 (100%) |
| **Tiempo de Ejecución** | 18.151s | 20.322s | 38.473s |

### Estado del Proyecto

- **Pruebas Fallidas:** 0
- **Cobertura Promedio:** 70.75%
- **Última Ejecución:** 6 de noviembre, 2025
- **Versión:** 1.0.0

---

## Configuración y Ejecución

### Requisitos del Sistema

**Hardware:**
- CPU: 4 cores mínimo
- RAM: 8GB mínimo
- Disco: 20GB disponible (SSD recomendado)

**Software:**
- Node.js: v20.x o superior
- npm: v10.x o superior
- TypeScript: v5.x
- Jest: v29.x
- Testing Library: v14.x

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-repo/cicomp-overflow.git
cd cicomp-overflow

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.test
```

### Ejecutar Pruebas

#### Suite Completa

```bash
# Todas las pruebas (backend + frontend)
npm test

# Con reporte de cobertura
npm run test:coverage
```

#### Backend

```bash
# Todas las pruebas backend
npm run test:backend

# Con cobertura
npm run test:backend -- --coverage

# Modo watch para desarrollo
npm run test:backend -- --watch

# Prueba específica
npm run test:backend PostService.test.ts

# Solo servicios
npm run test:backend -- services/

# Solo controladores
npm run test:backend -- controllers/
```

#### Frontend

```bash
# Todas las pruebas frontend
npm run test:frontend

# Con cobertura
npm run test:frontend -- --coverage

# Modo watch para desarrollo
npm run test:frontend -- --watch

# Prueba específica
npm run test:frontend Login.test.tsx

# Solo componentes
npm run test:frontend -- components/
```

### Opciones Adicionales

```bash
# Modo verbose (detalle completo)
npm test -- --verbose

# Solo ver fallos
npm test -- --onlyFailures

# Por patrón de nombre
npm test -- --testNamePattern="create"

# Ejecutar en paralelo (más rápido)
npm test -- --maxWorkers=4

# Generar reporte HTML
npm run test:coverage
# Reportes en: coverage-backend/ y coverage-frontend/
```


## Pruebas Unitarias

El proyecto cuenta con **20 archivos de pruebas** que cubren **258 pruebas** distribuidas en:

### Backend

**Componentes probados:**
- 6 Servicios (Services)
- 6 Controladores (Controllers)

**Total:** 12 archivos con 232 pruebas

### Frontend

**Componentes probados:**
- 1 Página (Login)
- 7 Componentes (UI y lógica)

**Total:** 8 archivos con 26 pruebas

---

## Pruebas de Backend

### 1. Servicios (Services)

#### CommentService.test.ts
**Archivo:** `__tests__/services/CommentService.test.ts`  
**Cobertura:** Gestión de comentarios en posts  
**Pruebas:** 15

**Escenarios cubiertos:**
- Obtención de comentarios con ordenamiento (fecha descendente/ascendente, votos ascendente/descendente)
- Parsing de votos desde JSON a array
- Manejo de JSON inválido y tipos incorrectos
- Operaciones CRUD completas
- Cálculo de score excluyendo votos soft deleted
- Conteo de comentarios por periodo

**Casos de prueba principales:**

| ID | Descripción | Estado |
|----|-------------|--------|
| CS-01 | Ordenamiento por fecha descendente (default) | PASS |
| CS-02 | Ordenamiento por fecha ascendente | PASS |
| CS-03 | Ordenamiento por votos descendente | PASS |
| CS-04 | Ordenamiento por votos ascendente | PASS |
| CS-05 | Parsing de votos desde string JSON | PASS |
| CS-06 | Manejo de JSON inválido en votos | PASS |
| CS-07 | Manejo de votos con tipo no-array | PASS |
| CS-08 | Retorno array vacío sin comentarios | PASS |
| CS-09 | Ignorar votos soft deleted en score | PASS |
| CS-10 | Obtención de comentario por ID | PASS |
| CS-11 | Comentario no encontrado retorna null | PASS |
| CS-12 | Creación de comentario completo | PASS |
| CS-13 | Actualización preservando commentId | PASS |
| CS-14 | Eliminación exitosa | PASS |
| CS-15 | Conteo de comentarios último mes | PASS |

---

#### CommentVoteService.test.ts
**Archivo:** `__tests__/services/CommentVoteService.test.ts`  
**Cobertura:** Sistema de votación en comentarios  
**Pruebas:** 15

**Escenarios cubiertos:**
- Creación, actualización y eliminación de votos
- Toggle de votos (eliminar al votar mismo status)
- Cambio de votos (UPVOTE ↔ DOWNVOTE)
- Preservación de timestamps
- Manejo de votos soft deleted

**Casos de prueba principales:**

| ID | Descripción | Estado |
|----|-------------|--------|
| CVS-01 | Crear voto cuando no existe previo | PASS |
| CVS-02 | Toggle: soft delete al votar mismo status | PASS |
| CVS-03 | Error si toggle delete falla | PASS |
| CVS-04 | Cambio de UPVOTE a DOWNVOTE | PASS |
| CVS-05 | Cambio de DOWNVOTE a UPVOTE | PASS |
| CVS-06 | Preservar createdAt al actualizar | PASS |
| CVS-07 | No actualizar votos soft deleted | PASS |
| CVS-08 | Eliminación exitosa de voto | PASS |
| CVS-09 | Error cuando voto no encontrado | PASS |
| CVS-10 | Cambio de status exitoso | PASS |
| CVS-11 | Obtener todos los votos de comentario | PASS |
| CVS-12 | Array vacío cuando no hay votos | PASS |
| CVS-13 | Obtener voto específico por IDs | PASS |
| CVS-14 | Null cuando usuario no ha votado | PASS |
| CVS-15 | Validación de campos requeridos | PASS |

---

#### PostService.test.ts
**Archivo:** `__tests__/services/PostService.test.ts`  
**Cobertura:** Gestión de posts  
**Pruebas:** 17

**Escenarios cubiertos:**
- CRUD completo de posts
- Filtrado por tags y fecha
- Ordenamiento por novedad y popularidad
- Integración con Cloudinary para imágenes
- Búsqueda y paginación

**Casos de prueba principales:**

| ID | Descripción | Estado |
|----|-------------|--------|
| PS-01 | Obtener posts con ordenamiento default | PASS |
| PS-02 | Filtrar posts por tag | PASS |
| PS-03 | Ordenar posts por votos | PASS |
| PS-04 | Array vacío cuando no hay posts | PASS |
| PS-05 | Obtener post por ID (encontrado) | PASS |
| PS-06 | Post no encontrado retorna null | PASS |
| PS-07 | Crear post sin imagen | PASS |
| PS-08 | Crear post con imagen y Cloudinary | PASS |
| PS-09 | Crear post con tags | PASS |
| PS-10 | Actualizar post sin imagen | PASS |
| PS-11 | Actualizar post con nueva imagen | PASS |
| PS-12 | Actualizar tags de post | PASS |
| PS-13 | Eliminar post exitosamente | PASS |
| PS-14 | Error al eliminar post inexistente | PASS |
| PS-15 | Conteo total de posts | PASS |
| PS-16 | Conteo posts último mes | PASS |
| PS-17 | Búsqueda con paginación | PASS |

---

#### PostVoteService.test.ts
**Archivo:** `__tests__/services/PostVoteService.test.ts`  
**Cobertura:** Sistema de votación en posts  
**Pruebas:** 18

**Escenarios cubiertos:**
- Sistema completo de votación
- Toggle y cambio de votos
- Cálculo de score
- Filtrado de votos activos

**Casos de prueba principales:**

| ID | Descripción | Estado |
|----|-------------|--------|
| PVS-01 | Crear voto cuando no existe | PASS |
| PVS-02 | Eliminar voto al votar mismo status | PASS |
| PVS-03 | Error si toggle delete falla | PASS |
| PVS-04 | Cambio UPVOTE a DOWNVOTE | PASS |
| PVS-05 | Cambio DOWNVOTE a UPVOTE | PASS |
| PVS-06 | Error si actualización falla | PASS |
| PVS-07 | Manejo de votos soft deleted | PASS |
| PVS-08 | Eliminación exitosa | PASS |
| PVS-09 | Error cuando voto no encontrado | PASS |
| PVS-10 | Cambio de status exitoso | PASS |
| PVS-11 | Obtener todos los votos | PASS |
| PVS-12 | Array vacío sin votos | PASS |
| PVS-13 | Obtener voto por IDs | PASS |
| PVS-14 | Null cuando usuario no votó | PASS |
| PVS-15 | Excluir votos soft deleted | PASS |
| PVS-16 | Array vacío con todos deleted | PASS |
| PVS-17 | Cálculo correcto de score | PASS |
| PVS-18 | Conteo votos último mes | PASS |

---

#### TagService.test.ts
**Archivo:** `__tests__/services/TagService.test.ts`  
**Cobertura:** Gestión de etiquetas  
**Pruebas:** 8

**Casos de prueba principales:**

| ID | Descripción | Estado |
|----|-------------|--------|
| TS-01 | Obtener catálogo completo | PASS |
| TS-02 | Tags ordenadas alfabéticamente | PASS |
| TS-03 | Array vacío sin tags | PASS |
| TS-04 | Múltiples tags mismo label | PASS |
| TS-05 | Buscar tag por nombre | PASS |
| TS-06 | Tag no encontrada | PASS |
| TS-07 | Búsqueda case sensitive | PASS |
| TS-08 | No retornar tags soft deleted | PASS |

---

#### UserNotificationService.spec.ts
**Archivo:** `__tests__/services/UserNotificationService.spec.ts`  
**Cobertura:** Sistema de notificaciones  
**Pruebas:** 6

**Casos de prueba principales:**

| ID | Descripción | Estado |
|----|-------------|--------|
| UNS-01 | Obtener notificaciones por userId | PASS |
| UNS-02 | Obtener notificación por ID | PASS |
| UNS-03 | Crear notificación completa | PASS |
| UNS-04 | Marcar como leída | PASS |
| UNS-05 | Soft delete de notificación | PASS |
| UNS-06 | Eliminar todas por userId | PASS |

---

### 2. Controladores (Controllers)

#### CommentController.test.ts
**Archivo:** `__tests__/controllers/CommentController.test.ts`  
**Cobertura:** Endpoints HTTP de comentarios  
**Pruebas:** 41

**Escenarios cubiertos:**
- Endpoints GET, POST, PUT, DELETE
- Validación de parámetros
- Autenticación con header y cookie
- Manejo de errores

**Casos de prueba principales:**

| ID | Descripción | Código HTTP | Estado |
|----|-------------|-------------|--------|
| CC-01 | GET comentarios ordenamiento default | 200 | PASS |
| CC-02 | GET comentarios orden personalizado | 200 | PASS |
| CC-03 | GET sin postId | 400 | PASS |
| CC-04 | GET comentario por ID | 200 | PASS |
| CC-05 | GET ID faltante | 400 | PASS |
| CC-06 | GET comentario no encontrado | 404 | PASS |
| CC-07 | POST crear con Authorization header | 201 | PASS |
| CC-08 | POST crear con cookie session | 201 | PASS |
| CC-09 | POST body vacío | 400 | PASS |
| CC-10 | POST sin autenticación | 401 | PASS |
| CC-11 | PUT actualizar exitoso | 200 | PASS |
| CC-12 | PUT sin ID | 400 | PASS |
| CC-13 | DELETE exitoso | 200 | PASS |
| CC-14 | DELETE sin ID | 400 | PASS |
| CC-15 | DELETE todos los comentarios | 204 | PASS |
| CC-16 | Manejo de errores con ErrorHandler | 500 | PASS |

---

#### CommentVoteController.test.ts
**Archivo:** `__tests__/controllers/CommentVoteController.test.ts`  
**Cobertura:** Endpoints HTTP de votos en comentarios  
**Pruebas:** 40

**Casos de prueba principales:**

| ID | Descripción | Código HTTP | Estado |
|----|-------------|-------------|--------|
| CVC-01 | POST crear voto | 201 | PASS |
| CVC-02 | POST sin userId | 400 | PASS |
| CVC-03 | POST sin commentId | 400 | PASS |
| CVC-04 | POST sin status | 400 | PASS |
| CVC-05 | POST status inválido | 400 | PASS |
| CVC-06 | POST toggle (softDelete true) | 201 | PASS |
| CVC-07 | POST cambio de voto | 201 | PASS |
| CVC-08 | PUT cambiar status | 200 | PASS |
| CVC-09 | PUT sin userId | 400 | PASS |
| CVC-10 | PUT voto no encontrado | 404 | PASS |
| CVC-11 | DELETE voto | 200 | PASS |
| CVC-12 | DELETE sin parámetros | 400 | PASS |
| CVC-13 | GET votos de comentario | 200 | PASS |
| CVC-14 | GET voto específico | 200 | PASS |
| CVC-15 | Manejo de errores | 500 | PASS |

---

#### PostController.test.ts
**Archivo:** `__tests__/controllers/PostController.test.ts`  
**Cobertura:** Endpoints HTTP de posts  
**Pruebas:** 44

**Casos de prueba principales:**

| ID | Descripción | Código HTTP | Estado |
|----|-------------|-------------|--------|
| PC-01 | GET posts ordenamiento default | 200 | PASS |
| PC-02 | GET posts con orderBy custom | 200 | PASS |
| PC-03 | GET posts filtrados por tag | 200 | PASS |
| PC-04 | GET posts por publishedDate | 200 | PASS |
| PC-05 | GET post por ID | 200 | PASS |
| PC-06 | GET ID inválido | 400 | PASS |
| PC-07 | GET post no encontrado | 404 | PASS |
| PC-08 | POST crear post | 201 | PASS |
| PC-09 | POST sin title | 400 | PASS |
| PC-10 | POST sin body | 400 | PASS |
| PC-11 | PUT actualizar post | 200 | PASS |
| PC-12 | PUT ID inválido | 400 | PASS |
| PC-13 | DELETE post | 200 | PASS |
| PC-14 | DELETE sin ID | 400 | PASS |
| PC-15 | GET conteo total | 200 | PASS |
| PC-16 | GET conteo último mes | 200 | PASS |
| PC-17 | Búsqueda con paginación | 200 | PASS |
| PC-18 | Manejo de errores | 500 | PASS |

---

#### PostVoteController.test.ts
**Archivo:** `__tests__/controllers/PostVoteController.test.ts`  
**Cobertura:** Endpoints HTTP de votos en posts  
**Pruebas:** 42

**Casos de prueba principales:**

| ID | Descripción | Código HTTP | Estado |
|----|-------------|-------------|--------|
| PVC-01 | POST crear voto | 201 | PASS |
| PVC-02 | POST sin userId | 400 | PASS |
| PVC-03 | POST sin postId | 400 | PASS |
| PVC-04 | POST sin status | 400 | PASS |
| PVC-05 | POST status inválido | 400 | PASS |
| PVC-06 | POST toggle via error | 200 | PASS |
| PVC-07 | PUT cambiar voto | 200 | PASS |
| PVC-08 | PUT sin parámetros | 400 | PASS |
| PVC-09 | PUT voto no encontrado | 404 | PASS |
| PVC-10 | DELETE voto | 200 | PASS |
| PVC-11 | DELETE sin parámetros | 400 | PASS |
| PVC-12 | GET votos de post | 200 | PASS |
| PVC-13 | GET voto específico | 200 | PASS |
| PVC-14 | GET todos los votos | 200 | PASS |
| PVC-15 | Conteo votos último mes | 200 | PASS |

---

#### TagController.test.ts
**Archivo:** `__tests__/controllers/TagController.test.ts`  
**Cobertura:** Endpoints HTTP de tags  
**Pruebas:** 9

**Casos de prueba principales:**

| ID | Descripción | Código HTTP | Estado |
|----|-------------|-------------|--------|
| TC-01 | GET catálogo completo | 200 | PASS |
| TC-02 | GET array vacío sin tags | 200 | PASS |
| TC-03 | POST buscar por nombre | 200 | PASS |
| TC-04 | POST sin nombre | 400 | PASS |
| TC-05 | POST nombre no string | 400 | PASS |
| TC-06 | POST string vacío | 400 | PASS |
| TC-07 | POST tag no encontrada | 404 | PASS |
| TC-08 | Manejo de errores | 500 | PASS |

---

#### NotificationController.spec.ts
**Archivo:** `__tests__/controllers/NotificationController.spec.ts`  
**Cobertura:** Endpoints HTTP de notificaciones  
**Pruebas:** 17

**Casos de prueba principales:**

| ID | Descripción | Código HTTP | Estado |
|----|-------------|-------------|--------|
| NC-01 | GET notificaciones por userId | 200 | PASS |
| NC-02 | GET sin userId | 400 | PASS |
| NC-03 | GET notificación por ID | 200 | PASS |
| NC-04 | GET ID inválido | 400 | PASS |
| NC-05 | GET notificación no encontrada | 404 | PASS |
| NC-06 | POST crear notificación | 201 | PASS |
| NC-07 | POST campos faltantes | 400 | PASS |
| NC-08 | POST marcar como leída | 200 | PASS |
| NC-09 | POST ID inválido | 400 | PASS |
| NC-10 | DELETE notificación | 204 | PASS |
| NC-11 | DELETE todas por userId | 204 | PASS |
| NC-12 | Manejo de errores | 500 | PASS |

---

## Pruebas de Frontend

### 1. Páginas (Pages)

#### Login.test.tsx
**Archivo:** `__tests__/src/components/Login.test.tsx`  
**Cobertura:** Página de inicio de sesión  
**Pruebas:** 4

**Casos de prueba:**

| ID | Descripción | Estado |
|----|-------------|--------|
| LP-01 | Renderizado correcto | PASS |
| LP-02 | Escribir en inputs | PASS |
| LP-03 | Error en login fallido | PASS |
| LP-04 | Redirección en login exitoso | PASS |

---

### 2. Componentes (Components)

#### CommentForm.test.tsx
**Archivo:** `__tests__/src/components/CommentForm.test.tsx`  
**Cobertura:** Formulario de comentarios  
**Pruebas:** 4

**Casos de prueba:**

| ID | Descripción | Estado |
|----|-------------|--------|
| CF-01 | Renderizar textarea y botón | PASS |
| CF-02 | Validar body vacío | PASS |
| CF-03 | Validar longitud > 500 | PASS |
| CF-04 | Submit exitoso con notificación | PASS |

---

#### CommentList.test.tsx
**Archivo:** `__tests__/src/components/CommentList.test.tsx`  
**Cobertura:** Lista de comentarios  
**Pruebas:** 3

**Casos de prueba:**

| ID | Descripción | Estado |
|----|-------------|--------|
| CL-01 | Renderizar lista completa | PASS |
| CL-02 | No mostrar items sin comentarios | PASS |
| CL-03 | Pasar highlightedId correctamente | PASS |

---

#### CommentVoteButtons.test.tsx
**Archivo:** `__tests__/src/components/CommentVoteButtons.test.tsx`  
**Cobertura:** Botones de votación en comentarios  
**Pruebas:** 4

**Casos de prueba:**

| ID | Descripción | Estado |
|----|-------------|--------|
| CVB-01 | Renderizar botones de voto | PASS |
| CVB-02 | Redirección sin autenticación | PASS |
| CVB-03 | Cambio de clases CSS al votar | PASS |
| CVB-04 | Mostrar contador solo si > 0 | PASS |

---

#### VoteButtons.test.tsx
**Archivo:** `__tests__/src/components/VoteButtons.test.tsx`  
**Cobertura:** Botones de votación en posts  
**Pruebas:** 4

**Casos de prueba:**

| ID | Descripción | Estado |
|----|-------------|--------|
| VB-01 | Renderizar ambos botones | PASS |
| VB-02 | Redirección sin usuario | PASS |
| VB-03 | Aplicar clase al votar | PASS |
| VB-04 | Actualización optimista de contador | PASS |

---

#### PostCard.test.tsx
**Archivo:** `__tests__/src/components/PostCard.test.tsx`  
**Cobertura:** Tarjeta de post  
**Pruebas:** 4

**Casos de prueba:**

| ID | Descripción | Estado |
|----|-------------|--------|
| PC-01 | Renderizar título y contenido | PASS |
| PC-02 | Mostrar tags correctamente | PASS |
| PC-03 | Mostrar conteo de votos | PASS |
| PC-04 | No renderizar tags vacías | PASS |

---

#### PostInput.test.tsx
**Archivo:** `__tests__/src/components/PostInput.test.tsx`  
**Cobertura:** Modal de creación de posts  
**Pruebas:** 2

**Casos de prueba:**

| ID | Descripción | Estado |
|----|-------------|--------|
| PI-01 | Crear post completo | PASS |
| PI-02 | Cerrar modal al cancelar | PASS |

---

#### PostList.test.tsx
**Archivo:** `__tests__/src/components/PostList.test.tsx`  
**Cobertura:** Lista de posts con scroll infinito  
**Pruebas:** 1

**Casos de prueba:**

| ID | Descripción | Estado |
|----|-------------|--------|
| PL-01 | Renderizar posts y tags | PASS |

---

## Pruebas de Funcionalidad

### Sistema de Posts

**Funcionalidades verificadas:**

1. **CRUD Completo**
   - Crear post sin/con imagen
   - Leer post por ID y lista paginada
   - Actualizar post y sus tags
   - Eliminar post y relaciones

2. **Búsqueda y Filtrado**
   - Filtrar por tags
   - Filtrar por fecha de publicación
   - Búsqueda por texto
   - Paginación de resultados

3. **Ordenamiento**
   - Por fecha (newest)
   - Por popularidad (votes)

4. **Integración Externa**
   - Subida de imágenes a Cloudinary
   - Actualización de URLs en contenido



---

### Sistema de Comentarios

**Funcionalidades verificadas:**

1. **CRUD Completo**
   - Crear comentario en post
   - Leer comentarios ordenados
   - Actualizar body de comentario
   - Eliminar comentario (soft delete)

2. **Ordenamiento**
   - Por fecha (asc/desc)
   - Por votos (asc/desc)

3. **Procesamiento de Datos**
   - Parsing de votos desde JSON
   - Cálculo de score
   - Exclusión de votos deleted

---

### Sistema de Votos

**Funcionalidades verificadas:**

1. **Votación Básica**
   - UPVOTE en posts/comentarios
   - DOWNVOTE en posts/comentarios
   - Toggle (eliminar al votar igual)
   - Cambio (UPVOTE ↔ DOWNVOTE)

2. **Integridad de Datos**
   - Soft delete de votos
   - Preservación de createdAt
   - Cálculo correcto de score
   - Exclusión de votos eliminados

**Flujos end-to-end:**

---

### Sistema de Tags

**Funcionalidades verificadas:**

1. **Gestión de Tags**
   - Obtener catálogo completo
   - Buscar por nombre (case sensitive)
   - Asignar múltiples tags a post
   - Filtrar posts por tag

2. **Validaciones**
   - Tags ordenadas alfabéticamente
   - Exclusión de tags soft deleted
   - Manejo de caracteres especiales

---

### Sistema de Notificaciones

**Funcionalidades verificadas:**

1. **Gestión de Notificaciones**
   - Crear notificación por tipo (LIKE, ANSWER, etc.)
   - Marcar como leída
   - Eliminar individual (soft delete)
   - Eliminar masiva por usuario

2. **Consultas**
   - Listar por usuario
   - Obtener por ID
   - Filtrar por estado (leída/no leída)

---

### Sistema de Autenticación

**Funcionalidades verificadas:**

1. **Métodos de Autenticación**
   - Authorization header (Bearer token)
   - Cookie session
   - Fallback a cookie si header falla

2. **Validaciones**
   - Verificación de tokens
   - Manejo de sesiones expiradas
   - Protección de endpoints
   - Respuesta 401 sin autenticación

---

## Pruebas de Caja Negra

### Caso CB-01: Post sin Autenticación

**Entrada:**
```http
POST /api/posts
Body: {
  "title": "Nuevo Post",
  "body": "Contenido"
}
```

**Salida Esperada:** 401 Unauthorized  
**Resultado:** PASS

---

### Caso CB-02: Campos Faltantes

**Entrada:**
```http
POST /api/posts
Headers: { Authorization: "Bearer token" }
Body: {
  "title": "Solo título"
}
```

**Salida Esperada:** 400 Bad Request  
**Resultado:** PASS

---

### Caso CB-03: Toggle de Voto

**Precondición:** Usuario votó UPVOTE

**Entrada:**
```http
POST /api/postVotes
Body: {
  "userId": "user1",
  "postId": "post1",
  "status": "UPVOTE"
}
```

**Salida Esperada:** Voto con `softDelete: true`  
**Resultado:** PASS

---

### Caso CB-04: Cambio de Voto

**Precondición:** Usuario votó UPVOTE

**Entrada:**
```http
POST /api/postVotes
Body: {
  "userId": "user1",
  "postId": "post1",
  "status": "DOWNVOTE"
}
```

**Salida Esperada:** Status = DOWNVOTE, createdAt preservado  
**Resultado:** PASS

---

### Caso CB-05: Filtro por Tag Inexistente

**Entrada:**
```http
GET /api/posts?tag=TagInexistente
```

**Salida Esperada:** Array vacío `[]`  
**Resultado:** PASS

---

### Caso CB-06: Status Inválido

**Entrada:**
```http
POST /api/postVotes
Body: {
  "userId": "user1",
  "postId": "post1",
  "status": "MEGUSTA"
}
```

**Salida Esperada:** 400 Bad Request  
**Resultado:** PASS

---

### Caso CB-07: Eliminar Comentario Inexistente

**Entrada:**
```http
DELETE /api/comments/999
```

**Salida Esperada:** Error "Comment not found"  
**Resultado:** PASS

---

### Caso CB-08: Query Params Inválidos

**Entrada:**
```http
GET /api/posts?orderBy=invalid
```

**Salida Esperada:** Ordenamiento default aplicado  
**Resultado:** PASS

---

## Pruebas de Caja Blanca

### Caso CBL-01: Cobertura de Ramas en Sistema de Votos

**Código analizado:**
```typescript
if (existingVote) {
  if (existingVote.status === newStatus) {
    // Branch 1: Toggle - Eliminar voto
    return deleteVote();
  } else {
    // Branch 2: Cambiar voto
    return updateVoteStatus();
  }
} else {
  // Branch 3: Crear nuevo voto
  return createNewVote();
}
```

**Ramas probadas:**
- Branch 1: Toggle ejecutado correctamente - PASS
- Branch 2: Cambio de status ejecutado correctamente - PASS
- Branch 3: Creación de nuevo voto ejecutada correctamente - PASS

**Cobertura:** 100% de ramas

---

### Caso CBL-02: Validación de Campos Requeridos

**Código analizado:**
```typescript
if (!userId || !postId || !status) {
  return Response.json(
    { error: 'Missing required fields' }, 
    { status: 400 }
  );
}
```

**Condiciones probadas:**
- `!userId` es true → Error 400 - PASS
- `!postId` es true → Error 400 - PASS
- `!status` es true → Error 400 - PASS
- Todas las condiciones false → Flujo continúa - PASS

**Cobertura:** 100% de condiciones

---

### Caso CBL-03: Parsing de Votos desde JSON

**Código analizado:**
```typescript
try {
  const parsedVotes = JSON.parse(comment.votes);
  if (Array.isArray(parsedVotes)) {
    comment.votes = parsedVotes;
  } else {
    comment.votes = [];
  }
} catch {
  comment.votes = [];
}
```

**Casos probados:**
- JSON válido con array → Parsing exitoso - PASS
- JSON inválido → Catch ejecutado, array vacío - PASS
- JSON válido pero no array → Array vacío - PASS

**Cobertura:** 100% de líneas y excepciones

---

### Caso CBL-04: Cálculo de Score

**Código analizado:**
```typescript
const activeVotes = votes.filter(v => !v.softDelete);
const upvotes = activeVotes.filter(v => v.status === 'UPVOTE').length;
const downvotes = activeVotes.filter(v => v.status === 'DOWNVOTE').length;
const score = upvotes - downvotes;
```

**Casos probados:**
- 2 upvotes, 1 downvote, 0 deleted → score = 1 - PASS
- 2 upvotes, 1 downvote, 1 deleted upvote → score = 0 - PASS
- Solo votos deleted → score = 0 - PASS

**Cobertura:** 100% de lógica de cálculo

---

### Caso CBL-05: Flujo de Autenticación con Fallback

**Código analizado:**
```typescript
const headerToken = request.headers.get('Authorization');
let session = await decrypt(headerToken);

if (!session) {
  const cookieToken = await getCurrentSessionFromCookies();
  session = await decrypt(cookieToken);
}

if (!session) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Casos probados:**
- Token en header válido → Autenticación exitosa - PASS
- Token en header inválido, cookie válida → Autenticación exitosa - PASS
- Ambos inválidos → 401 Unauthorized - PASS

**Cobertura:** 100% de flujo de autenticación

---

## Cobertura de Código

### Resumen General

| Componente | Statements | Branch | Functions | Lines |
|------------|-----------|---------|-----------|-------|
| **Backend** | 61.42% | 56.64% | 47.95% | 61.96% |
| **Frontend** | 80.07% | 68.35% | 54.54% | 84.22% |
| **Promedio General** | **70.75%** | **62.50%** | **51.25%** | **73.09%** |

---

### Cobertura Detallada Backend

#### Controllers

| Archivo | Statements | Branch | Functions | Lines | Líneas No Cubiertas |
|---------|-----------|---------|-----------|-------|---------------------|
| **CommentController.ts** | 100% | 94.44% | 100% | 100% | 57, 102 |
| **CommentVoteController.ts** | 100% | 100% | 100% | 100% | - |
| **PostController.ts** | 90.65% | 73.80% | 100% | 90.65% | 30-31, 55-56, 93, 133, 225-226, 258-259 |
| **PostVoteController.ts** | 100% | 100% | 100% | 100% | - |
| **TagController.ts** | 100% | 100% | 100% | 100% | - |
| **UserNotificationController.ts** | 100% | 100% | 100% | 100% | - |
| **Promedio** | **97.28%** | **90.37%** | **100%** | **97.28%** | - |

#### Services

| Archivo | Statements | Branch | Functions | Lines | Líneas No Cubiertas |
|---------|-----------|---------|-----------|-------|---------------------|
| **CloudinaryService.ts** | 8.33% | 0% | 0% | 8.33% | 12-97 |
| **CommentService.ts** | 94.28% | 93.33% | 100% | 96.87% | 72 |
| **CommentVoteService.ts** | 100% | 91.66% | 100% | 100% | 9 |
| **PostService.ts** | 100% | 90% | 100% | 100% | 40 |
| **PostVoteService.ts** | 100% | 100% | 100% | 100% | - |
| **TagService.ts** | 100% | 100% | 100% | 100% | - |
| **UserNotificationService.ts** | 100% | 100% | 100% | 100% | - |
| **Promedio** | **78.39%** | **63.75%** | **85.71%** | **78.34%** | - |

**Nota:** CloudinaryService tiene baja cobertura porque es un servicio externo mockeado. Los servicios principales tienen cobertura superior al 90%.

#### Data Access Objects (DAO)

| Archivo | Statements | Branch | Functions | Lines | Líneas No Cubiertas |
|---------|-----------|---------|-----------|-------|---------------------|
| **CommentDAO.ts** | 10% | 0% | 0% | 10% | 10-121 |
| **CommentVoteDAO.ts** | 8.82% | 0% | 0% | 8.82% | 9-149 |
| **PostDAO.ts** | 6.49% | 0% | 0% | 6.94% | 10-349 |
| **PostVoteDAO.ts** | 7.5% | 0% | 0% | 7.5% | 8-183 |
| **TagDAO.ts** | 6.52% | 0% | 0% | 6.66% | 10-113 |
| **UserNotificationDAO.ts** | 14.28% | 0% | 0% | 14.28% | 11-87 |
| **Promedio** | **8.06%** | **0%** | **0%** | **8.26%** | - |

**Nota:** Los DAOs tienen baja cobertura intencional porque están completamente mockeados en las pruebas unitarias. Las pruebas se enfocan en la lógica de negocio (Services) y presentación (Controllers).

#### Database

| Archivo | Statements | Branch | Functions | Lines |
|---------|-----------|---------|-----------|-------|
| **Database.ts** | 31.81% | 100% | 12.5% | 31.81% |

**Nota:** La capa de base de datos está mockeada en pruebas unitarias.

#### Models

| Archivo | Statements | Branch | Functions | Lines |
|---------|-----------|---------|-----------|-------|
| **UserPostVote.ts** | 100% | 100% | 100% | 100% |

#### Utils

| Archivo | Statements | Branch | Functions | Lines | Líneas No Cubiertas |
|---------|-----------|---------|-----------|-------|---------------------|
| **BaseQueryBuilder.ts** | 5% | 0% | 0% | 5.88% | 4-38 |
| **ErrorHandler.ts** | 25% | 0% | 0% | 25% | 5-21 |
| **PostQueryBuilder.ts** | 11.76% | 0% | 0% | 11.76% | 6-97 |
| **PostUtils.ts** | 46.66% | 16.66% | 100% | 46.66% | 10-20 |
| **Promedio** | **20%** | **5.26%** | **6.25%** | **21.05%** | - |

#### Constants

| Archivo | Statements | Branch | Functions | Lines |
|---------|-----------|---------|-----------|-------|
| **post.ts** | 100% | 100% | 100% | 100% |

---

### Cobertura Detallada Frontend

#### Pages

| Archivo | Statements | Branch | Functions | Lines | Líneas No Cubiertas |
|---------|-----------|---------|-----------|-------|---------------------|
| **page.tsx (login)** | 91.3% | 82.6% | 100% | 91.3% | 19, 35 |

#### Components (UI Logic)

| Archivo | Statements | Branch | Functions | Lines | Líneas No Cubiertas |
|---------|-----------|---------|-----------|-------|---------------------|
| **CommentForm.tsx** | 96.96% | 84.61% | 100% | 96.96% | 64 |
| **CommentList.tsx** | 100% | 100% | 100% | 100% | - |
| **CommentVoteButtons.tsx** | 86.84% | 80% | 100% | 86.84% | 45-46, 64-66 |
| **LoadingState.tsx** | 50% | 21.42% | 100% | 50% | 19-65, 102 |
| **VoteButtons.tsx** | 85.71% | 74.41% | 100% | 85.71% | 53-54, 72-82 |
| **post.tsx** | 100% | 100% | 100% | 100% | - |
| **postInput.tsx** | 67.56% | 53.06% | 35% | 70.42% | 44, 52-60, 64, 69, 76-77, 103-104, 154-168, 189-225 |
| **postList.tsx** | 85.36% | 73.33% | 55.55% | 85.36% | 44-45, 52, 56, 112-199 |
| **Promedio** | **81.34%** | **68.52%** | **62.22%** | **82.32%** | - |

#### Components (UI Elements)

| Archivo | Statements | Branch | Functions | Lines | Líneas No Cubiertas |
|---------|-----------|---------|-----------|-------|---------------------|
| **badge.tsx** | 62.5% | 100% | 0% | 66.66% | 30-31 |
| **button.tsx** | 100% | 66.66% | 100% | 100% | 45 |
| **checkbox.tsx** | 70% | 100% | 0% | 87.5% | 12 |
| **dialog.tsx** | 87.5% | 100% | 66.66% | 85% | 56-58, 70-72 |
| **input.tsx** | 62.5% | 100% | 0% | 71.42% | 6-7 |
| **label.tsx** | 72.72% | 100% | 0% | 88.88% | 17 |
| **popover.tsx** | 100% | 100% | 100% | 100% | - |
| **select.tsx** | 59.61% | 0% | 0% | 81.57% | 18, 37, 53, 70, 100, 112, 134 |
| **separator.tsx** | 100% | 25% | 100% | 100% | 13-22 |
| **sheet.tsx** | 70% | 100% | 16.66% | 78.57% | 21, 75-77, 89-91, 105, 117 |
| **textarea.tsx** | 100% | 100% | 100% | 100% | - |
| **Promedio** | **76.52%** | **40%** | **33.33%** | **84.86%** | - |

**Nota:** Los componentes UI de shadcn/ui tienen menor cobertura porque son componentes genéricos de librería externa.

#### Constants & Libraries

| Archivo | Statements | Branch | Functions | Lines |
|---------|-----------|---------|-----------|-------|
| **constants/post.ts** | 100% | 100% | 100% | 100% |
| **lib/utils.ts** | 100% | 100% | 100% | 100% |

---

### Análisis de Cobertura

#### Áreas de Alta Cobertura (>90%)

**Backend:**
- Controllers: 97.28% statements
- Servicios principales: 94-100% statements
- Models: 100% statements

**Frontend:**
- Componentes principales: 81-100% statements
- Constants: 100% statements
- Libraries: 100% statements

#### Áreas de Baja Cobertura (<50%)

**Backend:**
- DAOs: 8.06% (intencional - mockeados)
- Utils: 20% (builders y handlers)
- Database: 31.81% (mockeada)

**Frontend:**
- LoadingState: 50% statements
- Componentes UI genéricos: 40% branch coverage

---

### Historial de Ejecuciones

| Fecha | Versión | Tests Backend | Tests Frontend | Total | Resultado | Duración |
|-------|---------|---------------|----------------|-------|-----------|----------|
| 2025-11-06 | v1.0.0 | 232/232 | 26/26 | 258/258 | PASS | 38.473s |

### Última Ejecución Completa

**Fecha:** 6 de noviembre, 2025  
**Versión:** 1.0.0

**Backend:**
- Test Suites: 12 passed, 12 total
- Tests: 232 passed, 232 total
- Snapshots: 0 total
- Time: 18.151s
- Coverage: 61.42% statements

**Frontend:**
- Test Suites: 8 passed, 8 total
- Tests: 26 passed, 26 total
- Snapshots: 0 total
- Time: 20.322s
- Coverage: 80.07% statements

**Estado:** APROBADO - 0 fallos

---


## Interpretación de Reportes

### Reporte de Consola

```
Test Suites: 12 passed, 12 total
Tests:       232 passed, 232 total
Snapshots:   0 total
Time:        18.151s
```

- **Test Suites passed:** Archivos de prueba completados exitosamente
- **Tests passed:** Pruebas individuales exitosas
- **Time:** Duración total de ejecución

### Reporte de Cobertura

```
File            | % Stmts | % Branch | % Funcs | % Lines
----------------|---------|----------|---------|--------
All files       |   61.42 |    56.64 |   47.95 |   61.96
```

- **% Stmts (Statements):** Porcentaje de declaraciones ejecutadas
- **% Branch:** Porcentaje de ramas condicionales ejecutadas
- **% Funcs (Functions):** Porcentaje de funciones ejecutadas
- **% Lines:** Porcentaje de líneas de código ejecutadas

### Reporte HTML

Después de ejecutar `npm run test:coverage`, abrir:

- Backend: `coverage-backend/index.html`
- Frontend: `coverage-frontend/index.html`

El reporte HTML muestra:
- Archivos con cobertura detallada
- Líneas específicas no cubiertas
- Navegación por carpetas
- Gráficos visuales de cobertura

---

## Métricas de Calidad

### Criterios de Aceptación

| Métrica | Objetivo | Actual | Estado |
|---------|----------|--------|--------|
| Pruebas Exitosas | 100% | 100% (258/258) | CUMPLIDO |
| Cobertura Backend | >60% | 61.42% | CUMPLIDO |
| Cobertura Frontend | >70% | 80.07% | CUMPLIDO |
| Cobertura Promedio | >65% | 70.75% | CUMPLIDO |
| Tiempo Ejecución | <60s | 38.473s | CUMPLIDO |
| Pruebas Fallidas | 0 | 0 | CUMPLIDO |

### Clasificación de Cobertura

| Rango | Clasificación | Componentes Backend | Componentes Frontend |
|-------|---------------|---------------------|----------------------|
| 90-100% | Excelente | Controllers (97.28%) | PostCard (100%) |
| 70-89% | Buena | Services (78.39%) | CommentList (100%) |
| 50-69% | Aceptable | - | PostInput (67.56%) |
| <50% | Requiere mejora | Utils (20%) | LoadingState (50%) |

---



### Estado General

**El proyecto cuenta con una suite de pruebas robusta y profesional que garantiza la calidad del código y la funcionalidad esperada.**

- 258 pruebas automatizadas
- 100% de pruebas exitosas
- Cobertura superior al 70% promedio
- Ejecución rápida (<40s)

---

## Anexos

### A. Comandos de Desarrollo

```bash
# Desarrollo con tests en watch mode
npm run test:backend -- --watch &
npm run test:frontend -- --watch &
npm run dev

# Ejecutar pruebas antes de commit
npm test && git commit -m "mensaje"

# Limpiar cache de Jest
npm test -- --clearCache

# Actualizar snapshots
npm test -- --updateSnapshot
```

### B. Solución de Problemas

**Error: Cannot find module '@/...'**
```bash
# Verificar tsconfig.json paths
# Limpiar cache
npm test -- --clearCache
```

**Error: Test timeout**
```bash
# Aumentar timeout en jest.config.ts
testTimeout: 10000
```

**Error: Out of memory**
```bash
# Limitar workers
npm test -- --maxWorkers=2
```

### C. Referencias

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)

---

**Última actualización:** 6 de noviembre, 2025  
**Versión del documento:** 1.0.0  
**Autor:** Equipo de Desarrollo CiComp Overflow
