import axios from 'axios';
import { searchAirports } from '../data/airports';
import type { LocationResult } from './amadeus';

interface AviationStackAirport {
  airport_name: string;
  iata_code: string;
  city_iata_code: string;
  country_name: string;
}

export async function searchLocations(keyword: string): Promise<LocationResult[]> {
  const staticResults = searchAirports(keyword, 10);

  const mapped: LocationResult[] = staticResults.map(a => ({
    iataCode: a.iata,
    name: a.name,
    cityName: a.city,
    countryName: a.country,
    subType: 'AIRPORT',
  }));

  if (mapped.length >= 3 || !process.env.AVIATIONSTACK_KEY) {
    return mapped;
  }

  // Supplement with AviationStack for obscure airports not in static DB
  try {
    const protocol = 'http'; // free tier is HTTP-only
    const resp = await axios.get(`${protocol}://api.aviationstack.com/v1/airports`, {
      params: {
        access_key: process.env.AVIATIONSTACK_KEY,
        search: keyword,
        limit: 10,
      },
      timeout: 5000,
    });

    const data = resp.data as { data?: AviationStackAirport[] };
    const apiAirports = data.data || [];
    const existingCodes = new Set(mapped.map(r => r.iataCode));

    for (const ap of apiAirports) {
      if (!ap.iata_code || existingCodes.has(ap.iata_code)) continue;
      existingCodes.add(ap.iata_code);
      mapped.push({
        iataCode: ap.iata_code,
        name: ap.airport_name,
        cityName: ap.city_iata_code || ap.airport_name,
        countryName: ap.country_name,
        subType: 'AIRPORT',
      });
    }
  } catch (err) {
    console.warn('[AviationStack] Supplemental search failed:', (err as Error).message);
  }

  return mapped.slice(0, 10);
}

export type { LocationResult } from './amadeus';
