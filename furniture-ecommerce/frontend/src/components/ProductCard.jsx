import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wished, setWished] = useState(false);

  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round(100 - (product.discountPrice / product.price) * 100) : 0;

  const toggleWish = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to save items to your wishlist.");
    await api.put(`/wishlist/${product._id}`);
    setWished((w) => !w);
  };

  return (
    <div className="product-card">
      {hasDiscount && <span className="discount-tag">-{discountPct}%</span>}
      <button className={`wish-btn ${wished ? "active" : ""}`} onClick={toggleWish}>
        <FiHeart />
      </button>
      <Link to={`/product/${product.slug}`}>
        <div className="img-wrap">
          <img src={product.images?.[0] || "https://placehold.co/400x400?text=Furniture"} alt={product.name} />
        </div>
        <div className="body">
          <div className="cat-name">{product.category?.name || ""}</div>
          <h4>{product.name}</h4>
          <div className="price-row">
            <span className="price">৳{finalPrice.toLocaleString()}</span>
            {hasDiscount && <span className="price-old">৳{product.price.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
      <div style={{ padding: "0 14px 14px" }}>
        <button
          className="btn btn-primary add-cart-btn"
          disabled={product.stock === 0}
          onClick={() => addToCart(product, 1)}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
