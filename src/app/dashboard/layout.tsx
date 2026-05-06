import { createClient } from "@/lib/supabase/server";
import { LogOut, LayoutDashboard, BookOpen, Award, Bell, QrCode, UserCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifCount } = await supabase
    .from("notificaciones")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", user.id)
    .eq("leida", false);

  const unread = (notifCount as unknown as { count: number } | null)?.count ?? 0;
  const nombre = user.user_metadata?.nombre_completo?.split(" ")[0] ?? user.email;

  const navItems = [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/talleres", label: "Talleres", icon: BookOpen },
    { href: "/dashboard/constancias", label: "Constancias", icon: Award },
    { href: "/dashboard/notificaciones", label: "Avisos", icon: Bell, badge: unread > 0 ? unread : null },
    { href: "/dashboard/perfil", label: "Perfil", icon: UserCircle, badge: null },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">T</div>
            <span className="font-bold text-lg tracking-tight">TallerTec</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon, badge }) => (
              <Link key={href} href={href}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                <Icon className="w-4 h-4" />
                {label}
                {badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{nombre}</p>
              <p className="text-xs text-muted-foreground">Estudiante</p>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit"
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-6xl p-4 md:p-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/40 z-50">
        <div className="flex">
          {navItems.map(({ href, label, icon: Icon, badge }) => (
            <Link key={href} href={href}
              className="relative flex-1 flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Icon className="w-5 h-5" />
              {label}
              {badge && (
                <span className="absolute top-2 left-1/2 translate-x-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          ))}
          <Link href="/scan" className="flex-1 flex flex-col items-center gap-1 py-3 text-xs text-accent hover:text-accent/80 transition-colors">
            <QrCode className="w-5 h-5" />
            Mi QR
          </Link>
        </div>
      </nav>
    </div>
  );
}
