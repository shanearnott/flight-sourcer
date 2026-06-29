export interface Region {
  id: string;
  name: string;
  airports: Array<{ code: string; city: string }>;
  keywords: string[];
}

export const REGIONS: Region[] = [
  // Australia
  {
    id: 'au-east-coast',
    name: 'Australian East Coast',
    airports: [
      { code: 'SYD', city: 'Sydney' },
      { code: 'MEL', city: 'Melbourne' },
      { code: 'BNE', city: 'Brisbane' },
    ],
    keywords: ['australian east coast', 'east coast australia', 'aus east'],
  },
  {
    id: 'au-major',
    name: 'Australia Major Cities',
    airports: [
      { code: 'SYD', city: 'Sydney' },
      { code: 'MEL', city: 'Melbourne' },
      { code: 'BNE', city: 'Brisbane' },
      { code: 'PER', city: 'Perth' },
      { code: 'ADL', city: 'Adelaide' },
    ],
    keywords: ['australia major', 'all australia', 'aus major'],
  },

  // United States
  {
    id: 'us-west-coast',
    name: 'US West Coast',
    airports: [
      { code: 'LAX', city: 'Los Angeles' },
      { code: 'SFO', city: 'San Francisco' },
      { code: 'SEA', city: 'Seattle' },
      { code: 'SAN', city: 'San Diego' },
      { code: 'PDX', city: 'Portland' },
    ],
    keywords: ['us west coast', 'west coast', 'pacific coast', 'pacific northwest', 'california'],
  },
  {
    id: 'us-east-coast',
    name: 'US East Coast',
    airports: [
      { code: 'JFK', city: 'New York' },
      { code: 'BOS', city: 'Boston' },
      { code: 'DCA', city: 'Washington DC' },
      { code: 'MIA', city: 'Miami' },
      { code: 'ATL', city: 'Atlanta' },
    ],
    keywords: ['us east coast', 'east coast', 'eastern seaboard'],
  },
  {
    id: 'new-york',
    name: 'New York Area',
    airports: [
      { code: 'JFK', city: 'New York' },
      { code: 'LGA', city: 'New York' },
      { code: 'EWR', city: 'Newark' },
    ],
    keywords: ['new york area', 'new york airports', 'nyc airports', 'greater new york'],
  },
  {
    id: 'us-southwest',
    name: 'US Southwest',
    airports: [
      { code: 'LAX', city: 'Los Angeles' },
      { code: 'LAS', city: 'Las Vegas' },
      { code: 'PHX', city: 'Phoenix' },
      { code: 'SAN', city: 'San Diego' },
    ],
    keywords: ['us southwest', 'southwest usa', 'southwest us'],
  },

  // United Kingdom & Europe
  {
    id: 'london',
    name: 'London Airports',
    airports: [
      { code: 'LHR', city: 'London' },
      { code: 'LGW', city: 'London' },
      { code: 'STN', city: 'London' },
      { code: 'LTN', city: 'London' },
      { code: 'LCY', city: 'London' },
    ],
    keywords: ['london airports', 'london area', 'greater london'],
  },
  {
    id: 'paris',
    name: 'Paris Airports',
    airports: [
      { code: 'CDG', city: 'Paris' },
      { code: 'ORY', city: 'Paris' },
    ],
    keywords: ['paris airports', 'greater paris'],
  },
  {
    id: 'eu-hubs',
    name: 'Western Europe Hubs',
    airports: [
      { code: 'LHR', city: 'London' },
      { code: 'CDG', city: 'Paris' },
      { code: 'AMS', city: 'Amsterdam' },
      { code: 'FRA', city: 'Frankfurt' },
      { code: 'ZUR', city: 'Zurich' },
    ],
    keywords: ['western europe', 'europe hubs', 'west europe'],
  },
  {
    id: 'scandinavia',
    name: 'Scandinavia',
    airports: [
      { code: 'CPH', city: 'Copenhagen' },
      { code: 'ARN', city: 'Stockholm' },
      { code: 'OSL', city: 'Oslo' },
      { code: 'HEL', city: 'Helsinki' },
    ],
    keywords: ['scandinavia', 'nordic', 'nordics'],
  },

  // Asia
  {
    id: 'tokyo',
    name: 'Tokyo Airports',
    airports: [
      { code: 'NRT', city: 'Tokyo' },
      { code: 'HND', city: 'Tokyo' },
    ],
    keywords: ['tokyo airports', 'greater tokyo'],
  },
  {
    id: 'japan',
    name: 'Japan Major Cities',
    airports: [
      { code: 'NRT', city: 'Tokyo' },
      { code: 'HND', city: 'Tokyo' },
      { code: 'KIX', city: 'Osaka' },
      { code: 'NGO', city: 'Nagoya' },
      { code: 'CTS', city: 'Sapporo' },
    ],
    keywords: ['japan major', 'japan cities', 'all japan'],
  },
  {
    id: 'southeast-asia',
    name: 'Southeast Asia',
    airports: [
      { code: 'BKK', city: 'Bangkok' },
      { code: 'SIN', city: 'Singapore' },
      { code: 'KUL', city: 'Kuala Lumpur' },
      { code: 'CGK', city: 'Jakarta' },
      { code: 'MNL', city: 'Manila' },
    ],
    keywords: ['southeast asia', 'sea', 'south east asia', 'asean'],
  },

  // Middle East
  {
    id: 'gulf',
    name: 'Gulf / Middle East',
    airports: [
      { code: 'DXB', city: 'Dubai' },
      { code: 'DOH', city: 'Doha' },
      { code: 'AUH', city: 'Abu Dhabi' },
      { code: 'KWI', city: 'Kuwait' },
      { code: 'BAH', city: 'Bahrain' },
    ],
    keywords: ['gulf', 'middle east', 'uae', 'dubai area'],
  },

  // Canada
  {
    id: 'canada-west',
    name: 'Canada West',
    airports: [
      { code: 'YVR', city: 'Vancouver' },
      { code: 'YYC', city: 'Calgary' },
      { code: 'YEG', city: 'Edmonton' },
    ],
    keywords: ['canada west', 'western canada'],
  },
  {
    id: 'canada-east',
    name: 'Canada East',
    airports: [
      { code: 'YYZ', city: 'Toronto' },
      { code: 'YUL', city: 'Montreal' },
      { code: 'YOW', city: 'Ottawa' },
      { code: 'YHZ', city: 'Halifax' },
    ],
    keywords: ['canada east', 'eastern canada'],
  },
];

export function matchRegions(query: string): Region[] {
  if (query.length < 3) return [];
  const q = query.toLowerCase().trim();
  return REGIONS.filter(r => r.keywords.some(kw => kw.includes(q) || q.includes(kw)));
}
