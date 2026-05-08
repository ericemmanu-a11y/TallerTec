import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PrintButton from "@/components/ui/print-button";

export const metadata = { title: "Mi Código QR | TallerTec" };

export default async function MiQRPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const qrData = `tallertec:${user.id}`;
  const nombre = user.user_metadata?.nombre_completo ?? user.email;
  const control = user.user_metadata?.numero_control;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 text-center animate-slide-up">
        <Link href="/dashboard"
          className="no-print inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </Link>

        <h1 className="text-2xl font-extrabold mb-1">Mi Código QR</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Muéstraselo al responsable de tu taller para registrar asistencia.
        </p>

        <div className="glass-card p-6 rounded-3xl mb-6">
          <div className="bg-white p-4 rounded-2xl mx-auto inline-block shadow-xl shadow-white/10 mb-4">
            <QRCodeSVG value={qrData} size={220} level="H" includeMargin />
          </div>
          <p className="font-bold">{nombre}</p>
          {control && <p className="text-sm text-muted-foreground font-mono mt-0.5">{control}</p>}
          <p className="text-xs text-muted-foreground mt-3 font-mono bg-black/20 px-3 py-1.5 rounded-lg truncate">
            {qrData.slice(0, 35)}...
          </p>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          Este código es único e intransferible. No lo compartas con terceros.
        </p>

        <div className="no-print">
          <PrintButton label="Guardar / Imprimir QR" />
        </div>
      </div>
    </div>
  );
}
