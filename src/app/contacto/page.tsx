import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contacto | TallerTec - TecNM Campus Matehuala",
  description: "Comunícate con la Oficina de Deportes del TecNM Campus Matehuala.",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">T</div>
            <span className="font-bold text-lg">TallerTec</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-12 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold mb-3">Contáctanos</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Oficina de Deportes y Actividades Culturales — TecNM Campus Matehuala
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Datos de contacto */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Información de Contacto</h2>

            {[
              {
                icon: MapPin,
                titulo: "Dirección",
                lineas: ["Carretera 57 Km 5", "Matehuala, San Luis Potosí", "C.P. 78746, México"],
              },
              {
                icon: Phone,
                titulo: "Teléfonos",
                lineas: ["(488) 882-1314", "(488) 882-3877"],
              },
              {
                icon: Mail,
                titulo: "Correo Electrónico",
                lineas: ["contacto@matehuala.tecnm.mx", "deportes@matehuala.tecnm.mx"],
              },
              {
                icon: Clock,
                titulo: "Horario de Atención",
                lineas: ["Lunes a Viernes", "08:00 – 15:00 horas", "Edificio de Servicios Estudiantiles"],
              },
            ].map(({ icon: Icon, titulo, lineas }) => (
              <div key={titulo} className="glass-card p-5 rounded-2xl flex gap-4">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{titulo}</p>
                  {lineas.map((l) => (
                    <p key={l} className="text-sm text-muted-foreground">{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Formulario de contacto (visual) */}
          <div className="glass-card p-7 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold">Envía un Mensaje</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Nombre Completo</label>
                <input type="text" className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="Tu nombre completo" readOnly />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Correo Electrónico</label>
                <input type="email" className="glass-input w-full px-4 py-3 rounded-xl text-sm" placeholder="tu@correo.com" readOnly />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Asunto</label>
                <select className="glass-input w-full px-4 py-3 rounded-xl text-sm">
                  <option>Duda sobre inscripciones</option>
                  <option>Problema con mi cuenta</option>
                  <option>Solicitud de constancia</option>
                  <option>Reporte de error en el sistema</option>
                  <option>Otro</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Mensaje</label>
                <textarea rows={4} className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none" placeholder="Describe tu pregunta o comentario..." readOnly />
              </div>
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Para mayor agilidad, envía directamente un correo a <strong>deportes@matehuala.tecnm.mx</strong> o visítanos en nuestro horario de atención.</p>
              </div>
              <Link href="mailto:deportes@matehuala.tecnm.mx"
                className="w-full block text-center py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                Enviar Correo Directo
              </Link>
            </div>
          </div>
        </div>

        {/* Mapa placeholder */}
        <div className="glass-card p-8 rounded-3xl text-center">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">Cómo Llegarnos</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-4">
            El Instituto Tecnológico de Matehuala se encuentra sobre la Carretera 57,
            a 5 kilómetros de la cabecera municipal de Matehuala, San Luis Potosí.
            Contamos con transporte urbano y estacionamiento.
          </p>
          <div className="bg-white/5 border border-border/50 rounded-2xl h-48 flex items-center justify-center text-muted-foreground text-sm">
            [Carretera 57 Km 5 — Matehuala, SLP]
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          TallerTec © 2026 — Sistema Oficial TecNM Campus Matehuala
        </div>
      </footer>
    </div>
  );
}
