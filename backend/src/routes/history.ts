import { Router } from 'express';
import { db } from '../db/index';

const router = Router();

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

export default router;
