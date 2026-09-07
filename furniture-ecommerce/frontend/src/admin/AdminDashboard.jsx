import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });

  useEffect(() => {
    Promise.all([api.get("/products?limit=1000"), api.get("/orders")]).then(([pRes, oRes]) => {
      const orders = oRes.data;
      setStats({
        products: pRes.data.total,
        orders: orders.length,
        revenue: orders.filter((o) => o.isPaid).reduce((a, o) => a + o.totalPrice, 0),
        pending: orders.filter((o) => o.orderStatus === "pending").length,
      });
    });
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 20 }}>
        {[
          { label: "Total Products", value: stats.products },
          { label: "Total Orders", value: stats.orders },
          { label: "Pending Orders", value: stats.pending },
          { label: "Revenue (Paid)", value: `৳${stats.revenue.toLocaleString()}` },
        ].map((c) => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: 20 }}>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
