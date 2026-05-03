"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight, Hash, GraduationCap } from "lucide-react";
import Link from "next/link";

const CARRERAS = [
  "Ing. en Sistemas Computacionales",
  "Ing. Industrial",
  "Ing. en Gestión Empresarial",
  "Ing. en Administración",
  "Lic. en Administración",
  "Ing. Mecatrónica",
  "Ing. en Tecnologías de la Información",
  "Otra carrera",
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

    if (!form.email.endsWith("@matehuala.tecnm.mx")) {
      setError("Debes usar tu correo institucional (@matehuala.tecnm.mx)");
      setLoading(false);
      return;
    }
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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre_completo: form.nombre_completo.trim(),
          numero_control: form.numero_control.trim().toUpperCase(),
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
      <div className="w-full max-w-md mx-auto glass-card rounded-2xl p-8 animate-scale-in text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
          <Mail className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">¡Registro Exitoso!</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Hemos enviado un enlace de confirmación a{" "}
          <strong className="text-foreground">{form.email}</strong>.
          Revisa tu bandeja de entrada para activar tu cuenta.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
        >
          Ir al Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto glass-card rounded-2xl p-8 animate-slide-up">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-4 border border-accent/30">
          <UserPlus className="w-8 h-8 text-accent" />
        </div>
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

        {/* No. Control + Carrera */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 ml-1">No. Control</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={form.numero_control} onChange={set("numero_control")}
                className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm" placeholder="L20230001" required />
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
              className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm" placeholder="l20230001@matehuala.tecnm.mx" required />
          </div>
        </div>

        {/* Password + Confirm */}
        <div className="grid grid-cols-2 gap-3">
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
  );
}
