import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Trophy, Activity, Award, Camera, ImageIcon } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

interface TallerDestacado {
  id: string;
  nombre: string;
  descripcion: string;
  imagen_url: string | null;
  color: string;
}

async function getTalleresDestacados(): Promise<TallerDestacado[]> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("talleres_destacados")
      .select("id, nombre, descripcion, imagen_url, color")
      .eq("activo", true)
      .order("orden", { ascending: true });

    if (error) {
      console.error("Error obteniendo talleres destacados:", error);
      return [];
    }

    return (data ?? []) as TallerDestacado[];
  } catch {
    return [];
  }
}

const colorClasses: Record<string, { gradient: string; icon: string; iconBg: string }> = {
  blue: { gradient: "from-blue-500/20 to-blue-600/10", icon: "text-blue-400", iconBg: "bg-blue-500/20" },
  orange: { gradient: "from-orange-500/20 to-orange-600/10", icon: "text-orange-400", iconBg: "bg-orange-500/20" },
  purple: { gradient: "from-purple-500/20 to-purple-600/10", icon: "text-purple-400", iconBg: "bg-purple-500/20" },
  green: { gradient: "from-green-500/20 to-green-600/10", icon: "text-green-400", iconBg: "bg-green-500/20" },
  pink: { gradient: "from-pink-500/20 to-pink-600/10", icon: "text-pink-400", iconBg: "bg-pink-500/20" },
  red: { gradient: "from-red-500/20 to-red-600/10", icon: "text-red-400", iconBg: "bg-red-500/20" },
  yellow: { gradient: "from-yellow-500/20 to-yellow-600/10", icon: "text-yellow-400", iconBg: "bg-yellow-500/20" },
  cyan: { gradient: "from-cyan-500/20 to-cyan-600/10", icon: "text-cyan-400", iconBg: "bg-cyan-500/20" },
};

export default async function Home() {
  const talleres = await getTalleresDestacados();

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[250px] md:h-[400px] bg-primary/20 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto p-4 md:p-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-itmh.png"
            alt="TecNM Campus Matehuala"
            width={56}
            height={56}
            className="w-12 h-12 md:w-14 md:h-14 object-contain"
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
        {/* Logos institucionales */}
        <div className="mb-6 md:mb-8 animate-fade-in flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* Logo TecNM horizontal (principal) */}
          <Image
            src="/logo-tecnm-horizontal.jpg"
            alt="Tecnológico Nacional de México"
            width={400}
            height={120}
            className="h-16 md:h-20 w-auto object-contain"
          />
          {/* Separador */}
          <div className="hidden md:block w-px h-16 bg-border/50" />
          {/* Logo ITMH */}
          <Image
            src="/logo-itmh-grande.jpg"
            alt="Instituto Tecnológico de Matehuala"
            width={100}
            height={100}
            className="h-16 md:h-20 w-auto object-contain"
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
      {talleres.length > 0 && (
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

            {/* Talleres Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {talleres.map((taller) => {
                const colors = colorClasses[taller.color] || colorClasses.blue;
                return (
                  <div
                    key={taller.id}
                    className="group glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className={`aspect-[4/3] bg-gradient-to-br ${colors.gradient} flex items-center justify-center relative`}>
                      {taller.imagen_url ? (
                        <Image
                          src={taller.imagen_url}
                          alt={taller.nombre}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-center p-6">
                          <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                            <Activity className={`w-8 h-8 ${colors.icon}`} />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-1">{taller.nombre}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {taller.descripcion}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Ver más */}
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
      )}

      {/* Footer */}
      <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-itmh.png"
              alt="TecNM Campus Matehuala"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
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
