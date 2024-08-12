const express = require("express");
const router = express.Router();

// import authentication middleware
const authMiddleware = require("../middleware/authMiddleware");

// import answer controllers
const { postAnswer, getAnswer, getUserAnswers, updateAnswer, deleteAnswer } = require("../controllers/answerController");

// post an answer for a question route
router.post("/", authMiddleware, postAnswer);

// get an answer for a question
router.get("/:question_id", authMiddleware, getAnswer);

// get answers for a specific user
router.get("/user/:username", authMiddleware, getUserAnswers);

// update an answer
router.put("/:answer_id", authMiddleware, updateAnswer);

// delete an answer
router.delete("/:answer_id", authMiddleware, deleteAnswer);

module.exports = router;
