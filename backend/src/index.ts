import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db/index';
import { startScheduler } from './services/scheduler';
import searchesRouter from './routes/searches';
import flightsRouter from './routes/flights';
import airlinesRouter from './routes/airlines';
import historyRouter from './routes/history';

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:5173', 'http://localhost:3000'],
}));
app.use(express.json());

// Routes
app.use('/api/searches', searchesRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/airlines', airlinesRouter);
app.use('/api/history', historyRouter);

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
