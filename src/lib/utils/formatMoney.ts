/**
 * Money formatting utilities.
 * All internal monetary values are stored as integer paisa (1 ₹ = 100 paisa).
 *
 * NOTE: Consolidate with `paisaToInr` from `@/constants/config/wallet.config`
 * in a follow-up cleanup.
 */

/** Convert integer paisa → rupees (float) */
export function paisaToRupees(paisa: number): number {
  return paisa / 100;
}

/** Convert rupees (float) → integer paisa */
export function rupeesToPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Format integer paisa as a display string: "₹19,999.00" */
export function formatPaisa(paisa: number): string {
  return `₹${paisaToRupees(paisa).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Alias kept for drop-in migration from wallet.config's paisaToInr */
export const paisaToInr = formatPaisa;