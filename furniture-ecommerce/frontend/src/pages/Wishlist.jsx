import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.get("/wishlist").then((res) => {
      setItems(res.data);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="container section empty-state">
        <p>Log in to view your wishlist.</p>
        <Link to="/login" className="btn btn-primary">Log In</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h2>My Wishlist</h2>
      {loading ? (
        <div className="spinner-wrap">Loading...</div>
      ) : items.length === 0 ? (
        <p className="empty-state">Your wishlist is empty.</p>
      ) : (
        <div className="product-grid">
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
