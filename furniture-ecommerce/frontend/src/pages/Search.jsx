import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [input, setInput] = useState(keyword);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (sort) params.set("sort", sort);
    api.get(`/products?${params.toString()}`).then((res) => {
      setProducts(res.data.products);
      setLoading(false);
    });
  }, [keyword, sort]);

  const submit = (e) => {
    e.preventDefault();
    setSearchParams(input ? { keyword: input } : {});
  };

  return (
    <div className="container section">
      <form onSubmit={submit} style={{ display: "flex", gap: 10, marginBottom: 30, maxWidth: 500 }}>
        <input
          className="form-group"
          style={{ flex: 1, padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 6 }}
          placeholder="Search products..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>

      <div className="section-title">
        <h2>{keyword ? `Results for "${keyword}"` : "All Products"}</h2>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {loading ? (
        <div className="spinner-wrap">Loading...</div>
      ) : products.length === 0 ? (
        <p className="empty-state">No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
