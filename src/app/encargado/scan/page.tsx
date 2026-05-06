"use client";

import QrScanner from "@/components/talleres/qr-scanner";
import { Clock, Users, ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { registrarAsistencia } from "@/app/actions/asistencia";
import Link from "next/link";

type Taller = { id: string; nombre: string; horario_texto: string; categoria: string };

export default function ScanPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const tallerId      = searchParams.get("taller") ?? "";
  const [sessionHours, setSessionHours] = useState("2.0");
  const [totalScanned, setTotalScanned] = useState(0);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [tallerActivo, setTallerActivo] = useState<Taller | null>(null);

  // Fetch encargado's talleres
  useEffect(() => {
    fetch("/api/encargado/mis-talleres")
      .then((r) => r.json())
      .then((data: Taller[]) => {
        setTalleres(data);
        if (tallerId) {
          const found = data.find((t) => t.id === tallerId);
          if (found) setTallerActivo(found);
        }
      })
      .catch(() => {});
  }, [tallerId]);

  const handleScanSuccess = async (qrData: string) => {
    const result = await registrarAsistencia(qrData, tallerId, parseFloat(sessionHours));
    if (result.success) {
      setTotalScanned((prev) => prev + 1);
      return { success: true, nombre: result.nombreEstudiante, control: result.numeroControl };
    }
    return { success: false, error: result.error };
  };

  const seleccionarTaller = (t: Taller) => {
    setTallerActivo(t);
    setTotalScanned(0);
    router.replace(`/encargado/scan?taller=${t.id}`);
  };

  // ── Step 1: taller selector ──
  if (!tallerActivo) {
    return (
      <div className="container mx-auto max-w-md p-4 py-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/encargado" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Pase de Lista QR</h1>
            <p className="text-sm text-muted-foreground">Selecciona el taller de esta sesión</p>
          </div>
        </div>

        {talleres.length === 0 ? (
          <div className="glass-card p-10 rounded-3xl text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No tienes talleres asignados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {talleres.map((t) => (
              <button key={t.id} onClick={() => seleccionarTaller(t)}
                className="w-full glass-card p-5 rounded-2xl flex items-center gap-4 hover:border-primary/30 hover:bg-white/5 transition-all group text-left">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${t.categoria === "DEPORTIVO" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold group-hover:text-primary transition-colors truncate">{t.nombre}</p>
                  <p className="text-sm text-muted-foreground">{t.horario_texto}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Step 2: scanner ──
  return (
    <div className="container mx-auto max-w-md p-4 flex flex-col items-center py-8 animate-fade-in">
      <div className="w-full flex items-center justify-between mb-6">
        <button onClick={() => { setTallerActivo(null); router.replace("/encargado/scan"); }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Cambiar taller
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold">{tallerActivo.nombre}</h1>
          <p className="text-xs text-muted-foreground">{tallerActivo.horario_texto}</p>
        </div>
        <div className="w-20" />
      </div>

      {/* Session controls */}
      <div className="w-full glass-card p-4 rounded-2xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor de la Sesión</p>
            <select value={sessionHours} onChange={(e) => setSessionHours(e.target.value)}
              className="bg-transparent text-foreground text-sm font-bold focus:outline-none cursor-pointer">
              <option value="1.0">1.0 hora</option>
              <option value="1.5">1.5 horas</option>
              <option value="2.0">2.0 horas</option>
              <option value="2.5">2.5 horas</option>
              <option value="3.0">3.0 horas</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-xs text-muted-foreground">Registrados</p>
            <p className="text-xl font-bold text-accent">{totalScanned}</p>
          </div>
          <div className="w-10 h-10 bg-accent/20 text-accent rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      <QrScanner onScanSuccess={handleScanSuccess} />
    </div>
  );
}
