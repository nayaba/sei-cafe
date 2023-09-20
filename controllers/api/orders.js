const Order = require('../../models/order')
// const Item = require('../../models/item');
const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

module.exports = {
  cart,
  addToCart,
  setItemQtyInCart,
  checkout,
  getAllForUser
}

async function getAllForUser(req, res) {
  const orders = await Order.find({ user: req.user._id, isPaid: true }).sort(
    '-updatedAt'
  )
  res.json(orders)
}

// A cart is the unpaid order for a user
async function cart(req, res) {
  const cart = await Order.getCart(req.user._id)
  res.json(cart)
}

// Add an item to the cart
async function addToCart(req, res) {
  const cart = await Order.getCart(req.user._id)
  await cart.addItemToCart(req.params.id)
  res.json(cart)
}

// Updates an item's qty in the cart
async function setItemQtyInCart(req, res) {
  const cart = await Order.getCart(req.user._id)
  await cart.setItemQty(req.body.itemId, req.body.newQty)
  res.json(cart)
}

// Update the checkout function to create a STRIPE payment
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
