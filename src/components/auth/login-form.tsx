"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="w-full max-w-md mx-auto">
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
        <div className="mb-6 bg-white rounded-xl p-4">
          {/* Desktop */}
          <div className="hidden sm:flex items-center justify-center gap-4">
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
          {/* Mobile */}
          <div className="flex sm:hidden flex-col items-center gap-3">
            <Image
              src="/logo-tecnm-horizontal.jpg"
              alt="Tecnológico Nacional de México"
              width={200}
              height={60}
              className="h-10 w-auto object-contain"
            />
            <div className="w-full h-px bg-gray-200" />
            <div className="flex items-center justify-center gap-4">
              <Image
                src="/logo-itmh.png"
                alt="Instituto Tecnológico de Matehuala"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <div className="w-px h-8 bg-gray-300" />
              <Image
                src="/mascota-itmh.png"
                alt="Mascota ITMH"
                width={40}
                height={40}
                className="h-11 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center mb-6">
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
    </div>
  );
}
