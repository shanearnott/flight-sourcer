import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from '../db/index';
import { runSearch, cancelSearch, type SearchRecord } from '../services/orchestrator';

const router = Router();

function parseCabinClass(val: string): string[] {
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [val];
  }
}

function serializeSearch(s: Record<string, unknown>) {
  return {
    ...s,
    origin_airports: JSON.parse(s.origin_airports as string),
    destination_airports: JSON.parse(s.destination_airports as string),
    cabin_class: parseCabinClass(s.cabin_class as string),
    airline_codes: s.airline_codes ? JSON.parse(s.airline_codes as string) : null,
  };
}

const SearchSchema = z.object({
  name: z.string().min(1).max(100),
  origin_label: z.string().min(1),
  destination_label: z.string().min(1),
  origin_airports: z.array(z.string().length(3)).min(1).max(5),
  destination_airports: z.array(z.string().length(3)).min(1).max(5),
  trip_type: z.enum(['weekend', 'week', 'custom']),
  window_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  window_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  min_nights: z.number().int().min(1).max(30).default(2),
  max_nights: z.number().int().min(1).max(30).default(7),
  cabin_class: z.array(z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'])).min(1).default(['ECONOMY']),
  adults: z.number().int().min(1).max(9).default(1),
  airline_codes: z.array(z.string()).nullable().optional(),
  search_mode: z.enum(['cash', 'award', 'both']).default('both'),
  alert_email: z.string().email().nullable().optional(),
  alert_threshold_cash: z.number().positive().nullable().optional(),
  alert_threshold_points: z.number().int().positive().nullable().optional(),
});

// GET /api/searches
router.get('/', (_req, res) => {
  const searches = db.prepare(`
    SELECT s.*,
      (SELECT COUNT(*) FROM price_snapshots WHERE search_id = s.id) as snapshot_count,
      (SELECT MIN(min_price) FROM price_snapshots WHERE search_id = s.id AND snapshot_type = 'cash') as all_time_low_cash,
      (SELECT min_price FROM price_snapshots WHERE search_id = s.id AND snapshot_type = 'cash' ORDER BY checked_at DESC LIMIT 1) as latest_cash,
      (SELECT MIN(min_price) FROM price_snapshots WHERE search_id = s.id AND snapshot_type = 'award') as all_time_low_points
    FROM searches s
    ORDER BY s.created_at DESC
  `).all();

  res.json((searches as Record<string, unknown>[]).map(serializeSearch));
});

// GET /api/searches/:id
router.get('/:id', (req, res) => {
  const search = db.prepare(`SELECT * FROM searches WHERE id = ?`).get(req.params.id) as SearchRecord | undefined;
  if (!search) {
    res.status(404).json({ error: 'Search not found' });
    return;
  }
  res.json(serializeSearch(search as unknown as Record<string, unknown>));
});

// POST /api/searches
router.post('/', (req, res) => {
  const parsed = SearchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    return;
  }

  const data = parsed.data;
  const id = uuidv4();

  db.prepare(`
    INSERT INTO searches (
      id, name, origin_label, destination_label, origin_airports, destination_airports,
      trip_type, window_start, window_end, min_nights, max_nights,
      cabin_class, adults, airline_codes, search_mode,
      alert_email, alert_threshold_cash, alert_threshold_points,
      is_active, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      1, datetime('now')
    )
  `).run(
    id, data.name, data.origin_label, data.destination_label,
    JSON.stringify(data.origin_airports), JSON.stringify(data.destination_airports),
    data.trip_type, data.window_start, data.window_end, data.min_nights, data.max_nights,
    JSON.stringify(data.cabin_class), data.adults,
    data.airline_codes ? JSON.stringify(data.airline_codes) : null,
    data.search_mode,
    data.alert_email || null, data.alert_threshold_cash || null, data.alert_threshold_points || null
  );

  const created = db.prepare(`SELECT * FROM searches WHERE id = ?`).get(id) as SearchRecord;
  res.status(201).json(serializeSearch(created as unknown as Record<string, unknown>));
});

// PUT /api/searches/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare(`SELECT id FROM searches WHERE id = ?`).get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Search not found' });
    return;
  }

  const parsed = SearchSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    return;
  }

  const data = parsed.data;
  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
  if (data.origin_label !== undefined) { updates.push('origin_label = ?'); values.push(data.origin_label); }
  if (data.destination_label !== undefined) { updates.push('destination_label = ?'); values.push(data.destination_label); }
  if (data.origin_airports !== undefined) { updates.push('origin_airports = ?'); values.push(JSON.stringify(data.origin_airports)); }
  if (data.destination_airports !== undefined) { updates.push('destination_airports = ?'); values.push(JSON.stringify(data.destination_airports)); }
  if (data.trip_type !== undefined) { updates.push('trip_type = ?'); values.push(data.trip_type); }
  if (data.window_start !== undefined) { updates.push('window_start = ?'); values.push(data.window_start); }
  if (data.window_end !== undefined) { updates.push('window_end = ?'); values.push(data.window_end); }
  if (data.min_nights !== undefined) { updates.push('min_nights = ?'); values.push(data.min_nights); }
  if (data.max_nights !== undefined) { updates.push('max_nights = ?'); values.push(data.max_nights); }
  if (data.cabin_class !== undefined) { updates.push('cabin_class = ?'); values.push(JSON.stringify(data.cabin_class)); }
  if (data.adults !== undefined) { updates.push('adults = ?'); values.push(data.adults); }
  if (data.airline_codes !== undefined) { updates.push('airline_codes = ?'); values.push(data.airline_codes ? JSON.stringify(data.airline_codes) : null); }
  if (data.search_mode !== undefined) { updates.push('search_mode = ?'); values.push(data.search_mode); }
  if (data.alert_email !== undefined) { updates.push('alert_email = ?'); values.push(data.alert_email); }
  if (data.alert_threshold_cash !== undefined) { updates.push('alert_threshold_cash = ?'); values.push(data.alert_threshold_cash); }
  if (data.alert_threshold_points !== undefined) { updates.push('alert_threshold_points = ?'); values.push(data.alert_threshold_points); }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  values.push(req.params.id);
  db.prepare(`UPDATE searches SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare(`SELECT * FROM searches WHERE id = ?`).get(req.params.id) as SearchRecord;
  res.json(serializeSearch(updated as unknown as Record<string, unknown>));
});

// PATCH /api/searches/:id/toggle
router.patch('/:id/toggle', (req, res) => {
  const search = db.prepare(`SELECT id, is_active FROM searches WHERE id = ?`).get(req.params.id) as { id: string; is_active: number } | undefined;
  if (!search) {
    res.status(404).json({ error: 'Search not found' });
    return;
  }
  const newActive = search.is_active ? 0 : 1;
  db.prepare(`UPDATE searches SET is_active = ? WHERE id = ?`).run(newActive, req.params.id);
  res.json({ is_active: newActive });
});

// DELETE /api/searches/:id
router.delete('/:id', (req, res) => {
  const search = db.prepare(`SELECT id FROM searches WHERE id = ?`).get(req.params.id);
  if (!search) {
    res.status(404).json({ error: 'Search not found' });
    return;
  }
  db.prepare(`DELETE FROM searches WHERE id = ?`).run(req.params.id);
  res.status(204).send();
});

// POST /api/searches/:id/cancel
router.post('/:id/cancel', (req, res) => {
  cancelSearch(req.params.id);
  res.json({ ok: true });
});

// GET /api/searches/:id/run - SSE progress stream
router.get('/:id/run', async (req, res) => {
  const search = db.prepare(`SELECT * FROM searches WHERE id = ?`).get(req.params.id) as SearchRecord | undefined;
  if (!search) {
    res.status(404).json({ error: 'Search not found' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await runSearch(search, (event) => {
      send(event);
    });
  } catch (err) {
    send({ type: 'error', message: String(err) });
  }

  res.end();
});

export default router;
