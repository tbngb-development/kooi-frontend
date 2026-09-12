"use client";

import { CreditCard } from "lucide-react";
import BillingTab from "@/components/settings/BillingTab"; // Sourced from your existing file

export default function PlansAndBillingPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
          Plans & Billing
        </h1>
        <p className="text-sm font-medium text-text-muted mt-1">
          Manage your active subscription, wallet usage, and transaction
          history.
        </p>
      </div>

      {/* Embedded Billing Content */}
      <div className="bg-surface border border-surface-border rounded-xl shadow-sm p-6">
        <BillingTab />
      </div>
    </div>
  );
}
