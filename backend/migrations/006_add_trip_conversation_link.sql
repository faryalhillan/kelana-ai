-- Add trip_id column to conversations table to link conversations to trips
ALTER TABLE conversations ADD COLUMN trip_id INTEGER;
ALTER TABLE conversations ADD CONSTRAINT fk_trip_id FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE;
CREATE INDEX idx_conversations_trip_id ON conversations(trip_id);

-- Add trip_preferences column to trips table for storing user refinement preferences
ALTER TABLE trips ADD COLUMN trip_preferences TEXT;
