import type { ReactNode } from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Sparkles } from "lucide-react";

// Standard marketing stats shared across auth flows
const MARKETING_STATS = [
  { label: "Leads Qualified", value: "10K+" },
  { label: "Accuracy Rate", value: "95%" },
  { label: "Faster Qualification", value: "3x" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-surface-muted font-sans">
      {/* ── Left Marketing Panel (Hidden on Mobile) ─────────────────────── */}
      <aside className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-secondary-600 shrink-0">
        {/* Decorative Radial Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_50%)]" />

        {/* Structured Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16 text-text-inverse">
          {/* Logo Identity */}
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg group-hover:bg-white/25 transition-all">
              <Zap
                size={18}
                className="text-white fill-white animate-slide-in"
              />
            </div>
            <span className="text-lg font-bold tracking-tight">Kooi</span>
          </Link>

          {/* Core Copy Block */}
          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1 mb-6">
              <Sparkles size={12} className="text-white" />
              <span className="text-base font-semibold tracking-wide uppercase">
                AI-Powered Voice Agents
              </span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight mb-4">
              Qualify Leads While You Sleep
            </h1>
            <p className="text-base text-white/85 leading-relaxed">
              Kooi deploys intelligent voice AI agents that call, qualify, and
              score your leads 24/7. Focus your sales team on high-value
              closing, and eliminate manual cold calling forever.
            </p>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/20">
              {MARKETING_STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-base text-white/75 mt-1 leading-tight">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Security Marker */}
          <div className="flex items-center gap-2 text-base text-white/75">
            <ShieldCheck size={13} />
            <span>Enterprise-grade security · SOC 2 compliant</span>
          </div>
        </div>
      </aside>

      {/* ── Right Dynamic Content Panel ─────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface-muted">
        {/* Mobile Header (visible only on screens smaller than lg) */}
        <header className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-sm">
              <Zap size={15} className="text-text-inverse fill-white" />
            </div>
            <span className="text-base font-bold text-text-primary tracking-tight">
              Kooi
            </span>
          </Link>

          <Link
            href="/"
            className="text-base font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back
          </Link>
        </header>

        {/* Form Insertion Node */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 overflow-y-auto">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Global Footer */}
        <footer className="hidden lg:flex items-center justify-center gap-6 py-4 border-t border-surface-border bg-surface shrink-0">
          <span className="text-base text-text-muted">
            © {new Date().getFullYear()} Kooi. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-base text-text-muted hover:text-text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-base text-text-muted hover:text-text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/security"
              className="text-base text-text-muted hover:text-text-primary transition-colors"
            >
              Security
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
