const express = require('express')
const router = express.Router()
const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

router.post('/', async (req, res) => {
  const { amount, id } = req.body

  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: 'USD',
      description: 'I think I need to grab this from req.body',
      payment_method: id,
      confirm: true,
      // automatic_payment_methods: {
      //   enabled: true,
      //   allow_redirects: 'never'
      // }
      return_url: 'http://localhost:3000/orders/new',
    })
    console.log('Payment: ', payment)
    res.json({ message: 'Payment successful!' })
  } catch (err) {
    console.log('Error: ', err)
    res.status(400).json({ message: 'Payment failed!' })
  }
})

module.exports = router
