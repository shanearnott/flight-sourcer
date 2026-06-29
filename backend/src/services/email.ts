import nodemailer from 'nodemailer';
import type { FlightOffer } from './amadeus';
import type { AwardAvailability } from './seatAero';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}h` : '';
  const m = match[2] ? `${match[2]}m` : '';
  return `${h} ${m}`.trim();
}

export interface AlertPayload {
  searchName: string;
  route: string;
  departDate: string;
  returnDate?: string;
  searchId: string;
  cashOffers?: FlightOffer[];
  awardOffers?: AwardAvailability[];
  appUrl?: string;
}

function buildEmailHtml(payload: AlertPayload): string {
  const { searchName, route, departDate, returnDate, cashOffers = [], awardOffers = [], appUrl = 'http://localhost:5173', searchId } = payload;

  const cashRows = cashOffers.slice(0, 5).map(f => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #1e3a5f;">${f.airline} ${f.flightNumber}</td>
      <td style="padding:10px;border-bottom:1px solid #1e3a5f;">${f.departureDate} ${f.departureTime}</td>
      <td style="padding:10px;border-bottom:1px solid #1e3a5f;">${f.stops === 0 ? 'Nonstop' : `${f.stops} stop${f.stops > 1 ? 's' : ''}`}</td>
      <td style="padding:10px;border-bottom:1px solid #1e3a5f;">${formatDuration(f.duration)}</td>
      <td style="padding:10px;border-bottom:1px solid #1e3a5f;color:#f59e0b;font-weight:bold;">$${f.price.toFixed(0)} ${f.currency}</td>
    </tr>
  `).join('');

  const awardRows = awardOffers.slice(0, 5).map(a => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #1e3a5f;">${a.partner}</td>
      <td style="padding:10px;border-bottom:1px solid #1e3a5f;">${a.date}</td>
      <td style="padding:10px;border-bottom:1px solid #1e3a5f;">${a.cabin}</td>
      <td style="padding:10px;border-bottom:1px solid #1e3a5f;color:#f59e0b;font-weight:bold;">${a.pointsCost.toLocaleString()} pts${a.taxesCash ? ` + $${a.taxesCash}` : ''}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Helvetica Neue',Arial,sans-serif;color:#e2e8f0;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:32px 0 24px;">
      <div style="font-size:28px;font-weight:700;color:#6366f1;">✈ FlightSourcer</div>
      <div style="font-size:14px;color:#94a3b8;margin-top:4px;">Price Alert</div>
    </div>

    <div style="background:#0d1629;border:1px solid #1e3a5f;border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="font-size:13px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Search</div>
      <div style="font-size:22px;font-weight:700;margin-bottom:4px;">${searchName}</div>
      <div style="font-size:16px;color:#94a3b8;">${route} &bull; ${departDate}${returnDate ? ` → ${returnDate}` : ''}</div>
    </div>

    ${cashOffers.length > 0 ? `
    <div style="background:#0d1629;border:1px solid #1e3a5f;border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="font-size:13px;color:#10b981;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">💵 Cash Fares Found</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="color:#64748b;font-size:12px;text-transform:uppercase;">
            <th style="padding:8px 10px;text-align:left;">Flight</th>
            <th style="padding:8px 10px;text-align:left;">Departure</th>
            <th style="padding:8px 10px;text-align:left;">Stops</th>
            <th style="padding:8px 10px;text-align:left;">Duration</th>
            <th style="padding:8px 10px;text-align:left;">Price</th>
          </tr>
        </thead>
        <tbody>${cashRows}</tbody>
      </table>
    </div>` : ''}

    ${awardOffers.length > 0 ? `
    <div style="background:#0d1629;border:1px solid #1e3a5f;border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="font-size:13px;color:#f59e0b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">🏆 Award Availability Found</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="color:#64748b;font-size:12px;text-transform:uppercase;">
            <th style="padding:8px 10px;text-align:left;">Program</th>
            <th style="padding:8px 10px;text-align:left;">Date</th>
            <th style="padding:8px 10px;text-align:left;">Cabin</th>
            <th style="padding:8px 10px;text-align:left;">Cost</th>
          </tr>
        </thead>
        <tbody>${awardRows}</tbody>
      </table>
    </div>` : ''}

    <div style="text-align:center;padding:24px 0;">
      <a href="${appUrl}/search/${searchId}" style="display:inline-block;background:#6366f1;color:white;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;">View Price History →</a>
    </div>

    <div style="text-align:center;font-size:12px;color:#475569;padding-top:16px;border-top:1px solid #1e3a5f;">
      Sent by FlightSourcer &bull; <a href="${appUrl}" style="color:#6366f1;text-decoration:none;">Manage Alerts</a>
    </div>
  </div>
</body>
</html>`;
}

export async function sendAlert(to: string, payload: AlertPayload): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Email] SMTP not configured, skipping alert email');
    return false;
  }
  try {
    const transporter = getTransporter();
    const minCashPrice = payload.cashOffers?.length
      ? Math.min(...payload.cashOffers.map(f => f.price))
      : null;
    const minPoints = payload.awardOffers?.length
      ? Math.min(...payload.awardOffers.map(a => a.pointsCost))
      : null;

    const subjectParts: string[] = [];
    if (minCashPrice) subjectParts.push(`$${minCashPrice.toFixed(0)}`);
    if (minPoints) subjectParts.push(`${minPoints.toLocaleString()}pts`);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject: `✈ FlightSourcer Alert: ${payload.route} from ${subjectParts.join(' / ')}`,
      html: buildEmailHtml(payload),
    });
    console.log(`[Email] Alert sent to ${to} for ${payload.route}`);
    return true;
  } catch (err) {
    console.error('[Email] Failed to send alert:', err);
    return false;
  }
}
