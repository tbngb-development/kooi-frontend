import { RegisterForm } from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Free Trial · Kooi",
  description:
    "Provision your workspace environment and start qualifying outbound leads with autonomous voice agents in minutes. No credit card required.",
  openGraph: {
    title: "Start Free Trial · Kooi",
    description:
      "Create your free Kooi account today and deploy your first AI voice campaign.",
    type: "website",
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
