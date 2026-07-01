import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { List, ArrowRight, Plane, Award, X, ExternalLink } from 'lucide-react';
import { historyApi, type FlightEntry, type AwardEntry } from '../api/client';
import { Spinner, Card, EmptyState, Badge } from '../components/ui';
import { formatCurrency, formatPoints, formatDuration, formatDate, formatRelativeTime, cabinLabel, formatStops } from '../utils/formatters';
import { cn } from '../utils/cn';
import type { FlightOffer, AwardOffer } from '../api/client';

function googleFlightsUrl(flight: FlightOffer): string {
  const trip = flight.isRoundTrip
    ? `round trip ${flight.origin} ${flight.destination} ${flight.departureDate}${flight.returnDate ? ` ${flight.returnDate}` : ''}`
    : `flights from ${flight.origin} to ${flight.destination} on ${flight.departureDate}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(trip)}`;
}

function FlightModal({ entry, onClose }: { entry: FlightEntry; onClose: () => void }) {
  const f = entry.flight;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-navy-800 border border-navy-600 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-navy-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-brand-400">{f.airline}</span>
              <span className="text-slate-500 text-sm">{f.flightNumber}</span>
              <Badge variant="default" className="text-xs">{cabinLabel(f.cabin)}</Badge>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <span className="font-semibold">{f.origin}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">{f.destination}</span>
              <span className="text-slate-600">·</span>
              <span>{formatDate(f.departureDate)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-navy-700 text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Times */}
        <div className="px-5 py-4 flex items-center gap-4 border-b border-navy-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-100">{f.departureTime}</div>
            <div className="text-xs text-slate-500 mt-0.5">{f.origin}</div>
            <div className="text-xs text-slate-600">{formatDate(f.departureDate)}</div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="text-xs text-slate-500">{formatDuration(f.duration)}</div>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-navy-600" />
              <Plane className="w-3 h-3 text-slate-600" />
              <div className="flex-1 h-px bg-navy-600" />
            </div>
            <div className="text-xs text-slate-500">{formatStops(f.stops)}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-100">{f.arrivalTime}</div>
            <div className="text-xs text-slate-500 mt-0.5">{f.destination}</div>
            <div className="text-xs text-slate-600">{formatDate(f.arrivalDate)}</div>
          </div>
        </div>

        {/* Segments */}
        {f.segments && f.segments.length > 1 && (
          <div className="px-5 py-3 border-b border-navy-700">
            <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Itinerary</div>
            <div className="space-y-2">
              {f.segments.map((seg, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-xs font-bold text-brand-400 w-12">{seg.carrier}{seg.flightNumber.replace(seg.carrier, '')}</span>
                  <span className="text-slate-300">{seg.origin}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                  <span className="text-slate-300">{seg.destination}</span>
                  <span className="text-slate-600 text-xs ml-auto">{formatDuration(seg.duration)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Return info */}
        {f.isRoundTrip && f.returnDate && (
          <div className="px-5 py-3 border-b border-navy-700 flex items-center gap-2 text-sm text-slate-400">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Return: {formatDate(f.returnDate)}</span>
          </div>
        )}

        {/* Price + meta */}
        <div className="px-5 py-4 border-b border-navy-700 flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-amber-400">{formatCurrency(f.price, f.currency)}</div>
            <div className="text-xs text-slate-500 mt-0.5">per person</div>
          </div>
          {f.seatsAvailable !== null && (
            <Badge variant={f.seatsAvailable <= 3 ? 'danger' : 'default'}>
              {f.seatsAvailable} seat{f.seatsAvailable !== 1 ? 's' : ''} left
            </Badge>
          )}
        </div>

        {/* Source + Book */}
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <span>From </span>
            <Link to={`/search/${entry.search.id}`} onClick={onClose} className="text-brand-400 hover:underline">{entry.search.name}</Link>
            <span className="ml-1">· seen {formatRelativeTime(entry.checked_at)}</span>
          </div>
          <a
            href={googleFlightsUrl(f)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
          >
            Book <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function AwardModal({ entry, onClose }: { entry: AwardEntry; onClose: () => void }) {
  const a = entry.flight;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-navy-800 border border-navy-600 rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-navy-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-amber-400 uppercase">{a.partner}</span>
              <Badge variant="warning" className="text-xs">{cabinLabel(a.cabin.toUpperCase())}</Badge>
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <span className="font-semibold">{a.origin}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">{a.destination}</span>
              <span className="text-slate-600">·</span>
              <span>{formatDate(a.date)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-navy-700 text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-navy-700 flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-amber-400">{formatPoints(a.pointsCost)}</div>
            {a.taxesCash && <div className="text-sm text-slate-400 mt-0.5">+ {formatCurrency(a.taxesCash)} taxes</div>}
          </div>
          {a.remainingSeats > 0 && (
            <Badge variant={a.remainingSeats <= 2 ? 'danger' : 'success'}>
              {a.remainingSeats} seat{a.remainingSeats !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <span>From </span>
            <Link to={`/search/${entry.search.id}`} onClick={onClose} className="text-brand-400 hover:underline">{entry.search.name}</Link>
            <span className="ml-1">· seen {formatRelativeTime(entry.checked_at)}</span>
          </div>
          <a
            href={`https://www.google.com/travel/flights?q=award+flights+${a.origin}+to+${a.destination}+${a.date}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
          >
            Search <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function FlightRow({ entry, onClick }: { entry: FlightEntry; onClick: () => void }) {
  const f = entry.flight;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 border-b border-navy-700 last:border-0 hover:bg-navy-700/50 transition-colors flex items-center gap-3 group"
    >
      <div className="w-10 text-center flex-shrink-0">
        <div className="text-xs font-bold text-brand-400">{f.airline}</div>
        <div className="text-xs text-slate-600 truncate">{f.flightNumber}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
          <span>{f.origin}</span>
          <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
          <span>{f.destination}</span>
          <span className="text-slate-600 font-normal">·</span>
          <span className="text-slate-400 font-normal text-xs">{formatDate(f.departureDate)}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
          <span>{formatDuration(f.duration)}</span>
          <span>·</span>
          <span>{formatStops(f.stops)}</span>
          <span>·</span>
          <span>{cabinLabel(f.cabin)}</span>
          <span className="text-slate-700">·</span>
          <span className="truncate">{entry.search.name}</span>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-base font-bold text-amber-400">{formatCurrency(f.price, f.currency)}</div>
        <div className="text-xs text-slate-600 group-hover:text-brand-400 transition-colors mt-0.5">View →</div>
      </div>
    </button>
  );
}

function AwardRow({ entry, onClick }: { entry: AwardEntry; onClick: () => void }) {
  const a = entry.flight;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 border-b border-navy-700 last:border-0 hover:bg-navy-700/50 transition-colors flex items-center gap-3 group"
    >
      <div className="w-10 text-center flex-shrink-0">
        <div className="text-xs font-bold text-amber-400 uppercase">{a.partner}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
          <span>{a.origin}</span>
          <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
          <span>{a.destination}</span>
          <span className="text-slate-600 font-normal">·</span>
          <span className="text-slate-400 font-normal text-xs">{formatDate(a.date)}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
          <span>{cabinLabel(a.cabin.toUpperCase())}</span>
          <span>·</span>
          <span>{a.remainingSeats} seat{a.remainingSeats !== 1 ? 's' : ''}</span>
          <span className="text-slate-700">·</span>
          <span className="truncate">{entry.search.name}</span>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-base font-bold text-amber-400">{formatPoints(a.pointsCost)}</div>
        <div className="text-xs text-slate-600 group-hover:text-amber-400 transition-colors mt-0.5">View →</div>
      </div>
    </button>
  );
}

export default function Flights() {
  const [type, setType] = useState<'cash' | 'award'>('cash');
  const [sort, setSort] = useState<'price' | 'date' | 'airline'>('price');
  const [selected, setSelected] = useState<FlightEntry | AwardEntry | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['all-flights', type, sort],
    queryFn: () => historyApi.allFlights(type, sort),
    staleTime: 2 * 60 * 1000,
  });

  const entries = data ?? [];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">All Flights</h1>
        <p className="text-slate-400 text-sm mt-1">Every result found across your searches — click to book</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1 bg-navy-800 rounded-lg p-0.5 border border-navy-700">
          <button onClick={() => setType('cash')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all', type === 'cash' ? 'bg-brand-500 text-white' : 'text-slate-400')}>
            <Plane className="w-3.5 h-3.5" />Cash
          </button>
          <button onClick={() => setType('award')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all', type === 'award' ? 'bg-amber-500 text-white' : 'text-slate-400')}>
            <Award className="w-3.5 h-3.5" />Award
          </button>
        </div>

        <div className="flex gap-1 ml-auto">
          <span className="text-xs text-slate-500 self-center mr-1">Sort:</span>
          {(['price', 'date', 'airline'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)} className={cn('px-2.5 py-1 rounded text-xs font-medium capitalize transition-all', sort === s ? 'bg-navy-600 text-slate-200' : 'text-slate-500 hover:text-slate-300')}>
              {s}
            </button>
          ))}
        </div>

        {entries.length > 0 && (
          <span className="text-xs text-slate-600">{entries.length} result{entries.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<List className="w-12 h-12" />}
          title="No flights found yet"
          description="Run a search to start seeing flight results here."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          {type === 'cash'
            ? (entries as FlightEntry[]).map((e, i) => (
                <FlightRow key={i} entry={e} onClick={() => setSelected(e)} />
              ))
            : (entries as AwardEntry[]).map((e, i) => (
                <AwardRow key={i} entry={e} onClick={() => setSelected(e)} />
              ))
          }
        </Card>
      )}

      {/* Modal */}
      {selected && type === 'cash' && (
        <FlightModal entry={selected as FlightEntry} onClose={() => setSelected(null)} />
      )}
      {selected && type === 'award' && (
        <AwardModal entry={selected as AwardEntry} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
