import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              T
            </div>
            <span className="font-bold text-lg tracking-tight">TallerTec</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden md:block">
              {user.email}
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto max-w-6xl p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
