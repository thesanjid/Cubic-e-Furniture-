const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getProducts).post(protect, admin, createProduct);
router.get("/id/:id", getProductById);
router.post("/:id/reviews", protect, createProductReview);
router.route("/:id").put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);
router.get("/:slug", getProductBySlug);

module.exports = router;
