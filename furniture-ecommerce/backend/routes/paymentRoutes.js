const express = require("express");

const {
  initSSLCommerz,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIPN,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Parse form-encoded gateway callbacks.
router.use(express.urlencoded({ extended: false }));

// Require authentication to initiate payment.
router.post("/sslcommerz/init/:orderId", protect, initSSLCommerz);

// Public gateway callbacks: no user authentication required.
router.post("/sslcommerz/success/:orderId", handleSuccess);
router.post("/sslcommerz/fail/:orderId", handleFail);
router.post("/sslcommerz/cancel/:orderId", handleCancel);
router.post("/sslcommerz/ipn", handleIPN);

module.exports = router;
