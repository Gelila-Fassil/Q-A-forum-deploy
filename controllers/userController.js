// db connection
const dbConnection = require("../db/Config");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const zxcvbn = require("zxcvbn");

// register logic 
async function register(req, res) {
  const { firstName, lastName, username, email, password } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all required fields" });
  }

  try {
    // Check if the email already exists
    const [emailExists] = await dbConnection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (emailExists.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "Email already exists" });
    }

    // Check if the username already exists
    const [usernameExists] = await dbConnection.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (usernameExists.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "Username already exists" });
    }

    // Check password strength using zxcvbn
    const passwordStrength = zxcvbn(password);

    if (passwordStrength.score < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Password is too weak. Please choose a stronger password.",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const [newUser] = await dbConnection.query(
      "INSERT INTO users (firstname, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)",
      [firstName, lastName, username, email, hashedPassword]
    );

    // Generate JWT token
    const user_id = newUser.insertId; // Assuming the insertId gives the new user's ID
    const token = jwt.sign({ username, user_id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Return the token and user info
    return res.status(StatusCodes.CREATED).json({
      msg: "User registered successfully.",
      token,
      user: {
        firstName,
        lastName,
        username,
        email,
      },
    });
  } catch (error) {
    console.log(error);
    // Provide error feedback to the user
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Error registering user. Please try again later." });
  }
}


// Other imports and functions...

// Get User Profile Logic
async function getUserProfile(req, res) {
  const { username } = req.params;

  try {
    // Query to fetch user details excluding sensitive information like password
    const [rows] = await dbConnection.query(
      "SELECT username, firstname, lastname, email, phone_number, address, gender, profile_picture FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
    }

    // Assuming the profile_picture is stored as a BLOB, we'll convert it back to a URL-compatible format if needed
    const user = rows[0];
    return res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Error fetching user profile" });
  }
}



// Update User Profile Logic
const multer = require('multer');
// Setup Multer for file uploads (storing files in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Update User Profile Logic
async function updateUserProfile(req, res) {
  const { username } = req.params;
  const { firstname, lastname, email, phone, address, gender } = req.body;

  if (!firstname || !lastname || !email) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please provide all required fields" });
  }

  try {
    // Handle profile picture if provided
    let profilePictureBuffer = null;
    if (req.file) {
      profilePictureBuffer = req.file.buffer;
    }

    // Update the user's profile in the database
    await dbConnection.query(
      `UPDATE users SET 
        firstname = ?, 
        lastname = ?, 
        email = ?, 
        phone_number = ?, 
        address = ?, 
        gender = ?, 
        profile_picture = ?
        WHERE username = ?`,
      [firstname, lastname, email, phone, address, gender, profilePictureBuffer, username]
    );

    return res.status(StatusCodes.OK).json({ msg: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Error updating profile' });
  }
}



// login logic
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Please enter all required fields" });
  }
  const { rateLimit } = res.req;

  const remaining = rateLimit.remaining;

  try {
    const [user] = await dbConnection.query(
      "SELECT username,id,password FROM users WHERE email=? ",
      [email]
    );
    if (user.length === 0) {
      if (remaining > 5) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          msg: "Unauthorized access!",
        });
      }
      if ((remaining > 0) & (remaining <= 5)) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          msg: `Unauthorized access. Please check your email and password. You have ${remaining} attempts remaining.`,
        });
      } else if (remaining === 0) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          msg: "Unauthorized access. This is your final attempt to enter the correct email and password.",
        });
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          msg: "Maximum login attempts exceeded. Please try again later.",
        });
      }
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      if (remaining > 5) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          msg: "Invalid email or password!",
        });
      }
      if ((remaining > 0) & (remaining <= 5)) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          msg: `Invalid email or password, your remaining attempt is ${remaining}`,
        });
      } else if (remaining === 0) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          msg: "Invalid email or password. This is your final attempt to enter the correct email and password.",
        });
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          msg: "Maximum login attempts exceeded. Please try again later.",
        });
      }
    }

    const username = user[0].username;
    const user_id = user[0].id;
    const token = jwt.sign({ username, user_id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Provide feedback to the user
    return res
      .status(StatusCodes.OK)
      .json({ msg: "User login successful", token, username });
  } catch (error) {
    // Provide error feedback to the user
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong. Please try again later." });
  }
}

async function checkUser(req, res) {
  const user = req.user;
  const username = req.user.username;
  const user_id = req.user.user_id;

  // Provide feedback to the user
  res
    .status(StatusCodes.OK)
    .json({ msg: "Valid user", user, username, user_id });
}

module.exports = {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  checkUser,
};