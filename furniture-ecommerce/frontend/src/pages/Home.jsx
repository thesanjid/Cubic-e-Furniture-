import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiBox } from "react-icons/fi";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
    api.get("/products?featured=true&limit=8").then((res) => setFeatured(res.data.products));
    api.get("/products?limit=8").then((res) => setLatest(res.data.products));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <div className="hero-badge">Office & Commercial Furniture</div>
            <h1>Furnish your workspace with Cubic.</h1>
            <p>
              Ergonomic office chairs, executive desks, hospital-grade steel furniture and custom
              metal fabrication — built to last, delivered across Bangladesh.
            </p>
            <Link to="/collections" className="btn btn-accent">Shop All Categories</Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-title">
          <h2>Shop by Category</h2>
          <Link to="/collections">View all</Link>
        </div>
        <div className="cat-grid">
          {categories.length === 0 && <p className="empty-state">No categories yet — add some from the admin dashboard.</p>}
          {categories.map((cat) => (
            <Link key={cat._id} to={`/collections/${cat.slug}`} className="cat-card">
              <div className="icon"><FiBox /></div>
              <h3>{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section container">
          <div className="section-title">
            <h2>Featured Products</h2>
            <Link to="/search">View all</Link>
          </div>
          <div className="product-grid">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="section-title">
          <h2>New Arrivals</h2>
          <Link to="/search">View all</Link>
        </div>
        <div className="product-grid">
          {latest.length === 0 && <p className="empty-state">No products yet — add some from the admin dashboard.</p>}
          {latest.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
