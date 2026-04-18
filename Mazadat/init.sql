-- Initial database setup for Mazadat
-- This file runs automatically when the MySQL container starts

-- Make sure we're using the correct database
USE mazadat;

-- Create initial indexes and constraints
-- These are typically created by Hibernate, but having them here helps

-- Grant all privileges to the mazadat user
GRANT ALL PRIVILEGES ON mazadat.* TO 'mazadat_user'@'%';
FLUSH PRIVILEGES;

-- Show status
SELECT 'Mazadat database initialized successfully' as status;

