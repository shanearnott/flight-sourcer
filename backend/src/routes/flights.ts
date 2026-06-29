import { Router } from 'express';
import { z } from 'zod';
import { searchFlightOffers } from '../services/serpapi';
import { searchAwardAvailability } from '../services/seatAero';
import { searchLocations } from '../services/aviationstack';

const router = Router();

// GET /api/flights/locations?q=Sydney
router.get('/locations', async (req, res) => {
  const q = req.query.q as string;
  if (!q || q.length < 2) {
    res.json([]);
    return;
  }
  const results = await searchLocations(q);
  res.json(results);
});

const QuickSearchSchema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.number().int().min(1).max(9).default(1),
  cabinClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  airlineCodes: z.array(z.string()).optional(),
  mode: z.enum(['cash', 'award', 'both']).default('both'),
});

// POST /api/flights/search
router.post('/search', async (req, res) => {
  const parsed = QuickSearchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    return;
  }

  const { origin, destination, departureDate, returnDate, adults, cabinClass, airlineCodes, mode } = parsed.data;

  const results: { cash?: unknown[]; award?: unknown[] } = {};

  if (mode === 'cash' || mode === 'both') {
    results.cash = await searchFlightOffers({
      originCode: origin,
      destinationCode: destination,
      departureDate,
      returnDate,
      adults,
      cabinClass,
      airlineCodes,
      maxResults: 20,
    });
  }

  if (mode === 'award' || mode === 'both') {
    results.award = await searchAwardAvailability({
      originCode: origin,
      destinationCode: destination,
      cabin: cabinClass,
      startDate: departureDate,
      endDate: returnDate || departureDate,
    });
  }

  res.json(results);
});

export default router;
