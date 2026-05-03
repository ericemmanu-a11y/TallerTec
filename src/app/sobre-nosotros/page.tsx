import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Trophy, Music, Target, Users, Star, BookOpen } from "lucide-react";

export const metadata = {
  title: "Sobre Nosotros | TallerTec - TecNM Campus Matehuala",
  description: "Conoce el Instituto Tecnológico de Matehuala y su programa de actividades extracurriculares.",
};

const talleres_deportivos = [
  { nombre: "Fútbol Varonil", descripcion: "Entrenamiento competitivo con participación en Universiada Nacional TecNM." },
  { nombre: "Voleibol Femenil", descripcion: "Desarrollo técnico y de equipo en la duela central del campus." },
  { nombre: "Basquetbol Mixto", descripcion: "Disciplina táctica y juego colectivo para toda la comunidad estudiantil." },
  { nombre: "Atletismo", descripcion: "Entrenamiento en pista: velocidad, resistencia y saltos." },
  { nombre: "Tae-kwon-do", descripcion: "Arte marcial coreano: disciplina, autodefensa y competencia." },
  { nombre: "Ajedrez", descripcion: "Torneo interno y delegación al Festival Nacional de Arte y Cultura TecNM." },
];

const talleres_culturales = [
  { nombre: "Danza Folclórica", descripcion: "Representación de la riqueza cultural de la Huasteca Potosina y México." },
  { nombre: "Coro Institucional", descripcion: "Expresión vocal con repertorio nacional, folclórico y clásico." },
  { nombre: "Ajedrez Cultural", descripcion: "Desarrollo del pensamiento lógico y estratégico con competencias regionales." },
];

const valores = [
  { icon: Target, titulo: "Misión", texto: "Formar integralmente a los estudiantes mediante actividades deportivas y culturales que complementen su desarrollo académico, promoviendo hábitos saludables, trabajo en equipo y valores ciudadanos." },
  { icon: Star, titulo: "Visión", texto: "Ser el campus TecNM con mayor participación y reconocimiento en competencias nacionales de deporte y cultura, formando egresados íntegros y comprometidos con su comunidad." },
  { icon: Users, titulo: "Valores", texto: "Disciplina, respeto, compañerismo, excelencia académica y compromiso con la identidad cultural de Matehuala y la región Huasteca." },
];

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">T</div>
            <span className="font-bold text-lg">TallerTec</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Inicio
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-12 space-y-20">

        {/* Hero institucional */}
        <section className="relative text-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-primary/20 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary" />
              TecNM Campus Matehuala — Desde 1972
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Instituto Tecnológico<br />
              <span className="text-gradient">de Matehuala</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Formando ingenieros y profesionistas desde hace más de 50 años en el altiplano potosino.
              Campus del Tecnológico Nacional de México ubicado en Matehuala, San Luis Potosí.
            </p>
          </div>
        </section>

        {/* Datos de contacto */}
        <section className="glass-card p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary" /> Información de Contacto
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, label: "Dirección", value: "Carretera 57 Km 5, C.P. 78746, Matehuala, San Luis Potosí" },
              { icon: Phone, label: "Teléfonos", value: "(488) 882-1314 / 882-3877" },
              { icon: Mail, label: "Correo", value: "contacto@matehuala.tecnm.mx" },
              { icon: Globe, label: "Sitio Web", value: "matehuala.tecnm.mx" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Misión, Visión, Valores */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center">Nuestra Filosofía Institucional</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {valores.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className="glass-card p-7 rounded-3xl">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-3">{titulo}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Programa de talleres */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-3">Programa de Actividades Extracurriculares</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              TallerTec es la plataforma oficial para gestionar las 20 horas de actividad extracurricular
              requeridas como requisito de titulación. Ofrecemos talleres deportivos y culturales cada semestre.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Deportivos */}
            <div className="glass-card p-7 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Talleres Deportivos</h3>
              </div>
              <div className="space-y-4">
                {talleres_deportivos.map((t) => (
                  <div key={t.nombre} className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">{t.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Culturales */}
            <div className="glass-card p-7 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/20 text-accent rounded-xl flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Talleres Culturales</h3>
              </div>
              <div className="space-y-4">
                {talleres_culturales.map((t) => (
                  <div key={t.nombre} className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-accent shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">{t.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona TallerTec */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center">¿Cómo funciona TallerTec?</h2>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { paso: "01", titulo: "Regístrate", desc: "Con tu correo institucional @matehuala.tecnm.mx" },
              { paso: "02", titulo: "Inscríbete", desc: "Elige el taller que más te guste cada semestre" },
              { paso: "03", titulo: "Asiste", desc: "El encargado escanea tu QR en cada sesión" },
              { paso: "04", titulo: "Constancia", desc: "Al cumplir 20 horas, solicita tu constancia oficial" },
            ].map(({ paso, titulo, desc }) => (
              <div key={paso} className="glass-card p-5 rounded-2xl text-center">
                <div className="text-4xl font-extrabold text-primary/30 mb-3">{paso}</div>
                <h4 className="font-bold mb-1">{titulo}</h4>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center glass-card p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="relative z-10">
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">¿Listo para comenzar?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Únete a la plataforma y gestiona tus horas extracurriculares de forma digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Registrarme como Estudiante
              </Link>
              <Link href="/login"
                className="px-8 py-3 rounded-full glass-card text-foreground font-semibold hover:bg-white/5 transition-colors">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          TallerTec © 2026 — Sistema Oficial TecNM Campus Matehuala
        </div>
      </footer>
    </div>
  );
}
