const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  setAddresses,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected profile routes
router
  .route("/me")
  .all(protect)
  .get(getMe)
  .put(updateMe);

// Protected address route
router.put("/addresses", protect, setAddresses);

module.exports = router;
