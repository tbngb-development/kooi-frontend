import Link from "next/link";
import GoBackButton from "@/components/ui/GoBackButton";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-muted">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-brand-400/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-brand-300/8 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full border-2 border-dashed border-surface-border flex items-center justify-center animate-[spin_25s_linear_infinite]">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-400" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-300" />
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-200" />
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-100" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-surface-border shadow-sm flex items-center justify-center rotate-12 transition-transform duration-500 hover:rotate-0">
              <svg
                className="w-7 h-7 text-brand-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 404 */}
        <span className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-text-primary/15 to-text-primary/5 select-none leading-none mb-4">
          404
        </span>

        <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 tracking-tight">
          Page Not Found
        </h1>

        <p className="text-base sm:text-base text-text-muted leading-relaxed mb-8 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href={"/dashboard"}
            className="
              inline-flex items-center justify-center gap-2
              w-full sm:w-auto
              px-5 py-2.5
              text-base font-medium
              text-white bg-brand-500
              rounded-lg shadow-xs
              hover:bg-brand-600
              transition-all duration-200
              group
            "
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Dashboard
          </Link>

          <GoBackButton className="w-full sm:w-auto" />
        </div>

        <p className="mt-10 text-sm text-text-placeholder">
          Need help?{" "}
          <a
            href="mailto:support@leadqualify.ai"
            className="text-brand-500 hover:text-brand-600 font-medium transition-colors duration-150"
          >
            Contact Support
          </a>
        </p>
      </div>

      {/* Branding */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-text-placeholder tracking-wide">
          LeadQualify AI
        </span>
      </div>
    </div>
  );
}
