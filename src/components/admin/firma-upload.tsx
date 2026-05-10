"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";

interface FirmaUploadProps {
  configId: string;
  firmante: "1" | "2";
  firmaActual?: string | null;
  onUploadComplete: (url: string) => void;
  onDelete?: () => void;
}

export default function FirmaUpload({
  configId,
  firmante,
  firmaActual,
  onUploadComplete,
  onDelete,
}: FirmaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validaciones del lado del cliente
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten archivos PNG o JPG.");
      return;
    }

    if (file.size > 500 * 1024) {
      setError("El archivo excede el tamaño máximo de 500KB.");
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("configId", configId);
      formData.append("firmante", firmante);
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-firma", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al subir el archivo");
      }

      onUploadComplete(data.url);
      setPreview(null); // Limpiar preview ya que ahora usaremos la URL real
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo");
      setPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta firma?")) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/upload-firma?configId=${configId}&firmante=${firmante}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar");
      }

      onDelete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setIsDeleting(false);
    }
  };

  const displayUrl = preview || firmaActual;

  return (
    <div className="space-y-3">
      {/* Preview de firma */}
      {displayUrl && (
        <div className="relative inline-block">
          <div className="p-3 bg-white rounded-xl border border-border/50 inline-block">
            <img
              src={displayUrl}
              alt={`Firma ${firmante}`}
              className="h-16 max-w-[200px] object-contain"
            />
          </div>
          {firmaActual && !isDeleting && (
            <button
              type="button"
              onClick={handleDelete}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-full transition-colors"
              title="Eliminar firma"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {isDeleting && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Input de archivo */}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <span
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isUploading
                ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                : "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : displayUrl ? (
              <>
                <Upload className="w-4 h-4" />
                Cambiar imagen
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Subir firma
              </>
            )}
          </span>
        </label>

        {firmaActual && !isUploading && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Recomendaciones */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1.5">
          <ImageIcon className="w-3 h-3" />
          PNG con fondo transparente recomendado
        </p>
        <p>Tamaño máximo: 500KB | Dimensiones sugeridas: 200x80px</p>
      </div>
    </div>
  );
}
