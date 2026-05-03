import Link from "next/link";
import { ArrowRight, Trophy, Activity, Award } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto p-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">
            T
          </div>
          <span className="font-bold text-xl tracking-tight">TallerTec</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/sobre-nosotros" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sobre Nosotros
          </Link>
          <Link href="/ayuda" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Ayuda
          </Link>
          <div className="h-4 w-px bg-border/50 mx-2"></div>
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Iniciar Sesión
          </Link>
          <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            Regístrate
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative mt-12 mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Sistema Oficial TecNM Campus Matehuala
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          El Deporte Universitario, <br />
          <span className="text-gradient">Digitalizado</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Inscríbete a talleres, registra tu asistencia con QR y obtén tus constancias de forma automática. Todo desde tu celular.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20">
            Soy Estudiante - Registro
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 glass-card text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/5 transition-all">
            Ingresar al Sistema
          </Link>
        </div>
        
        <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <span>Accesos rápidos:</span>
          <Link href="/login" className="hover:text-primary transition-colors font-medium">Alumnos</Link>
          <span className="w-1 h-1 rounded-full bg-border/50" />
          <Link href="/login" className="hover:text-primary transition-colors font-medium">Encargados</Link>
          <span className="w-1 h-1 rounded-full bg-border/50" />
          <Link href="/login" className="hover:text-primary transition-colors font-medium">Administrador</Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 relative z-10">
        <div className="glass-card p-8 rounded-3xl">
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-6">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Registro Instantáneo</h3>
          <p className="text-muted-foreground leading-relaxed">
            Olvídate de las filas. Inscríbete a tus talleres favoritos con un par de clics desde cualquier dispositivo.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <div className="w-12 h-12 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mb-6">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Asistencia con QR</h3>
          <p className="text-muted-foreground leading-relaxed">
            Control exacto de tus horas mediante códigos QR únicos. Sin listas de papel ni firmas perdidas.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">Constancias PDF</h3>
          <p className="text-muted-foreground leading-relaxed">
            Al cumplir tus 20 horas, solicita y descarga tu constancia oficial directamente desde la plataforma.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-xs">
              T
            </div>
            <span className="font-bold text-sm tracking-tight text-muted-foreground">TallerTec © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/sobre-nosotros" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Sobre Nosotros
            </Link>
            <Link href="/ayuda" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Centro de Ayuda
            </Link>
            <Link href="/contacto" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
