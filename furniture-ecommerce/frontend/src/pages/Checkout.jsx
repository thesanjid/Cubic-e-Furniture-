import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const { cart, itemsPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    addressLine: "",
    city: "",
    postCode: "",
    country: "Bangladesh",
  });
  const [paymentMethod, setPaymentMethod] = useState("sslcommerz");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const shipping = itemsPrice > 5000 ? 0 : 120;
  const total = itemsPrice + shipping;

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: order } = await api.post("/orders", {
        orderItems: cart.map((i) => ({ product: i.product, qty: i.qty })),
        shippingAddress: address,
        paymentMethod,
      });

      if (paymentMethod === "sslcommerz") {
        const { data } = await api.post(`/payment/sslcommerz/init/${order._id}`);
        clearCart();
        window.location.href = data.url; // redirect to SSLCommerz gateway
      } else {
        clearCart();
        navigate(`/order/${order._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return <div className="container section empty-state">Your cart is empty.</div>;

  return (
    <div className="container section" style={{ maxWidth: 700 }}>
      <h2>Checkout</h2>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={placeOrder}>
        <h4>Shipping Address</h4>
        <div className="form-group">
          <label>Full Name</label>
          <input value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input value={address.addressLine} onChange={(e) => setAddress({ ...address, addressLine: e.target.value })} required />
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>City</label>
            <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Post Code</label>
            <input value={address.postCode} onChange={(e) => setAddress({ ...address, postCode: e.target.value })} />
          </div>
        </div>

        <h4>Payment Method</h4>
        <div className="form-group">
          <label>
            <input type="radio" checked={paymentMethod === "sslcommerz"} onChange={() => setPaymentMethod("sslcommerz")} />{" "}
            Pay online (Card / Mobile Banking / bKash via SSLCommerz)
          </label>
        </div>
        <div className="form-group">
          <label>
            <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />{" "}
            Cash on Delivery
          </label>
        </div>

        <div className="cart-summary" style={{ marginLeft: 0, marginBottom: 20 }}>
          <div className="summary-row"><span>Subtotal</span><span>৳{itemsPrice.toLocaleString()}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : `৳${shipping}`}</span></div>
          <div className="summary-row total"><span>Total</span><span>৳{total.toLocaleString()}</span></div>
        </div>

        <button className="btn btn-primary" style={{ width: "100%" }} type="submit" disabled={loading}>
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}
