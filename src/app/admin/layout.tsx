import { createClient } from "@/lib/supabase/server";
import { LogOut, LayoutDashboard, Users, UserCog, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.rol !== "ADMIN_OFICINA") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar para desktop, topbar para móvil */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/40 bg-background/80 backdrop-blur md:h-screen sticky top-0 flex flex-col z-50">
        <div className="flex h-16 items-center px-4 md:px-6 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold tracking-tight">Admin TallerTec</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-auto p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium whitespace-nowrap">Dashboard</span>
          </Link>
          <Link href="/admin/talleres" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
            <CalendarPlus className="w-5 h-5" />
            <span className="font-medium whitespace-nowrap">Talleres</span>
          </Link>
          <Link href="/admin/encargados" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
            <UserCog className="w-5 h-5" />
            <span className="font-medium whitespace-nowrap">Encargados</span>
          </Link>
          <Link href="/admin/alumnos" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
            <Users className="w-5 h-5" />
            <span className="font-medium whitespace-nowrap">Alumnos</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border/40 hidden md:block">
          <div className="text-xs text-muted-foreground mb-4 truncate">
            {user.email}
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 w-full rounded-xl hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto bg-background/50">
        {children}
      </main>
    </div>
  );
}
