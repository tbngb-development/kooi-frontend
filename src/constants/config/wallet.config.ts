export const RECHARGE_SLABS_PAISA = [
  100_000, 500_000, 1_000_000, 2_500_000, 10_000_000,
] as const;

export const RAZORPAY_CHECKOUT_JS =
  "https://checkout.razorpay.com/v1/checkout.js";

export const RAZORPAY_THEME_COLOR = "#15803d";

export function paisaToInr(paisa: number): string {
  return `₹${(paisa / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function paisaToInrShort(paisa: number): string {
  const rupees = paisa / 100;
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(1)}L`;
  if (rupees >= 1_000) return `₹${(rupees / 1_000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
}
