const express = require("express");
const router = express.Router();
const {
  initSSLCommerz,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIPN,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/sslcommerz/init/:orderId", protect, initSSLCommerz);
// SSLCommerz posts form data to these on redirect - no auth (gateway calls them)
router.post("/sslcommerz/success/:orderId", handleSuccess);
router.post("/sslcommerz/fail/:orderId", handleFail);
router.post("/sslcommerz/cancel/:orderId", handleCancel);
router.post("/sslcommerz/ipn", handleIPN);

module.exports = router;
