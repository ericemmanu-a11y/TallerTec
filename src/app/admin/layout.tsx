import { createClient } from "@/lib/supabase/server";
import { LogOut, LayoutDashboard, Users, UserCog, CalendarPlus, Award, Calendar } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") redirect("/login");

  const { data: pendientes } = await supabase
    .from("constancias")
    .select("id", { count: "exact", head: true })
    .eq("estado", "PENDIENTE");

  const pendientesCount = (pendientes as unknown as { count: number } | null)?.count ?? 0;

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/talleres", label: "Talleres", icon: CalendarPlus },
    { href: "/admin/periodos", label: "Períodos", icon: Calendar },
    { href: "/admin/encargados", label: "Encargados", icon: UserCog },
    { href: "/admin/alumnos", label: "Alumnos", icon: Users },
    { href: "/admin/constancias", label: "Constancias", icon: Award, badge: pendientesCount > 0 ? pendientesCount : null },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/40 bg-background/80 backdrop-blur md:h-screen sticky top-0 flex flex-col z-50">
        <div className="flex h-16 items-center px-4 md:px-6 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
            <div>
              <span className="font-bold tracking-tight text-sm">Admin TallerTec</span>
              <p className="text-xs text-muted-foreground">Oficina de Deportes</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-auto p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {navItems.map(({ href, label, icon: Icon, badge }) => (
            <Link key={href} href={href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-medium whitespace-nowrap text-sm">{label}</span>
              {badge && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/40 hidden md:block">
          <p className="text-xs text-muted-foreground mb-3 truncate">{user.email}</p>
          <form action="/auth/signout" method="post">
            <button type="submit"
              className="flex items-center gap-3 px-3 py-2 w-full rounded-xl hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500 text-sm">
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background/50">{children}</main>
    </div>
  );
}
