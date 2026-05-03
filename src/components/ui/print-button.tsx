"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Imprimir / Guardar PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-sm"
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  );
}
