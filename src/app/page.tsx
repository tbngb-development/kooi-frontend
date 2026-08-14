// src/app/page.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Phone,
  Bot,
  BarChart3,
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Star,
  Play,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Target,
  PhoneCall,
  MessageSquare,
  Calendar,
  Globe,
  Mic,
  Activity,
  ChevronRight,
  Check,
} from "lucide-react";

// ─── Animation Hook ───────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ─── Animated Counter ─────────────────────────────────────────────
function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
  duration = 2000,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollReveal(0.3);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * end);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

// ─── Floating Particles ──────────────────────────────────────────
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${8 + i * 4}px`,
            height: `${8 + i * 4}px`,
            background: `linear-gradient(135deg, var(--color-brand-400), var(--color-secondary-400))`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `float${i} ${6 + i * 2}s ease-in-out infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float0 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, -20px) scale(1.2);
          }
        }
        @keyframes float1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20px, 30px) scale(0.8);
          }
        }
        @keyframes float2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(25px, 15px) scale(1.1);
          }
        }
        @keyframes float3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-15px, -25px) scale(0.9);
          }
        }
        @keyframes float4 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -30px) scale(1.15);
          }
        }
        @keyframes float5 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-25px, 20px) scale(0.85);
          }
        }
      `}</style>
    </div>
  );
}

// ─── Voice Waveform Animation ─────────────────────────────────────
function VoiceWaveform({ active = true }: { active?: boolean }) {
  return (
    <div className="flex items-center gap-[3px] h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-all duration-300"
          style={{
            background: `linear-gradient(to top, var(--color-brand-500), var(--color-secondary-400))`,
            height: active ? `${12 + Math.sin(i * 1.2) * 12}px` : "4px",
            animation: active
              ? `waveform ${0.8 + i * 0.15}s ease-in-out infinite alternate`
              : "none",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes waveform {
          0% {
            height: 8px;
          }
          100% {
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────
function Section({
  children,
  className = "",
  id,
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  dark?: boolean;
}) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`
        relative py-20 md:py-28 lg:py-32 transition-all duration-1000
        ${dark ? "bg-[#0a1628] text-white" : "bg-white"}
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        ${className}
      `}
    >
      {children}
    </section>
  );
}

// ─── Staggered Child ──────────────────────────────────────────────
function Stagger({
  children,
  index = 0,
  className = "",
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        transitionDelay: `${index * 100}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "annual",
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  }, []);

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Benefits", id: "benefits" },
    { label: "Pricing", id: "pricing" },
    { label: "FAQ", id: "faq" },
  ];

  // ─── NAVBAR ───────────────────────────────────────────────────────
  const Navbar = (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-surface-border/50"
            : "bg-transparent"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-secondary-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Bot className="w-5 h-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-brand-300 rounded-full animate-pulse" />
            </div>
            <span
              className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? "text-text-primary" : "text-text-primary"}`}
            >
              Kooi
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-full transition-all duration-300
                  hover:bg-brand-50 hover:text-brand-600
                  ${scrolled ? "text-text-secondary" : "text-text-secondary"}
                `}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/login"
              className={`
                px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300
                ${scrolled ? "text-text-secondary hover:text-brand-600" : "text-text-secondary hover:text-brand-600"}
              `}
            >
              Sign In
            </a>
            <a
              href="/register"
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Free Trial
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-surface-subtle transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          lg:hidden overflow-hidden transition-all duration-500
          ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-4 pb-6 pt-2 bg-white/95 backdrop-blur-xl border-t border-surface-border/50 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-text-secondary hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 space-y-2 border-t border-surface-border mt-3">
            <a
              href="/login"
              className="block w-full text-center px-4 py-3 text-sm font-semibold text-text-secondary hover:text-brand-600 rounded-xl transition-colors"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="block w-full text-center px-5 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-brand-600 to-brand-500"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </div>
    </nav>
  );

  // ─── HERO ─────────────────────────────────────────────────────────
  const Hero = (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-white pt-20">
      <FloatingParticles />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-200/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100/80 border border-brand-200/60 mb-8 animate-[fadeIn_0.6s_ease-out]">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-semibold text-brand-700">
                AI-Powered Voice Agents
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6 animate-[fadeIn_0.8s_ease-out]">
              Qualify Leads{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-secondary-500 bg-clip-text text-transparent">
                  While You Sleep
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                >
                  <path
                    d="M2 8C50 2 100 4 150 6C200 8 250 4 298 8"
                    stroke="url(#underline-gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-[draw_1.5s_ease-out_0.8s_forwards]"
                    strokeDasharray="300"
                    strokeDashoffset="300"
                  />
                  <defs>
                    <linearGradient
                      id="underline-gradient"
                      x1="0"
                      y1="0"
                      x2="300"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#16a34a" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10 animate-[fadeIn_1s_ease-out]">
              Kooi deploys intelligent voice AI agents that call, qualify, and
              score your leads 24/7. No more cold-call burnout. No more missed
              opportunities.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12 animate-[fadeIn_1.2s_ease-out]">
              <a
                href="/register"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-lg hover:shadow-xl shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-text-secondary rounded-2xl border border-surface-border hover:border-brand-300 hover:bg-brand-50 transition-all duration-300"
              >
                <Play className="w-4 h-4 text-brand-500" />
                See How It Works
              </button>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-4 justify-center lg:justify-start text-sm text-text-muted animate-[fadeIn_1.4s_ease-out]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
                <span>No credit card required</span>
              </div>
              <div className="w-px h-4 bg-surface-border" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </div>

          {/* Right — Hero Visual */}
          <div className="relative animate-[scaleIn_1s_ease-out]">
            <div className="relative">
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-secondary-400/20 rounded-3xl blur-2xl scale-110" />

              {/* Main Card */}
              <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl p-6 sm:p-8">
                {/* Agent Status */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-secondary-500 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        Kooi Agent
                      </p>
                      <p className="text-xs text-brand-600 font-medium">
                        ● Live — Qualifying leads
                      </p>
                    </div>
                  </div>
                  <VoiceWaveform />
                </div>

                {/* Live Transcript Preview */}
                <div className="space-y-3 mb-6">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <div className="bg-brand-50 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%]">
                      <p className="text-sm text-text-primary">
                        Hi Sarah! I&apos;m calling about the Greenview
                        Residences. Do you have a couple of minutes?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-surface-subtle rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[80%]">
                      <p className="text-sm text-text-primary">
                        Yes, I&apos;ve been looking at 2 BHK options.
                        What&apos;s the starting price?
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-secondary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-secondary-600" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <div className="bg-brand-50 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[80%]">
                      <p className="text-sm text-text-primary">
                        Great choice! 2 BHK starts at ₹72 lakhs. Would you like
                        to schedule a site visit?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Extraction Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-surface-border/60">
                  <span className="px-3 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-full">
                    🔥 Hot Lead
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-brand-50 text-brand-700 rounded-full">
                    Site Visit Interest
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-secondary-50 text-secondary-700 rounded-full">
                    Budget: ₹72-85L
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-info-50 text-info-600 rounded-full">
                    Timeline: 3 months
                  </span>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-surface-border/60 px-4 py-3 animate-[float0_4s_ease-in-out_infinite]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-success-600" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Qualified Today</p>
                    <p className="text-sm font-bold text-text-primary">
                      47 leads
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-surface-border/60 px-4 py-3 animate-[float1_5s_ease-in-out_infinite]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-warning-600" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Avg Call Time</p>
                    <p className="text-sm font-bold text-text-primary">
                      2m 34s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </section>
  );

  // ─── SOCIAL PROOF ─────────────────────────────────────────────────
  const SocialProof = (
    <section className="relative py-16 bg-surface-muted border-y border-surface-border/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-text-muted mb-10 tracking-wide uppercase">
          Trusted by forward-thinking teams
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {[
            { value: 10, suffix: "K+", label: "Leads Qualified" },
            { value: 95, suffix: "%", label: "Accuracy Rate" },
            { value: 3, suffix: "x", label: "Faster Qualification" },
            { value: 500, suffix: "+", label: "Active Campaigns" },
          ].map((stat, i) => (
            <Stagger key={i} index={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-brand-600 to-secondary-600 bg-clip-text text-transparent">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-text-muted mt-1">{stat.label}</p>
            </Stagger>
          ))}
        </div>
      </div>
    </section>
  );

  // ─── FEATURES ─────────────────────────────────────────────────────
  const features = [
    {
      icon: PhoneCall,
      title: "AI Voice Calling",
      description:
        "Deploy natural-sounding AI agents that hold real conversations, ask qualifying questions, and adapt to customer responses in real-time.",
      gradient: "from-brand-500 to-brand-400",
    },
    {
      icon: Target,
      title: "Smart Lead Scoring",
      description:
        "Automatically score leads as Hot, Warm, or Cold based on budget, timeline, intent signals, and conversation analysis.",
      gradient: "from-secondary-500 to-secondary-400",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description:
        "Track campaign performance, disposition breakdowns, conversion rates, and agent efficiency from a single dashboard.",
      gradient: "from-info-500 to-info-400",
    },
    {
      icon: MessageSquare,
      title: "Smart Extraction",
      description:
        "AI extracts budget range, purchase timeline, preferred configuration, location preferences, and next steps from every call.",
      gradient: "from-warning-500 to-warning-400",
    },
    {
      icon: Shield,
      title: "Compliance Built-In",
      description:
        "Automatic Do-Not-Call detection, language preference tracking, and full call recording with transcript archiving.",
      gradient: "from-error-500 to-error-400",
    },
    {
      icon: Zap,
      title: "Instant Campaigns",
      description:
        "Upload a CSV, assign an AI agent, and launch. Kooi handles batched outbound calls with built-in concurrency management.",
      gradient: "from-brand-600 to-secondary-500",
    },
  ];

  const Features = (
    <Section id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <Stagger>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-6">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-semibold text-brand-700">
                Powerful Features
              </span>
            </div>
          </Stagger>
          <Stagger index={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-brand-600 to-secondary-500 bg-clip-text text-transparent">
                automate lead qualification
              </span>
            </h2>
          </Stagger>
          <Stagger index={2}>
            <p className="text-lg text-text-secondary leading-relaxed">
              From CSV upload to qualified pipeline — Kooi handles the entire
              outbound calling process while you focus on closing deals.
            </p>
          </Stagger>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <Stagger key={i} index={i}>
              <div className="group relative h-full bg-white rounded-2xl border border-surface-border/60 p-7 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-500 hover:-translate-y-1">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg shadow-brand-500/10 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-50/0 to-secondary-50/0 group-hover:from-brand-50/50 group-hover:to-secondary-50/30 transition-all duration-500 pointer-events-none" />
              </div>
            </Stagger>
          ))}
        </div>
      </div>
    </Section>
  );

  // ─── HOW IT WORKS (Product Showcase) ──────────────────────────────
  const steps = [
    {
      step: "01",
      icon: Users,
      title: "Upload Your Leads",
      description:
        "Import your lead list via CSV. Kooi auto-deduplicates, validates phone numbers, and prepares your campaign in seconds.",
      visual: "upload",
    },
    {
      step: "02",
      icon: Bot,
      title: "Configure Your AI Agent",
      description:
        "Choose a voice agent, customize the script with your property details, set campaign variables, and hit launch.",
      visual: "configure",
    },
    {
      step: "03",
      icon: PhoneCall,
      title: "AI Calls & Qualifies",
      description:
        "Your AI agent calls each lead, asks qualifying questions, handles objections naturally, and extracts key data points.",
      visual: "calling",
    },
    {
      step: "04",
      icon: BarChart3,
      title: "Review & Close",
      description:
        "Get instant lead scores, disposition reports, and next-action recommendations. Focus your team on the hottest leads.",
      visual: "review",
    },
  ];

  const HowItWorks = (
    <Section id="how-it-works" className="bg-surface-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <Stagger>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-50 border border-secondary-100 mb-6">
              <Activity className="w-4 h-4 text-secondary-600" />
              <span className="text-sm font-semibold text-secondary-700">
                How It Works
              </span>
            </div>
          </Stagger>
          <Stagger index={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
              From CSV to{" "}
              <span className="bg-gradient-to-r from-brand-600 to-secondary-500 bg-clip-text text-transparent">
                qualified pipeline
              </span>{" "}
              in minutes
            </h2>
          </Stagger>
          <Stagger index={2}>
            <p className="text-lg text-text-secondary leading-relaxed">
              Four simple steps to transform your lead qualification process
              forever.
            </p>
          </Stagger>
        </div>

        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
          {steps.map((step, i) => (
            <Stagger key={i} index={i}>
              <div className="relative group">
                {/* Connector Line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-300 to-transparent" />
                )}

                <div className="bg-white rounded-2xl border border-surface-border/60 p-6 hover:border-brand-200 hover:shadow-lg transition-all duration-500 h-full">
                  {/* Step Number */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-4xl font-black bg-gradient-to-br from-brand-400/20 to-secondary-400/20 bg-clip-text text-transparent">
                      {step.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-secondary-500 flex items-center justify-center shadow-md">
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Stagger>
          ))}
        </div>
      </div>
    </Section>
  );

  // ─── BENEFITS ─────────────────────────────────────────────────────
  const benefits = [
    {
      icon: Clock,
      title: "Save 40+ Hours/Week",
      description:
        "Eliminate manual cold calling. Your AI agent handles hundreds of calls daily while your team focuses on high-value activities.",
      stat: "40h+",
      statLabel: "saved weekly",
    },
    {
      icon: TrendingUp,
      title: "3x Higher Conversion",
      description:
        "AI-qualified leads convert 3x better because your sales team only talks to genuinely interested, pre-scored prospects.",
      stat: "3x",
      statLabel: "conversion lift",
    },
    {
      icon: Globe,
      title: "24/7 Lead Coverage",
      description:
        "Never miss a lead again. Kooi calls across time zones, handles high volumes, and works nights, weekends, and holidays.",
      stat: "24/7",
      statLabel: "availability",
    },
    {
      icon: Calendar,
      title: "Instant Follow-Up",
      description:
        "Leads are scored and routed in real-time. Hot leads get instant alerts so your team can follow up within minutes, not days.",
      stat: "<5m",
      statLabel: "response time",
    },
  ];

  const Benefits = (
    <Section id="benefits" dark>
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <Stagger>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
              <Zap className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-semibold text-brand-300">
                Why Kooi
              </span>
            </div>
          </Stagger>
          <Stagger index={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
              The ROI speaks{" "}
              <span className="bg-gradient-to-r from-brand-400 to-secondary-400 bg-clip-text text-transparent">
                for itself
              </span>
            </h2>
          </Stagger>
          <Stagger index={2}>
            <p className="text-lg text-slate-400 leading-relaxed">
              Small and mid-size businesses see measurable results from day one.
            </p>
          </Stagger>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {benefits.map((benefit, i) => (
            <Stagger key={i} index={i}>
              <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-7 hover:bg-white/10 hover:border-brand-400/30 transition-all duration-500">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-brand-500/30 group-hover:to-secondary-500/30 transition-all">
                    <benefit.icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{benefit.title}</h3>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold bg-gradient-to-r from-brand-400 to-secondary-400 bg-clip-text text-transparent">
                          {benefit.stat}
                        </span>
                        <p className="text-xs text-slate-500">
                          {benefit.statLabel}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            </Stagger>
          ))}
        </div>
      </div>
    </Section>
  );

  // ─── TESTIMONIALS ─────────────────────────────────────────────────
  const testimonials = [
    {
      quote:
        "Kooi replaced 3 SDRs and actually improved our qualification rate. The AI catches buying signals our team used to miss.",
      name: "Priya Sharma",
      role: "Head of Sales",
      company: "Meridian Properties",
      rating: 5,
    },
    {
      quote:
        "We went from 200 manual calls a week to 2,000 AI-qualified conversations. The ROI was obvious within the first month.",
      name: "Rahul Mehta",
      role: "Founder",
      company: "UrbanNest Realty",
      rating: 5,
    },
    {
      quote:
        "The lead scoring is incredibly accurate. Hot leads from Kooi close at nearly 3x the rate of our manually qualified pipeline.",
      name: "Anita Desai",
      role: "VP Marketing",
      company: "Skyline Developers",
      rating: 5,
    },
  ];

  const Testimonials = (
    <Section id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <Stagger>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-50 border border-warning-100 mb-6">
              <Star className="w-4 h-4 text-warning-600" />
              <span className="text-sm font-semibold text-warning-700">
                Customer Stories
              </span>
            </div>
          </Stagger>
          <Stagger index={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
              Loved by{" "}
              <span className="bg-gradient-to-r from-brand-600 to-secondary-500 bg-clip-text text-transparent">
                sales teams
              </span>{" "}
              everywhere
            </h2>
          </Stagger>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <Stagger key={i} index={i}>
              <div className="group relative bg-white rounded-2xl border border-surface-border/60 p-7 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-500 h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-warning-500 fill-warning-500"
                    />
                  ))}
                </div>

                <blockquote className="text-base text-text-secondary leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3 pt-5 border-t border-surface-border/60">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-secondary-400 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {t.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {t.role}, {t.company}
                    </p>
                  </div>
                </div>
              </div>
            </Stagger>
          ))}
        </div>
      </div>
    </Section>
  );

  // ─── PRICING ──────────────────────────────────────────────────────
  const plans = [
    {
      name: "Starter",
      description: "For small teams getting started with AI qualification.",
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        "500 AI calls/month",
        "1 AI voice agent",
        "CSV lead upload",
        "Basic analytics dashboard",
        "Email support",
        "Call recordings & transcripts",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Growth",
      description: "For growing teams that need scale and deeper insights.",
      monthlyPrice: 249,
      annualPrice: 199,
      features: [
        "2,500 AI calls/month",
        "3 AI voice agents",
        "Advanced lead scoring",
        "Campaign analytics & reports",
        "Priority support",
        "Custom agent scripts",
        "Brochure AI extraction",
        "Team management",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For large teams with custom needs and high volume.",
      monthlyPrice: null,
      annualPrice: null,
      features: [
        "Unlimited AI calls",
        "Unlimited AI agents",
        "Custom integrations",
        "Dedicated account manager",
        "SLA & uptime guarantee",
        "Custom AI training",
        "White-label options",
        "On-premise deployment",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const Pricing = (
    <Section id="pricing" className="bg-surface-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <Stagger>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-6">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-semibold text-brand-700">
                Simple Pricing
              </span>
            </div>
          </Stagger>
          <Stagger index={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
              Plans that{" "}
              <span className="bg-gradient-to-r from-brand-600 to-secondary-500 bg-clip-text text-transparent">
                scale with you
              </span>
            </h2>
          </Stagger>
          <Stagger index={2}>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              Start free. Upgrade when you&apos;re ready. No hidden fees.
            </p>
          </Stagger>

          {/* Billing Toggle */}
          <Stagger index={3}>
            <div className="inline-flex items-center gap-3 bg-white rounded-full p-1.5 border border-surface-border shadow-sm">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  billingPeriod === "monthly"
                    ? "bg-brand-500 text-white shadow-md"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  billingPeriod === "annual"
                    ? "bg-brand-500 text-white shadow-md"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Annual
                <span className="ml-1.5 text-xs font-bold text-brand-400">
                  -20%
                </span>
              </button>
            </div>
          </Stagger>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, i) => (
            <Stagger key={i} index={i}>
              <div
                className={`
                  relative bg-white rounded-2xl border p-7 transition-all duration-500 h-full flex flex-col
                  ${
                    plan.popular
                      ? "border-brand-300 shadow-xl shadow-brand-500/10 scale-[1.02] lg:scale-105"
                      : "border-surface-border/60 hover:border-brand-200 hover:shadow-lg"
                  }
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-full shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-text-primary mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-text-muted">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.monthlyPrice !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-text-primary">
                        $
                        {billingPeriod === "annual"
                          ? plan.annualPrice
                          : plan.monthlyPrice}
                      </span>
                      <span className="text-text-muted">/month</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-extrabold text-text-primary">
                      Custom
                    </div>
                  )}
                  {billingPeriod === "annual" && plan.monthlyPrice !== null && (
                    <p className="text-xs text-brand-600 font-medium mt-1">
                      Billed annually · Save $
                      {(plan.monthlyPrice - (plan.annualPrice ?? 0)) * 12}/yr
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-text-secondary">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.name === "Enterprise" ? "#contact" : "/register"}
                  className={`
                    block w-full text-center px-6 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300
                    ${
                      plan.popular
                        ? "text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:-translate-y-0.5"
                        : "text-brand-600 border border-brand-200 hover:bg-brand-50 hover:border-brand-300"
                    }
                  `}
                >
                  {plan.cta}
                </a>
              </div>
            </Stagger>
          ))}
        </div>
      </div>
    </Section>
  );

  // ─── FAQ ──────────────────────────────────────────────────────────
  const faqs = [
    {
      q: "How natural do the AI voice agents sound?",
      a: "Our AI agents use advanced voice synthesis that sounds remarkably human. They handle natural conversation flow, understand context, manage interruptions, and adapt their tone based on the conversation. Most leads don't realize they're speaking with AI.",
    },
    {
      q: "How long does it take to set up a campaign?",
      a: "You can launch your first campaign in under 5 minutes. Upload a CSV of leads, select or customize an AI agent, configure your property details, and hit start. Kooi handles everything else—batching, calling, qualifying, and reporting.",
    },
    {
      q: "What data does Kooi extract from each call?",
      a: "Kooi extracts 13+ data points from every conversation including disposition, lead temperature (Hot/Warm/Cold), budget range, purchase timeline, preferred configuration, location preferences, purchase purpose, next action, contact channel preference, and compliance flags like Do-Not-Call.",
    },
    {
      q: "Can I customize the AI agent's script and behavior?",
      a: "Absolutely. You can customize the agent's name, personality, property details, qualifying questions, and conversation flow. Our template system lets you inject campaign-specific variables so each campaign feels personalized.",
    },
    {
      q: "How does lead deduplication work?",
      a: "Kooi automatically detects duplicate phone numbers within each campaign during CSV upload. Duplicates are flagged and skipped, and you get a detailed report showing exactly which numbers were deduplicated.",
    },
    {
      q: "Is my data secure?",
      a: "Yes. Kooi uses multi-tenant architecture with strict data isolation—no tenant can ever access another's data. All API calls are authenticated via JWT, and we encrypt data in transit and at rest. Call recordings are stored securely with access controls.",
    },
    {
      q: "Do you offer a free trial?",
      a: "Yes! Every plan comes with a 14-day free trial with full access to all features. No credit card required to start. You can launch campaigns, test AI agents, and see real qualification results before committing.",
    },
  ];

  const FAQ = (
    <Section id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <Stagger>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-50 border border-secondary-100 mb-6">
              <MessageSquare className="w-4 h-4 text-secondary-600" />
              <span className="text-sm font-semibold text-secondary-700">
                FAQ
              </span>
            </div>
          </Stagger>
          <Stagger index={1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5">
              Got{" "}
              <span className="bg-gradient-to-r from-brand-600 to-secondary-500 bg-clip-text text-transparent">
                questions?
              </span>
            </h2>
          </Stagger>
          <Stagger index={2}>
            <p className="text-lg text-text-secondary">
              Everything you need to know about Kooi.
            </p>
          </Stagger>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Stagger key={i} index={i}>
              <div
                className={`
                  rounded-2xl border transition-all duration-300 overflow-hidden
                  ${
                    activeFaq === i
                      ? "border-brand-200 bg-brand-50/30 shadow-sm"
                      : "border-surface-border/60 bg-white hover:border-brand-200"
                  }
                `}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  aria-expanded={activeFaq === i}
                >
                  <span className="text-base font-semibold text-text-primary pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-300 ${
                      activeFaq === i ? "rotate-180 text-brand-600" : ""
                    }`}
                  />
                </button>
                <div
                  className={`
                    transition-all duration-300 ease-in-out
                    ${activeFaq === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                  `}
                >
                  <p className="px-6 pb-5 text-sm text-text-secondary leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </Stagger>
          ))}
        </div>
      </div>
    </Section>
  );

  // ─── FINAL CTA ────────────────────────────────────────────────────
  const FinalCTA = (
    <Section id="cta" className="bg-surface-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-secondary-500 p-10 sm:p-14 lg:p-20 text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative">
            <Stagger>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-8">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  Start Today — It&apos;s Free
                </span>
              </div>
            </Stagger>

            <Stagger index={1}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight mb-6">
                Ready to automate your
                <br className="hidden sm:block" /> lead qualification?
              </h2>
            </Stagger>

            <Stagger index={2}>
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
                Join hundreds of SMBs using Kooi to qualify leads faster, close
                deals sooner, and grow revenue with AI-powered voice agents.
              </p>
            </Stagger>

            <Stagger index={3}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/register"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-brand-700 bg-white rounded-2xl hover:bg-brand-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Start Your Free Trial
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="#contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-2xl border-2 border-white/30 hover:bg-white/10 transition-all duration-300"
                >
                  Talk to Sales
                </a>
              </div>
            </Stagger>

            <Stagger index={4}>
              <div className="flex items-center justify-center gap-6 mt-10 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  14-day free trial
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  No credit card
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Cancel anytime
                </span>
              </div>
            </Stagger>
          </div>
        </div>
      </div>
    </Section>
  );

  // ─── FOOTER ───────────────────────────────────────────────────────
  const Footer = (
    <footer className="bg-[#0a1628] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-secondary-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Kooi</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              AI-powered voice agents that qualify your leads 24/7. Built for
              SMBs who want enterprise-grade lead qualification without the
              enterprise price tag.
            </p>
            <div className="flex gap-3">
              {["X", "Li", "Gh"].map((label, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white transition-all duration-300"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {[
                "Features",
                "Pricing",
                "Integrations",
                "Changelog",
                "API Docs",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {["About", "Blog", "Careers", "Press", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {["Privacy", "Terms", "Security", "GDPR", "SLA"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Kooi. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            Made with{" "}
            <span className="text-brand-400" aria-label="love">
              ♥
            </span>{" "}
            for modern sales teams
          </p>
        </div>
      </div>
    </footer>
  );

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {Navbar}
      {Hero}
      {SocialProof}
      {Features}
      {HowItWorks}
      {Benefits}
      {Testimonials}
      {Pricing}
      {FAQ}
      {FinalCTA}
      {Footer}
    </main>
  );
}
