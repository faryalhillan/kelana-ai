-- Add theme_preference column to users table
ALTER TABLE users ADD COLUMN theme_preference VARCHAR(10) DEFAULT 'light' NOT NULL;

-- Valid values: 'light', 'dark', 'system'
