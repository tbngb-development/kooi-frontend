import { API_PREFIXES } from "@/constants/config/api-prefix";

export const PAYMENT_ENDPOINTS = {
  CREATE_ORDER: `${API_PREFIXES.TENANT}/payments/create-order`,
  VERIFY: `${API_PREFIXES.TENANT}/payments/verify`,
  ORDER_STATUS: (orderId: string) =>
    `${API_PREFIXES.TENANT}/payments/order-status/${orderId}`,
} as const;
