"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Loader2, ArrowRight, Hash, GraduationCap, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CARRERAS = [
  "Ingeniería en Sistemas Computacionales",
  "Ingeniería Civil",
  "Ingeniería Industrial",
  "Ingeniería en Gestión Empresarial",
  "Contador Público",
];

export default function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    nombre_completo: "",
    numero_control: "",
    email: "",
    password: "",
    confirmPassword: "",
    carrera: "",
    semestre: "",
    telefono: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }
    if (form.nombre_completo.trim().length < 3) {
      setError("Ingresa tu nombre completo.");
      setLoading(false);
      return;
    }

    // Validar que el correo sea institucional del TecNM
    const emailLower = form.email.toLowerCase().trim();
    if (!emailLower.endsWith("@matehuala.tecnm.mx")) {
      setError("Debes usar tu correo institucional (@matehuala.tecnm.mx)");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre_completo: form.nombre_completo.trim(),
          numero_control: form.numero_control.trim(),
          carrera: form.carrera,
          semestre: form.semestre ? parseInt(form.semestre) : null,
          telefono: form.telefono.trim(),
          rol: "ESTUDIANTE",
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message === "User already registered"
        ? "Este correo ya está registrado."
        : signUpError.message
      );
      setLoading(false);
      return;
    }

    if (data.user) {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto animate-scale-in space-y-5">
        {/* Confirmation card */}
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <Mail className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Registro Exitoso!</h2>
          <p className="text-muted-foreground text-sm mb-1">
            Enviamos un enlace de activación a
          </p>
          <p className="font-bold text-foreground text-sm mb-4">{form.email}</p>
          <p className="text-xs text-muted-foreground mb-6">
            Revisa tu bandeja de entrada (y spam) y haz clic en el enlace para activar tu cuenta.
          </p>
          <Link href="/login"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
            Ir al Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Onboarding steps */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <p className="text-sm font-bold text-center text-muted-foreground uppercase tracking-wider">¿Qué sigue?</p>
          {[
            { num: "1", title: "Confirma tu correo", desc: "Revisa el enlace que te enviamos." },
            { num: "2", title: "Inicia sesión", desc: "Usa tus credenciales institucionales." },
            { num: "3", title: "Inscríbete a un taller", desc: "Elige deportivo o cultural." },
            { num: "4", title: "Registra tu asistencia", desc: "Muestra tu QR al encargado cada sesión." },
            { num: "5", title: "Solicita tu constancia", desc: "Al cumplir 20 horas la constancia es tuya." },
          ].map(({ num, title, desc }) => (
            <div key={num} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {num}
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Enlace para volver al inicio */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <Home className="w-4 h-4" />
        Volver al inicio
      </Link>

      <div className="glass-card rounded-2xl p-8 animate-slide-up">
        {/* Logos institucionales con mascota */}
        <div className="flex items-center justify-center gap-4 mb-6 bg-white rounded-xl p-4">
          <Image
            src="/logo-tecnm-horizontal.jpg"
            alt="Tecnológico Nacional de México"
            width={160}
            height={50}
            className="h-12 w-auto object-contain"
          />
          <div className="w-px h-10 bg-gray-300" />
          <Image
            src="/logo-itmh.png"
            alt="Instituto Tecnológico de Matehuala"
            width={50}
            height={50}
            className="h-12 w-auto object-contain"
          />
          <div className="w-px h-10 bg-gray-300" />
          <Image
            src="/mascota-itmh.png"
            alt="Mascota ITMH"
            width={50}
            height={50}
            className="h-14 w-auto object-contain"
          />
        </div>

        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold text-center">Crea tu cuenta</h2>
          <p className="text-muted-foreground mt-1 text-center text-sm">
            Estudiantes del TecNM Campus Matehuala
          </p>
        </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Nombre */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80 ml-1">Nombre Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={form.nombre_completo} onChange={set("nombre_completo")}
              className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm" placeholder="Juan Carlos Pérez Martínez" required minLength={3} />
          </div>
        </div>

        {/* No. Control + Semestre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 ml-1">No. Control</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={form.numero_control} onChange={set("numero_control")}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm" placeholder="23660151" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 ml-1">Semestre</label>
            <select value={form.semestre} onChange={set("semestre")}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm" required>
              <option value="">Selecciona</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}°</option>
              ))}
            </select>
          </div>
        </div>

        {/* Carrera */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80 ml-1">Carrera</label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select value={form.carrera} onChange={set("carrera")}
              className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm" required>
              <option value="">Selecciona tu carrera</option>
              {CARRERAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80 ml-1">Correo Institucional</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="email" value={form.email} onChange={set("email")}
              className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm" placeholder="L23660151@matehuala.tecnm.mx" required />
          </div>
          <p className="text-xs text-muted-foreground ml-1">
            Solo correos @matehuala.tecnm.mx
          </p>
        </div>

        {/* Password + Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="password" value={form.password} onChange={set("password")}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm" placeholder="••••••••" required minLength={8} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 ml-1">Confirmar</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="password" value={form.confirmPassword} onChange={set("confirmPassword")}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm" placeholder="••••••••" required minLength={8} />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
            <span className="font-medium">Error: </span>{error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>Crear Cuenta <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent/80 transition-colors">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
