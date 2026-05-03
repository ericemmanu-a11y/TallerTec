import LoginForm from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | TallerTec",
  description: "Ingresa a tu cuenta de TallerTec",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" style={{ animationDelay: "2s" }} />
      
      <div className="w-full relative z-10">
        <LoginForm />
      </div>
    </main>
  );
}
