const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getCategories).post(protect, admin, createCategory);
router.route("/:id").put(protect, admin, updateCategory).delete(protect, admin, deleteCategory);
router.get("/slug/:slug", getCategoryBySlug);

module.exports = router;
