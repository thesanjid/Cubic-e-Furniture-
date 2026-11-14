const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const {
  protect,
  admin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication for all order routes.
router.use(protect);

// Create an order or list all orders (admin only).
router
  .route("/")
  .post(createOrder)
  .get(admin, getOrders);

// Keep named routes before dynamic ID routes.
router.get("/mine", getMyOrders);

// View an individual order.
router.get("/:id", getOrderById);

// Update order status (admin only).
router.put("/:id/status", admin, updateOrderStatus);

module.exports = router;
