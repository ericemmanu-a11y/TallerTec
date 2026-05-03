import Link from "next/link";
import { ArrowLeft, ChevronDown, HelpCircle, QrCode, Award, BookOpen, LogIn, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Centro de Ayuda | TallerTec",
  description: "Preguntas frecuentes y guía de uso del sistema TallerTec.",
};

const categorias = [
  {
    icon: LogIn,
    titulo: "Registro y Acceso",
    preguntas: [
      {
        q: "¿Quién puede usar TallerTec?",
        a: "Exclusivamente estudiantes, docentes y personal del TecNM Campus Matehuala con correo institucional (@matehuala.tecnm.mx).",
      },
      {
        q: "¿Cómo me registro?",
        a: "Haz clic en 'Regístrate', ingresa tu nombre completo, número de control, correo institucional y una contraseña de al menos 8 caracteres. Recibirás un correo de confirmación.",
      },
      {
        q: "Olvidé mi contraseña, ¿qué hago?",
        a: "En la pantalla de login haz clic en '¿Olvidaste tu contraseña?'. Se enviará un enlace de recuperación a tu correo institucional.",
      },
      {
        q: "¿Por qué no puedo registrarme con mi correo personal?",
        a: "El sistema solo acepta correos @matehuala.tecnm.mx como medida de seguridad para garantizar que solo la comunidad del TecNM pueda acceder.",
      },
    ],
  },
  {
    icon: BookOpen,
    titulo: "Talleres e Inscripciones",
    preguntas: [
      {
        q: "¿Cuántos talleres puedo tomar al mismo tiempo?",
        a: "Puedes inscribirte en un taller por período. Las horas se acumulan de todos los talleres en los que hayas participado.",
      },
      {
        q: "¿Puedo cambiar de taller después de inscribirme?",
        a: "Sí, puedes darte de baja y unirte a otro taller siempre que haya lugares disponibles. Las horas acumuladas en el taller anterior se conservan.",
      },
      {
        q: "¿Cuándo abren las inscripciones?",
        a: "Las inscripciones se abren al inicio de cada período semestral. El sistema te notificará cuando estén disponibles.",
      },
      {
        q: "¿Qué pasa si el taller que quiero está lleno?",
        a: "Puedes elegir otro taller disponible. Actualmente no hay lista de espera; te recomendamos inscribirte al inicio del período.",
      },
    ],
  },
  {
    icon: QrCode,
    titulo: "Código QR y Asistencia",
    preguntas: [
      {
        q: "¿Dónde encuentro mi código QR?",
        a: "En tu Dashboard principal, sección 'Mi Código QR'. También está disponible en el ícono de QR en la barra de navegación móvil.",
      },
      {
        q: "¿Qué hago si el responsable no puede escanear mi QR?",
        a: "Asegúrate de que la pantalla tenga suficiente brillo. El responsable también puede registrar tu asistencia de forma manual si el QR falla.",
      },
      {
        q: "¿Puedo registrar más de una asistencia en el mismo día?",
        a: "No. El sistema registra una asistencia por persona por día para evitar duplicados. Si asististe, ya quedó registrado.",
      },
      {
        q: "¿Cuántas horas vale cada sesión?",
        a: "El responsable del taller configura el valor de cada sesión (1, 1.5, 2 o más horas). Esto varía según la duración real de la sesión.",
      },
    ],
  },
  {
    icon: Award,
    titulo: "Constancias",
    preguntas: [
      {
        q: "¿Cuántas horas necesito para mi constancia?",
        a: "Necesitas acumular exactamente 20 horas en talleres del TecNM Campus Matehuala durante el período en curso.",
      },
      {
        q: "¿Cómo solicito mi constancia?",
        a: "Ve a 'Mis Constancias' en tu dashboard. Cuando hayas acumulado 20+ horas, aparecerá el botón 'Solicitar Constancia'. La oficina de deportes la revisará y aprobará.",
      },
      {
        q: "¿Cuánto tiempo tarda en aprobarse?",
        a: "Generalmente entre 1 y 5 días hábiles. Recibirás una notificación en el sistema cuando sea aprobada o rechazada.",
      },
      {
        q: "¿Puedo obtener más de una constancia por semestre?",
        a: "No. Solo se emite una constancia por estudiante por período académico.",
      },
    ],
  },
];

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">T</div>
            <span className="font-bold text-lg">TallerTec</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12 space-y-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Centro de Ayuda</h1>
          <p className="text-muted-foreground text-lg">
            Preguntas frecuentes sobre el uso de TallerTec.
          </p>
        </div>

        {categorias.map(({ icon: Icon, titulo, preguntas }) => (
          <section key={titulo} className="glass-card p-7 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">{titulo}</h2>
            </div>
            <div className="space-y-4">
              {preguntas.map(({ q, a }) => (
                <details key={q} className="group border border-border/40 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-sm hover:bg-white/5 transition-colors list-none">
                    {q}
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform shrink-0 ml-3" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* Contacto adicional */}
        <div className="glass-card p-7 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-1">¿No encontraste tu respuesta?</h3>
            <p className="text-sm text-muted-foreground">
              Visita la Oficina de Deportes y Actividades Culturales del TecNM Campus Matehuala o escríbenos.
            </p>
          </div>
          <Link href="/contacto"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors">
            Contacto
          </Link>
        </div>
      </main>

      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          TallerTec © 2026 — TecNM Campus Matehuala
        </div>
      </footer>
    </div>
  );
}
