const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, admin } = require("../middleware/authMiddleware");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpe?g|png|webp|gif/;
  const extOk = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = filetypes.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Images only (jpg, jpeg, png, webp, gif)"));
}

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => checkFileType(file, cb),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// @route POST /api/upload  (field name: "images", up to 6 files)
router.post("/", protect, admin, upload.array("images", 6), (req, res) => {
  const paths = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({ paths });
});

module.exports = router;
