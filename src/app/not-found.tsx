import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <p className="text-[8rem] font-extrabold leading-none text-gradient opacity-20 select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[8rem] font-extrabold leading-none text-gradient select-none">404</p>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Página no encontrada</h1>
          <p className="text-muted-foreground">
            La página que buscas no existe o fue movida.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 glass-card rounded-xl font-semibold hover:bg-white/5 transition-colors text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Mi panel
          </Link>
        </div>
      </div>
    </div>
  );
}
