import { createClient } from "@/lib/supabase/server";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, Download } from "lucide-react";

export default async function InscribirPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // En un entorno real, aquí se haría:
  // 1. Verificar cupo
  // 2. Insertar en tabla inscripciones
  // 3. Generar token único para QR si no tiene
  
  // Para la demo del Sprint 2, simulamos éxito directo
  const dummyQrData = user?.id ? `tallertec:${user.id}` : `tallertec:demo-12345`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 relative z-10 text-center animate-slide-up">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/30">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">¡Inscripción Exitosa!</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Te has inscrito correctamente al taller. Este es tu código QR personal para registrar asistencia.
        </p>

        <div className="bg-white p-4 rounded-2xl mx-auto inline-block mb-6 shadow-xl">
          <QRCodeSVG 
            value={dummyQrData}
            size={200}
            level="H"
            includeMargin={true}
            className="rounded-lg"
          />
        </div>
        
        <p className="text-xs text-muted-foreground mb-8">
          Presenta este código al responsable del taller en cada sesión. Puedes encontrarlo siempre en tu Dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            Descargar QR
          </button>
          
          <Link href="/dashboard" className="w-full py-3 rounded-xl bg-white/5 text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Ir a mi Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
