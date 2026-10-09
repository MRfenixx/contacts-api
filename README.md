# CRM API - Prueba Técnica Backend (CachalotLab)

API REST modular desarrollada en Node.js, Express y PostgreSQL (usando la librería nativa `pg`) para la gestión de contactos de un CRM, siguiendo buenas prácticas de arquitectura, manejo de errores, seguridad contra SQL Injection y pruebas automatizadas.

---

## 🛠️ Requisitos previos

Asegúrate de tener instalado en tu equipo:
- [Node.js](https://nodejs.org/) (versión 18+ recomendada)
- [Docker y Docker Compose](https://www.docker.com/) (para levantar PostgreSQL)

---

## ⚙️ Configuración de Variables de Entorno

1. En la raíz del proyecto, duplica el archivo `.env.example` y nómbralo `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configura las variables en tu archivo `.env` local según tu entorno (puerto, usuario, contraseña, base de datos y host).

---

## 🚀 Instalación y Ejecución

Sigue estos pasos para levantar el entorno de desarrollo:

### 1. Clonar el repositorio y cambiar a la rama de trabajo
```bash
git clone <url-del-repositorio>
cd <nombre-del-proyecto>
git checkout feature/contactos
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Levantar la base de datos con Docker Compose
```bash
docker-compose up -d
```
*Esto levantará un contenedor de PostgreSQL (versión 15-alpine) en el puerto `5432` con las credenciales configuradas.*

### 4. Iniciar el servidor en modo desarrollo
```bash
npm run dev
```
*El servidor iniciará un arranque seguro (`startServer`), esperando a que la base de datos y la tabla `contactos` estén listas antes de empezar a atender peticiones en el puerto configurado.*

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto incluye una suite completa de pruebas de integración desarrolladas con **Jest** y **Supertest**:
```bash
npm test
```

---

## 🏛️ Arquitectura del Proyecto

El código está estructurado bajo un enfoque modular desacoplado en capas:
- **`config/`**: Conexión a PostgreSQL mediante la librería `pg` y carga de variables de entorno con `dotenv`.
- **`controllers/`**: Lógica de negocio, validaciones de entrada (`Regex` para correos, `isNaN` para IDs numéricos), ejecución de consultas SQL parametrizadas y respuestas HTTP (`200`, `201`, `400`, `404`).
- **`routes/`**: Definición de enrutamiento utilizando `express.Router()` para el recurso `/contactos`.
- **`middlewares/`**: Manejador global de errores `(err, req, res, next)` para centralizar la respuesta `500`.
- **`tests/`**: Pruebas de integración automatizadas cubriendo los endpoints principales.

---

## 📡 Endpoints de la API

### 1. Crear Contacto
- **URL:** `POST /contactos`
- **Descripción:** Crea un nuevo contacto. Valida campos obligatorios y formato de correo. Utiliza consultas SQL parametrizadas.
- **Body (JSON):**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan.perez@example.com",
  "telefono": "+573001234567",
  "empresa": "CachalotLab",
  "notas": "Cliente interesado en servicios de desarrollo."
}
```
- **Respuesta exitosa (`201 Created`):**
```json
{
  "mensaje": "Contacto creado exitosamente",
  "contacto": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan.perez@example.com",
    "telefono": "+573001234567",
    "empresa": "CachalotLab",
    "notas": "Cliente interesado en servicios de desarrollo."
  }
}
```

### 2. Listar / Buscar Contactos
- **URL:** `GET /contactos` o `GET /contactos?q=juan`
- **Descripción:** Lista todos los contactos o filtra de forma insensible a mayúsculas (`ILIKE`) por `nombre` o `empresa`.

### 3. Ver Contacto por ID
- **URL:** `GET /contactos/:id`
- **Descripción:** Obtiene un contacto por ID. Valida que el ID sea numérico (`400 Bad Request` si no lo es) y retorna `404 Not Found` si no existe.

### 4. Actualizar Notas de un Contacto
- **URL:** `PATCH /contactos/:id/notas`
- **Descripción:** Actualiza parcialmente el campo `notas` de un contacto específico.

---

## 🤖 Uso de IA

El desarrollo se gestionó mediante un flujo de trabajo incremental y estratégico utilizando la IA como herramienta de mentoría técnica:

- **Estructuración previa:** Se configuró primero la infraestructura (Docker, dependencias, servidor base y conexión modular) antes de delegar cualquier lógica de negocio.
- **Desarrollo dirigido:** Se solicitaron los endpoints de forma iterativa bajo directrices estrictas (`async/await`, validaciones con Regex, códigos HTTP precisos y SQL parametrizado).
- **Verificación y validación humana:** Cada bloque de código fue revisado línea por línea, verificando el uso de consultas parametrizadas (`$1, $2`) contra SQL Injection y realizando pruebas manuales y automatizadas con Jest (`200`, `201`, `400`, `404`) para garantizar la comprensión total antes de registrar cada avance en Git.
