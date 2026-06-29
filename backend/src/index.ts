import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db/index';
import { startScheduler } from './services/scheduler';
import searchesRouter from './routes/searches';
import flightsRouter from './routes/flights';
import airlinesRouter from './routes/airlines';
import historyRouter from './routes/history';
import demoRouter from './routes/demo';
import settingsRouter from './routes/settings';

const PORT = process.env.PORT || 3001;

const app = express();

const corsOrigin: string | string[] | boolean =
  process.env.NODE_ENV !== 'production'
    ? ['http://localhost:5173', 'http://localhost:3000']
    : process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
      : true; // allow all origins in production when no explicit origin is set

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Routes
app.use('/api/searches', searchesRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/airlines', airlinesRouter);
app.use('/api/history', historyRouter);
app.use('/api/demo', demoRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Init
initDb();
startScheduler();

app.listen(PORT, () => {
  console.log(`\n🛫 FlightSourcer API running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Amadeus: ${process.env.AMADEUS_CLIENT_ID ? '✓ configured' : '✗ not configured'}`);
  console.log(`   Seat.aero: ${process.env.SEAT_AERO_API_KEY ? '✓ configured' : '✗ not configured'}`);
  console.log(`   Email: ${process.env.SMTP_USER ? '✓ configured' : '✗ not configured'}\n`);
});

export default app;
