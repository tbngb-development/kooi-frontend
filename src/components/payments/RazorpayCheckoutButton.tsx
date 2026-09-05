"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentsApi } from "@/lib/api/payments";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { QUERY_KEYS } from "@/constants/config/query-keys";
import {
  RAZORPAY_CHECKOUT_JS,
  RAZORPAY_THEME_COLOR,
} from "@/constants/config/wallet.config";
import type { RechargePurpose } from "@/types/payment";
import type {
  RazorpayOptions,
  RazorpayInstance,
} from "@/types/razorpay-checkout";

interface RazorpayCheckoutButtonProps {
  purpose: RechargePurpose;
  amountPaisa?: number;
  label: string;
  onSuccess?: () => void;
  className?: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${RAZORPAY_CHECKOUT_JS}"]`)) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_JS;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayCheckoutButton({
  purpose,
  amountPaisa,
  label,
  onSuccess,
  className,
}: RazorpayCheckoutButtonProps) {
  const [isProcessing, setIsSubmitting] = useState(false);
  const { user, memberships, activeTenantId } = useAuthStore();
  const qc = useQueryClient();

  const activeMembership = memberships.find(
    (m) => m.tenantId === activeTenantId,
  );

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error(
          "Failed to initialize billing secure frame. Check your network.",
        );
        return;
      }

      // Generate the secure Razorpay Order from Kooi servers
      const order = await paymentsApi.createOrder({
        purpose,
        amountPaisa: purpose === "WALLET_TOPUP" ? amountPaisa : undefined,
      });

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: activeMembership?.tenantName ?? "Kooi Platform",
        description:
          purpose === "ONBOARDING"
            ? "Workspace Activation Onboarding Fee"
            : "Platform Wallet Automated Recharge Topup",
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: RAZORPAY_THEME_COLOR,
        },
        modal: {
          ondismiss: () => toast.info("Payment cancelled"),
        },
        handler: async (response) => {
          setIsSubmitting(true);
          try {
            await paymentsApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Recharge payment verified successfully!");

            // Invalidate wallet and user workspace parameters to trigger active updates
            qc.invalidateQueries({ queryKey: QUERY_KEYS.WALLET.all });
            qc.invalidateQueries({ queryKey: QUERY_KEYS.WORKSPACE.current });

            onSuccess?.();
          } catch (err: unknown) {
            toast.error(
              "Payment confirmation failed. System is investigating order.",
            );
          } finally {
            setIsSubmitting(false);
          }
        },
      };

      const rzpInstance: RazorpayInstance = new window.Razorpay(options);

      rzpInstance.on("payment.failed", (response) => {
        toast.error(`Transaction failed: ${response.error.description}`);
      });

      rzpInstance.open();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to establish transactional order session.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      loading={isProcessing}
      className={className}
    >
      {label}
    </Button>
  );
}
