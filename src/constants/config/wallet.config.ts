export { API_PREFIX, API_PREFIXES } from "./api-prefix";

export const RECHARGE_SLABS_PAISA = [
  500_00,  100_000, 500_000, 1_000_000, 2_500_000, 5_000_000,
] as const; 

export const RAZORPAY_CHECKOUT_JS =
  "https://checkout.razorpay.com/v1/checkout.js";

export const RAZORPAY_THEME_COLOR = "#15803d";

// Re-export from canonical location — existing imports keep working.
export { formatPaisa as paisaToInr } from "@/lib/utils/formatMoney";

/** Short format: ₹1.5L, ₹50K, ₹999 */
export function paisaToInrShort(paisa: number): string {
  const rupees = paisa / 100;
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(1)}L`;
  if (rupees >= 1_000) return `₹${(rupees / 1_000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
}
