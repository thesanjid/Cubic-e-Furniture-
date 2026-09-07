const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe, updateMe, setAddresses } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/addresses", protect, setAddresses);

module.exports = router;
