import { Router } from 'express';
import { db } from '../db/index';

const router = Router();

// Static routes MUST come before /:searchId to avoid being swallowed by the wildcard.

// GET /api/history/all-flights?type=cash&sort=price - all latest results across searches
router.get('/all-flights', (req, res) => {
  const { type = 'cash', sort = 'price' } = req.query;

  const snapshots = db.prepare(`
    SELECT p.results, p.checked_at, p.snapshot_type,
      s.id as search_id, s.name as search_name,
      s.origin_label, s.destination_label
    FROM (
      SELECT search_id, MAX(checked_at) as max_at
      FROM price_snapshots
      WHERE snapshot_type = ?
      GROUP BY search_id
    ) latest
    JOIN price_snapshots p
      ON p.search_id = latest.search_id
      AND p.checked_at = latest.max_at
      AND p.snapshot_type = ?
    JOIN searches s ON s.id = p.search_id
    WHERE s.is_active = 1
  `).all(type, type) as Array<{
    results: string;
    checked_at: string;
    snapshot_type: string;
    search_id: string;
    search_name: string;
    origin_label: string;
    destination_label: string;
  }>;

  type Entry = { flight: Record<string, unknown>; search: { id: string; name: string; origin_label: string; destination_label: string }; checked_at: string };
  const all: Entry[] = [];

  for (const snap of snapshots) {
    try {
      const results = JSON.parse(snap.results);
      if (Array.isArray(results)) {
        for (const flight of results) {
          all.push({
            flight: flight as Record<string, unknown>,
            search: { id: snap.search_id, name: snap.search_name, origin_label: snap.origin_label, destination_label: snap.destination_label },
            checked_at: snap.checked_at,
          });
        }
      }
    } catch { /* skip */ }
  }

  if (sort === 'price') {
    all.sort((a, b) => ((a.flight.price ?? a.flight.pointsCost ?? 0) as number) - ((b.flight.price ?? b.flight.pointsCost ?? 0) as number));
  } else if (sort === 'date') {
    all.sort((a, b) => ((a.flight.departureDate ?? a.flight.date ?? '') as string).localeCompare((b.flight.departureDate ?? b.flight.date ?? '') as string));
  } else if (sort === 'airline') {
    all.sort((a, b) => ((a.flight.airline ?? a.flight.partner ?? '') as string).localeCompare((b.flight.airline ?? b.flight.partner ?? '') as string));
  }

  res.json(all.slice(0, 500));
});

// GET /api/history/stats/overview - dashboard stats
router.get('/stats/overview', (_req, res) => {
  const activeSearches = (db.prepare(`SELECT COUNT(*) as count FROM searches WHERE is_active = 1`).get() as { count: number }).count;
  const alertsToday = (db.prepare(`SELECT COUNT(*) as count FROM alerts_log WHERE sent_at >= date('now')`).get() as { count: number }).count;
  const totalSnapshots = (db.prepare(`SELECT COUNT(*) as count FROM price_snapshots`).get() as { count: number }).count;

  const recentLows = db.prepare(`
    SELECT s.name, s.origin_label, s.destination_label,
      p.min_price, p.snapshot_type, p.checked_at
    FROM price_snapshots p
    JOIN searches s ON s.id = p.search_id
    WHERE p.checked_at >= datetime('now', '-24 hours')
    ORDER BY p.min_price ASC
    LIMIT 5
  `).all();

  res.json({
    activeSearches,
    alertsToday,
    totalSnapshots,
    recentLows,
  });
});

// GET /api/history/:searchId - price history for chart
router.get('/:searchId', (req, res) => {
  const { searchId } = req.params;
  const { type = 'cash', days = '90' } = req.query;

  const search = db.prepare(`SELECT id FROM searches WHERE id = ?`).get(searchId);
  if (!search) {
    res.status(404).json({ error: 'Search not found' });
    return;
  }

  const snapshots = db.prepare(`
    SELECT
      date(checked_at) as date,
      snapshot_type,
      MIN(min_price) as min_price,
      MAX(max_price) as max_price,
      AVG((min_price + max_price) / 2) as avg_price,
      COUNT(*) as checks
    FROM price_snapshots
    WHERE search_id = ?
      AND snapshot_type = ?
      AND checked_at >= datetime('now', ?)
    GROUP BY date(checked_at), snapshot_type
    ORDER BY date ASC
  `).all(searchId, type, `-${days} days`) as {
    date: string;
    snapshot_type: string;
    min_price: number;
    max_price: number;
    avg_price: number;
    checks: number;
  }[];

  res.json(snapshots);
});

// GET /api/history/:searchId/latest - latest snapshot results
router.get('/:searchId/latest', (req, res) => {
  const { searchId } = req.params;
  const { type = 'cash' } = req.query;

  const snapshot = db.prepare(`
    SELECT * FROM price_snapshots
    WHERE search_id = ? AND snapshot_type = ?
    ORDER BY checked_at DESC
    LIMIT 1
  `).get(searchId, type) as { results: string; checked_at: string; min_price: number; max_price: number } | undefined;

  if (!snapshot) {
    res.json({ results: [], checked_at: null, min_price: null, max_price: null });
    return;
  }

  res.json({
    ...snapshot,
    results: JSON.parse(snapshot.results),
  });
});

// GET /api/history/:searchId/alerts - alert history
router.get('/:searchId/alerts', (req, res) => {
  const { searchId } = req.params;

  const alerts = db.prepare(`
    SELECT * FROM alerts_log
    WHERE search_id = ?
    ORDER BY sent_at DESC
    LIMIT 50
  `).all(searchId);

  res.json(alerts);
});

export default router;
