// AirLabs API Service
// API Documentation: https://airlabs.co/docs/flights

const AIRLABS_API_KEY = process.env.EXPO_PUBLIC_AIRLABS_API_KEY || "";
const AIRLABS_BASE_URL = "https://airlabs.co/api/v9";

export interface FlightData {
  flight_iata: string;
  flight_number: string;
  airline_name: string;
  airline_iata: string;
  dep_iata: string; // Departure airport IATA code
  arr_iata: string; // Arrival airport IATA code
  dep_time: string;
  arr_time: string;
  dep_estimated?: string;
  arr_estimated?: string;
  dep_actual?: string;
  arr_actual?: string;
  dep_terminal?: string | null;
  dep_gate?: string | null;
  arr_terminal?: string | null;
  arr_gate?: string | null;
  arr_baggage?: string | null;
  status: string;
  duration?: number; // Flight duration in minutes
  dep_delayed?: number | null; // Departure delay in minutes
  arr_delayed?: number | null; // Arrival delay in minutes
  delayed?: number | null; // Overall delay
  cs_airline_iata?: string; // Codeshare airline
  cs_flight_number?: string; // Codeshare flight number
  cs_flight_iata?: string; // Codeshare flight IATA
  dep_name?: string; // Departure airport name
  arr_name?: string; // Arrival airport name
  dep_city?: string;
  arr_city?: string;
  dep_country?: string;
  arr_country?: string;
}

export interface AirLabsResponse {
  response: FlightData;
}

/**
 * Fetch flight information from AirLabs API
 * @param flightNumber - Flight number (e.g., "DL1234" or "1234")
 * @returns Flight data or null if not found
 */
export async function fetchFlightInfo(
  flightNumber: string
): Promise<FlightData | null> {
  try {
    // Clean up flight number - remove spaces and convert to uppercase
    const cleanFlightNumber = flightNumber.trim().toUpperCase();

    // Build API URL
    const url = `${AIRLABS_BASE_URL}/flight?flight_iata=${cleanFlightNumber}&api_key=${AIRLABS_API_KEY}`;

    console.log("Fetching flight info for:", cleanFlightNumber);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `AirLabs API error: ${response.status} ${response.statusText}`
      );
    }

    const data: AirLabsResponse = await response.json();
    console.log("AirLabs response:", data.response);

    // Check if we got a result
    if (!data.response || !data.response.flight_iata) {
      console.log("No flight found for:", cleanFlightNumber);
      return null;
    }

    // Return the flight data
    const flight = data.response;
    console.log("Flight found:", flight);

    return flight;
  } catch (error) {
    console.error("Error fetching flight info:", error);
    throw error;
  }
}

/**
 * Parse flight number to extract airline code and number
 * @param flightNumber - Full flight number (e.g., "DL1234")
 * @returns Object with airline code and flight number
 */
export function parseFlightNumber(flightNumber: string): {
  airlineCode: string;
  number: string;
} {
  const cleaned = flightNumber.trim().toUpperCase();
  const match = cleaned.match(/^([A-Z]{2})(\d+)$/);

  if (match) {
    return {
      airlineCode: match[1],
      number: match[2],
    };
  }

  // If no airline code, assume it's just the number
  return {
    airlineCode: "",
    number: cleaned,
  };
}
