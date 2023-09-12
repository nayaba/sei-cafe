import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import * as ordersAPI from '../../utilities/orders-api'

export default function StripePaymentPage() {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) return

    const card = elements.getElement(CardElement)
    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: card
    })

    if (result.error) {
      console.log(result.error.message)
    } else {
      // const response = await fetch('/api/orders/cart/checkout', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     amount: 100, // Convert to smallest unit (cents for USD)
      //     id: result.paymentMethod.id
      //   })
      // })


      const response = await ordersAPI.checkout({
            amount: 100, // Convert to smallest unit (cents for USD)
            id: result.paymentMethod.id
          })
          
      const paymentResult = await response.json()

      if (paymentResult.message === 'Payment successful!') {
        // Handle success
        alert(paymentResult.message)
      } else {
        // Handle error
        alert(paymentResult.message)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay</button>
    </form>
  )
}
