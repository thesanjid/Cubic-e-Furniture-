import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiHeart, FiShoppingCart, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <>
      <div className="topbar">Free shipping on orders over ৳5,000 | Same-day dispatch in Dhaka</div>
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            CUBIC<span>.</span>
          </Link>

          <form className="search-box" onSubmit={submitSearch}>
            <FiSearch />
            <input
              placeholder="Search furniture..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </form>

          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/collections">Category</Link>
            <Link to="/search">Search</Link>
          </nav>

          <div className="header-icons">
            <Link to="/wishlist" className="icon-badge">
              <FiHeart />
            </Link>
            <Link to="/cart" className="icon-badge">
              <FiShoppingCart />
              {cart.length > 0 && <span className="count">{cart.reduce((a, i) => a + i.qty, 0)}</span>}
            </Link>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                style={{ background: "none", border: "none", fontSize: 20, display: "flex" }}
              >
                <FiUser />
              </button>
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 34,
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: 6,
                    minWidth: 170,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                    zIndex: 100,
                  }}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  {user ? (
                    <>
                      <div style={{ padding: "10px 16px", fontSize: 13, color: "#6b7280" }}>
                        Hi, {user.name}
                      </div>
                      <Link to="/account" style={{ display: "block", padding: "10px 16px" }} onClick={() => setMenuOpen(false)}>
                        My Account
                      </Link>
                      {user.isAdmin && (
                        <Link to="/admin" style={{ display: "block", padding: "10px 16px" }} onClick={() => setMenuOpen(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none" }}
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                          navigate("/");
                        }}
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" style={{ display: "block", padding: "10px 16px" }} onClick={() => setMenuOpen(false)}>
                        Log In
                      </Link>
                      <Link to="/register" style={{ display: "block", padding: "10px 16px" }} onClick={() => setMenuOpen(false)}>
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
