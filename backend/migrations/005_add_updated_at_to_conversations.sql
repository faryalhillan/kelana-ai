-- Migration: 005_add_updated_at_to_conversations
-- Adds updated_at timestamp to conversations table

ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have updated_at equal to created_at
UPDATE conversations
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Make the column NOT NULL after setting values
ALTER TABLE conversations
    ALTER COLUMN updated_at SET NOT NULL;

-- Create a trigger to automatically update updated_at on message creation
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();
