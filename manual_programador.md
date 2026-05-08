# Manual del Programador — TallerTec

**Sistema Integral de Gestión de Talleres Deportivos**
TecNM Campus Matehuala

---

| Campo        | Detalle                          |
|--------------|----------------------------------|
| Versión      | 1.0                              |
| Fecha        | Mayo 2026                        |
| Audiencia    | Desarrolladores y personal técnico |
| Stack        | Next.js 16 · Supabase · TypeScript · Tailwind CSS |

---

## Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Crear la Base de Datos en Supabase](#3-crear-la-base-de-datos-en-supabase)
4. [Configuración del Proyecto Local](#4-configuración-del-proyecto-local)
5. [Variables de Entorno](#5-variables-de-entorno)
6. [Subir el Proyecto a GitHub](#6-subir-el-proyecto-a-github)
7. [Despliegue en Vercel](#7-despliegue-en-vercel)
8. [Estructura del Código Fuente](#8-estructura-del-código-fuente)
9. [Módulos Clave del Sistema](#9-módulos-clave-del-sistema)
10. [Base de Datos: Esquema y Tablas Principales](#10-base-de-datos-esquema-y-tablas-principales)
11. [Roles y Permisos (RLS)](#11-roles-y-permisos-rls)
12. [Resolución de Problemas Comunes](#12-resolución-de-problemas-comunes)

---

## 1. Requisitos Previos

Antes de comenzar, el desarrollador debe contar con las siguientes herramientas instaladas en su equipo:

| Herramienta      | Versión mínima | Enlace de descarga                     |
|------------------|----------------|-----------------------------------------|
| Node.js          | 18.x o superior | https://nodejs.org                     |
| npm              | 9.x o superior  | Incluido con Node.js                   |
| Git              | 2.x o superior  | https://git-scm.com                    |
| Editor de código | Cualquiera      | VS Code recomendado: https://code.visualstudio.com |

También se requieren cuentas gratuitas en los siguientes servicios:

- **Supabase** — https://supabase.com (base de datos y autenticación)
- **GitHub** — https://github.com (repositorio de código)
- **Vercel** — https://vercel.com (plataforma de despliegue)

---

## 2. Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────┐
│                   Cliente (Navegador)                     │
│              Next.js 16 — App Router                      │
│         React 19 · Tailwind CSS · TypeScript             │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼────────────────────────────────┐
│                     Vercel (Hosting)                      │
│          Server Components · API Routes · Edge           │
└─────────────────────────┬────────────────────────────────┘
                          │ REST / WebSocket
┌─────────────────────────▼────────────────────────────────┐
│                   Supabase (Backend)                      │
│  PostgreSQL · Auth · Row Level Security · Storage        │
└──────────────────────────────────────────────────────────┘
```

**Flujo de autenticación:** Supabase Auth gestiona sesiones mediante cookies HTTP-Only a través de `@supabase/ssr`. El middleware de Next.js valida la sesión en cada petición al servidor.

---

## 3. Crear la Base de Datos en Supabase

### 3.1 Crear el Proyecto en Supabase

1. Ingresar a https://supabase.com e iniciar sesión o crear una cuenta gratuita.
2. Hacer clic en **"New project"**.
3. Completar los campos:
   - **Name:** `tallertec` (o el nombre que se prefiera)
   - **Database Password:** Crear una contraseña segura y guardarla. Se necesitará después.
   - **Region:** Seleccionar la región más cercana (p. ej. `us-east-1`).
4. Hacer clic en **"Create new project"** y esperar a que el proyecto se inicialice (aproximadamente 2 minutos).

### 3.2 Ejecutar el Esquema SQL

1. En el panel de Supabase, ir al menú lateral izquierdo y seleccionar **SQL Editor**.
2. Hacer clic en **"New query"**.
3. Abrir el archivo `schema.sql` ubicado en la raíz del proyecto.
4. Copiar todo el contenido de `schema.sql` y pegarlo en el editor SQL de Supabase.
5. Hacer clic en **"Run"** (o presionar `Ctrl + Enter`).

> **Nota:** El archivo `schema.sql` crea todas las tablas, índices, tipos enumerados y políticas RLS necesarias para el funcionamiento del sistema. Si existe también un archivo `migration_v2.sql`, ejecutarlo después de `schema.sql` en el mismo orden.

### 3.3 Verificar las Tablas Creadas

Ir a **Table Editor** en el menú lateral. Deben aparecer las siguientes tablas:

| Tabla            | Descripción                                    |
|------------------|------------------------------------------------|
| `usuarios`       | Datos de todos los usuarios del sistema        |
| `periodos`       | Períodos académicos (semestres)                |
| `talleres`       | Catálogo de talleres deportivos y culturales   |
| `inscripciones`  | Relación entre estudiantes y talleres          |
| `asistencias`    | Registro de asistencias por sesión             |
| `constancias`    | Solicitudes y estados de constancias           |
| `notificaciones` | Notificaciones del sistema para los usuarios   |

### 3.4 Obtener las Credenciales de Supabase

1. En el panel de Supabase, ir a **Project Settings** (ícono de engranaje) → **API**.
2. Copiar y guardar los siguientes valores:

| Variable                      | Dónde encontrarla                               |
|-------------------------------|--------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`    | Sección "Project URL"                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sección "Project API keys" → `anon public`   |
| `SUPABASE_SERVICE_ROLE_KEY`   | Sección "Project API keys" → `service_role`    |

> **Advertencia:** La `service_role` key tiene permisos completos sobre la base de datos y omite Row Level Security. **Nunca** exponerla en el cliente ni en repositorios públicos.

---

## 4. Configuración del Proyecto Local

### 4.1 Clonar o Descargar el Repositorio

```bash
# Si se clona desde GitHub
git clone https://github.com/tu-usuario/tallertec.git
cd tallertec

# Si se descarga el ZIP, descomprimir y abrir la carpeta en terminal
cd tallertec
```

### 4.2 Instalar Dependencias

```bash
npm install
```

### 4.3 Crear el Archivo de Variables de Entorno

Crear un archivo llamado `.env.local` en la raíz del proyecto:

```bash
# En Windows (PowerShell)
New-Item .env.local

# En Linux/Mac
touch .env.local
```

Abrir `.env.local` con el editor de texto y agregar las credenciales obtenidas en el paso 3.4:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.4 Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abrir el navegador en `http://localhost:3000` para verificar que el sistema funciona correctamente.

---

## 5. Variables de Entorno

Las variables de entorno son el mecanismo principal para conectar la aplicación con Supabase. Se definen en el archivo `.env.local` (local) y en Vercel (producción).

### 5.1 Ubicación en el Código

Las variables se consumen en tres archivos dentro de `src/lib/supabase/`:

**`src/lib/supabase/client.ts`** — Cliente para el navegador (componentes del lado cliente):

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`src/lib/supabase/server.ts`** — Cliente para Server Components y Server Actions:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { ... } }
  )
}
```

**`src/lib/supabase/admin.ts`** — Cliente administrativo con permisos totales (solo servidor):

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY  // ← clave secreta

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
```

### 5.2 Resumen de Variables

| Variable                        | Prefijo              | Exposición        | Uso                              |
|---------------------------------|----------------------|-------------------|----------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | `NEXT_PUBLIC_`       | Cliente y servidor| URL del proyecto Supabase        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_`       | Cliente y servidor| Clave pública (respeta RLS)      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Sin `NEXT_PUBLIC_`   | Solo servidor     | Clave secreta (omite RLS)        |

> **Regla importante:** Las variables con prefijo `NEXT_PUBLIC_` son visibles en el navegador. La `SUPABASE_SERVICE_ROLE_KEY` **no** debe tener ese prefijo y solo debe usarse en Server Components o Server Actions.

---

## 6. Subir el Proyecto a GitHub

### 6.1 Crear el Repositorio en GitHub

1. Ingresar a https://github.com y hacer clic en **"New repository"**.
2. Configurar el repositorio:
   - **Repository name:** `tallertec`
   - **Visibility:** Private (recomendado para proteger credenciales)
   - No inicializar con README ni .gitignore (el proyecto ya los tiene)
3. Hacer clic en **"Create repository"**.

### 6.2 Verificar el Archivo .gitignore

Asegurarse de que el archivo `.gitignore` en la raíz incluya las siguientes entradas para no subir archivos sensibles:

```
.env.local
.env*.local
node_modules/
.next/
```

### 6.3 Vincular y Subir el Código

Ejecutar los siguientes comandos en la terminal dentro de la carpeta del proyecto:

```bash
# Inicializar git si no existe
git init

# Agregar todos los archivos al staging
git add .

# Crear el primer commit
git commit -m "feat: implementación inicial TallerTec"

# Vincular con el repositorio de GitHub
git remote add origin https://github.com/tu-usuario/tallertec.git

# Subir el código
git push -u origin main
```

---

## 7. Despliegue en Vercel

### 7.1 Conectar el Repositorio

1. Ingresar a https://vercel.com e iniciar sesión con la cuenta de GitHub.
2. Hacer clic en **"Add New Project"**.
3. Seleccionar el repositorio `tallertec` de la lista.
4. Vercel detectará automáticamente que es un proyecto Next.js.

### 7.2 Configurar las Variables de Entorno en Vercel

Antes de desplegar, agregar las variables de entorno:

1. En la pantalla de configuración del proyecto, buscar la sección **"Environment Variables"**.
2. Agregar las tres variables una por una:

| Nombre                          | Valor                            |
|---------------------------------|----------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | La URL de tu proyecto Supabase   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La clave `anon public`           |
| `SUPABASE_SERVICE_ROLE_KEY`     | La clave `service_role`          |

3. Asegurarse de que cada variable esté marcada para los entornos **Production**, **Preview** y **Development**.

### 7.3 Desplegar

1. Hacer clic en **"Deploy"**.
2. Vercel construirá y desplegará la aplicación automáticamente (entre 2 y 4 minutos).
3. Al finalizar, se mostrará la URL de producción (por ejemplo: `https://tallertec.vercel.app`).

### 7.4 Configurar el Dominio en Supabase (CORS)

Para que la autenticación funcione correctamente con el dominio de Vercel:

1. En Supabase, ir a **Authentication** → **URL Configuration**.
2. En **Site URL**, ingresar la URL de Vercel: `https://tallertec.vercel.app`
3. En **Redirect URLs**, agregar:
   - `https://tallertec.vercel.app/**`
   - `http://localhost:3000/**` (para desarrollo local)
4. Guardar los cambios.

### 7.5 Despliegues Futuros

A partir de este momento, cada vez que se haga `git push` al repositorio de GitHub, Vercel desplegará los cambios automáticamente.

---

## 8. Estructura del Código Fuente

```
tallertec/
├── src/
│   ├── app/                    # Páginas y rutas (App Router de Next.js)
│   │   ├── layout.tsx          # Layout raíz de la aplicación
│   │   ├── page.tsx            # Página de inicio (landing)
│   │   ├── login/              # Página de inicio de sesión
│   │   ├── register/           # Página de registro de usuarios
│   │   ├── dashboard/          # Panel del estudiante
│   │   ├── talleres/           # Catálogo e inscripción a talleres
│   │   ├── encargado/          # Panel del responsable de taller
│   │   │   ├── alumnos/        # Lista de alumnos inscritos
│   │   │   ├── evaluar/        # Registro de asistencias
│   │   │   ├── scan/           # Escáner QR de asistencia
│   │   │   └── perfil/         # Perfil del encargado
│   │   ├── admin/              # Panel de la oficina de deportes
│   │   ├── constancia/         # Solicitud de constancias
│   │   ├── scan/               # Módulo de escaneo QR
│   │   ├── auth/               # Callbacks de autenticación
│   │   ├── forgot-password/    # Recuperación de contraseña
│   │   └── reset-password/     # Restablecimiento de contraseña
│   │
│   ├── components/             # Componentes reutilizables
│   │   ├── auth/               # Formularios de login y registro
│   │   ├── talleres/           # Tarjetas de talleres, escáner QR
│   │   ├── contacto/           # Formulario de contacto
│   │   └── ui/                 # Componentes de interfaz genéricos
│   │
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts       # Cliente Supabase para el navegador
│       │   ├── server.ts       # Cliente Supabase para el servidor
│       │   └── admin.ts        # Cliente administrativo (service role)
│       └── auth/               # Utilidades de autenticación
│
├── middleware.ts               # Middleware de Next.js (protección de rutas)
├── schema.sql                  # Esquema completo de la base de datos
├── migration_v2.sql            # Migración de actualizaciones
├── .env.local                  # Variables de entorno (NO subir a Git)
├── next.config.ts              # Configuración de Next.js
├── package.json                # Dependencias del proyecto
└── tsconfig.json               # Configuración de TypeScript
```

---

## 9. Módulos Clave del Sistema

### 9.1 Middleware de Protección de Rutas

**Archivo:** `middleware.ts` (raíz del proyecto)

Este archivo intercepta todas las peticiones HTTP y verifica si el usuario tiene sesión activa antes de acceder a rutas protegidas. Redirige a `/login` si no hay sesión.

```typescript
// middleware.ts
// Valida la sesión en cada petición y redirige si no está autenticado
```

### 9.2 Autenticación y Registro

**Archivo:** `src/components/auth/register-form.tsx`

El formulario de registro captura los datos del estudiante y llama a `supabase.auth.signUp()`. Los datos adicionales (número de control, carrera, semestre) se pasan como `user_metadata` para sincronizarse con la tabla `usuarios`.

Campos del registro:
- Nombre completo
- Número de control
- Correo electrónico institucional
- Contraseña (mínimo 8 caracteres)
- Carrera
- Semestre
- Teléfono (opcional)

### 9.3 Sincronización de Usuarios

**Archivo:** `src/app/dashboard/page.tsx`

El sistema implementa una sincronización automática: si un usuario existe en Supabase Auth pero no en la tabla `usuarios`, se crea el registro automáticamente al acceder al dashboard. Esto previene errores por inconsistencias entre las dos capas de datos.

### 9.4 Escáner QR

**Archivo:** `src/components/talleres/qr-scanner.tsx`

Implementa el escaneo de códigos QR usando la API nativa del navegador (`getUserMedia`). Cada estudiante tiene un código QR único almacenado en la columna `codigo_qr` de la tabla `usuarios`. El encargado escanea el QR para registrar la asistencia.

### 9.5 Generación de Constancias

**Archivo:** `src/app/admin/page.tsx` y acciones relacionadas

Las constancias se gestionan con el flujo:
1. Estudiante solicita la constancia (estado `PENDIENTE`)
2. Oficina de deportes revisa y aprueba (estado `APROBADA`)
3. Se genera el PDF con los datos del estudiante, taller, horas y folio único
4. Estado final: `GENERADA` o `ENTREGADA`

---

## 10. Base de Datos: Esquema y Tablas Principales

### 10.1 Tipos Enumerados

```sql
rol_enum            → 'ESTUDIANTE' | 'RESPONSABLE_TALLER' | 'ADMIN_OFICINA'
estado_inscripcion  → 'ACTIVA' | 'BAJA' | 'COMPLETADA'
metodo_registro     → 'QR' | 'MANUAL'
estado_constancia   → 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'GENERADA' | 'ENTREGADA'
categoria_taller    → 'DEPORTIVO' | 'CULTURAL'
```

### 10.2 Relaciones Entre Tablas

```
usuarios ──< inscripciones >── talleres
inscripciones ──< asistencias
usuarios ──< constancias >── periodos
talleres >── periodos
talleres >── usuarios (responsable_id)
```

### 10.3 Restricciones Importantes

- Un estudiante solo puede inscribirse **una vez** por taller por período (`UNIQUE` en `inscripciones`).
- Un estudiante solo puede tener **una asistencia por día** en cada taller (`UNIQUE` en `asistencias`).
- El campo `cupo_disponible` nunca puede ser mayor a `cupo_maximo` en `talleres`.
- Las horas acumuladas se calculan automáticamente al registrar cada asistencia.

---

## 11. Roles y Permisos (RLS)

Supabase usa Row Level Security (RLS) para que cada usuario solo acceda a sus propios datos. El sistema maneja tres roles:

| Rol                  | Acceso                                                               |
|----------------------|----------------------------------------------------------------------|
| `ESTUDIANTE`         | Ver su perfil, sus inscripciones, sus asistencias, solicitar constancias |
| `RESPONSABLE_TALLER` | Ver y gestionar los talleres que tiene asignados, registrar asistencias |
| `ADMIN_OFICINA`      | Acceso total a todos los datos, gestión de periodos y constancias    |

El cliente administrativo (`admin.ts`) usa la `service_role` key para operaciones que requieren acceso completo (p. ej. sincronización de usuarios, reportes globales).

---

## 12. Resolución de Problemas Comunes

### Error: "Missing SUPABASE_SERVICE_ROLE_KEY"

**Causa:** El archivo `.env.local` no existe o no contiene la variable.

**Solución:** Crear o revisar el archivo `.env.local` en la raíz del proyecto y asegurarse de que las tres variables estén correctamente definidas.

---

### Error: "Invalid API key" en Supabase

**Causa:** Se copió mal alguna de las claves de Supabase.

**Solución:** Ir a Supabase → Project Settings → API y copiar nuevamente las claves sin espacios adicionales.

---

### Error 401 en producción (Vercel)

**Causa:** Las variables de entorno no se configuraron en Vercel.

**Solución:** Ir a Vercel → Project → Settings → Environment Variables y agregar las tres variables. Luego hacer un nuevo despliegue desde el panel.

---

### La autenticación redirige a localhost en producción

**Causa:** La URL del sitio no está configurada en Supabase.

**Solución:** Ir a Supabase → Authentication → URL Configuration y actualizar el **Site URL** con el dominio de producción de Vercel.

---

### Los cambios en código no se reflejan en Vercel

**Causa:** Los cambios no fueron subidos a GitHub.

**Solución:** Ejecutar `git add .`, `git commit -m "descripción"` y `git push`. Vercel desplegará automáticamente al detectar el nuevo commit.

---

*Manual del Programador — TallerTec v1.0 · TecNM Campus Matehuala · 2026*
