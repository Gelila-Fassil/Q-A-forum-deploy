const dbConnection = require("../db/Config");

// POST /answer/:answerId/like
async function likeAnswer(req, res) {
  const { answerId } = req.body;
  const { username } = req.user;
 
  

  try {
    // Check if the user has already liked or disliked the answer
    const [existingLike] = await dbConnection.query(
      "SELECT * FROM answer_likes WHERE user_username = ? AND answer_id = ?",
      [username, answerId]

    );
   


    if (existingLike.length===0) {
      // If the user has not yet liked or disliked the answer, insert a new record
      await dbConnection.query(
        "INSERT INTO answer_likes (user_username, answer_id, liked, disliked) VALUES (?, ?, ?, ?)",
        [username, answerId, true, false]
      );
    } else {
      
      
      // If the user has already liked or disliked the answer, update the existing record
      if (existingLike[0].liked) {
        // If the user has already liked the answer, remove the like
        await dbConnection.query(
          "UPDATE answer_likes SET liked = ?, disliked = ? WHERE user_username = ? AND answer_id = ?",
          [false, false, username, answerId]
        );
      } else {
        // If the user has not liked the answer, add the like
        await dbConnection.query(
          "UPDATE answer_likes SET liked = ?, disliked = ? WHERE user_username = ? AND answer_id = ?",
          [true, false, username, answerId]
        );
      }
    }

    // Get the number of likes and dislikes for the answer
    const [[{ num_likes }]] = await dbConnection.query(
      "SELECT COUNT(*) AS num_likes FROM answer_likes WHERE answer_id = ? AND liked = true",
      [answerId]
    );
    const [[{ num_dislikes }]] = await dbConnection.query(
      "SELECT COUNT(*) AS num_dislikes FROM answer_likes WHERE answer_id = ? AND disliked = true",
      [answerId]
    );

    res
      .status(200)
      .json({
        message: "Like registered successfully",
        num_likes,
        num_dislikes,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /answer/:answerId/dislike
async function dislikeAnswer(req, res) {
  const { answerId } = req.body;
  const { username } = req.user;

  try {
    // Check if the user has already liked or disliked the answer
    const [existingLike] = await dbConnection.query(
      "SELECT * FROM answer_likes WHERE user_username = ? AND answer_id = ?",
      [username, answerId]
    );

    if (existingLike.length===0) {
      // If the user has not yet liked or disliked the answer, insert a new record
      await dbConnection.query(
        "INSERT INTO answer_likes (user_username, answer_id, liked, disliked) VALUES (?, ?, ?, ?)",
        [username, answerId, false, true]
      );
    } else {
      // If the user has already liked or disliked the answer, update the existing record
      if (existingLike[0].disliked) {
        // If the user has already disliked the answer, remove the dislike
        await dbConnection.query(
          "UPDATE answer_likes SET liked = ?, disliked = ? WHERE user_username = ? AND answer_id = ?",
          [false, false, username, answerId]
        );
      } else {
        // If the user has not disliked the answer, add the dislike
        await dbConnection.query(
          "UPDATE answer_likes SET liked = ?, disliked = ? WHERE user_username = ? AND answer_id = ?",
          [false, true, username, answerId]
        );
      }
    }

    // Get the number of likes and dislikes for the answer
    const [[{ num_likes }]] = await dbConnection.query(
      "SELECT COUNT(*) AS num_likes FROM answer_likes WHERE answer_id = ? AND liked = true",
      [answerId]
    );
    const [[{ num_dislikes }]] = await dbConnection.query(
      "SELECT COUNT(*) AS num_dislikes FROM answer_likes WHERE answer_id = ? AND disliked = true",
      [answerId]
    );

    res
      .status(200)
      .json({
        message: "Dislike registered successfully",
        num_likes,
        num_dislikes,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { likeAnswer, dislikeAnswer };