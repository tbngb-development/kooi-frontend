import type { Metadata } from "next";
import { ForgotPasswordFlow } from "@/components/auth/ForgotPasswordFlow";

export const metadata: Metadata = {
  title: "Reset Password — Kooi",
  description: "Reset your Kooi account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <ForgotPasswordFlow />
      </div>
    </div>
  );
}
