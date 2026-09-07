import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [params] = useSearchParams();
  const paymentStatus = params.get("payment");

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <div className="spinner-wrap">Loading...</div>;

  return (
    <div className="container section" style={{ maxWidth: 700 }}>
      {paymentStatus === "success" && <div className="success-box">Payment successful! Your order is confirmed.</div>}
      {paymentStatus === "failed" && <div className="error-box">Payment failed. You can retry payment or contact support.</div>}
      {paymentStatus === "cancelled" && <div className="error-box">Payment was cancelled.</div>}

      <h2>Order #{order._id.slice(-8).toUpperCase()}</h2>
      <p>
        Status: <span className={`badge ${order.orderStatus}`}>{order.orderStatus}</span>{" "}
        {order.isPaid ? <span className="badge delivered">Paid</span> : <span className="badge pending">Unpaid</span>}
      </p>

      <h4>Shipping Address</h4>
      <p>
        {order.shippingAddress.fullName}, {order.shippingAddress.addressLine}, {order.shippingAddress.city}{" "}
        {order.shippingAddress.postCode}, {order.shippingAddress.country}
        <br />
        Phone: {order.shippingAddress.phone}
      </p>

      <h4>Items</h4>
      <table className="cart-table">
        <tbody>
          {order.orderItems.map((item) => (
            <tr key={item.product}>
              <td>
                <div className="cart-item-info">
                  <img src={item.image || "https://placehold.co/60x60"} alt={item.name} />
                  <span>{item.name}</span>
                </div>
              </td>
              <td>Qty: {item.qty}</td>
              <td>৳{(item.price * item.qty).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary" style={{ marginLeft: 0, marginTop: 20 }}>
        <div className="summary-row"><span>Subtotal</span><span>৳{order.itemsPrice.toLocaleString()}</span></div>
        <div className="summary-row"><span>Shipping</span><span>৳{order.shippingPrice.toLocaleString()}</span></div>
        <div className="summary-row total"><span>Total</span><span>৳{order.totalPrice.toLocaleString()}</span></div>
      </div>
    </div>
  );
}
