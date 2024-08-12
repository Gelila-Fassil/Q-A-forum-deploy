const dbConnection = require("../db/Config");
const { v4: uuidv4 } = require("uuid");

async function postAnswer(req, res) {
  const { questionid, answer } = req.body;
  const username = req.user.username;
  const answer_id = uuidv4();

  try {
    await dbConnection.query(
      "INSERT INTO answers (answer_id, question_id, user_username, answer) VALUES (?, ?, ?, ?)",
      [answer_id, questionid, username, answer]
    );

    res.status(201).json({
      message: "Answer posted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

// get answers for a question controller
async function getAnswer(req, res) {
  const questionId = req.params.question_id;

  try {
    const [answers] = await dbConnection.query(
      "SELECT a.answer_id AS answer_id, a.answer AS content, u.username AS user_name, a.created_at, a.attachment_url, " +
        "(SELECT COUNT(*) FROM answer_likes WHERE answer_id = a.answer_id AND liked = true) AS num_like, " +
        "(SELECT COUNT(*) FROM answer_likes WHERE answer_id = a.answer_id AND disliked = true) AS num_dislike " +
        "FROM answers a " +
        "INNER JOIN users u ON a.user_username = u.username " +
        "WHERE a.question_id = ?",
      [questionId]
    );
    res.status(200).json({
      answers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred. Try Again!",
    });
  }
}

async function getUserAnswers(req, res) {
  const username = req.params.username;

  try {
    const [answers] = await dbConnection.query(
      "SELECT a.answer_id AS answer_id, a.answer AS content, u.username AS user_name, a.created_at, a.attachment_url,a.question_id,  " +
        "(SELECT COUNT(*) FROM answer_likes WHERE answer_id = a.answer_id AND liked = true) AS num_like, " +
        "(SELECT COUNT(*) FROM answer_likes WHERE answer_id = a.answer_id AND disliked = true) AS num_dislike " +
        "FROM answers a " +
        "INNER JOIN users u ON a.user_username = u.username " +
        "WHERE a.user_username = ?",
      [username]
    );

    res.status(200).json({
      answers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

// update an answer
async function updateAnswer(req, res) {
  const { answer_id } = req.params;
  const { content } = req.body;
  const username = req.user.username;

  try {
    // Ensure that the user is the owner of the answer
    const [answer] = await dbConnection.query(
      "SELECT user_username FROM answers WHERE answer_id = ?",
      [answer_id]
    );

    if (answer.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Answer not found.",
      });
    }

    if (answer[0].user_username !== username) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not authorized to edit this answer.",
      });
    }

    await dbConnection.query(
      "UPDATE answers SET answer = ? WHERE answer_id = ?",
      [content, answer_id]
    );

    res.status(200).json({
      message: "Answer updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

// delete an answer
async function deleteAnswer(req, res) {
  const { answer_id } = req.params;
  const username = req.user.username;

  try {
    // Ensure that the user is the owner of the answer
    const [answer] = await dbConnection.query(
      "SELECT user_username FROM answers WHERE answer_id = ?",
      [answer_id]
    );

    if (answer.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Answer not found.",
      });
    }

    if (answer[0].user_username !== username) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not authorized to delete this answer.",
      });
    }

    await dbConnection.query(
      "DELETE FROM answers WHERE answer_id = ?",
      [answer_id]
    );

    res.status(200).json({
      message: "Answer deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = {
  postAnswer, 
  getAnswer,
  getUserAnswers,
  updateAnswer,
  deleteAnswer,
};
