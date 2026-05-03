"use client";

import QrScanner from "@/components/talleres/qr-scanner";
import Link from "next/link";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { useState } from "react";

export default function ScanPage() {
  const [sessionHours, setSessionHours] = useState("2.0");
  const [totalScanned, setTotalScanned] = useState(0);

  const handleScanSuccess = (text: string) => {
    // In a real app, send 'text' and 'sessionHours' to backend via Server Action
    setTotalScanned(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex h-16 items-center px-4 justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              R
            </div>
            <span className="font-bold tracking-tight hidden sm:inline-block">Panel de Responsable</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-md p-4 flex flex-col items-center py-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Pase de Lista QR</h1>
          <p className="text-muted-foreground">Taller de Fútbol Varonil</p>
        </div>

        {/* Panel de Configuración de la Sesión */}
        <div className="w-full glass-card p-4 rounded-2xl mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Valor de la Sesión</p>
              <select 
                value={sessionHours}
                onChange={(e) => setSessionHours(e.target.value)}
                className="bg-transparent text-foreground text-sm font-bold focus:outline-none cursor-pointer"
              >
                <option value="1.0">1.0 horas</option>
                <option value="1.5">1.5 horas</option>
                <option value="2.0">2.0 horas</option>
                <option value="3.0">3.0 horas</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-sm font-medium">Asistencia</p>
              <p className="text-lg font-bold text-accent">{totalScanned} / 25</p>
            </div>
            <div className="w-10 h-10 bg-accent/20 text-accent rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Escáner */}
        <QrScanner onScanSuccess={handleScanSuccess} />
      </main>
    </div>
  );
}
