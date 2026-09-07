import { useEffect, useState } from "react";
import api from "../api/axios";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/orders").then((res) => {
    setOrders(res.data);
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, orderStatus) => {
    await api.put(`/orders/${id}/status`, { orderStatus });
    load();
  };

  return (
    <div>
      <h2>Orders</h2>
      {loading ? (
        <div className="spinner-wrap">Loading...</div>
      ) : orders.length === 0 ? (
        <p className="empty-state">No orders yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Paid</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-8).toUpperCase()}</td>
                <td>{o.user?.name}<br /><span style={{ fontSize: 12, color: "var(--muted)" }}>{o.user?.email}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>৳{o.totalPrice.toLocaleString()}</td>
                <td>{o.isPaid ? "Yes" : "No"}</td>
                <td>
                  <select value={o.orderStatus} onChange={(e) => updateStatus(o._id, e.target.value)} style={{ padding: 6, borderRadius: 6 }}>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
