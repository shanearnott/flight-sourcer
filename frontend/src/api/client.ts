import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const api = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
});

// Types
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
  isRoundTrip: boolean;
  returnDate?: string;
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

export interface AwardOffer {
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

export interface SavedSearch {
  id: string;
  name: string;
  origin_label: string;
  destination_label: string;
  origin_airports: string[];
  destination_airports: string[];
  trip_type: 'weekend' | 'week' | 'custom';
  window_start: string;
  window_end: string;
  min_nights: number;
  max_nights: number;
  cabin_class: string[];
  adults: number;
  airline_codes: string[] | null;
  search_mode: 'cash' | 'award' | 'both';
  alert_email: string | null;
  alert_threshold_cash: number | null;
  alert_threshold_points: number | null;
  is_active: number;
  created_at: string;
  last_checked: string | null;
  snapshot_count?: number;
  all_time_low_cash?: number;
  latest_cash?: number;
  all_time_low_points?: number;
}

export interface PriceSnapshot {
  date: string;
  snapshot_type: string;
  min_price: number;
  max_price: number;
  avg_price: number;
  checks: number;
}

export interface Airline {
  code: string;
  name: string;
  alliance: 'Star Alliance' | 'oneworld' | 'SkyTeam' | null;
  ffProgram: string | null;
  region: string;
}

export interface DashboardStats {
  activeSearches: number;
  alertsToday: number;
  totalSnapshots: number;
  recentLows: Array<{
    name: string;
    origin_label: string;
    destination_label: string;
    min_price: number;
    snapshot_type: string;
    checked_at: string;
  }>;
}

// API functions
export const searchesApi = {
  list: () => api.get<SavedSearch[]>('/searches').then(r => r.data),
  get: (id: string) => api.get<SavedSearch>(`/searches/${id}`).then(r => r.data),
  create: (data: Omit<SavedSearch, 'id' | 'created_at' | 'last_checked' | 'snapshot_count' | 'all_time_low_cash' | 'latest_cash' | 'all_time_low_points' | 'is_active'>) =>
    api.post<SavedSearch>('/searches', data).then(r => r.data),
  update: (id: string, data: Partial<SavedSearch>) =>
    api.put<SavedSearch>(`/searches/${id}`, data).then(r => r.data),
  toggle: (id: string) => api.patch<{ is_active: number }>(`/searches/${id}/toggle`).then(r => r.data),
  cancel: (id: string) => api.post(`/searches/${id}/cancel`).then(r => r.data),
  estimate: (id: string) => api.get<{ serpapi_calls: number }>(`/searches/${id}/estimate`).then(r => r.data),
  delete: (id: string) => api.delete(`/searches/${id}`),
};

export const flightsApi = {
  locations: (q: string) => api.get<LocationResult[]>('/flights/locations', { params: { q } }).then(r => r.data),
  search: (params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults?: number;
    cabinClass?: string;
    airlineCodes?: string[];
    mode?: 'cash' | 'award' | 'both';
  }) => api.post<{ cash?: FlightOffer[]; award?: AwardOffer[] }>('/flights/search', params).then(r => r.data),
};

export const airlinesApi = {
  list: () => api.get<Airline[]>('/airlines').then(r => r.data),
  alliances: () => api.get<Array<{ name: string; airlines: Airline[] }>>('/airlines/alliances').then(r => r.data),
  ffPrograms: () => api.get<Array<{ program: string; airlines: Airline[] }>>('/airlines/ff-programs').then(r => r.data),
};

export interface AppSettings {
  alert_email: string | null;
}

export interface ApiStatus {
  serpapi: boolean;
  serpapi_used: number;
  serpapi_limit: number;
  aviationstack: boolean;
  seat_aero: boolean;
  smtp: boolean;
}

export const settingsApi = {
  get: () => api.get<AppSettings>('/settings').then(r => r.data),
  save: (data: Partial<AppSettings>) => api.put<{ ok: boolean }>('/settings', data).then(r => r.data),
  status: () => api.get<ApiStatus>('/settings/status').then(r => r.data),
};

export const demoApi = {
  seed: () => api.post<{ seeded: boolean; searches?: number; message?: string }>('/demo/seed').then(r => r.data),
  clear: () => api.delete<{ cleared: boolean; removed: number }>('/demo/clear').then(r => r.data),
};

export const historyApi = {
  get: (searchId: string, type?: 'cash' | 'award', days?: number) =>
    api.get<PriceSnapshot[]>(`/history/${searchId}`, { params: { type, days } }).then(r => r.data),
  latest: (searchId: string, type?: 'cash' | 'award') =>
    api.get<{ results: FlightOffer[] | AwardOffer[]; checked_at: string; min_price: number; max_price: number }>(
      `/history/${searchId}/latest`, { params: { type } }
    ).then(r => r.data),
  alerts: (searchId: string) =>
    api.get(`/history/${searchId}/alerts`).then(r => r.data),
  stats: () => api.get<DashboardStats>('/history/stats/overview').then(r => r.data),
};
