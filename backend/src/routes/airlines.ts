import { Router } from 'express';
import { AIRLINES, ALLIANCES, getAirlinesByAlliance } from '../data/airlines';

const router = Router();

// GET /api/airlines
router.get('/', (_req, res) => {
  res.json(AIRLINES);
});

// GET /api/airlines/alliances
router.get('/alliances', (_req, res) => {
  const result = ALLIANCES.map(alliance => ({
    name: alliance,
    airlines: getAirlinesByAlliance(alliance),
  }));
  res.json(result);
});

// GET /api/airlines/ff-programs
router.get('/ff-programs', (_req, res) => {
  const programs = new Map<string, { program: string; airlines: typeof AIRLINES }>();

  for (const airline of AIRLINES) {
    if (!airline.ffProgram) continue;
    const key = airline.ffProgram;
    if (!programs.has(key)) {
      programs.set(key, { program: key, airlines: [] });
    }
    programs.get(key)!.airlines.push(airline);
  }

  const result = Array.from(programs.values())
    .sort((a, b) => a.program.localeCompare(b.program));

  res.json(result);
});

export default router;
