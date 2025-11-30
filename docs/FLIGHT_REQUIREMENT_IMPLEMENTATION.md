# Flight Number Requirement Implementation

## Overview

Users must enter their flight number before they can select an airport. The system fetches flight data from the AirLabs API and restricts airport selection to only the departure and arrival airports associated with their flight.

## Implementation Details

### 1. Profile Schema Updates

Added the following fields to the `Profile` interface in `types/database.types.ts`:

- `flight_number`: User's flight number (e.g., "DL1234")
- `flight_iata`: IATA flight code from API
- `departure_airport`: Departure airport IATA code (e.g., "ATL")
- `arrival_airport`: Arrival airport IATA code (e.g., "LAX")
- `departure_time`: Scheduled departure time
- `arrival_time`: Scheduled arrival time
- `airline_name`: Airline name
- `has_seen_flight_modal`: Flag to track if user has seen the flight info modal

### 2. AirLabs API Integration

Created `lib/airlabs.ts` service to:

- Fetch real-time flight information from AirLabs API (https://airlabs.co/api/v9/flight)
- Parse flight numbers and extract airline codes
- Return structured flight data including airports, times, and airline info

**API Key Setup:**

1. Get an API key from https://airlabs.co/
2. Create a `.env` file in the project root
3. Add: `EXPO_PUBLIC_AIRLABS_API_KEY=your_key_here`

### 3. Flight Info Modal Updates

Updated `components/FlightInfoModal.tsx` to:

- Call AirLabs API when user enters flight number
- Show loading state while fetching flight data
- Display error messages if flight not found
- Pass flight data back to parent component
- Allow users to skip if they don't have flight info

### 4. Airport Selector Restrictions

Modified `components/AirportSelector.tsx` to:

- Accept `departureAirport` and `arrivalAirport` props
- Filter airports to only show flight-related airports when flight data exists
- Show all airports if no flight data is available
- Disable selector when `disabled` prop is true
- Display visual feedback (opacity) when disabled

### 5. Header Component Integration

Updated `components/Header.tsx` to:

- Pass flight data (departure/arrival airports) to AirportSelector
- Disable airport selector when user has NOT entered flight number
- Enable selector only after flight number is entered

### 6. Feed Screen Flow

Updated `screens/FeedScreen.tsx` to:

- Handle flight data submission from modal
- Save all flight data fields to user profile
- Refresh profile after flight info is saved
- Show success message with available airports
- Display modal on first login

## User Flow

1. **First Login**: User sees Flight Information modal
2. **Enter Flight Number**: User enters flight number (e.g., "DL1234")
3. **API Fetch**: System calls AirLabs API to get flight details
4. **Success**: Flight data is saved to profile
5. **Airport Selection Unlocked**: User can now select from departure/arrival airports only
6. **Restricted Selection**: Airport dropdown only shows the 2 airports from their flight

## Error Handling

- **Flight Not Found**: User can retry or skip
- **API Error**: User can retry or skip
- **No Internet**: Error message with retry option
- **Skip Option**: Users can skip and enter flight info later

## Database Migration Required

Add these columns to the `profiles` table in Supabase:

```sql
ALTER TABLE profiles
ADD COLUMN flight_number TEXT,
ADD COLUMN flight_iata TEXT,
ADD COLUMN departure_airport TEXT,
ADD COLUMN arrival_airport TEXT,
ADD COLUMN departure_time TIMESTAMPTZ,
ADD COLUMN arrival_time TIMESTAMPTZ,
ADD COLUMN airline_name TEXT,
ADD COLUMN has_seen_flight_modal BOOLEAN DEFAULT FALSE;
```

## Testing Checklist

- [ ] User cannot select airport without flight number
- [ ] Flight info modal appears on first login
- [ ] AirLabs API successfully fetches flight data
- [ ] Airport selector shows only departure/arrival airports after flight entry
- [ ] Profile is updated with all flight data fields
- [ ] Error handling works for invalid flight numbers
- [ ] Skip functionality works correctly
- [ ] Airport selector is visually disabled before flight entry
- [ ] Success message displays correct airport codes

## Environment Variables

Required in `.env` file:

```
EXPO_PUBLIC_AIRLABS_API_KEY=your_airlabs_api_key_here
```

## Notes

- AirLabs API has rate limits - check your plan
- Flight data is cached in user profile
- Users can update flight info by clicking the flight icon in header
- Confirmation code tab exists but doesn't have API support yet
