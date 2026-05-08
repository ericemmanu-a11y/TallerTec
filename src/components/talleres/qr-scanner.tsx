"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { CheckCircle2, UserCheck, XCircle, Loader2, Clock } from "lucide-react";

interface ScanResult {
  success: boolean;
  nombre?: string;
  control?: string;
  error?: string;
}

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => Promise<ScanResult>;
}

export default function QrScanner({ onScanSuccess }: QrScannerProps) {
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 8,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      async (decodedText: string) => {
        if (isProcessing.current || decodedText === lastScanned) return;
        isProcessing.current = true;
        setLastScanned(decodedText);
        setScanStatus("loading");

        const result = await onScanSuccess(decodedText);
        setScanResult(result);
        setScanStatus(result.success ? "success" : "error");

        setTimeout(() => {
          setScanStatus("idle");
          setScanResult(null);
          setLastScanned(null);
          isProcessing.current = false;
        }, 4000);
      },
      () => {}
    );

    return () => { scanner.clear().catch(console.error); };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div
        id="reader"
        className={`w-full max-w-sm rounded-3xl overflow-hidden glass-card transition-all duration-300 ${
          scanStatus === "success" ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]" :
          scanStatus === "error"   ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" :
          scanStatus === "loading" ? "border-primary/60" :
          "border-primary/20"
        }`}
      />

      <div className="mt-6 w-full max-w-sm min-h-28">
        {scanStatus === "idle" && (
          <div className="flex flex-col items-center text-center animate-fade-in text-muted-foreground py-4">
            <p className="text-sm">Apunta la cámara al código QR del estudiante</p>
          </div>
        )}

        {scanStatus === "loading" && (
          <div className="flex flex-col items-center text-center animate-fade-in py-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
            <p className="text-primary font-medium text-sm">Validando asistencia...</p>
          </div>
        )}

        {scanStatus === "success" && scanResult && (
          <div className="animate-scale-in glass-card p-4 border-green-500/30 rounded-2xl text-center">
            <UserCheck className="w-8 h-8 text-green-500 mb-2 mx-auto" />
            <h3 className="font-bold text-foreground">¡Asistencia Registrada!</h3>
            <p className="text-green-500 text-sm font-medium mt-0.5">{scanResult.nombre}</p>
            {scanResult.control && (
              <p className="text-xs text-muted-foreground font-mono mt-1">{scanResult.control}</p>
            )}
          </div>
        )}

        {scanStatus === "error" && scanResult && (
          <div className="animate-scale-in glass-card p-4 border-red-500/30 rounded-2xl text-center">
            <XCircle className="w-8 h-8 text-red-500 mb-2 mx-auto" />
            <h3 className="font-bold text-foreground">No Registrado</h3>
            <p className="text-red-400 text-sm mt-0.5">{scanResult.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
