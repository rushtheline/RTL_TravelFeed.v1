# Flight Feature Troubleshooting

## Issue: Airport selector still disabled after entering flight number

### Root Cause

The database doesn't have the new flight-related columns yet.

### Solution

1. **Run the database migration**:

   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `MIGRATION_FLIGHT_FIELDS.sql`
   - Click "Run" to execute the migration

2. **Verify the migration**:

   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'profiles'
   AND column_name LIKE '%flight%' OR column_name = 'has_seen_flight_modal';
   ```

3. **Test the flow**:
   - Clear app data/cache or use a new user
   - Enter a valid flight number (e.g., "KE6847")
   - Verify flight data is saved
   - Check that airport selector becomes enabled
   - Verify only departure/arrival airports appear in selector

## Issue: Flight information not displaying in modal

### Possible Causes

1. Profile not refreshed after saving flight data
2. Database columns missing
3. Flight data not saved correctly

### Debug Steps

1. **Check if data was saved**:

   ```sql
   SELECT id, username, flight_number, departure_airport, arrival_airport, airline_name
   FROM profiles
   WHERE id = 'your-user-id';
   ```

2. **Check console logs**:

   - Look for "AirLabs response:" in console
   - Verify flight data structure matches expected format

3. **Verify profile refresh**:
   - Profile should refresh BEFORE modal closes
   - Check `FeedScreen.tsx` line ~595

## Issue: API returns no flight data

### Possible Causes

1. Invalid API key
2. Flight number format incorrect
3. Flight not in AirLabs database
4. API rate limit exceeded

### Solutions

1. **Check API key**:

   - Verify `.env` file exists with `EXPO_PUBLIC_AIRLABS_API_KEY`
   - Key should be valid and not expired
   - Check https://airlabs.co/ dashboard

2. **Flight number format**:

   - Should include airline code: "DL1234", "AA567", "KE6847"
   - Not just numbers: "1234" (may work but less reliable)

3. **Test with known flight**:

   - Use a recent/current flight
   - Check flight exists on https://www.flightradar24.com/

4. **Check rate limits**:
   - Free tier: 1000 requests/month
   - Check your usage in AirLabs dashboard

## Expected Flow

1. **First Login**:

   - Modal appears automatically
   - User enters flight number
   - API fetches flight data
   - Data saved to profile
   - Profile refreshed
   - Modal closes
   - Success alert shows
   - Airport selector enabled with 2 airports

2. **Subsequent Opens**:
   - Click flight icon in header
   - Modal shows saved flight information
   - Flight number, airline, airports, times displayed
   - No input fields shown
   - User can close modal

## Database Schema

Required columns in `profiles` table:

```sql
flight_number TEXT
flight_iata TEXT
departure_airport TEXT
arrival_airport TEXT
departure_time TIMESTAMPTZ
arrival_time TIMESTAMPTZ
airline_name TEXT
has_seen_flight_modal BOOLEAN DEFAULT FALSE
```

## API Response Format

Expected from AirLabs:

```json
{
  "response": {
    "flight_iata": "KE6847",
    "flight_number": "6847",
    "airline_name": "Korean Air",
    "airline_iata": "KE",
    "dep_iata": "ATL",
    "arr_iata": "BTR",
    "dep_time": "2025-11-29 17:22",
    "arr_time": "2025-11-29 17:59",
    "status": "landed"
  }
}
```
