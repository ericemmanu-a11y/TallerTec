import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, Settings, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export const metadata = {
  title: "Dashboard | TallerTec",
  description: "Panel principal de TallerTec",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Mock data para el Sprint 4 (Progreso)
  const currentHours = 14.5;
  const targetHours = 20.0;
  const progressPercentage = Math.min((currentHours / targetHours) * 100, 100);
  const isCompleted = currentHours >= targetHours;
  const dummyQrData = user?.id ? `tallertec:${user.id}` : `tallertec:demo-12345`; 

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Bienvenido a tu Panel</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Aquí podrás gestionar tus talleres y consultar tu progreso.
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 relative z-10">
          <div>
            <h3 className="font-semibold text-xl mb-1">Progreso del Semestre</h3>
            <p className="text-muted-foreground">Tu meta es alcanzar las 20 horas para liberar tu actividad.</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <span className="text-5xl font-extrabold text-foreground">{currentHours}</span>
            <span className="text-xl text-muted-foreground font-medium"> / {targetHours} hrs</span>
          </div>
        </div>

        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden relative z-10">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {isCompleted && (
          <div className="mt-6 flex items-center p-4 bg-green-500/10 border border-green-500/20 rounded-2xl relative z-10">
            <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
            <div>
              <p className="text-green-500 font-bold">¡Meta Alcanzada!</p>
              <p className="text-green-500/80 text-sm">Ya puedes generar tu constancia oficial desde la sección de Documentos.</p>
            </div>
            <button className="ml-auto bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 hover:bg-green-400 transition-colors">
              Generar Constancia
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mis Talleres */}
        <div className="glass-card p-6 rounded-3xl flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Mis Talleres Activos</h3>
          <div className="flex-1 space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <p className="font-bold">Fútbol Varonil</p>
                <p className="text-xs text-muted-foreground mt-1">Lunes y Miércoles 7:00 AM</p>
              </div>
              <div className="text-right">
                <p className="text-primary font-bold">14.5 hrs</p>
                <p className="text-xs text-muted-foreground">Acumuladas</p>
              </div>
            </div>
          </div>
          <Link href="/talleres" className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold flex items-center justify-center transition-colors">
            Explorar Catálogo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Mi Código QR */}
        <div className="glass-card p-6 rounded-3xl flex flex-col items-center text-center">
          <h3 className="font-semibold text-lg mb-2">Mi Código QR</h3>
          <p className="text-muted-foreground text-sm mb-6">Muéstralo para registrar asistencia</p>
          <div className="bg-white p-3 rounded-2xl shadow-xl shadow-white/5 mb-4">
            <QRCodeSVG 
              value={dummyQrData}
              size={150}
              level="H"
              includeMargin={true}
              className="rounded-lg"
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono bg-black/20 px-3 py-1.5 rounded-lg w-full truncate">
            {dummyQrData}
          </p>
        </div>
      </div>
    </div>
  );
}
