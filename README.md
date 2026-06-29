# FlightSourcer ✈

Personal flight price intelligence — tracks cash fares via Amadeus and award seats via Seat.aero, sends email alerts when prices drop, and shows price history charts.

## Features

- **Smart location search** — type a city name and it finds all airports in the area
- **Flexible date combinations** — searches all weekends, full weeks, or custom lengths within a date window
- **Cash fares** via [Amadeus Self-Service API](https://developers.amadeus.com) (free tier)
- **Award seats** via [Seat.aero Partner API](https://seats.aero) (paid)
- **Airline filtering** — by alliance (Star Alliance, oneworld, SkyTeam), individual airline, or all
- **Daily price checks** — automated cron job runs at 6 AM
- **Email alerts** — triggered when prices drop below your threshold
- **Price history charts** — shaded min/max band with trend lines

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API keys

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your API credentials
```

Required:
- **Amadeus**: Register at [developers.amadeus.com](https://developers.amadeus.com), create a Self-Service app
- **Seat.aero**: Apply for Partner API at [seats.aero](https://seats.aero) (optional, for award search)
- **SMTP**: Gmail App Password or any SMTP provider (optional, for email alerts)

### 3. Run

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Architecture

```
flight-sourcer/
├── backend/          # Express + TypeScript API
│   ├── src/
│   │   ├── db/       # SQLite database (better-sqlite3)
│   │   ├── services/ # Amadeus, Seat.aero, Email, Scheduler
│   │   ├── routes/   # REST API endpoints
│   │   └── utils/    # Date range generation
│   └── data/         # SQLite database files (gitignored)
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── pages/    # Dashboard, SearchDetail, PriceHistory, Alerts, Settings
        └── components/
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/searches` | List all saved searches |
| `POST /api/searches` | Create a new search |
| `GET /api/searches/:id/run` | Execute search with SSE progress |
| `GET /api/flights/locations?q=` | Airport/city autocomplete |
| `GET /api/history/:id` | Price history for chart |
| `GET /api/airlines/alliances` | Airlines grouped by alliance |

## Amadeus: Test vs Production

The Amadeus sandbox (`AMADEUS_HOSTNAME=test`) only returns results for specific routes. Set `AMADEUS_HOSTNAME=production` for real data with your production credentials.

## Email Setup (Gmail)

1. Enable 2FA on your Google account
2. Go to Security → App Passwords → Generate
3. Use the generated password as `SMTP_PASS` in `.env`
