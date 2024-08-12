const express = require("express");
const router = express.Router();

// import authentication middleware
const authMiddleware = require("../middleware/authMiddleware");

// import like controller
const { likeAnswer, dislikeAnswer } = require("../controllers/likeController")

// post like for an answer
router.post("/like", authMiddleware, likeAnswer);


// post dislike for an answer
router.post("/dislike", authMiddleware, dislikeAnswer);


module.exports = router;