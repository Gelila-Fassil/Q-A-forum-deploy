const express = require("express");
const router = express.Router();

// import authentication middleware
const authMiddleware = require("../middleware/authMiddleware");

// import question controllers
const {
  postQuestion,
  getAllQuestions,
  getSingleQuestions, // Make sure this is correctly named
  updateQuestion, // Import the updateQuestion controller
  deleteQuestion // Import the deleteQuestion controller
} = require("../controllers/questionController");

// route to post a question
router.post("/", authMiddleware, postQuestion);

// route to get all questions
router.get("/all", authMiddleware, getAllQuestions);

// route to get a single question
router.get("/:question_id", authMiddleware, getSingleQuestions);

// route to update a question
router.put("/:question_id", authMiddleware, updateQuestion);

// route to delete a question
router.delete("/:question_id", authMiddleware, deleteQuestion);

module.exports = router;
