const express = require("express");

const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require("../controllers/productController");

const {
  protect,
  admin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// List products publicly or create a product as an admin.
router
  .route("/")
  .get(getProducts)
  .post(protect, admin, createProduct);

// Public product lookup by ID.
router.get("/id/:id", getProductById);

// Authenticated users can submit reviews.
router.post("/:id/reviews", protect, createProductReview);

// Admin product management.
router
  .route("/:id")
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Public product lookup by slug.
router.get("/:slug", getProductBySlug);

module.exports = router;
