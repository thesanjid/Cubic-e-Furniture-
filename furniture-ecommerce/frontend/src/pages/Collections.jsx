import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function Collections() {
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    if (slug) {
      api.get(`/categories/slug/${slug}`).then((res) => {
        setActiveCategory(res.data);
        api.get(`/products?category=${res.data._id}`).then((r) => {
          setProducts(r.data.products);
          setLoading(false);
        });
      });
    } else {
      setActiveCategory(null);
      api.get("/products").then((r) => {
        setProducts(r.data.products);
        setLoading(false);
      });
    }
  }, [slug]);

  return (
    <div className="container section">
      <div className="section-title">
        <h2>{activeCategory ? activeCategory.name : "All Categories"}</h2>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30 }}>
        <Link to="/collections" className={`btn ${!slug ? "btn-primary" : "btn-outline"}`}>All</Link>
        {categories.map((c) => (
          <Link
            key={c._id}
            to={`/collections/${c.slug}`}
            className={`btn ${slug === c.slug ? "btn-primary" : "btn-outline"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap">Loading...</div>
      ) : products.length === 0 ? (
        <p className="empty-state">No products found in this category yet.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
