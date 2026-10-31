-- Run once so the users.password column can hold the salted hash (~100 chars).
-- Existing plain-text passwords keep working and are converted to hashes
-- automatically the next time each user logs in.
USE careerdb;
ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL;
