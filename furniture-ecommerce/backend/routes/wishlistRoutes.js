const express = require("express");

const {
  getWishlist,
  toggleWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication for all wishlist routes.
router.use(protect);

// Get the current user's wishlist.
router.get("/", getWishlist);

// Add or remove a product from the current user's wishlist.
router.put("/:productId", toggleWishlist);

module.exports = router;
