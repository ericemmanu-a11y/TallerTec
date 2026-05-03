"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate email domain
    if (!email.endsWith("@matehuala.tecnm.mx")) {
      setError("Debes usar tu correo institucional (@matehuala.tecnm.mx)");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: name,
          rol: "ESTUDIANTE", // Default role
        },
      },
    });

    if (error) {
      setError(error.message);
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
          Hemos enviado un enlace de confirmación a <strong>{email}</strong>. 
          Por favor revisa tu bandeja de entrada para activar tu cuenta.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center py-2 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
        >
          Ir al Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-2xl p-8 animate-slide-up">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-4 border border-accent/30">
          <UserPlus className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-center text-foreground">
          Crea tu cuenta
        </h2>
        <p className="text-muted-foreground mt-2 text-center text-sm">
          Únete a la nueva plataforma deportiva
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80 ml-1">
            Nombre Completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              placeholder="Juan Pérez"
              required
              minLength={3}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80 ml-1">
            Correo Institucional
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              placeholder="l12345678@matehuala.tecnm.mx"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80 ml-1">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start animate-fade-in">
            <span className="font-medium mr-2">Error:</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Registrarse
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:text-accent/80 transition-colors"
        >
          Inicia Sesión
        </Link>
      </div>
    </div>
  );
}
