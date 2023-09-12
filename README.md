# SEI-CAFE

reference Stripe API docs where possible

Create a Stripe account.
Install the necessary Stripe packages for Node.js and React:

```
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### .env

Update the .env file with STRIPE_SECRET_KEY and REACT_APP_STRIPE_PUBLISHABLE_KEY which can be accessed here: https://dashboard.stripe.com/test/apikeys

Be sure to restart your server after editing your .env file.

### orders.js

Initialize Stripe

```js
const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
```

Update the checkout function in controllers/api/orders.js

```js
// controllers/api/orders.js

// Update the checkout function to create a STRIPE payment
async function checkout(req, res) {
  const { amount, id } = req.body

  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: 'USD',
      description: 'I think I need to grab this from req.body',
      payment_method: id,
      confirm: true,
      // stripe needs a return url; update this with deployed app url
      return_url: 'http://localhost:3000/orders/new'
      // if a return url is not desired, use the following code instead:
      // automatic_payment_methods: {
      //   enabled: true,
      //   allow_redirects: 'never'
      // }
    })
    console.log('Payment: ', payment)

    const cart = await Order.getCart(req.user._id)
    cart.isPaid = true
    await cart.save()

    console.log('Updated cart: ', cart)

    res.json({ message: 'Payment successful!', cart })
  } catch (err) {
    console.log('Error: ', err)
    res.status(400).json({ message: 'Payment failed!' })
  }
}
```

### App.jsx

Initialize Stripe in your React application

```js
// App.jsx
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
```

Include Stripe’s Elements provider around the component. This allows you to access Stripe functionality inside your component.

```js
<Elements stripe={stripePromise}>
  <Routes>
    {/* client-side route that renders the component instance if the path matches the url in the address bar */}
    <Route
      path="/orders/new"
      element={<NewOrderPage user={user} setUser={setUser} />}
    />
    <Route
      path="/orders"
      element={<OrderHistoryPage user={user} setUser={setUser} />}
    />
    {/* redirect to /orders/new if path in address bar hasn't matched a <Route> above */}
    <Route path="/*" element={<Navigate to="/orders/new" />} />
  </Routes>
</Elements>
```

### StripePayment.jsx

Stripe provides React components like CardElement to securely collect card details.

```js
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useNavigate } from 'react-router-dom'
import * as ordersAPI from '../../utilities/orders-api'

export default function StripePaymentPage({setActiveStripe}) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()

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

      const response = await ordersAPI.checkout({
            amount: 100, // Convert to smallest unit (cents for USD)
            id: result.paymentMethod.id
          })

      const paymentResult = await response

      if (paymentResult.message === 'Payment successful!') {
        // Handle success
        alert(paymentResult.message)
        navigate('/orders')
        setActiveStripe(false)
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
```

### NewOrderPage.jsx


