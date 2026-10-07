# CRM API - Prueba Técnica Backend (CachalotLab)

API REST desarrollada en Node.js, Express y PostgreSQL (usando la librería nativa `pg`) para la gestión de contactos de un CRM.

---

## 🛠️ Requisitos previos

Asegúrate de tener instalado en tu equipo:
- [Node.js](https://nodejs.org/) (versión 18+ recomendada)
- [Docker y Docker Compose](https://www.docker.com/) (para levantar PostgreSQL)

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
En la raíz del proyecto, ejecuta:
```bash
docker-compose up -d
```
*Esto levantará un contenedor de PostgreSQL (versión 15-alpine) en el puerto `5432` con las credenciales configuradas en el proyecto (`crm_db`).*

### 4. Iniciar el servidor en modo desarrollo
```bash
npm run dev
```
*El servidor correrá en `http://localhost:3000` y auto-inicializará la tabla `contactos` en PostgreSQL al arrancar.*

---

## 📡 Endpoints de la API

### 1. Crear Contacto
- **URL:** `POST /contactos`
- **Descripción:** Crea un nuevo contacto. Valida que `nombre` y `correo` estén presentes, y que el correo tenga un formato válido mediante Regex. Utiliza consultas SQL parametrizadas para prevenir SQL Injection.
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
- **Descripción:** Lista todos los contactos ordenados del más reciente al más antiguo. Si se envía el parámetro `?q=`, realiza una búsqueda insensible a mayúsculas (`ILIKE`) por `nombre` o `empresa`.
- **Respuesta exitosa (`200 OK`):**
```json
{
  "total": 1,
  "contactos": [
    {
      "id": 1,
      "nombre": "Juan Pérez",
      "correo": "juan.perez@example.com",
      "telefono": "+573001234567",
      "empresa": "CachalotLab",
      "notas": "Cliente interesado en servicios de desarrollo."
    }
  ]
}
```

### 3. Ver Contacto por ID
- **URL:** `GET /contactos/:id`
- **Descripción:** Obtiene los detalles de un contacto específico mediante su identificador único. Si no existe, retorna un error `404 Not Found`.
- **Respuesta exitosa (`200 OK`):**
```json
{
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
- **Respuesta error (`404 Not Found`):**
```json
{
  "error": "El contacto con ID 999 no fue encontrado."
}
```

### 4. Actualizar Notas de un Contacto
- **URL:** `PATCH /contactos/:id/notas`
- **Descripción:** Actualiza el campo `notas` de un contacto específico. Retorna `404 Not Found` si el ID no existe.
- **Body (JSON):**
```json
{
  "notas": "Llamada de seguimiento realizada el 5 de octubre. Muy receptivo."
}
```
- **Respuesta exitosa (`200 OK`):**
```json
{
  "mensaje": "Notas actualizadas exitosamente",
  "contacto": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan.perez@example.com",
    "telefono": "+573001234567",
    "empresa": "CachalotLab",
    "notas": "Llamada de seguimiento realizada el 5 de octubre. Muy receptivo."
  }
}
```

---

## 🤖 Uso de IA

Durante el desarrollo de esta prueba técnica, se utilizó asistencia de Inteligencia Artificial (opencode / LLM) como **Mentor Técnico** para:
1. **Planificación y Arquitectura:** Estructurar el paso a paso del desarrollo modular de la API REST sin dependencias innecesarias de ORMs pesados, manteniendo la cercanía con SQL nativo (`pg`).
2. **Generación de Código Base y Validaciones:** Redacción de validaciones con Regex, manejo de promesas con `async/await`, bloques `try/catch` y códigos de estado HTTP correctos (`200`, `201`, `400`, `404`, `500`).
3. **Buenas Prácticas de Git y Documentación:** Guías para mantener un historial de commits atómicos y estructurar este archivo `README.md`.

**Verificación y Corrección Humana:**
- Todo el código generado fue revisado línea por línea para asegurar la comprensión total de su funcionamiento.
- Se verificó explícitamente el uso de consultas parametrizadas (`$1, $2`) para prevenir ataques de SQL Injection en cada uno de los endpoints con operaciones de base de datos.
- Se realizaron pruebas manuales en cliente HTTP para confirmar el comportamiento ante casos exitosos y de error (`404` / `400`).
