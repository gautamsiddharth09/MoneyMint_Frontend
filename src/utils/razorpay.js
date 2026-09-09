/**
 * Razorpay Checkout helpers.
 * Uses server-side order creation + signature verification (ShopVault pattern).
 */

/** Load the Razorpay checkout script dynamically (only once). */
export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.body.appendChild(script)
  })
}

/**
 * Open Razorpay checkout with a server-created order, then verify on success.
 *
 * @param {object} options
 * @param {object} options.order          - Response from createRazorpayOrder API
 * @param {object} options.paymentPayload - { loanDisbursedId, transactionAmount, transactionType }
 * @param {Function} options.verifyPayment - API fn called in handler after Razorpay success
 * @param {string} options.description
 * @param {object} options.prefill        - { name, email, contact }
 */
export async function openLoanRazorpayCheckout({
  order,
  paymentPayload,
  verifyPayment,
  description,
  prefill,
}) {
  const RazorpayCtor = await loadRazorpayScript()

  return new Promise((resolve, reject) => {
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      order_id: order.orderId,
      name: 'FinTrack Loans',
      description,
      prefill: {
        name: prefill?.name || '',
        email: prefill?.email || '',
        contact: prefill?.contact || '',
      },
      handler: async (response) => {
        try {
          const result = await verifyPayment({
            ...paymentPayload,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          resolve(result)
        } catch (err) {
          reject(err)
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
      theme: { color: '#10b981' },
    }

    const rz = new RazorpayCtor(options)
    rz.on('payment.failed', () => reject(new Error('Payment failed')))
    rz.open()
  })
}
