import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiHeart, FiStar } from "react-icons/fi";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [msg, setMsg] = useState("");
  const { addToCart } = useCart();
  const { user } = useAuth();

  const load = () => api.get(`/products/${slug}`).then((res) => setProduct(res.data));

  useEffect(() => {
    load();
    setActiveImg(0);
    setQty(1);
  }, [slug]);

  if (!product) return <div className="spinner-wrap">Loading...</div>;

  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${product._id}/reviews`, { rating: reviewRating, comment: reviewText });
      setReviewText("");
      setMsg("Review submitted, thank you!");
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not submit review");
    }
  };

  return (
    <div className="container">
      <div className="product-detail">
        <div>
          <div className="pd-gallery-main">
            <img
              src={product.images?.[activeImg] || "https://placehold.co/600x600?text=Furniture"}
              alt={product.name}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="pd-thumbs">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={i === activeImg ? "active" : ""}
                  onClick={() => setActiveImg(i)}
                  alt=""
                />
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          <div className="cat-name">{product.category?.name}</div>
          <h1>{product.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#c8a45d" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar key={i} fill={i < Math.round(product.rating) ? "#c8a45d" : "none"} />
            ))}
            <span style={{ color: "#6b7280", fontSize: 13 }}>({product.numReviews} reviews)</span>
          </div>
          <div className="pd-price">
            ৳{finalPrice.toLocaleString()}{" "}
            {hasDiscount && <span className="price-old" style={{ fontSize: 18, marginLeft: 8 }}>৳{product.price.toLocaleString()}</span>}
          </div>
          <p style={{ color: "#4b5563" }}>{product.shortDescription || product.description}</p>

          <ul style={{ fontSize: 14, color: "#4b5563", marginBottom: 10 }}>
            {product.material && <li>Material: {product.material}</li>}
            {product.color && <li>Color: {product.color}</li>}
            {product.dimensions && <li>Dimensions: {product.dimensions}</li>}
            <li>Availability: {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</li>
          </ul>

          <div className="qty-selector">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
          </div>

          <div className="pd-actions">
            <button
              className="btn btn-primary"
              disabled={product.stock === 0}
              onClick={() => addToCart(product, qty)}
            >
              Add to Cart
            </button>
            <button
              className="btn btn-outline"
              onClick={async () => {
                if (!user) return alert("Please log in to save items to your wishlist.");
                await api.put(`/wishlist/${product._id}`);
                alert("Wishlist updated");
              }}
            >
              <FiHeart /> Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="section" style={{ maxWidth: 700 }}>
        <h3>Description</h3>
        <p style={{ color: "#4b5563" }}>{product.description}</p>

        <h3>Reviews ({product.numReviews})</h3>
        {product.reviews?.map((r) => (
          <div key={r._id} style={{ borderBottom: "1px solid var(--border)", padding: "12px 0" }}>
            <strong>{r.name}</strong>
            <div style={{ color: "#c8a45d", fontSize: 13 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            <p style={{ margin: "6px 0", color: "#4b5563" }}>{r.comment}</p>
          </div>
        ))}

        {user ? (
          <form onSubmit={submitReview} style={{ marginTop: 20 }}>
            <h4>Write a review</h4>
            {msg && <div className="success-box">{msg}</div>}
            <div className="form-group">
              <label>Rating</label>
              <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea rows={3} value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit">Submit Review</button>
          </form>
        ) : (
          <p style={{ color: "#6b7280" }}>Log in to write a review.</p>
        )}
      </div>
    </div>
  );
}
