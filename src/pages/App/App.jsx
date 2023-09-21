import React, { useState, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { getUser } from '../../utilities/users-service'
import AuthPage from '../AuthPage/AuthPage'
import NewOrderPage from '../NewOrderPage/NewOrderPage'
import OrderHistoryPage from '../OrderHistoryPage/OrderHistoryPage'

// STRIPE imports
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import NavbarComponent from '../../components/Navbar/Navbar'
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)

export default function App() {
  const [user, setUser] = useState(getUser())
  const [activeCat, setActiveCat] = useState('')
  const categoriesRef = useRef([])

  return (
    <main className="App">
      {user ? (
        <Elements stripe={stripePromise}>
          {/* <NavbarComponent
            user={user}
            setUser={setUser}
            categoriesRef={categoriesRef}
            activeCat={activeCat}
            setActiveCat={setActiveCat}
          /> */}
          <Routes>
            {/* client-side route that renders the component instance if the path matches the url in the address bar */}
            <Route
              path="/orders/new"
              element={
                <NewOrderPage
                  user={user}
                  setUser={setUser}
                  categoriesRef={categoriesRef}
                  activeCat={activeCat}
                  setActiveCat={setActiveCat}
                />
              }
            />
            <Route
              path="/orders"
              element={<OrderHistoryPage user={user} setUser={setUser} />}
            />
            {/* redirect to /orders/new if path in address bar hasn't matched a <Route> above */}
            <Route path="/*" element={<Navigate to="/orders/new" />} />
          </Routes>
        </Elements>
      ) : (
        <AuthPage setUser={setUser} />
      )}
    </main>
  )
}
