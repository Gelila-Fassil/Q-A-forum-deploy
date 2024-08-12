const express = require("express");
const router = express.Router();
const multer = require("multer");

// import authentication middleware
const authMiddleware = require("../middleware/authMiddleware");
const limiter = require("../middleware/rateLimitMiddleware")

// import user controllers
const { register, login, checkUser, updateUserProfile, getUserProfile } = require("../controllers/userController");

// Set up Multer for file uploads (storing files in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Register route
router.post("/register", register);

// Login route
router.post("/login", limiter, login);

// Check user route
router.get("/check", authMiddleware, checkUser);

// get user profile
router.get("/userprofile/:username", authMiddleware, getUserProfile)
// Update user profile route
router.post("/userprofile/:username/update", authMiddleware, upload.single('profile_picture'), updateUserProfile);

module.exports = router;
