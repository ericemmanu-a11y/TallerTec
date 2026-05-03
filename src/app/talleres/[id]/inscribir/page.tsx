"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inscribirTaller } from "@/app/actions/talleres";
import { CheckCircle2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function InscribirPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [estado, setEstado] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [mensaje, setMensaje] = useState("");
  const [tallerNombre, setTallerNombre] = useState("");

  const handleInscribir = async () => {
    setEstado("loading");
    const { id } = await params;
    const result = await inscribirTaller(id);
    if (result.error) {
      setMensaje(result.error);
      setEstado("error");
    } else {
      setTallerNombre(result.tallerNombre ?? "");
      setEstado("success");
    }
  };

  if (estado === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
        <div className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/30">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">¡Inscripción Exitosa!</h1>
          <p className="text-muted-foreground text-sm mb-2">
            Te has inscrito en <strong className="text-foreground">{tallerNombre}</strong>.
          </p>
          <p className="text-muted-foreground text-xs mb-8">
            Usa tu código QR para registrar asistencia en cada sesión.
          </p>
          <div className="bg-white p-4 rounded-2xl mx-auto inline-block mb-6 shadow-xl">
            <QRCodeSVG value="tallertec:demo" size={180} level="H" includeMargin />
          </div>
          <p className="text-xs text-muted-foreground mb-6">Tu QR personal está disponible siempre en tu Dashboard.</p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              Ir a mi Dashboard <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link href="/talleres"
              className="w-full py-3 rounded-xl bg-white/5 text-foreground font-semibold flex items-center justify-center hover:bg-white/10 transition-colors">
              Ver más talleres
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 relative z-10 text-center animate-slide-up">
        <h1 className="text-2xl font-bold mb-2">Confirmar Inscripción</h1>
        <p className="text-muted-foreground text-sm mb-8">
          ¿Deseas inscribirte a este taller? Al confirmar se reservará tu lugar.
        </p>

        {estado === "error" && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2 text-left animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">No se pudo completar</p>
              <p>{mensaje}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={handleInscribir} disabled={estado === "loading"}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70">
            {estado === "loading" ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
            ) : "Confirmar Inscripción"}
          </button>
          <Link href="/talleres"
            className="w-full py-3 rounded-xl bg-white/5 text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
