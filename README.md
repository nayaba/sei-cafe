
<img src="https://i.imgur.com/5Fi4UA0.png" width="100%">

**Setting Up Stripe Payments in a Node.js & React App**

---

**Objective:** By the end of this lesson, learners will be able to integrate Stripe payments into a Node.js backend and React frontend application.

---

### Introduction

Stripe provides a suite of tools for accepting online payments. In this lesson, we'll guide you through the process of setting up Stripe in a Node.js and React app, specifically for SEI-CAFE.

---

### Prerequisites

1. A fully built-out SEI-CAFE, including Order History.
2. A Stripe account. If you don't have one, [sign up here](https://stripe.com/).

---

### Steps:

#### 1. Reference Stripe API Docs

While following this lesson, keep the [Stripe API documentation](https://stripe.com/docs/api) handy for an exhaustive reference.

#### 2. Create a Stripe Account

If you haven’t already, create an account with [Stripe](https://dashboard.stripe.com/register?redirect=https%3A%2F%2Fstripe.com%2Fdocs%2Fapi). This will allow you to access necessary API keys.  During the initial development and testing phase, it's recommended to use Stripe's "test mode". This mode allows you to use Stripe's sample credit cards, avoiding any real transactions.

Note: If you intend to run real transactions or use actual credit cards, you'll need to switch from "test mode" to "live mode". Activating your account for live transactions might require additional verification steps and can take a few days, so it's important to plan accordingly. Ensure you've thoroughly tested your integration in test mode before making the transition to live mode.

#### 3. Package Installation

Install the required packages for Stripe integration:

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Why?** These packages provide the necessary tools to interact with Stripe from both our backend (`stripe`) and frontend (`@stripe/stripe-js` and `@stripe/react-stripe-js`).

#### 4. Configuring Environment Variables

Environment variables keep sensitive information, like API keys, hidden. Add the following lines to your `.env`:

```plaintext
STRIPE_SECRET_KEY=your_secret_key_here
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_publishable_key_here
```

You can find these keys at [Stripe's dashboard](https://dashboard.stripe.com/test/apikeys).

**Important**: Always restart your server after modifying the `.env` file.

**Note**: Prefixing `REACT_APP_` before environment variable names is a requirement when using Create React App. Only environment variables with this prefix will be embedded into the build, ensuring that sensitive backend variables aren't accidentally exposed on the client side. Ensure that you only store public-facing keys with this prefix.

#### 5. Backend Stripe Initialization (`orders.js`)

To process payments, we must initialize Stripe on our server:

```js
const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
```

**Why?** This code creates an instance of Stripe with our secret key, letting us interact with the Stripe API.

Now, update the checkout function to handle Stripe payments:

```js
// controllers/api/orders.js
async function checkout(req, res) {
  const { amount, id, description } = req.body

  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: 'USD',
      description: description,
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

**Why?** This function facilitates a Stripe payment by creating a payment intent, ensuring the payment goes through, and updating the user's cart to reflect the transaction.

#### 6. Frontend Stripe Configuration (`App.jsx`)

Firstly, initialize Stripe on the frontend:

```js
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
```

**Why?** This loads Stripe's JS library, preparing it for use within our React components.

Then, wrap your routes with Stripe's Elements provider:

```jsx
<Elements stripe={stripePromise}>
    <Routes>
    <Route
      path="/orders/new"
      element={<NewOrderPage user={user} setUser={setUser} />}
    />
    <Route
      path="/orders"
      element={<OrderHistoryPage user={user} setUser={setUser} />}
    />
    <Route path="/*" element={<Navigate to="/orders/new" />} />
  </Routes>
</Elements>
```

**Why?** The `Elements` provider grants children components access to Stripe's features.

#### 7. Stripe Payment Component (`StripePayment.jsx`)

Create a new page called `StripePayment`.
Stripe provides React components like `CardElement` to securely collect card details.  We'll utilize this `CardElement` as part of our `StripePayment` page.

```js
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useNavigate } from 'react-router-dom'
import * as ordersAPI from '../../utilities/orders-api'

export default function StripePaymentPage({setActiveStripe, total, orderId}) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const numTotal = Math.trunc(Number(total)*100)

  console.log('total stripe payment: ', typeof numTotal, numTotal)

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
            amount: numTotal, // Convert to smallest unit (cents for USD)
            id: result.paymentMethod.id,
            description: `OrderId: ${orderId}`
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

**Why?** This component aids in securely gathering payment info without sensitive data touching our server. The function `handleSubmit` oversees the payment process, sending the card info to Stripe, receiving a token, and passing it to our backend for payment execution.

#### 8. Updating Checkout (`NewOrderPage.jsx`)

Create some state for the ternary we'll be creating later in the OrderDetail component:

```js
 const [activeStripe, setActiveStripe] = useState(false)
 ```

Refactor the checkout handler:

```js
  async function handleCheckout() {
    setActiveStripe(true)
  }
```

Add necessary props to the OrderDetail component rendered in the return:

```js
        <OrderDetail
          order={cart}
          handleChangeQty={handleChangeQty}
          handleCheckout={handleCheckout}
          activeStripe={activeStripe}
          setActiveStripe={setActiveStripe}
        />
```

**Why?** The `handleCheckout` function activates Stripe's payment dialog. The props manage and monitor this state.

### 8. Modifying `OrderDetail.jsx`

In the next step, we will refactor the `OrderDetail.jsx` file. We're going to destructure several props to keep our code cleaner and more readable. Additionally, we'll make some changes in the component's return statement to add another ternary operation for displaying the payment section.

1. **Destructuring Props**

   At the top of the `OrderDetail` component, destructure the following props:
   ```jsx
   function OrderDetail({
     order,
     handleChangeQty,
     handleCheckout,
     activeStripe,
     setActiveStripe
   }) {
   ```

2. **Refactoring the Return Statement**

   We're going to add a new ternary to determine whether the payment section (with the Stripe component) should be displayed. This is controlled by the `activeStripe` prop. When `activeStripe` is true, the Stripe payment component will be rendered.

   Replace the current return statement with the following:

   ```jsx
   return (
     <div className="OrderDetail">
       <div className="section-heading">
         {order.isPaid ? (
           <span>
             ORDER <span className="smaller">{order.orderId}</span>
           </span>
         ) : (
           <span>NEW ORDER</span>
         )}
         <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
       </div>
       <div className="line-item-container flex-ctr-ctr flex-col scroll-y">
         {lineItems.length ? (
           <>
             {lineItems}
             <section className="total">
               {order.isPaid ? (
                 <span className="right">TOTAL&nbsp;&nbsp;</span>
               ) : (
                 <button
                   className="btn-sm"
                   onClick={handleCheckout}
                   disabled={!lineItems.length}
                 >
                   CHECKOUT
                 </button>
               )}
               <span>{order.totalQty}</span>
               <span className="right">${order.orderTotal.toFixed(2)}</span>
               {console.log('total qty: ', order.orderTotal.toFixed(2))}
             </section>
           </>
         ) : (
           <div className="hungry">Hungry?</div>
         )}
         <section className="payment">
           {activeStripe ? (
             <StripePaymentPage
               setActiveStripe={setActiveStripe}
               total={order.orderTotal.toFixed(2)}
               orderId={order.orderId}
             />
           ) : (
             ''
           )}
         </section>
       </div>
     </div>
   )
   ```

   Here's what we've done:
   - We've added a new section, `<section className="payment">`, which uses the `activeStripe` prop to determine if the `StripePaymentPage` component should be displayed.
   - This approach ensures that the Stripe component is only rendered when needed, improving the user experience and potentially performance.

By structuring your components this way, you keep the UI clean, only presenting users with the information and options they need at any given moment. It also helps in maintaining a modular and maintainable codebase.

---

### Test Stripe

Go ahead and test out our Stripe implementation by using the test credit card info available on the Stripe API Dashboard, or by using this test info:



| Card Number      | Exp. Date | CVC | ZIP  |
|------------------|-----------|-----|------|
| 4242 4242 4242 4242 | 12/34    | 123 | 12345|

Well done! You've deeply integrated Stripe into your app, equipped with the knowledge of each code snippet's purpose. Always test the payment process in a sandboxed environment before launching live.
