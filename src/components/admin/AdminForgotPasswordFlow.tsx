"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAdminForgotPassword,
  useAdminVerifyOtp,
  useAdminResetPassword,
} from "@/hooks/admin/useAdminAuth";
import {
  EmailStep,
  EmailStepFormValues,
} from "@/components/auth/forgot-password/EmailStep";
import { OtpStep } from "@/components/auth/forgot-password/OtpStep";
import {
  NewPasswordStep,
  NewPasswordFormValues,
} from "@/components/auth/forgot-password/NewPasswordStep";
import { SuccessStep } from "@/components/auth/forgot-password/SuccessStep";
import { ADMIN_ROUTES } from "@/constants/routes/admin.routes";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const STORAGE_KEY = "admin_forgot_password_state"; // Separate storage namespace
const MAX_OTP_ATTEMPTS = 3;

type Step = "email" | "otp" | "new-password" | "success";

interface PersistedState {
  step: "email" | "otp";
  email: string;
  otpRequestedAt: number;
}

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
  } catch {}
}

function clearPersistedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function AdminForgotPasswordFlow() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(MAX_OTP_ATTEMPTS);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [otpExpiry, setOtpExpiry] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const forgotPasswordMutation = useAdminForgotPassword();
  const verifyOtpMutation = useAdminVerifyOtp();
  const resetPasswordMutation = useAdminResetPassword();

  const isPending =
    forgotPasswordMutation.isPending ||
    verifyOtpMutation.isPending ||
    resetPasswordMutation.isPending;

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

    tick();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
        "Platform verification code expired. Request a new validation token.",
      );
    } else if (persisted.step === "email") {
      setEmail(persisted.email);
    }
  }, [startTimers]);

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
            clearPersistedState();
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          },
          onError: (error: Error) => {
            const msg = error.message.toLowerCase();
            if (msg.includes("maximum") || msg.includes("attempts")) {
              setGlobalError(
                "Exceeded authorized verification limits. Request a new token.",
              );
              clearPersistedState();
              setStep("email");
            } else {
              const remaining = otpAttemptsLeft - 1;
              setOtpAttemptsLeft(remaining);
              if (remaining <= 0) {
                setGlobalError(
                  "Exceeded authorized verification limits. Request a new token.",
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
              setGlobalError(
                "Authorized reset session expired. Restart sequence.",
              );
              setResetToken(null);
              setStep("email");
            }
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

  return (
    <div className="bg-surface border border-surface-border rounded-xl shadow-md p-6 sm:p-8 transition-all">
      {step === "email" && (
        <EmailStep
          defaultEmail={email}
          isPending={isPending}
          globalError={globalError}
          onSubmit={handleSendOtp}
          backToLoginUrl={ADMIN_ROUTES.LOGIN}
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

      {step === "success" && <SuccessStep loginUrl={ADMIN_ROUTES.LOGIN} />}
    </div>
  );
}
