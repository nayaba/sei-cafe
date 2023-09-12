import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { getUser } from '../../utilities/users-service'
import AuthPage from '../AuthPage/AuthPage'
import NewOrderPage from '../NewOrderPage/NewOrderPage'
import OrderHistoryPage from '../OrderHistoryPage/OrderHistoryPage'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import StripePaymentPage from '../StripePayment/StripePayment'
const stripePromise = loadStripe(
  'pk_test_51NpEm7CoctFuvb9QuX05rBAsA7Gfb5FlSEWe0HRKeLJVsq3oj3M9kkz571Q9oP7qmhzL5kw0mRCFwhk5M9k0DbTK00KfMF8cP4'
)

export default function App() {
  const [user, setUser] = useState(getUser())
  return (
    <main className="App">
      {user ? (
        <Elements stripe={stripePromise}>
          <Routes>
            {/* client-side route that renders the component instance if the path matches the url in the address bar */}
            <Route
              path="/orders/new"
              element={<NewOrderPage user={user} setUser={setUser} />}
            />
            <Route path="/orders" element={<OrderHistoryPage />} />
            {/* redirect to /orders/new if path in address bar hasn't matched a <Route> above */}
            <Route path="/*" element={<Navigate to="/orders/new" />} />
            <Route path="/payment" element={<StripePaymentPage />} />
          </Routes>
        </Elements>
      ) : (
        <AuthPage setUser={setUser} />
      )}
    </main>
  )
}
