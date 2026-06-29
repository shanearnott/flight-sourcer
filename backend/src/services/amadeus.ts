import Amadeus from 'amadeus';

let client: InstanceType<typeof Amadeus> | null = null;

function getClient(): InstanceType<typeof Amadeus> {
  if (!client) {
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      throw new Error('Amadeus API credentials not configured. Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in .env');
    }
    client = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET,
      hostname: (process.env.AMADEUS_HOSTNAME as 'test' | 'production') || 'test',
    });
  }
  return client;
}

export interface LocationResult {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
  subType: string;
}

export interface FlightOffer {
  id: string;
  airline: string;
  airlineName: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  cabin: string;
  price: number;
  currency: string;
  seatsAvailable: number | null;
  returnDate?: string;
  isRoundTrip: boolean;
  segments: FlightSegment[];
}

export interface FlightSegment {
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  carrier: string;
  flightNumber: string;
  duration: string;
}

export async function searchLocations(keyword: string): Promise<LocationResult[]> {
  const amadeus = getClient();
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'AIRPORT,CITY',
      view: 'LIGHT',
      page: { limit: 10 },
    });

    return (response.data as Record<string, unknown>[] || []).map((loc) => ({
      iataCode: loc.iataCode as string,
      name: loc.name as string,
      cityName: (loc.address as Record<string, string>)?.cityName || (loc.name as string),
      countryName: (loc.address as Record<string, string>)?.countryName || '',
      subType: loc.subType as string,
    }));
  } catch (err) {
    console.error('Amadeus location search error:', err);
    return [];
  }
}

export async function searchAirportsForCity(cityIata: string): Promise<LocationResult[]> {
  const amadeus = getClient();
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: cityIata,
      subType: 'AIRPORT',
      page: { limit: 20 },
    });
    return (response.data as Record<string, unknown>[] || []).map((loc) => ({
      iataCode: loc.iataCode as string,
      name: loc.name as string,
      cityName: (loc.address as Record<string, string>)?.cityName || '',
      countryName: (loc.address as Record<string, string>)?.countryName || '',
      subType: loc.subType as string,
    }));
  } catch {
    return [];
  }
}

export interface CashSearchParams {
  originCode: string;
  destinationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass: string;
  airlineCodes?: string[];
  maxResults?: number;
  currency?: string;
}

export async function searchFlightOffers(params: CashSearchParams): Promise<FlightOffer[]> {
  const amadeus = getClient();

  const queryParams: Record<string, unknown> = {
    originLocationCode: params.originCode,
    destinationLocationCode: params.destinationCode,
    departureDate: params.departureDate,
    adults: params.adults,
    travelClass: params.cabinClass,
    currencyCode: params.currency || 'USD',
    max: params.maxResults || 20,
  };

  if (params.returnDate) {
    queryParams.returnDate = params.returnDate;
  }

  if (params.airlineCodes && params.airlineCodes.length > 0) {
    queryParams.includedAirlineCodes = params.airlineCodes.join(',');
  }

  try {
    const response = await amadeus.shopping.flightOffersSearch.get(queryParams as Parameters<typeof amadeus.shopping.flightOffersSearch.get>[0]);
    const carriers: Record<string, string> = response.result?.dictionaries?.carriers || {};

    return (response.data as Record<string, unknown>[] || []).map((offer) => {
      const itineraries = offer.itineraries as Record<string, unknown>[];
      const firstItinerary = itineraries[0];
      const segments = (firstItinerary.segments as Record<string, unknown>[]);
      const firstSeg = segments[0];
      const lastSeg = segments[segments.length - 1];
      const dep = firstSeg.departure as Record<string, string>;
      const arr = lastSeg.arrival as Record<string, string>;
      const carrier = (firstSeg.carrierCode as string) || '';
      const price = offer.price as Record<string, unknown>;

      const mappedSegments: FlightSegment[] = segments.map((seg: Record<string, unknown>) => ({
        origin: (seg.departure as Record<string, string>).iataCode,
        destination: (seg.arrival as Record<string, string>).iataCode,
        departureAt: (seg.departure as Record<string, string>).at,
        arrivalAt: (seg.arrival as Record<string, string>).at,
        carrier: seg.carrierCode as string,
        flightNumber: `${seg.carrierCode}${seg.number}`,
        duration: seg.duration as string,
      }));

      return {
        id: offer.id as string,
        airline: carrier,
        airlineName: carriers[carrier] || carrier,
        flightNumber: `${firstSeg.carrierCode}${firstSeg.number}`,
        origin: dep.iataCode,
        destination: arr.iataCode,
        departureDate: dep.at.split('T')[0],
        departureTime: dep.at.split('T')[1]?.slice(0, 5) || '',
        arrivalDate: arr.at.split('T')[0],
        arrivalTime: arr.at.split('T')[1]?.slice(0, 5) || '',
        duration: firstItinerary.duration as string,
        stops: segments.length - 1,
        cabin: ((offer.travelerPricings as Record<string, unknown>[])?.[0]?.fareDetailsBySegment as Record<string, unknown>[])?.[0]?.cabin as string || params.cabinClass,
        price: parseFloat(price.grandTotal as string) || parseFloat(price.total as string),
        currency: params.currency || 'USD',
        seatsAvailable: (offer.numberOfBookableSeats as number) || null,
        isRoundTrip: itineraries.length > 1,
        returnDate: itineraries.length > 1 ? ((itineraries[1].segments as Record<string, unknown>[])[0].departure as Record<string, string>).at.split('T')[0] : undefined,
        segments: mappedSegments,
      };
    });
  } catch (err: unknown) {
    const amadeusErr = err as { description?: unknown; response?: { statusCode?: number } };
    if (amadeusErr?.response?.statusCode === 400) {
      return [];
    }
    console.error('Amadeus flight search error:', amadeusErr?.description || err);
    return [];
  }
}
