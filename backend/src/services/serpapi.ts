import axios from 'axios';
import type { FlightOffer, FlightSegment, CashSearchParams } from './amadeus';
import { getSetting, setSetting } from '../db/index';

function trackUsage() {
  const month = new Date().toISOString().slice(0, 7);
  const storedMonth = getSetting('serpapi_usage_month');
  const count = storedMonth === month ? parseInt(getSetting('serpapi_usage_count') || '0') + 1 : 1;
  setSetting('serpapi_usage_month', month);
  setSetting('serpapi_usage_count', count.toString());
}

export function getSerpApiUsage(): { count: number; month: string } {
  const month = new Date().toISOString().slice(0, 7);
  const storedMonth = getSetting('serpapi_usage_month');
  const count = storedMonth === month ? parseInt(getSetting('serpapi_usage_count') || '0') : 0;
  return { count, month };
}

const CABIN_CLASS_MAP: Record<string, number> = {
  ECONOMY: 1,
  PREMIUM_ECONOMY: 2,
  BUSINESS: 3,
  FIRST: 4,
};

function minutesToIso(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `PT${h > 0 ? `${h}H` : ''}${m > 0 ? `${m}M` : ''}` || 'PT0M';
}

function splitDateTime(dt: string): { date: string; time: string } {
  const [date, time = ''] = dt.split(' ');
  return { date, time: time.slice(0, 5) };
}

function parseFlightNumber(raw: string): { carrier: string; number: string } {
  const clean = raw.replace(/\s+/g, '');
  const match = clean.match(/^([A-Z0-9]{2})(\d+.*)$/);
  if (match) return { carrier: match[1], number: clean };
  return { carrier: clean.slice(0, 2), number: clean };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOffer(offer: any, params: CashSearchParams, idx: number): FlightOffer | null {
  try {
    const legs: unknown[] = offer.flights ?? [];
    if (!legs.length) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstSeg = legs[0] as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastSeg = legs[legs.length - 1] as any;

    const dep = splitDateTime(firstSeg.departure_airport?.time ?? '');
    const arr = splitDateTime(lastSeg.arrival_airport?.time ?? '');

    const { carrier, number: flightNum } = parseFlightNumber(firstSeg.flight_number ?? '');

    const segments: FlightSegment[] = legs.map((seg: any) => {
      const sd = splitDateTime(seg.departure_airport?.time ?? '');
      const sa = splitDateTime(seg.arrival_airport?.time ?? '');
      const { carrier: sc, number: sn } = parseFlightNumber(seg.flight_number ?? '');
      return {
        origin: seg.departure_airport?.id ?? '',
        destination: seg.arrival_airport?.id ?? '',
        departureAt: `${sd.date}T${sd.time}`,
        arrivalAt: `${sa.date}T${sa.time}`,
        carrier: sc,
        flightNumber: sn,
        duration: minutesToIso(seg.duration ?? 0),
      };
    });

    const price = typeof offer.price === 'number' ? offer.price : 0;
    const totalDuration = minutesToIso(offer.total_duration ?? 0);

    return {
      id: `serp-${params.originCode}-${params.destinationCode}-${params.departureDate}-${idx}`,
      airline: carrier,
      airlineName: firstSeg.airline ?? carrier,
      flightNumber: flightNum,
      origin: firstSeg.departure_airport?.id ?? params.originCode,
      destination: lastSeg.arrival_airport?.id ?? params.destinationCode,
      departureDate: dep.date,
      departureTime: dep.time,
      arrivalDate: arr.date,
      arrivalTime: arr.time,
      duration: totalDuration,
      stops: legs.length - 1,
      cabin: params.cabinClass,
      price,
      currency: 'USD',
      seatsAvailable: null,
      isRoundTrip: !!params.returnDate,
      returnDate: params.returnDate,
      segments,
    };
  } catch {
    return null;
  }
}

export async function searchFlightOffers(params: CashSearchParams): Promise<FlightOffer[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) {
    console.log('[SerpApi] SERPAPI_KEY not configured, skipping cash search');
    return [];
  }

  const query: Record<string, string | number> = {
    engine: 'google_flights',
    api_key: key,
    departure_id: params.originCode,
    arrival_id: params.destinationCode,
    outbound_date: params.departureDate,
    currency: params.currency || 'USD',
    hl: 'en',
    type: params.returnDate ? 1 : 2,
    travel_class: CABIN_CLASS_MAP[params.cabinClass] ?? 1,
    adults: params.adults,
  };

  if (params.returnDate) query.return_date = params.returnDate;
  if (params.airlineCodes?.length) query.include_airlines = params.airlineCodes.join(',');
  if (params.maxResults) query.max_price = 99999; // no direct count limit; filter after

  try {
    trackUsage();
    const resp = await axios.get('https://serpapi.com/search', {
      params: query,
      timeout: 15000,
    });

    const data = resp.data as Record<string, unknown>;
    const rawOffers = [
      ...((data.best_flights as unknown[]) || []),
      ...((data.other_flights as unknown[]) || []),
    ];

    const offers: FlightOffer[] = [];
    for (let i = 0; i < rawOffers.length; i++) {
      const mapped = mapOffer(rawOffers[i], params, i);
      if (mapped && mapped.price > 0) offers.push(mapped);
    }

    // Filter by airline if requested (SerpApi include_airlines is best-effort)
    const filtered = params.airlineCodes?.length
      ? offers.filter(o => params.airlineCodes!.includes(o.airline))
      : offers;

    return filtered.slice(0, params.maxResults || 20);
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number; data?: unknown } };
    if (axiosErr?.response?.status === 429) {
      console.warn('[SerpApi] Rate limited');
    } else {
      console.error('[SerpApi] Flight search error:', axiosErr?.response?.data || err);
    }
    return [];
  }
}

export type { FlightOffer, FlightSegment, CashSearchParams } from './amadeus';
