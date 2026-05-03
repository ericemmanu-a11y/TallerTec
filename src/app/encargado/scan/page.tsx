"use client";

import QrScanner from "@/components/talleres/qr-scanner";
import { Clock, Users, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { registrarAsistencia } from "@/app/actions/asistencia";
import Link from "next/link";

export default function ScanPage() {
  const searchParams = useSearchParams();
  const tallerId = searchParams.get("taller") ?? "";
  const [sessionHours, setSessionHours] = useState("2.0");
  const [totalScanned, setTotalScanned] = useState(0);

  const handleScanSuccess = async (qrData: string) => {
    const result = await registrarAsistencia(qrData, tallerId, parseFloat(sessionHours));
    if (result.success) {
      setTotalScanned((prev) => prev + 1);
      return { success: true, nombre: result.nombreEstudiante, control: result.numeroControl };
    }
    return { success: false, error: result.error };
  };

  return (
    <div className="container mx-auto max-w-md p-4 flex flex-col items-center py-8 animate-fade-in">
      <div className="w-full flex items-center justify-between mb-8">
        <Link href="/encargado" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-bold">Pase de Lista QR</h1>
          <p className="text-muted-foreground text-xs">{tallerId ? "Taller activo" : "Selecciona un taller"}</p>
        </div>
        <div className="w-16" />
      </div>

      <div className="w-full glass-card p-4 rounded-2xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor de la Sesión</p>
            <select
              value={sessionHours}
              onChange={(e) => setSessionHours(e.target.value)}
              className="bg-transparent text-foreground text-sm font-bold focus:outline-none cursor-pointer"
            >
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

      {!tallerId && (
        <div className="w-full p-4 mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-sm text-center">
          Accede desde "Mis Talleres" para vincular el escáner a un taller específico.
        </div>
      )}

      <QrScanner onScanSuccess={handleScanSuccess} />
    </div>
  );
}
