"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, MapPin, Phone, Mail, Clock, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { enviarContacto } from "@/app/actions/contacto";

export const metadata = undefined; // metadata must be in server page; handled below

const ASUNTOS = [
  "Duda sobre inscripciones",
  "Problema con mi cuenta",
  "Solicitud de constancia",
  "Reporte de error en el sistema",
  "Información sobre talleres",
  "Otro",
];

const CONTACTOS = [
  { icon: MapPin, titulo: "Dirección", lineas: ["Carretera 57 Km 5", "Matehuala, San Luis Potosí", "C.P. 78746, México"] },
  { icon: Phone, titulo: "Teléfonos", lineas: ["(488) 882-1314", "(488) 882-3877"] },
  { icon: Mail,  titulo: "Correo Electrónico", lineas: ["contacto@matehuala.tecnm.mx", "deportes@matehuala.tecnm.mx"] },
  { icon: Clock, titulo: "Horario de Atención", lineas: ["Lunes a Viernes", "08:00 – 15:00 horas", "Edificio de Servicios Estudiantiles"] },
];

export default function ContactoClient() {
  const [form, setForm] = useState({ nombre: "", email: "", asunto: ASUNTOS[0], mensaje: "" });
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      setError("Completa todos los campos requeridos.");
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.set(k, v));
      const result = await enviarContacto(fd);
      if (result.error) setError(result.error);
      else setDone(true);
    });
  };

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
            {CONTACTOS.map(({ icon: Icon, titulo, lineas }) => (
              <div key={titulo} className="glass-card p-5 rounded-2xl flex gap-4">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{titulo}</p>
                  {lineas.map((l) => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          {/* Formulario funcional */}
          <div className="glass-card p-7 rounded-3xl">
            {done ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">¡Mensaje enviado!</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Tu mensaje ha sido recibido. Te responderemos en un plazo de 1–2 días hábiles
                  al correo <strong>{form.email}</strong>.
                </p>
                <button onClick={() => { setDone(false); setForm({ nombre: "", email: "", asunto: ASUNTOS[0], mensaje: "" }); }}
                  className="text-sm text-primary hover:underline font-medium">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-bold">Envía un Mensaje</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-sm font-medium text-foreground/80">Nombre Completo <span className="text-red-400">*</span></label>
                      <input type="text" value={form.nombre} onChange={set("nombre")} required
                        className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                        placeholder="Tu nombre completo" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-sm font-medium text-foreground/80">Correo Electrónico <span className="text-red-400">*</span></label>
                      <input type="email" value={form.email} onChange={set("email")} required
                        className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                        placeholder="tu@correo.com" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/80">Asunto</label>
                    <select value={form.asunto} onChange={set("asunto")}
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm">
                      {ASUNTOS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground/80">Mensaje <span className="text-red-400">*</span></label>
                    <textarea rows={4} value={form.mensaje} onChange={set("mensaje")} required
                      className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                      placeholder="Describe tu pregunta o comentario..." />
                    <p className="text-xs text-muted-foreground text-right">{form.mensaje.length}/500</p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">{error}</p>
                  )}

                  <button type="submit" disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70 shadow-lg shadow-primary/20">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                    {isPending ? "Enviando..." : "Enviar Mensaje"}
                  </button>
                  <p className="text-xs text-center text-muted-foreground">
                    También puedes escribirnos a{" "}
                    <a href="mailto:deportes@matehuala.tecnm.mx" className="text-primary hover:underline">
                      deportes@matehuala.tecnm.mx
                    </a>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Cómo llegar */}
        <div className="glass-card p-8 rounded-3xl text-center">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">Cómo Llegarnos</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
            El Instituto Tecnológico de Matehuala se encuentra sobre la Carretera 57,
            a 5 kilómetros de la cabecera municipal. Contamos con transporte urbano y estacionamiento.
          </p>
          <div className="rounded-2xl overflow-hidden border border-border/50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.28!2d-100.6442!3d23.6526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842b6d7b6e4a1c3b%3A0x5a5a5a5a5a5a5a5a!2sInstituto+Tecnol%C3%B3gico+de+Matehuala!5e0!3m2!1ses!2smx!4v1"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />
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
