"use client";

import { useCallback, useState } from "react";
import { ArrowLeft, RefreshCw, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";

const MAX_OTP_ATTEMPTS = 3;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface OtpStepProps {
  email: string;
  isPending: boolean;
  globalError: string | null;
  otpExpiry: number; // seconds remaining
  resendCooldown: number; // seconds remaining
  otpAttemptsLeft: number;
  hasVerifyError: boolean;
  onBack: () => void;
  onVerify: (otp: string) => void;
  onResend: () => void;
}

export function OtpStep({
  email,
  isPending,
  globalError,
  otpExpiry,
  resendCooldown,
  otpAttemptsLeft,
  hasVerifyError,
  onBack,
  onVerify,
  onResend,
}: OtpStepProps) {
  const [otpValue, setOtpValue] = useState("");
  const isOtpExpired = otpExpiry <= 0;

  const handleOtpChange = useCallback(
    (value: string) => {
      setOtpValue(value);
      // Auto-submit when all 6 digits entered
      if (value.length === 6 && !isPending && !isOtpExpired) {
        setTimeout(() => onVerify(value), 150);
      }
    },
    [isPending, isOtpExpired, onVerify],
  );

  return (
    <>
      <button
        onClick={onBack}
        disabled={isPending}
        className="group flex items-center gap-2 text-base font-medium text-text-muted hover:text-text-primary transition-colors mb-6 disabled:opacity-50 cursor-pointer"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        <span>Back</span>
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Verify your identity
        </h2>
        <p className="text-base text-text-muted mt-1.5">
          We&apos;ve sent a 6-digit code to{" "}
          <span className="font-semibold text-text-primary">{email}</span>
        </p>
      </div>

      {globalError && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-base text-error-700">
          {globalError}
        </div>
      )}

      {isOtpExpired ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-base text-warning-700 text-center">
            Your verification code has expired. Please request a new one.
          </div>
          <Button
            variant="outline"
            onClick={onBack}
            className="font-semibold text-base"
          >
            Request new code
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <OtpInput
            value={otpValue}
            onChange={handleOtpChange}
            disabled={isPending}
            error={
              hasVerifyError && !globalError
                ? "Invalid code. Please try again."
                : undefined
            }
          />

          {/* Countdown + Resend */}
          <div className="flex flex-col items-center gap-2 text-base">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Timer size={14} />
              <span>Code expires in {formatTime(otpExpiry)}</span>
            </div>

            {resendCooldown > 0 ? (
              <span className="text-text-muted">
                Resend code in{" "}
                <span className="font-semibold text-text-secondary">
                  {formatTime(resendCooldown)}
                </span>
              </span>
            ) : (
              <button
                onClick={onResend}
                disabled={isPending}
                className="flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={14} />
                Resend code
              </button>
            )}

            {otpAttemptsLeft < MAX_OTP_ATTEMPTS && (
              <span className="text-sm text-text-muted">
                {otpAttemptsLeft} attempt{otpAttemptsLeft !== 1 ? "s" : ""}{" "}
                remaining
              </span>
            )}
          </div>

          <Button
            onClick={() => onVerify(otpValue)}
            loading={isPending}
            disabled={otpValue.length !== 6}
            className="w-full h-11 font-semibold text-base transition-all shadow-sm active:scale-[0.98]"
          >
            Verify code
          </Button>
        </div>
      )}
    </>
  );
}
