import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/mine").then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="container section">
      <h2>My Account</h2>
      <p><strong>{user.name}</strong> — {user.email}</p>

      <h3 style={{ marginTop: 30 }}>Order History</h3>
      {orders.length === 0 ? (
        <p className="empty-state">You haven't placed any orders yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th><th>Paid</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-8).toUpperCase()}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>৳{o.totalPrice.toLocaleString()}</td>
                <td><span className={`badge ${o.orderStatus}`}>{o.orderStatus}</span></td>
                <td>{o.isPaid ? "Yes" : "No"}</td>
                <td><Link to={`/order/${o._id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
