"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import { UserCheck, XCircle, Loader2, Camera, CameraOff, RefreshCw } from "lucide-react";

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
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraStatus, setCameraStatus] = useState<"initializing" | "ready" | "error" | "permission_denied">("initializing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const isProcessing = useRef(false);
  const lastScannedRef = useRef<string | null>(null);

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleQRCode = useCallback(async (code: string) => {
    if (isProcessing.current || code === lastScannedRef.current) return;

    isProcessing.current = true;
    lastScannedRef.current = code;
    setScanStatus("loading");

    try {
      const result = await onScanSuccess(code);
      setScanResult(result);
      setScanStatus(result.success ? "success" : "error");
    } catch (err) {
      setScanResult({ success: false, error: "Error al procesar el código" });
      setScanStatus("error");
    }

    setTimeout(() => {
      setScanStatus("idle");
      setScanResult(null);
      lastScannedRef.current = null;
      isProcessing.current = false;
    }, 4000);
  }, [onScanSuccess]);

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (qrCode && qrCode.data) {
      handleQRCode(qrCode.data);
    }

    animationRef.current = requestAnimationFrame(scanFrame);
  }, [handleQRCode]);

  const startCamera = useCallback(async () => {
    setCameraStatus("initializing");
    setErrorMessage("");
    stopCamera();

    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta acceso a la cámara");
      }

      // Try back camera first
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      } catch (e) {
        // Fallback to any camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");

        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject();
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => resolve())
              .catch(reject);
          };
          videoRef.current.onerror = reject;
        });

        setCameraStatus("ready");
        animationRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.error("Camera error:", err);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraStatus("permission_denied");
        setErrorMessage("Permiso de cámara denegado. Permite el acceso en la configuración de tu navegador.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraStatus("error");
        setErrorMessage("No se encontró ninguna cámara en este dispositivo.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraStatus("error");
        setErrorMessage("La cámara está siendo usada por otra aplicación.");
      } else {
        setCameraStatus("error");
        setErrorMessage(err.message || "Error al acceder a la cámara.");
      }
    }
  }, [stopCamera, scanFrame]);

  const retryCamera = () => {
    startCamera();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Camera container */}
      <div
        className={`w-full max-w-sm rounded-3xl overflow-hidden glass-card transition-all duration-300 relative ${
          scanStatus === "success" ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]" :
          scanStatus === "error"   ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]" :
          scanStatus === "loading" ? "border-primary/60" :
          "border-primary/20"
        }`}
      >
        {/* Video element - always present */}
        <video
          ref={videoRef}
          className={`w-full aspect-square object-cover ${cameraStatus === "ready" ? "" : "hidden"}`}
          playsInline
          muted
        />

        {/* Hidden canvas for QR processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* QR targeting overlay */}
        {cameraStatus === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 border-2 border-primary/60 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
            </div>
          </div>
        )}

        {/* Initializing state */}
        {cameraStatus === "initializing" && (
          <div className="aspect-square flex flex-col items-center justify-center bg-zinc-900 p-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-sm text-zinc-400 text-center">Iniciando cámara...</p>
            <p className="text-xs text-zinc-500 text-center mt-2">
              Permite el acceso cuando se solicite
            </p>
          </div>
        )}

        {/* Permission denied */}
        {cameraStatus === "permission_denied" && (
          <div className="aspect-square flex flex-col items-center justify-center bg-zinc-900 p-8">
            <CameraOff className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-sm text-red-400 text-center font-medium">Cámara bloqueada</p>
            <p className="text-xs text-zinc-400 text-center mt-2 mb-4 px-4">
              {errorMessage}
            </p>
            <button
              onClick={retryCamera}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reintentar
            </button>
          </div>
        )}

        {/* Error state */}
        {cameraStatus === "error" && (
          <div className="aspect-square flex flex-col items-center justify-center bg-zinc-900 p-8">
            <CameraOff className="w-12 h-12 text-yellow-500 mb-4" />
            <p className="text-sm text-yellow-400 text-center font-medium">Error de cámara</p>
            <p className="text-xs text-zinc-400 text-center mt-2 mb-4 px-4">
              {errorMessage}
            </p>
            <button
              onClick={retryCamera}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reintentar
            </button>
          </div>
        )}
      </div>

      {/* Status messages */}
      <div className="mt-6 w-full max-w-sm min-h-28">
        {cameraStatus === "ready" && scanStatus === "idle" && (
          <div className="flex flex-col items-center text-center animate-fade-in text-zinc-400 py-4">
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
            <h3 className="font-bold text-white">¡Asistencia Registrada!</h3>
            <p className="text-green-500 text-sm font-medium mt-0.5">{scanResult.nombre}</p>
            {scanResult.control && (
              <p className="text-xs text-zinc-400 font-mono mt-1">{scanResult.control}</p>
            )}
          </div>
        )}

        {scanStatus === "error" && scanResult && (
          <div className="animate-scale-in glass-card p-4 border-red-500/30 rounded-2xl text-center">
            <XCircle className="w-8 h-8 text-red-500 mb-2 mx-auto" />
            <h3 className="font-bold text-white">No Registrado</h3>
            <p className="text-red-400 text-sm mt-0.5">{scanResult.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
