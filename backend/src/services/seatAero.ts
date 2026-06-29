import axios from 'axios';

const BASE_URL = 'https://seats.aero/partnerapi';

function getHeaders() {
  if (!process.env.SEAT_AERO_API_KEY) {
    throw new Error('Seat.aero API key not configured. Set SEAT_AERO_API_KEY in .env');
  }
  return {
    'Partner-Authorization': process.env.SEAT_AERO_API_KEY,
    'Accept': 'application/json',
  };
}

export interface AwardAvailability {
  id: string;
  route: string;
  origin: string;
  destination: string;
  date: string;
  cabin: string;
  airline: string;
  partner: string;
  remainingSeats: number;
  pointsCost: number;
  taxesCash: number | null;
  taxesCurrency: string | null;
  isAvailable: boolean;
  source: string;
}

export interface AwardSearchParams {
  originCode: string;
  destinationCode: string;
  cabin?: string;
  startDate: string;
  endDate: string;
  take?: number;
}

const CABIN_MAP: Record<string, string> = {
  ECONOMY: 'economy',
  PREMIUM_ECONOMY: 'premium',
  BUSINESS: 'business',
  FIRST: 'first',
};

export async function searchAwardAvailability(params: AwardSearchParams): Promise<AwardAvailability[]> {
  const cabin = CABIN_MAP[params.cabin || 'ECONOMY'] || 'economy';

  try {
    const response = await axios.get(`${BASE_URL}/availability`, {
      headers: getHeaders(),
      params: {
        origin_airport: params.originCode,
        destination_airport: params.destinationCode,
        cabin,
        start_date: params.startDate,
        end_date: params.endDate,
        take: params.take || 50,
      },
    });

    const data = response.data;
    const availabilities: AwardAvailability[] = [];

    for (const item of data?.data || []) {
      availabilities.push({
        id: item.ID || `${item.Origin}-${item.Destination}-${item.Date}`,
        route: `${item.Origin}-${item.Destination}`,
        origin: item.Origin,
        destination: item.Destination,
        date: item.Date,
        cabin: item.Cabin || cabin,
        airline: item.Source || '',
        partner: item.Source || '',
        remainingSeats: item.RemainingSeats || 0,
        pointsCost: item.MileageCost || 0,
        taxesCash: item.TaxesCash || null,
        taxesCurrency: item.TaxesCurrency || null,
        isAvailable: (item.RemainingSeats || 0) > 0,
        source: item.Source || '',
      });
    }

    return availabilities.filter(a => a.isAvailable);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        throw new Error('Seat.aero API authentication failed. Check your API key.');
      }
      if (err.response?.status === 404) {
        return [];
      }
      console.error('Seat.aero API error:', err.response?.data || err.message);
    } else {
      console.error('Seat.aero error:', err);
    }
    return [];
  }
}

export async function getAwardPartners(): Promise<string[]> {
  try {
    const response = await axios.get(`${BASE_URL}/cached`, {
      headers: getHeaders(),
    });
    return response.data?.sources || [];
  } catch {
    return [];
  }
}
