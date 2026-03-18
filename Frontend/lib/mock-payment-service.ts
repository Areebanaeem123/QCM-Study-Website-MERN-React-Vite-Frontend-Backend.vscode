/**
 * MOCK Payment Service for Pakistan (Stripe not available)
 * This simulates the payment API calls for testing purposes
 */

export class MockPaymentService {
  static async createPaymentIntent(payload: {
    items: any[]
    payment_method: string
    accept_terms: boolean
    voucher_code?: string
  }): Promise<{
    payment_intent_id: string
    transaction_id: string
    status: string
    amount: number
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // MOCK: Generate fake IDs
    const paymentIntentId = `pi_mock_${Math.random().toString(36).substr(2, 9)}`
    const transactionId = `txn_mock_${Math.random().toString(36).substr(2, 9)}`

    // Calculate total
    let total = 0
    payload.items.forEach(item => {
      total += item.price
    })

    console.log("✓ [MOCK] Payment Intent Created")
    console.log(`  Payment Intent ID: ${paymentIntentId}`)
    console.log(`  Transaction ID: ${transactionId}`)
    console.log(`  Amount: ${total} DT`)
    if (payload.voucher_code) {
      console.log(`  Voucher: ${payload.voucher_code}`)
    }

    return {
      payment_intent_id: paymentIntentId,
      transaction_id: transactionId,
      status: "requires_payment_method",
      amount: total
    }
  }

  static async confirmPayment(payload: {
    payment_intent_id: string
    transaction_id: string
  }): Promise<{
    status: string
    message: string
    payment_method_id: string
  }> {
    // Simulate network delay and payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log("✓ [MOCK] Payment Confirmed")
    console.log(`  Payment Intent: ${payload.payment_intent_id}`)
    console.log(`  Transaction: ${payload.transaction_id}`)

    return {
      status: "completed",
      message: "Payment processed successfully (mock mode)",
      payment_method_id: `pm_mock_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  static async validateVoucher(
    code: string,
    amount: number,
    items: any[]
  ): Promise<{
    valid: boolean
    message: string
    discount_amount: number
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // MOCK: Simple voucher validation
    const mockVouchers: { [key: string]: number } = {
      WELCOME10: 10, // 10% discount
      SAVE50: 50, // 50 DT discount
      PROMO25: 25, // 25% discount (capped at amount)
      TESTCODE: 100, // 100 DT discount
    }

    const discount = mockVouchers[code.toUpperCase()]

    if (!discount) {
      console.log(`✗ [MOCK] Invalid voucher code: ${code}`)
      return {
        valid: false,
        message: "Invalid voucher code",
        discount_amount: 0
      }
    }

    // Check if discount is percentage or fixed amount
    let discountAmount = 0
    if (code.toUpperCase().includes("10") || code.toUpperCase().includes("25")) {
      // Percentage based
      discountAmount = Math.min((amount * discount) / 100, amount)
    } else {
      // Fixed amount
      discountAmount = Math.min(discount, amount)
    }

    console.log(`✓ [MOCK] Voucher Valid: ${code}`)
    console.log(`  Discount: ${discountAmount.toFixed(2)} DT`)

    return {
      valid: true,
      message: `Discount applied: ${discountAmount.toFixed(2)} DT`,
      discount_amount: discountAmount
    }
  }
}
