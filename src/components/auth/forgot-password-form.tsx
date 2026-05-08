"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError("No pudimos procesar la solicitud. Verifica tu correo e intenta de nuevo.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="w-full max-w-md mx-auto glass-card rounded-2xl p-8 animate-scale-in text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Correo Enviado</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Si <strong className="text-foreground">{email}</strong> está registrado, recibirás un
          enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y carpeta de spam.
        </p>
        <Link href="/login"
          className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
          Volver al Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-2xl p-8 animate-slide-up">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-center">Recuperar Contraseña</h2>
        <p className="text-muted-foreground mt-2 text-center text-sm">
          Te enviaremos un enlace para restablecer tu acceso.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground/80 ml-1">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
            <span className="font-medium">Error: </span>{error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Enviar Enlace de Recuperación
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
