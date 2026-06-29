import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db/index';

const router = Router();
const DEMO_TAG = '[Demo]';

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(6, 0, 0, 0);
  return d.toISOString();
}

function dateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// Xorshift pseudo-random from a seed for reproducible price curves
function mkRand(seed: number) {
  let s = seed | 1;
  return (): number => {
    s ^= s << 13; s ^= s >> 17; s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

function mockCashResults(
  origin: string, dest: string,
  basePrice: number, currency: string,
  airline: string, airlineName: string, cabin: string,
): string {
  return JSON.stringify([1.0, 1.07, 1.14].map((f, i) => ({
    id: `demo-cash-${origin}-${dest}-${i}`,
    airline, airlineName,
    flightNumber: `${airline}${101 + i * 12}`,
    origin, destination: dest,
    departureDate: dateStr(30),
    departureTime: `${String(8 + i).padStart(2, '0')}:30`,
    arrivalDate: dateStr(31),
    arrivalTime: '07:45',
    duration: 'PT14H15M',
    stops: i === 2 ? 1 : 0,
    cabin,
    price: Math.round(basePrice * f),
    currency,
    seatsAvailable: 4 - i,
    isRoundTrip: true,
    returnDate: dateStr(34),
    segments: [],
  })));
}

function mockAwardResults(
  origin: string, dest: string,
  basePoints: number, airline: string,
): string {
  return JSON.stringify([0, 5000].map((bump, i) => ({
    id: `demo-award-${origin}-${dest}-${i}`,
    route: `${origin}-${dest}`,
    origin, destination: dest,
    date: dateStr(35),
    cabin: 'economy',
    airline, partner: airline,
    remainingSeats: 2 - i,
    pointsCost: basePoints + bump,
    taxesCash: 45,
    taxesCurrency: 'USD',
    isAvailable: true,
    source: 'seat.aero',
  })));
}

interface PriceConfig {
  cash?: { base: number; range: number; currency: string; airline: string; airlineName: string };
  award?: { base: number; range: number; airline: string };
  days: number;
}

interface SearchSeed {
  id: string;
  name: string;
  origin_label: string;
  destination_label: string;
  origin_airports: string;
  destination_airports: string;
  trip_type: string;
  window_start: string;
  window_end: string;
  min_nights: number;
  max_nights: number;
  cabin_class: string;
  adults: number;
  search_mode: string;
  alert_threshold_cash: number | null;
  alert_threshold_points: number | null;
  created_at: string;
  last_checked: string;
  price: PriceConfig;
}

const SEARCHES: SearchSeed[] = [
  {
    id: 'demo-syd-lax',
    name: `${DEMO_TAG} Sydney → Los Angeles`,
    origin_label: 'SYD · Sydney',
    destination_label: 'LAX · Los Angeles',
    origin_airports: '["SYD"]',
    destination_airports: '["LAX"]',
    trip_type: 'weekend',
    window_start: dateStr(0),
    window_end: dateStr(90),
    min_nights: 2, max_nights: 4,
    cabin_class: 'ECONOMY',
    adults: 1,
    search_mode: 'both',
    alert_threshold_cash: 1100,
    alert_threshold_points: 45000,
    created_at: daysAgoIso(90),
    last_checked: daysAgoIso(0),
    price: {
      cash: { base: 1280, range: 450, currency: 'AUD', airline: 'UA', airlineName: 'United Airlines' },
      award: { base: 47000, range: 14000, airline: 'UA' },
      days: 90,
    },
  },
  {
    id: 'demo-mel-lhr',
    name: `${DEMO_TAG} Melbourne → London`,
    origin_label: 'MEL · Melbourne',
    destination_label: 'LHR · London',
    origin_airports: '["MEL"]',
    destination_airports: '["LHR"]',
    trip_type: 'week',
    window_start: dateStr(0),
    window_end: dateStr(90),
    min_nights: 7, max_nights: 14,
    cabin_class: 'BUSINESS',
    adults: 2,
    search_mode: 'cash',
    alert_threshold_cash: 4800,
    alert_threshold_points: null,
    created_at: daysAgoIso(60),
    last_checked: daysAgoIso(0),
    price: {
      cash: { base: 5600, range: 2200, currency: 'AUD', airline: 'QF', airlineName: 'Qantas' },
      days: 60,
    },
  },
  {
    id: 'demo-syd-bkk',
    name: `${DEMO_TAG} Sydney → Bangkok`,
    origin_label: 'SYD · Sydney',
    destination_label: 'BKK · Bangkok',
    origin_airports: '["SYD"]',
    destination_airports: '["BKK"]',
    trip_type: 'custom',
    window_start: dateStr(0),
    window_end: dateStr(60),
    min_nights: 3, max_nights: 5,
    cabin_class: 'ECONOMY',
    adults: 1,
    search_mode: 'both',
    alert_threshold_cash: 520,
    alert_threshold_points: 36000,
    created_at: daysAgoIso(45),
    last_checked: daysAgoIso(0),
    price: {
      cash: { base: 590, range: 260, currency: 'AUD', airline: 'TG', airlineName: 'Thai Airways' },
      award: { base: 37000, range: 11000, airline: 'TG' },
      days: 45,
    },
  },
  {
    id: 'demo-bne-nrt',
    name: `${DEMO_TAG} Brisbane → Tokyo`,
    origin_label: 'BNE · Brisbane',
    destination_label: 'NRT · Tokyo',
    origin_airports: '["BNE"]',
    destination_airports: '["NRT","HND"]',
    trip_type: 'custom',
    window_start: dateStr(0),
    window_end: dateStr(90),
    min_nights: 5, max_nights: 7,
    cabin_class: 'ECONOMY',
    adults: 2,
    search_mode: 'award',
    alert_threshold_cash: null,
    alert_threshold_points: 42000,
    created_at: daysAgoIso(30),
    last_checked: daysAgoIso(0),
    price: {
      award: { base: 44000, range: 16000, airline: 'JL' },
      days: 30,
    },
  },
];

// POST /api/demo/seed
router.post('/seed', (_req, res) => {
  const { n } = db.prepare(`SELECT COUNT(*) as n FROM searches WHERE name LIKE ?`).get(`${DEMO_TAG}%`) as { n: number };
  if (n > 0) {
    res.json({ seeded: false, message: 'Demo data already present — clear it first.' });
    return;
  }

  const insertSearch = db.prepare(`
    INSERT INTO searches
      (id, name, origin_label, destination_label, origin_airports, destination_airports,
       trip_type, window_start, window_end, min_nights, max_nights, cabin_class, adults,
       airline_codes, search_mode, alert_email, alert_threshold_cash, alert_threshold_points,
       is_active, created_at, last_checked)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,NULL,?,?,1,?,?)
  `);

  const insertSnap = db.prepare(`
    INSERT INTO price_snapshots (id, search_id, checked_at, snapshot_type, results, min_price, max_price)
    VALUES (?,?,?,?,?,?,?)
  `);

  const insertAlert = db.prepare(`
    INSERT INTO alerts_log (id, search_id, sent_at, alert_type, price, details)
    VALUES (?,?,?,?,?,?)
  `);

  db.transaction(() => {
    for (const s of SEARCHES) {
      insertSearch.run(
        s.id, s.name, s.origin_label, s.destination_label,
        s.origin_airports, s.destination_airports,
        s.trip_type, s.window_start, s.window_end,
        s.min_nights, s.max_nights, s.cabin_class, s.adults,
        s.search_mode, s.alert_threshold_cash, s.alert_threshold_points,
        s.created_at, s.last_checked,
      );

      const rand = mkRand(s.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
      const origin = (JSON.parse(s.origin_airports) as string[])[0];
      const dest = (JSON.parse(s.destination_airports) as string[])[0];
      const pc = s.price;

      for (let day = pc.days; day >= 0; day--) {
        const t = (pc.days - day) / pc.days;
        // compound sine wave for natural-looking price variation
        const wave = Math.sin(t * Math.PI * 2.5) * 0.09 + Math.sin(t * Math.PI * 7.3) * 0.04;
        const checkedAt = daysAgoIso(day);

        if (pc.cash) {
          const { base, range, currency, airline, airlineName } = pc.cash;
          const factor = 1 + wave + (rand() - 0.5) * 0.14;
          const minP = Math.round(Math.max(base * 0.78, base * factor));
          const maxP = Math.round(minP + range * (0.6 + rand() * 0.8));
          const results = day === 0
            ? mockCashResults(origin, dest, minP, currency, airline, airlineName, s.cabin_class)
            : '[]';
          insertSnap.run(uuid(), s.id, checkedAt, 'cash', results, minP, maxP);
        }

        if (pc.award) {
          const { base, range, airline } = pc.award;
          const factor = 1 + wave * 0.5 + (rand() - 0.5) * 0.1;
          const minP = Math.round(base * factor / 1000) * 1000;
          const maxP = Math.round((minP + range * (0.5 + rand() * 0.9)) / 1000) * 1000;
          const results = day === 0
            ? mockAwardResults(origin, dest, minP, airline)
            : '[]';
          insertSnap.run(uuid(), s.id, checkedAt, 'award', results, minP, maxP);
        }
      }
    }

    // Demo alert history
    for (const a of [
      { sid: 'demo-syd-lax', daysAgo: 2,  type: 'cash',  price: 1089,  route: 'SYD → LAX' },
      { sid: 'demo-syd-lax', daysAgo: 14, type: 'award', price: 43000, route: 'SYD → LAX' },
      { sid: 'demo-syd-bkk', daysAgo: 1,  type: 'cash',  price: 514,   route: 'SYD → BKK' },
      { sid: 'demo-mel-lhr', daysAgo: 9,  type: 'cash',  price: 4720,  route: 'MEL → LHR' },
      { sid: 'demo-bne-nrt', daysAgo: 5,  type: 'award', price: 40000, route: 'BNE → NRT' },
    ] as const) {
      insertAlert.run(uuid(), a.sid, daysAgoIso(a.daysAgo), a.type, a.price, JSON.stringify({ route: a.route }));
    }
  })();

  res.json({ seeded: true, searches: SEARCHES.length });
});

// DELETE /api/demo/clear
router.delete('/clear', (_req, res) => {
  const { changes } = db.prepare(`DELETE FROM searches WHERE name LIKE ?`).run(`${DEMO_TAG}%`);
  res.json({ cleared: true, removed: changes });
});

export default router;
