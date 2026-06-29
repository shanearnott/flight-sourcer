import { Router } from 'express';
import { z } from 'zod';
import { getSetting, setSetting, deleteSetting } from '../db/index';
import { getSerpApiUsage } from '../services/serpapi';

const router = Router();

const ALLOWED_KEYS = ['alert_email'] as const;
type SettingKey = typeof ALLOWED_KEYS[number];

// GET /api/settings
router.get('/', (_req, res) => {
  const result: Record<string, string | null> = {};
  for (const key of ALLOWED_KEYS) {
    result[key] = getSetting(key);
  }
  res.json(result);
});

// GET /api/settings/status — which API keys are configured
router.get('/status', (_req, res) => {
  const { count: serpApiUsed } = getSerpApiUsage();
  res.json({
    serpapi: !!process.env.SERPAPI_KEY,
    serpapi_used: serpApiUsed,
    serpapi_limit: 100,
    aviationstack: !!process.env.AVIATIONSTACK_KEY,
    seat_aero: !!process.env.SEAT_AERO_API_KEY,
    smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  });
});

// PUT /api/settings
router.put('/', (req, res) => {
  const Schema = z.object({
    alert_email: z.string().email().optional().nullable(),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    return;
  }

  const updates = parsed.data;
  for (const key of ALLOWED_KEYS) {
    const value = updates[key as SettingKey];
    if (value === null || value === undefined || value === '') {
      deleteSetting(key);
    } else {
      setSetting(key, value);
    }
  }

  res.json({ ok: true });
});

export default router;
