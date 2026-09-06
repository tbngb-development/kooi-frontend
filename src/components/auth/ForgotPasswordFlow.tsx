"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useForgotPassword,
  useVerifyOtp,
  useResetPassword,
} from "@/hooks/useAuth";
import { EmailStep, EmailStepFormValues } from "./forgot-password/EmailStep";
import { OtpStep } from "./forgot-password/OtpStep";
import {
  NewPasswordStep,
  NewPasswordFormValues,
} from "./forgot-password/NewPasswordStep";
import { SuccessStep } from "./forgot-password/SuccessStep";

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const STORAGE_KEY = "forgot_password_state";
const MAX_OTP_ATTEMPTS = 3;

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "email" | "otp" | "new-password" | "success";

interface PersistedState {
  step: "email" | "otp";
  email: string;
  otpRequestedAt: number;
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────

function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.email || !parsed.otpRequestedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail — localStorage might be full or blocked
  }
}

function clearPersistedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ForgotPasswordFlow() {
  // ── State ────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(MAX_OTP_ATTEMPTS);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Timers (seconds remaining)
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Mutations ────────────────────────────────────────────────────────────
  const forgotPasswordMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyOtp();
  const resetPasswordMutation = useResetPassword();

  const isPending =
    forgotPasswordMutation.isPending ||
    verifyOtpMutation.isPending ||
    resetPasswordMutation.isPending;

  // ── Timer Logic ──────────────────────────────────────────────────────────
  const startTimers = useCallback((requestedAt: number) => {
    const tick = () => {
      const now = Date.now();
      const otpRemaining = Math.max(
        0,
        Math.ceil((requestedAt + OTP_TTL_MS - now) / 1000),
      );
      const resendRemaining = Math.max(
        0,
        Math.ceil((requestedAt + RESEND_COOLDOWN_MS - now) / 1000),
      );

      setOtpExpiry(otpRemaining);
      setResendCooldown(resendRemaining);

      if (otpRemaining <= 0 && resendRemaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    tick(); // Run immediately
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 1000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Restore from localStorage on mount ───────────────────────────────────
  useEffect(() => {
    const persisted = loadPersistedState();
    if (!persisted) return;

    const now = Date.now();
    const otpExpired = now >= persisted.otpRequestedAt + OTP_TTL_MS;

    if (persisted.step === "otp" && !otpExpired) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(persisted.email);
      setStep("otp");
      startTimers(persisted.otpRequestedAt);
    } else if (otpExpired) {
      clearPersistedState();
      setGlobalError(
        "Your verification code expired. Please request a new one.",
      );
    } else if (persisted.step === "email") {
      setEmail(persisted.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSendOtp = useCallback(
    (values: EmailStepFormValues) => {
      setGlobalError(null);
      forgotPasswordMutation.mutate(
        { email: values.email },
        {
          onSuccess: () => {
            setEmail(values.email);
            setStep("otp");
            setOtpAttemptsLeft(MAX_OTP_ATTEMPTS);

            const now = Date.now();
            startTimers(now);
            savePersistedState({
              step: "otp",
              email: values.email,
              otpRequestedAt: now,
            });
          },
        },
      );
    },
    [forgotPasswordMutation, startTimers],
  );

  const handleResendOtp = useCallback(() => {
    if (resendCooldown > 0 || !email) return;
    setGlobalError(null);

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setOtpAttemptsLeft(MAX_OTP_ATTEMPTS);
          const now = Date.now();
          startTimers(now);
          savePersistedState({
            step: "otp",
            email,
            otpRequestedAt: now,
          });
        },
      },
    );
  }, [email, forgotPasswordMutation, resendCooldown, startTimers]);

  const handleVerifyOtp = useCallback(
    (otp: string) => {
      if (otp.length !== 6 || isPending) return;
      setGlobalError(null);

      verifyOtpMutation.mutate(
        { email, otp },
        {
          onSuccess: (data) => {
            setResetToken(data.resetToken);
            setStep("new-password");
            clearPersistedState(); // Token is in memory only
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          },
          onError: (error: Error) => {
            const msg = error.message.toLowerCase();
            if (msg.includes("maximum") || msg.includes("attempts")) {
              setGlobalError(
                "Too many failed attempts. Please request a new code.",
              );
              clearPersistedState();
              setStep("email");
            } else {
              const remaining = otpAttemptsLeft - 1;
              setOtpAttemptsLeft(remaining);
              if (remaining <= 0) {
                setGlobalError(
                  "Too many failed attempts. Please request a new code.",
                );
                clearPersistedState();
                setStep("email");
              }
            }
          },
        },
      );
    },
    [email, isPending, otpAttemptsLeft, verifyOtpMutation],
  );

  const handleResetPassword = useCallback(
    (values: NewPasswordFormValues) => {
      if (!resetToken) return;
      setGlobalError(null);

      resetPasswordMutation.mutate(
        { resetToken, newPassword: values.newPassword },
        {
          onSuccess: () => {
            setResetToken(null);
            setStep("success");
            clearPersistedState();
          },
          onError: (error: Error) => {
            const msg = error.message.toLowerCase();
            if (msg.includes("expired") || msg.includes("invalid")) {
              setGlobalError("Your session expired. Please start over.");
              setResetToken(null);
              setStep("email");
            }
            // "same password" error is shown via toast by the hook
          },
        },
      );
    },
    [resetPasswordMutation, resetToken],
  );

  const goBackToEmail = useCallback(() => {
    setGlobalError(null);
    setResetToken(null);
    setOtpAttemptsLeft(MAX_OTP_ATTEMPTS);
    clearPersistedState();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setStep("email");
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-surface border border-surface-border rounded-xl shadow-md p-6 sm:p-8 transition-all">
      {step === "email" && (
        <EmailStep
          defaultEmail={email}
          isPending={isPending}
          globalError={globalError}
          onSubmit={handleSendOtp}
        />
      )}

      {step === "otp" && (
        <OtpStep
          email={email}
          isPending={isPending}
          globalError={globalError}
          otpExpiry={otpExpiry}
          resendCooldown={resendCooldown}
          otpAttemptsLeft={otpAttemptsLeft}
          hasVerifyError={verifyOtpMutation.isError}
          onBack={goBackToEmail}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
        />
      )}

      {step === "new-password" && (
        <NewPasswordStep
          isPending={isPending}
          globalError={globalError}
          onBack={goBackToEmail}
          onSubmit={handleResetPassword}
        />
      )}

      {step === "success" && <SuccessStep />}
    </div>
  );
}
