"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, UserCheck, XCircle, Loader2, Camera, CameraOff, RefreshCw } from "lucide-react";

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
  const [cameraStatus, setCameraStatus] = useState<"initializing" | "ready" | "error" | "permission_denied">("initializing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScan = useCallback(async (decodedText: string) => {
    if (isProcessing.current || decodedText === lastScanned) return;

    isProcessing.current = true;
    setLastScanned(decodedText);
    setScanStatus("loading");

    try {
      const result = await onScanSuccess(decodedText);
      setScanResult(result);
      setScanStatus(result.success ? "success" : "error");
    } catch (err) {
      setScanResult({ success: false, error: "Error al procesar el código" });
      setScanStatus("error");
    }

    setTimeout(() => {
      setScanStatus("idle");
      setScanResult(null);
      setLastScanned(null);
      isProcessing.current = false;
    }, 4000);
  }, [onScanSuccess, lastScanned]);

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;

    setCameraStatus("initializing");
    setErrorMessage("");

    try {
      // Check if camera is available
      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {
        setCameraStatus("error");
        setErrorMessage("No se encontró ninguna cámara en este dispositivo");
        return;
      }

      // Create scanner instance
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          // Ignore stop errors
        }
      }

      scannerRef.current = new Html5Qrcode("qr-reader");

      // Try to use back camera first (better for QR scanning), fallback to any camera
      const cameraConfig = { facingMode: "environment" };

      await scannerRef.current.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        handleScan,
        () => {} // Ignore scan errors (no QR found)
      );

      setCameraStatus("ready");
    } catch (err: any) {
      console.error("Scanner error:", err);

      if (err?.message?.includes("Permission") || err?.name === "NotAllowedError") {
        setCameraStatus("permission_denied");
        setErrorMessage("Permiso de cámara denegado. Por favor permite el acceso a la cámara.");
      } else if (err?.message?.includes("NotFoundError") || err?.message?.includes("Requested device not found")) {
        // Try with any available camera
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices.length > 0) {
            await scannerRef.current?.start(
              devices[0].id,
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1,
              },
              handleScan,
              () => {}
            );
            setCameraStatus("ready");
            return;
          }
        } catch (e) {
          // Fallback failed
        }
        setCameraStatus("error");
        setErrorMessage("No se pudo acceder a la cámara. Verifica que no esté en uso por otra aplicación.");
      } else {
        setCameraStatus("error");
        setErrorMessage(err?.message || "Error al iniciar la cámara");
      }
    }
  }, [handleScan]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const retryCamera = () => {
    stopScanner().then(() => startScanner());
  };

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Camera container */}
      <div
        ref={containerRef}
        className={`w-full max-w-sm rounded-3xl overflow-hidden glass-card transition-all duration-300 ${
          scanStatus === "success" ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]" :
          scanStatus === "error"   ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" :
          scanStatus === "loading" ? "border-primary/60" :
          "border-primary/20"
        }`}
      >
        {/* Initializing state */}
        {cameraStatus === "initializing" && (
          <div className="aspect-square flex flex-col items-center justify-center bg-black/50 p-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground text-center">Iniciando cámara...</p>
            <p className="text-xs text-muted-foreground/60 text-center mt-2">
              Permite el acceso a la cámara cuando se solicite
            </p>
          </div>
        )}

        {/* Permission denied */}
        {cameraStatus === "permission_denied" && (
          <div className="aspect-square flex flex-col items-center justify-center bg-black/50 p-8">
            <CameraOff className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-sm text-red-400 text-center font-medium">Acceso a cámara denegado</p>
            <p className="text-xs text-muted-foreground text-center mt-2 mb-4">
              {errorMessage}
            </p>
            <button
              onClick={retryCamera}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reintentar
            </button>
          </div>
        )}

        {/* Error state */}
        {cameraStatus === "error" && (
          <div className="aspect-square flex flex-col items-center justify-center bg-black/50 p-8">
            <CameraOff className="w-12 h-12 text-yellow-500 mb-4" />
            <p className="text-sm text-yellow-400 text-center font-medium">Error de cámara</p>
            <p className="text-xs text-muted-foreground text-center mt-2 mb-4">
              {errorMessage}
            </p>
            <button
              onClick={retryCamera}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reintentar
            </button>
          </div>
        )}

        {/* QR Reader container - always rendered but hidden when not ready */}
        <div
          id="qr-reader"
          className={cameraStatus === "ready" ? "" : "hidden"}
          style={{ width: "100%" }}
        />
      </div>

      {/* Status messages */}
      <div className="mt-6 w-full max-w-sm min-h-28">
        {cameraStatus === "ready" && scanStatus === "idle" && (
          <div className="flex flex-col items-center text-center animate-fade-in text-muted-foreground py-4">
            <Camera className="w-6 h-6 mb-2 text-primary" />
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
