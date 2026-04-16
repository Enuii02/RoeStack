CREATE DATABASE IF NOT EXISTS RoeStack;
USE RoeStack;

-- USERS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  role VARCHAR(30) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  is_mod BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, role, email, password_hash, bio, is_mod) VALUES
('alice', 'Student', 'alice@example.com', 'demo_hash', 'Enjoys campus life.', TRUE),
('bob', 'Student', 'bob@example.com', 'demo_hash', 'Coffee enthusiast.', FALSE),
('charlie', 'Student', 'charlie@example.com', 'demo_hash', 'Tech and gaming.', FALSE);


-- COMMUNITIES
CREATE TABLE communities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL,
  description TEXT,
  status ENUM('pending','active','banned') DEFAULT 'pending',
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO communities (name, description, status, created_by) VALUES
('Technology', 'Discuss tech topics.', 'active', 1),
('Gaming', 'Talk about games.', 'active', 2),
('General', 'General discussions.', 'active', 1);


-- POSTS
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  vote_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  user_id INT NOT NULL,
  community_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO posts (title, content, user_id, community_id) VALUES
('Welcome to RoeStack', 'This is the first demo post.', 1, 1),
('Best study spots?', 'Any quiet places recommended?', 2, 3),
('Favourite games right now?', 'Looking for suggestions.', 3, 2);


-- USER FOLLOW COMMUNITY
CREATE TABLE userFollowCommunity (
  user_id INT NOT NULL,
  community_id INT NOT NULL,
  created_at DATE DEFAULT CURRENT_DATE
);

INSERT INTO userFollowCommunity VALUES
(1,1,CURRENT_DATE),
(2,2,CURRENT_DATE),
(3,3,CURRENT_DATE);


-- VOTES
CREATE TABLE vote (
  user_id INT NOT NULL,
  post_id INT,
  comment_id INT,
  positive BOOLEAN NOT NULL,
  UNIQUE KEY unique_user_post (user_id, post_id)
);

INSERT INTO vote (user_id, post_id, positive) VALUES
(1,1,TRUE),
(2,1,FALSE),
(3,2,TRUE);