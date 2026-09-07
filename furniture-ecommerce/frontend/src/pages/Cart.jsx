import { Link, useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { cart, updateQty, removeFromCart, itemsPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const shipping = itemsPrice > 5000 || itemsPrice === 0 ? 0 : 120;

  if (cart.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <p>Your cart is currently empty.</p>
          <Link to="/collections" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h2>Shopping Cart</h2>
      <table className="cart-table">
        <thead>
          <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.product}>
              <td>
                <div className="cart-item-info">
                  <img src={item.image || "https://placehold.co/60x60"} alt={item.name} />
                  <span>{item.name}</span>
                </div>
              </td>
              <td>৳{item.price.toLocaleString()}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  max={item.stock}
                  value={item.qty}
                  onChange={(e) => updateQty(item.product, Math.max(1, Math.min(item.stock, Number(e.target.value))))}
                  style={{ width: 60, padding: 6 }}
                />
              </td>
              <td>৳{(item.price * item.qty).toLocaleString()}</td>
              <td>
                <button onClick={() => removeFromCart(item.product)} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: 18 }}>
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary" style={{ marginTop: 30 }}>
        <div className="summary-row"><span>Subtotal</span><span>৳{itemsPrice.toLocaleString()}</span></div>
        <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : `৳${shipping}`}</span></div>
        <div className="summary-row total"><span>Total</span><span>৳{(itemsPrice + shipping).toLocaleString()}</span></div>
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 12 }}
          onClick={() => navigate(user ? "/checkout" : "/login?redirect=/checkout")}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
