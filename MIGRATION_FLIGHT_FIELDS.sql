-- Migration: Add flight information fields to profiles table
-- Run this in your Supabase SQL Editor

-- Add flight-related columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS flight_number TEXT,
ADD COLUMN IF NOT EXISTS flight_iata TEXT,
ADD COLUMN IF NOT EXISTS departure_airport TEXT,
ADD COLUMN IF NOT EXISTS arrival_airport TEXT,
ADD COLUMN IF NOT EXISTS departure_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS arrival_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS airline_name TEXT,
ADD COLUMN IF NOT EXISTS has_seen_flight_modal BOOLEAN DEFAULT FALSE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_flight_number ON profiles(flight_number);
CREATE INDEX IF NOT EXISTS idx_profiles_departure_airport ON profiles(departure_airport);
CREATE INDEX IF NOT EXISTS idx_profiles_arrival_airport ON profiles(arrival_airport);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN (
  'flight_number',
  'flight_iata',
  'departure_airport',
  'arrival_airport',
  'departure_time',
  'arrival_time',
  'airline_name',
  'has_seen_flight_modal'
)
ORDER BY column_name;
