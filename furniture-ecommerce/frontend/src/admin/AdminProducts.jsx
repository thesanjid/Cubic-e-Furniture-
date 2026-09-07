import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/products?limit=1000").then((res) => {
    setProducts(res.data.products);
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Products</h2>
        <Link to="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>

      {loading ? (
        <div className="spinner-wrap">Loading...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><img src={p.images?.[0] || "https://placehold.co/50x50"} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }} /></td>
                <td>{p.name}</td>
                <td>{p.category?.name}</td>
                <td>৳{p.price.toLocaleString()}{p.discountPrice > 0 && ` (৳${p.discountPrice.toLocaleString()})`}</td>
                <td>{p.stock}</td>
                <td style={{ display: "flex", gap: 10 }}>
                  <Link to={`/admin/products/${p._id}/edit`} className="btn btn-outline">Edit</Link>
                  <button className="btn btn-danger" onClick={() => remove(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
