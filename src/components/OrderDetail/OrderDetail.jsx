import './OrderDetail.css'
import LineItem from '../LineItem/LineItem'
import StripePaymentPage from '../../pages/StripePayment/StripePayment'

// Used to display the details of any order, including the cart (unpaid order)
export default function OrderDetail({
  order,
  handleChangeQty,
  handleCheckout,
  activeStripe,
  setActiveStripe,
}) {
  if (!order) return null

  const lineItems = order.lineItems.map((item) => (
    <LineItem
      lineItem={item}
      isPaid={order.isPaid}
      handleChangeQty={handleChangeQty}
      key={item._id}
    />
  ))

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
}
