"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { CheckCircle2, UserCheck, XCircle, Loader2 } from "lucide-react";

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QrScanner({ onScanSuccess }: QrScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const [studentName, setStudentName] = useState<string>("");

  useEffect(() => {
    // Configuración del escáner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      rememberLastUsedCamera: true,
    };

    scannerRef.current = new Html5QrcodeScanner("reader", config, false);

    const onScan = (decodedText: string) => {
      // Evitar escanear el mismo código múltiples veces seguidas rápidamente
      if (decodedText === lastScanned && scanStatus !== "idle") return;
      
      setLastScanned(decodedText);
      setScanStatus("loading");

      // Simulamos un delay de red y validación en DB (Sprint 3 mock)
      setTimeout(() => {
        if (decodedText.startsWith("tallertec:")) {
          setScanStatus("success");
          setStudentName("Juan Pérez (L12345678)"); // Mock data
          onScanSuccess(decodedText);
          
          // Reset después de 3 segundos
          setTimeout(() => {
            setScanStatus("idle");
            setLastScanned(null);
          }, 3000);
        } else {
          setScanStatus("error");
          setTimeout(() => setScanStatus("idle"), 3000);
        }
      }, 800);
    };

    scannerRef.current.render(onScan, (err) => {
      // Ignorar errores de "no se detectó QR" frame por frame
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [lastScanned, scanStatus, onScanSuccess]);

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        id="reader" 
        className={`w-full max-w-sm rounded-3xl overflow-hidden glass-card transition-all ${
          scanStatus === "success" ? "border-green-500 shadow-green-500/20" :
          scanStatus === "error" ? "border-red-500 shadow-red-500/20" :
          "border-primary shadow-primary/10"
        }`}
      />
      
      <div className="mt-8 w-full max-w-sm h-32">
        {scanStatus === "idle" && (
          <div className="flex flex-col items-center text-center animate-fade-in text-muted-foreground">
            <p>Apunta la cámara al código QR del estudiante</p>
          </div>
        )}

        {scanStatus === "loading" && (
          <div className="flex flex-col items-center text-center animate-fade-in">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
            <p className="text-primary font-medium">Validando asistencia...</p>
          </div>
        )}

        {scanStatus === "success" && (
          <div className="flex flex-col items-center text-center animate-scale-in glass-card p-4 border-green-500/30 rounded-2xl">
            <UserCheck className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-bold text-foreground">Asistencia Registrada</h3>
            <p className="text-green-500 text-sm font-medium">{studentName}</p>
          </div>
        )}

        {scanStatus === "error" && (
          <div className="flex flex-col items-center text-center animate-scale-in glass-card p-4 border-red-500/30 rounded-2xl">
            <XCircle className="w-8 h-8 text-red-500 mb-2" />
            <h3 className="font-bold text-foreground">Código Inválido</h3>
            <p className="text-red-500/80 text-sm">El QR no pertenece a este taller</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        #reader {
          border: none !important;
        }
        #reader__dashboard_section_csr span {
          display: none !important;
        }
        #reader__dashboard_section_csr button {
          background-color: var(--primary) !important;
          color: white !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 1rem !important;
          border: none !important;
          margin-bottom: 1rem !important;
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}
