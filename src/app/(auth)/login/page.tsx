import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In · Kooi",
  description:
    "Sign in to your Kooi workspace to launch campaigns, monitor live voice agents, and review pre-scored hot leads.",
  openGraph: {
    title: "Sign In · Kooi",
    description:
      "Access your Kooi workspace to manage your automated outbound campaign pipelines.",
    type: "website",
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
