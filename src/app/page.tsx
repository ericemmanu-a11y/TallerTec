import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Trophy, Activity, Award, Camera, Users, Star } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[250px] md:h-[400px] bg-primary/20 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto p-4 md:p-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-tecnm.png"
            alt="TecNM"
            width={40}
            height={40}
            className="w-9 h-9 md:w-10 md:h-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg md:text-xl tracking-tight leading-tight">TallerTec</span>
            <span className="text-[10px] md:text-xs text-muted-foreground leading-tight">TecNM Campus Matehuala</span>
          </div>
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
        {/* Mobile menu button */}
        <Link href="/login" className="md:hidden text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full">
          Ingresar
        </Link>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 text-center z-10 relative mt-8 md:mt-12 mb-16 md:mb-20">
        {/* Logo institucional grande */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <Image
            src="/logo-itmh.png"
            alt="Instituto Tecnológico de Matehuala"
            width={120}
            height={120}
            className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Sistema Oficial TecNM Campus Matehuala
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-4 md:mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
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
      </div>

      {/* Features Section */}
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-16 md:mb-20 relative z-10">
        <div className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 text-primary rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
            <Activity className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Registro Instantáneo</h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Olvídate de las filas. Inscríbete a tus talleres favoritos con un par de clics desde cualquier dispositivo.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 text-accent rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
            <Trophy className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Asistencia con QR</h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Control exacto de tus horas mediante códigos QR únicos. Sin listas de papel ni firmas perdidas.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 text-purple-400 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
            <Award className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Constancias PDF</h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Al cumplir tus 20 horas, solicita y descarga tu constancia oficial directamente desde la plataforma.
          </p>
        </div>
      </div>

      {/* Conoce Nuestros Talleres Section */}
      <section className="w-full bg-gradient-to-b from-transparent via-primary/5 to-transparent py-16 md:py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Camera className="w-4 h-4" />
              Explora y Elige
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Conoce Nuestros Talleres
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubre las actividades deportivas y culturales que tenemos para ti.
              Cada taller es una oportunidad de crecer, aprender y formar parte de una comunidad.
            </p>
          </div>

          {/* Talleres Grid - Placeholder para futuras fotos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Taller Card 1 */}
            <div className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center relative">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">Foto próximamente</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">Fútbol</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Entrena con el equipo representativo y participa en torneos interuniversitarios.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> +50 inscritos
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500" /> Popular
                  </span>
                </div>
              </div>
            </div>

            {/* Taller Card 2 */}
            <div className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center relative">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-8 h-8 text-orange-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">Foto próximamente</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">Básquetbol</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Desarrolla tus habilidades en la cancha con entrenamientos profesionales.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> +30 inscritos
                  </span>
                </div>
              </div>
            </div>

            {/* Taller Card 3 */}
            <div className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center relative">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">Foto próximamente</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">Voleibol</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Únete al equipo y vive la emoción de las competencias deportivas.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> +25 inscritos
                  </span>
                </div>
              </div>
            </div>

            {/* Taller Card 4 */}
            <div className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center relative">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">Foto próximamente</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">Atletismo</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Mejora tu condición física y compite en las diferentes disciplinas del atletismo.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> +20 inscritos
                  </span>
                </div>
              </div>
            </div>

            {/* Taller Card 5 */}
            <div className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-to-br from-pink-500/20 to-pink-600/10 flex items-center justify-center relative">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-pink-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">Foto próximamente</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">Danza</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Expresa tu creatividad a través del baile y representa al Tecnológico en eventos culturales.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> +35 inscritos
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500" /> Popular
                  </span>
                </div>
              </div>
            </div>

            {/* Taller Card 6 - Ver más */}
            <Link href="/talleres" className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 flex items-center justify-center min-h-[280px]">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Ver Todos los Talleres</h3>
                <p className="text-sm text-muted-foreground">
                  Explora el catálogo completo de actividades disponibles
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-tecnm.png"
              alt="TecNM"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
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
