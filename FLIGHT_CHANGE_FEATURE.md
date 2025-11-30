# Flight Change/Reset Feature

## Overview

Users can now clear their saved flight information and enter a new flight number.

## User Flow

### Viewing Saved Flight Information

1. User clicks the flight icon in the header
2. Modal opens showing their saved flight details:
   - Flight number and airline
   - Departure/arrival airports with times
   - Gate information (Terminal & Gate numbers)
   - Flight duration
   - Flight status (Landed, Delayed, etc.)
   - Codeshare information (if applicable)
   - Delay information (if applicable)

### Changing Flight Number

1. At the bottom of the flight information display, user sees "Change Flight Number" button
2. User clicks the button
3. Confirmation dialog appears: "Are you sure you want to clear your current flight information? You'll need to enter a new flight number."
4. User confirms by clicking "Clear" (or cancels)
5. All flight data is cleared from the database
6. Profile is refreshed
7. Modal closes with success message
8. User can now click the flight icon again to enter a new flight number

## Technical Implementation

### Database Changes

All flight-related fields in the `profiles` table are set to `NULL` when clearing:

- `flight_number`
- `flight_iata`
- `departure_airport`
- `arrival_airport`
- `departure_time`
- `arrival_time`
- `airline_name`
- `flight_status`
- `dep_gate`
- `arr_gate`
- `dep_terminal`
- `arr_terminal`
- `flight_duration`
- `dep_delayed`
- `arr_delayed`
- `codeshare_airline`
- `codeshare_flight`

### UI Components

**FlightInfoModal.tsx:**

- Added `handleClearFlight()` function
- Shows "Change Flight Number" button when flight data exists
- Confirmation dialog before clearing
- Calls `onSubmit("", null)` to trigger clear action

**FeedScreen.tsx:**

- Updated `handleFlightInfoSubmit()` to handle empty flight data
- Checks for `flightNumber === "" && flightData === null`
- Clears all flight fields in database
- Refreshes profile
- Shows success alert

### Button Styling

- Subtle gray button with border
- Positioned below flight details
- Clear visual separation from other content
- Non-destructive appearance (not red) until confirmation

## User Benefits

1. **Flexibility**: Users can change flights if plans change
2. **Multiple Trips**: Users can update for different flights on different days
3. **Error Correction**: Users can fix mistakes in flight number entry
4. **Fresh Start**: Clear data and start over if needed

## Safety Features

1. **Confirmation Dialog**: Prevents accidental clearing
2. **Destructive Action Warning**: Clear button in dialog is marked as destructive (red)
3. **Success Feedback**: User gets confirmation that data was cleared
4. **Immediate Refresh**: Profile updates immediately so airport selector reflects changes

## Future Enhancements

Potential improvements:

- Save flight history (multiple flights)
- Auto-clear flight data after flight lands + 24 hours
- Quick switch between saved flights
- Edit flight details without full reset
