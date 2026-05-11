# Manual del Programador
## Sistema TallerTec - TecNM Campus Matehuala

**Versión:** 1.0
**Fecha:** Mayo 2026
**Tecnológico Nacional de México - Campus Matehuala**

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Requisitos del Entorno de Desarrollo](#3-requisitos-del-entorno-de-desarrollo)
4. [Configuración de Supabase](#4-configuración-de-supabase)
5. [Configuración del Proyecto Local](#5-configuración-del-proyecto-local)
6. [Estructura del Proyecto](#6-estructura-del-proyecto)
7. [Variables de Entorno](#7-variables-de-entorno)
8. [Base de Datos](#8-base-de-datos)
9. [Subida a GitHub](#9-subida-a-github)
10. [Despliegue en Vercel](#10-despliegue-en-vercel)
11. [Componentes Principales del Código](#11-componentes-principales-del-código)
12. [APIs y Server Actions](#12-apis-y-server-actions)
13. [Autenticación y Seguridad](#13-autenticación-y-seguridad)
14. [Solución de Problemas Comunes](#14-solución-de-problemas-comunes)

---

## 1. Introducción

### 1.1 Propósito del Documento

Este manual tiene como objetivo proporcionar a los desarrolladores toda la información necesaria para instalar, configurar, mantener y extender el sistema TallerTec. Incluye instrucciones detalladas sobre la configuración del entorno de desarrollo, la estructura del código fuente y los procedimientos de despliegue.

### 1.2 Descripción del Sistema

TallerTec es un sistema web para la gestión de talleres deportivos y culturales del TecNM Campus Matehuala. Permite:

- Registro e inscripción de estudiantes a talleres
- Control de asistencia mediante códigos QR
- Gestión de constancias de participación
- Panel de administración para la oficina de deportes
- Panel para encargados de talleres

### 1.3 Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Frontend | Next.js | 16.2.4 |
| UI Library | React | 19.2.4 |
| Estilos | Tailwind CSS | 4.x |
| Backend/API | Next.js API Routes | - |
| Base de Datos | PostgreSQL (Supabase) | 15.x |
| Autenticación | Supabase Auth | - |
| Almacenamiento | Supabase Storage | - |
| Hosting | Vercel | - |
| Control de Versiones | Git/GitHub | - |

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Navegador  │  │   Móvil     │  │   Tablet    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │ HTTPS
          ┌────────────────▼────────────────┐
          │           VERCEL                │
          │  ┌───────────────────────────┐  │
          │  │    Next.js Application    │  │
          │  │  ┌─────────┐ ┌─────────┐  │  │
          │  │  │  Pages  │ │   API   │  │  │
          │  │  │ (SSR)   │ │ Routes  │  │  │
          │  │  └─────────┘ └─────────┘  │  │
          │  │  ┌─────────────────────┐  │  │
          │  │  │  Server Actions     │  │  │
          │  │  └─────────────────────┘  │  │
          │  └───────────────────────────┘  │
          └────────────────┬────────────────┘
                           │
          ┌────────────────▼────────────────┐
          │          SUPABASE               │
          │  ┌─────────┐  ┌─────────────┐   │
          │  │PostgreSQL│  │    Auth     │   │
          │  │    DB    │  │   Service   │   │
          │  └─────────┘  └─────────────┘   │
          │  ┌─────────────────────────┐    │
          │  │   Storage (Imágenes)    │    │
          │  └─────────────────────────┘    │
          └─────────────────────────────────┘
```

### 2.2 Flujo de Datos

1. El usuario accede a la aplicación desde su navegador
2. Vercel sirve la aplicación Next.js con SSR (Server-Side Rendering)
3. Las páginas protegidas verifican autenticación via Supabase Auth
4. Los datos se obtienen/modifican mediante Server Actions o API Routes
5. Supabase procesa las consultas y aplica Row Level Security (RLS)
6. Las imágenes se almacenan en Supabase Storage

---

## 3. Requisitos del Entorno de Desarrollo

### 3.1 Software Requerido

| Software | Versión Mínima | Descarga |
|----------|----------------|----------|
| Node.js | 18.x o superior | https://nodejs.org |
| npm | 9.x o superior | Incluido con Node.js |
| Git | 2.x o superior | https://git-scm.com |
| Visual Studio Code | Última versión | https://code.visualstudio.com |

### 3.2 Extensiones Recomendadas para VS Code

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- GitLens

### 3.3 Verificación de Instalación

Ejecutar en terminal:

```bash
node --version    # Debe mostrar v18.x.x o superior
npm --version     # Debe mostrar 9.x.x o superior
git --version     # Debe mostrar git version 2.x.x
```

---

## 4. Configuración de Supabase

### 4.1 Crear Cuenta y Proyecto

1. Ir a https://supabase.com
2. Crear una cuenta o iniciar sesión
3. Click en **"New Project"**
4. Configurar:
   - **Name:** TallerTec
   - **Database Password:** (guardar de forma segura)
   - **Region:** Seleccionar la más cercana (ej: South America)
5. Click en **"Create new project"**
6. Esperar 2-3 minutos mientras se aprovisiona

### 4.2 Obtener Credenciales

Una vez creado el proyecto:

1. Ir a **Settings** (ícono de engranaje) → **API**
2. Copiar y guardar:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGci...`
   - **service_role key:** `eyJhbGci...` (¡mantener secreto!)

3. Ir a **Settings** → **Database**
4. Copiar **Connection string** (URI):
   - Reemplazar `[YOUR-PASSWORD]` con la contraseña del proyecto

### 4.3 Configurar Base de Datos

1. Ir a **SQL Editor** en el menú lateral
2. Click en **"New query"**
3. Copiar y pegar el contenido de `schema.sql`
4. Click en **"Run"** (o Ctrl+Enter)
5. Verificar que no haya errores

### 4.4 Ejecutar Migraciones Adicionales

Repetir el proceso para cada archivo de migración:

1. `migration_v2.sql` - Funciones y triggers adicionales
2. `migration_talleres_destacados.sql` - Tabla para página principal
3. `migration_config_constancias.sql` - Configuración de constancias

### 4.5 Configurar Autenticación

1. Ir a **Authentication** → **Providers**
2. Verificar que **Email** esté habilitado
3. En **Authentication** → **URL Configuration**:
   - **Site URL:** `https://tu-dominio.vercel.app`
   - **Redirect URLs:** Agregar:
     - `https://tu-dominio.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (para desarrollo)

### 4.6 Configurar Storage

#### Crear Bucket para Firmas:
1. Ir a **Storage** → **New bucket**
2. Nombre: `firmas`
3. Activar **Public bucket**
4. Click **Create bucket**

#### Crear Bucket para Fotos de Talleres:
1. Ir a **Storage** → **New bucket**
2. Nombre: `talleres-fotos`
3. Activar **Public bucket**
4. Click **Create bucket**

#### Configurar Políticas de Storage:

Para cada bucket, ir a **Policies** y crear:

**Política SELECT (lectura pública):**
- Policy name: `allow_public_read`
- Allowed operation: SELECT
- Policy definition: `true`

**Política INSERT (subida):**
- Policy name: `allow_upload`
- Allowed operation: INSERT
- Policy definition: `true`

**Política UPDATE:**
- Policy name: `allow_update`
- Allowed operation: UPDATE
- Policy definition: `true`

**Política DELETE:**
- Policy name: `allow_delete`
- Allowed operation: DELETE
- Policy definition: `true`

---

## 5. Configuración del Proyecto Local

### 5.1 Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/TallerTec.git
cd TallerTec
```

### 5.2 Instalar Dependencias

```bash
npm install
```

### 5.3 Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Supabase - Obtener de Settings > API
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Supabase Service Role - ¡MANTENER SECRETO!
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Database URL - Obtener de Settings > Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### 5.4 Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

### 5.5 Crear Usuario Administrador

1. Registrar un usuario normalmente en `/register`
2. Ir a Supabase → **Table Editor** → **usuarios**
3. Encontrar el usuario creado
4. Cambiar el campo `rol` a `ADMIN_OFICINA`
5. Guardar cambios

---

## 6. Estructura del Proyecto

```
TallerTec/
├── public/                    # Archivos estáticos
│   ├── logo-itmh.png         # Logo del instituto
│   ├── logo-tecnm.png        # Logo TecNM
│   └── ...
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── actions/          # Server Actions
│   │   │   ├── asistencia.ts
│   │   │   ├── constancias.ts
│   │   │   ├── talleres.ts
│   │   │   └── usuarios.ts
│   │   ├── admin/            # Páginas de administración
│   │   │   ├── layout.tsx    # Layout del panel admin
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── alumnos/
│   │   │   ├── constancias/
│   │   │   ├── encargados/
│   │   │   ├── periodos/
│   │   │   ├── talleres/
│   │   │   └── talleres-destacados/
│   │   ├── api/              # API Routes
│   │   │   ├── admin/
│   │   │   ├── periodos/
│   │   │   └── auth/
│   │   ├── auth/             # Rutas de autenticación
│   │   │   ├── callback/
│   │   │   └── signout/
│   │   ├── estudiante/       # Panel de estudiantes
│   │   ├── encargado/        # Panel de encargados
│   │   ├── constancia/       # Visualización de constancias
│   │   ├── globals.css       # Estilos globales
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Página principal (landing)
│   ├── components/           # Componentes reutilizables
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   └── ui/
│   └── lib/                  # Utilidades y configuración
│       ├── auth/
│       │   └── get-user-role.ts
│       └── supabase/
│           ├── admin.ts      # Cliente admin (service role)
│           ├── client.ts     # Cliente del navegador
│           └── server.ts     # Cliente del servidor
├── middleware.ts             # Middleware de autenticación
├── schema.sql               # Schema de la base de datos
├── migration_*.sql          # Archivos de migración
├── next.config.ts           # Configuración de Next.js
├── package.json             # Dependencias y scripts
├── tailwind.config.ts       # Configuración de Tailwind
└── tsconfig.json            # Configuración de TypeScript
```

---

## 7. Variables de Entorno

### 7.1 Ubicación

Las variables de entorno se configuran en el archivo `.env.local` ubicado en la raíz del proyecto.

**IMPORTANTE:** Este archivo NO debe subirse a Git. Está incluido en `.gitignore`.

### 7.2 Variables Requeridas

| Variable | Descripción | Público |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (admin) | **NO** |
| `DATABASE_URL` | Conexión directa a PostgreSQL | **NO** |

### 7.3 Uso en el Código

**En cliente (componentes del navegador):**
```typescript
// Solo variables con prefijo NEXT_PUBLIC_
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

**En servidor (Server Actions, API Routes):**
```typescript
// Todas las variables disponibles
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

---

## 8. Base de Datos

### 8.1 Diagrama Entidad-Relación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  usuarios   │     │  periodos   │     │  talleres   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ email       │     │ nombre      │     │ nombre      │
│ nombre      │     │ fecha_inicio│     │ descripcion │
│ rol         │     │ fecha_fin   │     │ categoria   │
│ numero_ctrl │     │ activo      │     │ horario     │
│ ...         │     └──────┬──────┘     │ responsable │──┐
└──────┬──────┘            │            │ periodo_id  │──┼─┐
       │                   │            └──────┬──────┘  │ │
       │                   │                   │         │ │
       │         ┌─────────┴─────────┐         │         │ │
       │         │                   │         │         │ │
       ▼         ▼                   ▼         ▼         │ │
┌──────────────────┐         ┌─────────────────┐        │ │
│  inscripciones   │         │   constancias   │        │ │
├──────────────────┤         ├─────────────────┤        │ │
│ id (PK)          │         │ id (PK)         │        │ │
│ estudiante_id(FK)│◄────────│ estudiante_id   │◄───────┘ │
│ taller_id (FK)   │◄────────│ periodo_id      │◄─────────┘
│ estado           │         │ taller_id       │
│ horas_acumuladas │         │ horas_totales   │
└────────┬─────────┘         │ estado          │
         │                   │ folio           │
         ▼                   └─────────────────┘
┌─────────────────┐
│   asistencias   │
├─────────────────┤
│ id (PK)         │
│ inscripcion_id  │
│ fecha           │
│ hora_entrada    │
│ hora_salida     │
│ horas_computadas│
└─────────────────┘
```

### 8.2 Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Todos los usuarios del sistema |
| `periodos` | Períodos escolares (semestres) |
| `talleres` | Talleres deportivos/culturales |
| `inscripciones` | Relación estudiante-taller |
| `asistencias` | Registros de asistencia |
| `constancias` | Solicitudes de constancias |
| `notificaciones` | Notificaciones del sistema |
| `talleres_destacados` | Talleres para página principal |
| `configuracion_constancias` | Config. de formato de constancias |

### 8.3 Tipos Enumerados

```sql
rol_enum: ESTUDIANTE, RESPONSABLE_TALLER, ADMIN_OFICINA
estado_inscripcion: ACTIVA, BAJA, COMPLETADA
estado_constancia: PENDIENTE, APROBADA, RECHAZADA, GENERADA, ENTREGADA
categoria_taller: DEPORTIVO, CULTURAL
```

### 8.4 Triggers Automáticos

- **trg_calcular_horas:** Actualiza horas acumuladas al registrar asistencia
- **trg_verificar_meta:** Marca inscripción como completada al llegar a 20 horas
- **trg_folio_constancia:** Genera folio único para constancias
- **trg_cupo_inscripcion:** Actualiza cupo disponible en talleres

---

## 9. Subida a GitHub

### 9.1 Crear Repositorio

1. Ir a https://github.com/new
2. Nombre: `TallerTec`
3. Visibilidad: Private (recomendado)
4. Click **"Create repository"**

### 9.2 Inicializar Git Local

```bash
cd TallerTec
git init
git add .
git commit -m "Initial commit"
```

### 9.3 Conectar con GitHub

```bash
git remote add origin https://github.com/tu-usuario/TallerTec.git
git branch -M main
git push -u origin main
```

### 9.4 Archivos Ignorados

El archivo `.gitignore` debe incluir:

```
node_modules/
.next/
.env.local
.env*.local
*.log
```

---

## 10. Despliegue en Vercel

### 10.1 Crear Cuenta en Vercel

1. Ir a https://vercel.com
2. Click **"Sign Up"**
3. Seleccionar **"Continue with GitHub"**
4. Autorizar acceso

### 10.2 Importar Proyecto

1. En el dashboard, click **"Add New..."** → **"Project"**
2. Seleccionar el repositorio **TallerTec**
3. Click **"Import"**

### 10.3 Configurar Variables de Entorno

En la pantalla de configuración:

1. Expandir **"Environment Variables"**
2. Agregar cada variable:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxxxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGci... |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGci... |
| `DATABASE_URL` | postgresql://... |

3. Click **"Deploy"**

### 10.4 Configurar Dominio (Opcional)

1. Ir a **Settings** → **Domains**
2. Agregar dominio personalizado o usar el de Vercel
3. Actualizar **Site URL** en Supabase con el nuevo dominio

### 10.5 Despliegues Automáticos

Cada `git push` a la rama `main` activará un nuevo despliegue automáticamente.

---

## 11. Componentes Principales del Código

### 11.1 Clientes de Supabase

**`src/lib/supabase/client.ts`** - Cliente para el navegador:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`src/lib/supabase/server.ts`** - Cliente para el servidor:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* configuración */ } }
  );
}
```

**`src/lib/supabase/admin.ts`** - Cliente con privilegios de admin:
```typescript
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

### 11.2 Middleware de Autenticación

**`middleware.ts`** - Protege rutas y maneja sesiones:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Verificar sesión y redirigir según rol
}

export const config = {
  matcher: ["/admin/:path*", "/estudiante/:path*", "/encargado/:path*"],
};
```

### 11.3 Obtener Usuario Autenticado

**`src/lib/auth/get-user-role.ts`**:
```typescript
export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Obtener datos adicionales de la tabla usuarios
  const { data } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", user.email)
    .single();

  return data;
}
```

---

## 12. APIs y Server Actions

### 12.1 Server Actions

Los Server Actions están en `src/app/actions/`. Ejemplo:

**`src/app/actions/talleres.ts`**:
```typescript
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/auth/get-user-role";

export async function crearTaller(formData: FormData) {
  const user = await getAuthUser();
  if (!user || user.rol !== "ADMIN_OFICINA") {
    return { error: "No autorizado" };
  }

  const adminClient = createAdminClient();
  // ... lógica de creación
}
```

### 12.2 API Routes

Las API Routes están en `src/app/api/`. Ejemplo:

**`src/app/api/admin/talleres/route.ts`**:
```typescript
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user-role";

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.rol !== "ADMIN_OFICINA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // ... obtener datos
  return NextResponse.json(data);
}
```

---

## 13. Autenticación y Seguridad

### 13.1 Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Supabase Auth verifica y crea sesión
3. Se redirige a `/auth/callback` para establecer cookies
4. Middleware verifica rol y permite acceso a rutas protegidas

### 13.2 Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Las políticas controlan:

- **SELECT:** Quién puede leer datos
- **INSERT:** Quién puede crear registros
- **UPDATE:** Quién puede modificar
- **DELETE:** Quién puede eliminar

### 13.3 Roles de Usuario

| Rol | Acceso |
|-----|--------|
| ESTUDIANTE | Panel estudiante, inscripciones, solicitar constancias |
| RESPONSABLE_TALLER | Panel encargado, registrar asistencia, evaluar |
| ADMIN_OFICINA | Panel admin completo, gestión total |

---

## 14. Solución de Problemas Comunes

### 14.1 Error de Conexión a Supabase

**Síntoma:** "Failed to fetch" o errores de red

**Solución:**
1. Verificar que las variables de entorno estén correctas
2. Verificar que el proyecto Supabase esté activo
3. Revisar que no haya restricciones de CORS

### 14.2 Imágenes No Se Muestran

**Síntoma:** Icono de imagen rota

**Solución:**
1. Verificar configuración en `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "xxxxx.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ],
}
```
2. Reiniciar el servidor / hacer redeploy

### 14.3 Error 401 No Autorizado

**Síntoma:** Acceso denegado a rutas de admin

**Solución:**
1. Verificar que el usuario tenga el rol correcto en la tabla `usuarios`
2. Cerrar sesión y volver a iniciar
3. Verificar que las cookies no estén bloqueadas

### 14.4 Migraciones Fallan

**Síntoma:** Error al ejecutar SQL

**Solución:**
1. Ejecutar las migraciones en orden
2. Verificar que no haya tablas duplicadas
3. Revisar dependencias de foreign keys

---

## Contacto y Soporte

Para soporte técnico o preguntas sobre el sistema:

**Institución:** TecNM Campus Matehuala
**Departamento:** Oficina de Promoción Deportiva
**Sistema:** TallerTec v1.0

---

*Documento generado para TallerTec - Sistema de Gestión de Talleres*
*TecNM Campus Matehuala © 2026*
