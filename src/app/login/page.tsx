import { strings } from "@/lib/fa/strings";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="brand-frame w-full max-w-md rounded-card bg-card px-8 py-12 shadow-warm">
        <p className="ornament-divider font-display text-section text-ornament">
          ✦
        </p>
        <h1 className="font-display mt-6 text-center text-hero text-foreground">
          {strings.auth.title}
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
