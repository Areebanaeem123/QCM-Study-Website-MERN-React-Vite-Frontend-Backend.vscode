import { ApiClient } from "./api-client"

export interface CreatePaymentIntentRequest {
  items: Array<{
    id: string
    type: string
    title: string
    price: number
    currency: string
  }>
  payment_method: string
  accept_terms: boolean
  voucher_code?: string
}

export interface CreatePaymentIntentResponse {
  client_secret: string
  payment_intent_id: string
  transaction_id: string
  original_amount: number
  discount_amount: number
  final_amount: number
  status: string
}

export interface ConfirmPaymentRequest {
  payment_intent_id: string
  transaction_id: string
}

export interface ConfirmPaymentResponse {
  message: string
  transaction_id: string
  status: string
  purchased_items: string[]
}

export class PaymentService {
  /**
   * Create a Stripe PaymentIntent for checkout
   */
  static async createPaymentIntent(
    data: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> {
    try {
      return await ApiClient.post<CreatePaymentIntentResponse>(
        "/basket/create-payment-intent",
        data
      )
    } catch (error: any) {
      console.error("Failed to create payment intent:", error)
      throw new Error(error?.message || "Failed to create payment")
    }
  }

  /**
   * Confirm payment after Stripe PaymentIntent is confirmed
   */
  static async confirmPayment(
    data: ConfirmPaymentRequest
  ): Promise<ConfirmPaymentResponse> {
    try {
      return await ApiClient.post<ConfirmPaymentResponse>(
        "/basket/confirm-payment",
        data
      )
    } catch (error: any) {
      console.error("Failed to confirm payment:", error)
      throw new Error(error?.message || "Failed to confirm payment")
    }
  }

  /**
   * Validate a voucher code
   */
  static async validateVoucher(
    code: string,
    total_amount: number,
    items: Array<any>
  ): Promise<any> {
    try {
      return await ApiClient.post("/vouchers/validate", {
        code,
        total_amount,
        items
      })
    } catch (error: any) {
      console.error("Failed to validate voucher:", error)
      throw new Error(error?.message || "Failed to validate voucher")
    }
  }
}
