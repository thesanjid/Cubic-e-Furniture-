import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>CUBIC.</h4>
            <p style={{ fontSize: 14 }}>
              Office & commercial furniture, hospital metal furniture and custom steel furnishings.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/collections">All Categories</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Log In</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/account">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>Dhaka, Bangladesh</li>
              <li>support@cubic.furniture</li>
              <li>+880 000-000000</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} Cubic Furniture Clone. All rights reserved.</div>
      </div>
    </footer>
  );
}
