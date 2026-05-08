"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Refresh to layout so it redirects based on role
      router.refresh();
      const role = data.user.user_metadata?.rol || 'ESTUDIANTE';
      if (role === 'ADMIN_OFICINA') {
        router.push("/admin");
      } else if (role === 'RESPONSABLE_TALLER') {
        router.push("/encargado");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-2xl p-8 animate-slide-up">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
          <LogIn className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-center text-foreground">
          Bienvenido a <span className="text-gradient">TallerTec</span>
        </h2>
        <p className="text-muted-foreground mt-2 text-center text-sm">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80 ml-1">
            Correo Electrónico
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
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between ml-1">
            <label className="text-sm font-medium text-foreground/80">
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
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
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start">
            <span className="font-medium mr-2">Error:</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Iniciar Sesión
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
}
