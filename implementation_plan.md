# Implementación de TallerTec

Este documento describe la planificación ágil para el desarrollo del **Sistema Integral de Gestión de Talleres Deportivos (TallerTec)** para el TecNM Campus Matehuala. Basado en la documentación analizada (Especificación IEEE 830, Diseño de Datos, Factibilidad), el sistema utilizará un stack tecnológico moderno para garantizar un desarrollo rápido y escalable.

## Stack Tecnológico

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend / Base de Datos:** Supabase (PostgreSQL, Auth, Storage)
- **Despliegue:** Vercel

## Metodología Ágil (Sprints Propuestos)

El desarrollo se realizará en una serie de *Sprints* o fases rápidas para tener un MVP funcional en el menor tiempo posible, de acuerdo con el cronograma del documento de arquitectura.

### Sprint 0: Inicialización e Infraestructura
- Creación del proyecto base con `npx create-next-app`.
- Configuración de Tailwind CSS, componentes UI básicos y estructura de carpetas (`app/`, `components/`, `lib/`).
- Configuración inicial de las variables de entorno para Supabase.
- Creación de los scripts DDL en SQL (esquema, tipos, triggers, funciones, RLS) listos para ser ejecutados en Supabase.

### Sprint 1: Módulo de Autenticación
- Integración de **Supabase Auth**.
- Desarrollo de las pantallas de Login y Registro.
- Validación de dominios institucionales (`@matehuala.tecnm.mx`).
- Redirección basada en los tres roles principales (`ESTUDIANTE`, `RESPONSABLE_TALLER`, `ADMIN_OFICINA`).

### Sprint 2: Módulo de Estudiantes (Inscripción y QR)
- Desarrollo del catálogo de talleres.
- Funcionalidad de inscripción a un taller.
- Generación y visualización del código QR único por estudiante utilizando librerías como `qrcode.react`.

### Sprint 3: Módulo de Responsables (Asistencia)
- Panel web responsive para los responsables de taller.
- Escáner de códigos QR integrando la cámara del dispositivo (`html5-qrcode`).
- Lógica de registro de asistencia y cálculo de horas computadas en tiempo real.

### Sprint 4 & 5: Horas, Dashboard y Administración
- Visualización de progreso para el estudiante (meta de 20 horas).
- Panel de administración para la oficina de deportes: creación de talleres, gestión de periodos y usuarios.
- Notificaciones internas o alertas de progreso.

### Sprint 6: Generación de Constancias y Reportes
- Lógica de validación de 20 horas.
- Flujo de solicitud y aprobación de constancias.
- Generación de documentos PDF con folio único utilizando `@react-pdf/renderer` o `jsPDF`.
- Exportación de reportes a Excel.

## Base de Datos (Supabase)
URL de conexión proporcionada: `postgresql://postgres:[TACOSALAJEDREZ]@db.jqbgssvbpliqkzivejsj.supabase.co:5432/postgres`
