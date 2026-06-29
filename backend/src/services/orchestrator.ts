import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index';
import { searchFlightOffers } from './serpapi';
import { searchAwardAvailability } from './seatAero';
import { getDatePairs } from '../utils/dateRanges';
import { sendAlert } from './email';

export interface SearchRecord {
  id: string;
  name: string;
  origin_label: string;
  destination_label: string;
  origin_airports: string;
  destination_airports: string;
  trip_type: 'weekend' | 'week' | 'custom';
  window_start: string;
  window_end: string;
  min_nights: number;
  max_nights: number;
  cabin_class: string;
  adults: number;
  airline_codes: string | null;
  search_mode: 'cash' | 'award' | 'both';
  alert_email: string | null;
  alert_threshold_cash: number | null;
  alert_threshold_points: number | null;
  is_active: number;
  created_at: string;
  last_checked: string | null;
}

export interface ProgressEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  message: string;
  current?: number;
  total?: number;
  results?: unknown[];
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runSearch(
  search: SearchRecord,
  onProgress?: (event: ProgressEvent) => void
): Promise<void> {
  const originAirports: string[] = JSON.parse(search.origin_airports);
  const destAirports: string[] = JSON.parse(search.destination_airports);
  const airlineCodes: string[] | null = search.airline_codes ? JSON.parse(search.airline_codes) : null;

  const datePairs = getDatePairs(
    search.trip_type,
    search.window_start,
    search.window_end,
    search.min_nights,
    search.max_nights
  );

  const airportPairs: [string, string][] = [];
  for (const orig of originAirports.slice(0, 3)) {
    for (const dest of destAirports.slice(0, 3)) {
      airportPairs.push([orig, dest]);
    }
  }

  const totalCalls = airportPairs.length * datePairs.length * (search.search_mode === 'both' ? 2 : 1);
  let current = 0;

  onProgress?.({ type: 'start', message: `Starting search: ${airportPairs.length} routes × ${datePairs.length} date pairs`, total: totalCalls, current: 0 });

  const cashAlerts: import('./serpapi').FlightOffer[] = [];
  const awardAlerts: import('./seatAero').AwardAvailability[] = [];

  for (const [orig, dest] of airportPairs) {
    for (const { depart, return: ret } of datePairs) {
      if (search.search_mode === 'cash' || search.search_mode === 'both') {
        try {
          const offers = await searchFlightOffers({
            originCode: orig,
            destinationCode: dest,
            departureDate: depart,
            returnDate: ret,
            adults: search.adults,
            cabinClass: search.cabin_class,
            airlineCodes: airlineCodes || undefined,
            maxResults: 5,
          });

          if (offers.length > 0) {
            const prices = offers.map(o => o.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            const snapshotId = uuidv4();
            db.prepare(`
              INSERT INTO price_snapshots (id, search_id, checked_at, snapshot_type, results, min_price, max_price)
              VALUES (?, ?, datetime('now'), 'cash', ?, ?, ?)
            `).run(snapshotId, search.id, JSON.stringify(offers), minPrice, maxPrice);

            if (search.alert_threshold_cash && minPrice <= search.alert_threshold_cash) {
              cashAlerts.push(...offers.filter(o => o.price <= search.alert_threshold_cash!));
            }
          }
        } catch (err) {
          console.error(`[Orchestrator] Cash search error ${orig}→${dest} ${depart}:`, err);
        }

        current++;
        onProgress?.({ type: 'progress', message: `Checked cash ${orig}→${dest} ${depart}`, current, total: totalCalls });
        await delay(150);
      }

      if (search.search_mode === 'award' || search.search_mode === 'both') {
        try {
          const awards = await searchAwardAvailability({
            originCode: orig,
            destinationCode: dest,
            cabin: search.cabin_class,
            startDate: depart,
            endDate: ret || depart,
          });

          if (awards.length > 0) {
            const points = awards.map(a => a.pointsCost).filter(p => p > 0);
            const minPoints = points.length ? Math.min(...points) : null;
            const maxPoints = points.length ? Math.max(...points) : null;

            const snapshotId = uuidv4();
            db.prepare(`
              INSERT INTO price_snapshots (id, search_id, checked_at, snapshot_type, results, min_price, max_price)
              VALUES (?, ?, datetime('now'), 'award', ?, ?, ?)
            `).run(snapshotId, search.id, JSON.stringify(awards), minPoints, maxPoints);

            if (search.alert_threshold_points && minPoints && minPoints <= search.alert_threshold_points) {
              awardAlerts.push(...awards.filter(a => a.pointsCost > 0 && a.pointsCost <= search.alert_threshold_points!));
            }
          }
        } catch (err) {
          console.error(`[Orchestrator] Award search error ${orig}→${dest} ${depart}:`, err);
        }

        current++;
        onProgress?.({ type: 'progress', message: `Checked awards ${orig}→${dest} ${depart}`, current, total: totalCalls });
        await delay(100);
      }
    }
  }

  // Update last_checked
  db.prepare(`UPDATE searches SET last_checked = datetime('now') WHERE id = ?`).run(search.id);

  // Send alerts if needed
  if (search.alert_email && (cashAlerts.length > 0 || awardAlerts.length > 0)) {
    const recentAlert = db.prepare(`
      SELECT id FROM alerts_log
      WHERE search_id = ? AND sent_at > datetime('now', '-23 hours')
      LIMIT 1
    `).get(search.id);

    if (!recentAlert) {
      await sendAlert(search.alert_email, {
        searchName: search.name,
        route: `${originAirports.join('/')} → ${destAirports.join('/')}`,
        departDate: datePairs[0]?.depart || '',
        searchId: search.id,
        cashOffers: cashAlerts.slice(0, 5),
        awardOffers: awardAlerts.slice(0, 5),
        appUrl: process.env.APP_URL || 'http://localhost:5173',
      });

      db.prepare(`
        INSERT INTO alerts_log (id, search_id, sent_at, alert_type, price, details)
        VALUES (?, ?, datetime('now'), ?, ?, ?)
      `).run(
        uuidv4(),
        search.id,
        cashAlerts.length > 0 ? 'cash' : 'award',
        cashAlerts.length > 0 ? Math.min(...cashAlerts.map(f => f.price)) : Math.min(...awardAlerts.map(a => a.pointsCost)),
        JSON.stringify({ cashCount: cashAlerts.length, awardCount: awardAlerts.length })
      );
    }
  }

  onProgress?.({ type: 'complete', message: 'Search complete', current: totalCalls, total: totalCalls });
}
