const dbConnection = require("../db/Config.js");
const { v4: uuidv4 } = require("uuid");

// postquestion controller
async function postQuestion(req, res) {
  const { title, description } = req.body;
  const user_name = req.user.username; // Retrieve user ID from the authenticated user
  const questionId = uuidv4(); // Generate a random UUID

  if (!title || !description) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Please provide all required fields",
    });
  }

  try {
    await dbConnection.query(
      "INSERT INTO questions (user_username, title, description, question_id) VALUES (?, ?, ?, ?)",
      [user_name, title, description, questionId]
    );

    res.status(201).json({
      message: "Question created successfully",
      question_id: questionId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

// Get All Questions controller
async function getAllQuestions(req, res) {
  try {
    const [rows] = await dbConnection.query(
      "SELECT q.question_id AS question_id, q.title, q.description AS content, u.username AS user_name, q.created_at, COUNT(a.id) AS answer_count FROM questions q INNER JOIN users u ON q.user_username = u.username LEFT JOIN answers a ON q.question_id = a.question_id GROUP BY q.question_id"
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "No questions found.",
      });
    }

    const questions = rows.map((row) => ({
      question_id: row.question_id,
      title: row.title,
      content: row.content,
      user_name: row.user_name,
      created_at: row.created_at.toISOString(),
      answer_count: row.answer_count,
    }));

    res.status(200).json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

// get a single question
async function getSingleQuestions(req, res) {
  const questionId = req.params.question_id;

  try {
    const [rows] = await dbConnection.query(
      "SELECT q.question_id, q.title, q.description AS content, u.username AS user_name, q.created_at, (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.question_id) AS num_answers FROM questions q INNER JOIN users u ON q.user_username = u.username WHERE q.question_id = ?",
      [questionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Question not found.",
      });
    }

    const question = {
      question_id: rows[0].question_id,
      title: rows[0].title,
      content: rows[0].content,
      user_name: rows[0].user_name,
      num_answers: rows[0].num_answers,
      created_at: rows[0].created_at.toISOString(),
    };

    res.status(200).json({ question });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

// Update question controller
async function updateQuestion(req, res) {
  const { question_id } = req.params;
  const { title, description } = req.body;
  const user_name = req.user.username;

  if (!title || !description) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Please provide all required fields",
    });
  }

  try {
    // Check if the question exists and is authored by the authenticated user
    const [questionRows] = await dbConnection.query(
      "SELECT user_username FROM questions WHERE question_id = ?",
      [question_id]
    );

    if (questionRows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Question not found.",
      });
    }

    if (questionRows[0].user_username !== user_name) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not authorized to update this question.",
      });
    }

    // Update the question
    await dbConnection.query(
      "UPDATE questions SET title = ?, description = ? WHERE question_id = ?",
      [title, description, question_id]
    );

    res.status(200).json({
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

// Delete question controller
async function deleteQuestion(req, res) {
  const { question_id } = req.params;

  try {
    // Check if the question exists
    const [questionRows] = await dbConnection.query(
      "SELECT user_username FROM questions WHERE question_id = ?",
      [question_id]
    );

    if (questionRows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Question not found.",
      });
    }

    // Delete the question
    await dbConnection.query(
      "DELETE FROM questions WHERE question_id = ?",
      [question_id]
    );

    res.status(200).json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

module.exports = {
  postQuestion,
  getAllQuestions,
  getSingleQuestions,
  updateQuestion,
  deleteQuestion,
};
