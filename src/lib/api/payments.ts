import apiClient from "@/lib/axios";
import { PAYMENT_ENDPOINTS } from "@/constants/api-routes/payment-endpoint";
import type { ApiResponse } from "@/types/api";
import type {
  CreateOrderInput,
  CreateOrderResponse,
  VerifyPaymentInput,
  VerifyPaymentResponse,
  OrderStatusResponse,
} from "@/types/payment";

export const paymentsApi = {
  createOrder: async (
    input: CreateOrderInput,
  ): Promise<CreateOrderResponse> => {
    const res = await apiClient.post<ApiResponse<CreateOrderResponse>>(
      PAYMENT_ENDPOINTS.CREATE_ORDER,
      input,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to create order");
    }
    return res.data.data;
  },

  verify: async (input: VerifyPaymentInput): Promise<VerifyPaymentResponse> => {
    const res = await apiClient.post<ApiResponse<VerifyPaymentResponse>>(
      PAYMENT_ENDPOINTS.VERIFY,
      input,
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Payment verification failed");
    }
    return res.data.data;
  },

  getOrderStatus: async (orderId: string): Promise<OrderStatusResponse> => {
    const res = await apiClient.get<ApiResponse<OrderStatusResponse>>(
      PAYMENT_ENDPOINTS.ORDER_STATUS(orderId),
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Failed to fetch order status");
    }
    return res.data.data;
  },
};
