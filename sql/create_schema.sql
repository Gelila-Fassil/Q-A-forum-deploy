-- Use the created database
USE evangadi_forum;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20), -- Add phone number
    address VARCHAR(255), -- Add address
    gender ENUM('male', 'female', 'other'), -- Add gender
    profile_picture BLOB, -- Change profile picture to BLOB to store binary data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Create the categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create the questions table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id VARCHAR(50) NOT NULL UNIQUE, 
    user_username VARCHAR(50) NOT NULL,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_username) REFERENCES users(username)
);

-- Link questions to categories
CREATE TABLE IF NOT EXISTS question_categories (
    question_id VARCHAR(50),
    category_id INT,
    FOREIGN KEY (question_id) REFERENCES questions(question_id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    PRIMARY KEY (question_id, category_id)
);

-- Create the answers table
CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    answer_id VARCHAR(50) NOT NULL UNIQUE, 
    question_id VARCHAR(50) NOT NULL,
    user_username VARCHAR(50) NOT NULL,
    answer TEXT NOT NULL,
    attachment_url VARCHAR(255),
    attachment_type ENUM('image', 'pdf', 'doc', 'link') DEFAULT 'link',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(question_id),
    FOREIGN KEY (user_username) REFERENCES users(username)
);

-- Create the answer likes table
CREATE TABLE answer_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_username VARCHAR(255) NOT NULL,
    answer_id VARCHAR(50) NOT NULL,
    liked BOOLEAN DEFAULT FALSE,
    disliked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_username) REFERENCES users(username),
    FOREIGN KEY (answer_id) REFERENCES answers(answer_id)
);

-- Create the shares table
CREATE TABLE IF NOT EXISTS shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_username VARCHAR(50),
    answer_id VARCHAR(50),
    liked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_username) REFERENCES users(username),
    FOREIGN KEY (answer_id) REFERENCES answers(answer_id),
    UNIQUE (user_username, answer_id)
);

-- Create the shares table
CREATE TABLE IF NOT EXISTS shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_username VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) DEFAULT NULL,
    answer_id VARCHAR(50) DEFAULT NULL,
    platform ENUM('facebook', 'twitter', 'linkedin', 'email', 'other') NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_username) REFERENCES users(username),
    FOREIGN KEY (question_id) REFERENCES questions(question_id),
    FOREIGN KEY (answer_id) REFERENCES answers(answer_id),
    CHECK (
        (question_id IS NOT NULL AND answer_id IS NULL) OR 
        (question_id IS NULL AND answer_id IS NOT NULL)
    )
);

-- Indexes for optimization
CREATE INDEX idx_title ON questions(title);
CREATE INDEX idx_description ON questions(description);