import type { Metadata } from "next";
import { AdminForgotPasswordFlow } from "@/components/admin/AdminForgotPasswordFlow";

export const metadata: Metadata = {
  title: "Super Admin Passphrase Reset",
  description: "Reset platform security credentials.",
};

export default function AdminForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-12">
      <div className="w-full max-w-md">
        <AdminForgotPasswordFlow />
      </div>
    </div>
  );
}
