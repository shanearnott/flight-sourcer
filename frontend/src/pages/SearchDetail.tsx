import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Play, RefreshCw, Plane, Award, Clock, ArrowRight, Layers, Pencil, Square, AlertTriangle, Zap } from 'lucide-react';
import { searchesApi, historyApi, settingsApi, type FlightOffer, type AwardOffer } from '../api/client';
import PriceAreaChart from '../components/charts/PriceAreaChart';
import { Button, Badge, Spinner, Card, EmptyState, ProgressBar } from '../components/ui';
import { formatCurrency, formatPoints, formatDuration, formatDate, formatDateTime, formatStops, cabinLabel, formatRelativeTime } from '../utils/formatters';
import { cn } from '../utils/cn';

interface RunProgress {
  type: 'start' | 'progress' | 'complete' | 'error';
  message: string;
  current?: number;
  total?: number;
}

function FlightRow({ flight }: { flight: FlightOffer }) {
  return (
    <div className="px-5 py-4 border-b border-navy-700 last:border-0 flex items-center gap-4 hover:bg-navy-700/50 transition-colors">
      <div className="w-10 flex-shrink-0 text-center">
        <div className="text-xs font-bold text-brand-400">{flight.airline}</div>
        <div className="text-xs text-slate-600 mt-0.5 truncate">{flight.flightNumber}</div>
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="text-center flex-shrink-0">
          <div className="text-sm font-bold text-slate-100">{flight.departureTime}</div>
          <div className="text-xs text-slate-500">{flight.origin}</div>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5 px-2">
          <div className="text-xs text-slate-600">{formatDuration(flight.duration)}</div>
          <div className="w-full flex items-center gap-1">
            <div className="flex-1 h-px bg-navy-600" />
            <Plane className="w-3 h-3 text-slate-600" />
            <div className="flex-1 h-px bg-navy-600" />
          </div>
          <div className="text-xs text-slate-600">{formatStops(flight.stops)}</div>
        </div>
        <div className="text-center flex-shrink-0">
          <div className="text-sm font-bold text-slate-100">{flight.arrivalTime}</div>
          <div className="text-xs text-slate-500">{flight.destination}</div>
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-lg font-bold text-amber-400">{formatCurrency(flight.price, flight.currency)}</div>
        <div className="text-xs text-slate-500">{cabinLabel(flight.cabin)}</div>
      </div>
      {flight.seatsAvailable !== null && (
        <Badge variant={flight.seatsAvailable <= 3 ? 'danger' : 'default'} className="flex-shrink-0">
          {flight.seatsAvailable} left
        </Badge>
      )}
    </div>
  );
}

function AwardRow({ award }: { award: AwardOffer }) {
  return (
    <div className="px-5 py-4 border-b border-navy-700 last:border-0 flex items-center gap-4 hover:bg-navy-700/50 transition-colors">
      <div className="w-10 flex-shrink-0 text-center">
        <div className="text-xs font-bold text-amber-400 uppercase">{award.partner}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-200">{award.origin}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="font-medium text-slate-200">{award.destination}</span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{formatDate(award.date)} &bull; {cabinLabel(award.cabin.toUpperCase())}</div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-lg font-bold text-amber-400">{formatPoints(award.pointsCost)}</div>
        {award.taxesCash && (
          <div className="text-xs text-slate-500">+ {formatCurrency(award.taxesCash)} taxes</div>
        )}
      </div>
      {award.remainingSeats > 0 && (
        <Badge variant={award.remainingSeats <= 2 ? 'danger' : 'success'} className="flex-shrink-0">
          {award.remainingSeats} seat{award.remainingSeats > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}

export default function SearchDetail({ autoRun = false }: { autoRun?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'cash' | 'award'>('cash');
  const [chartDays, setChartDays] = useState(30);
  const [running, setRunning] = useState(false);
  const [runProgress, setRunProgress] = useState<RunProgress | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{ calls: number } | null>(null);
  const autoRunFiredRef = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: search, isLoading: searchLoading } = useQuery({
    queryKey: ['search', id],
    queryFn: () => searchesApi.get(id!),
    enabled: !!id,
  });

  const { data: chartData, refetch: refetchChart } = useQuery({
    queryKey: ['history', id, activeTab, chartDays],
    queryFn: () => historyApi.get(id!, activeTab, chartDays),
    enabled: !!id,
  });

  const { data: latestData, refetch: refetchLatest } = useQuery({
    queryKey: ['history-latest', id, activeTab],
    queryFn: () => historyApi.latest(id!, activeTab),
    enabled: !!id,
  });

  const { data: apiStatus } = useQuery({
    queryKey: ['api-status'],
    queryFn: () => settingsApi.status(),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    return () => { eventSourceRef.current?.close(); };
  }, []);

  useEffect(() => {
    if (autoRun && !autoRunFiredRef.current && search && !running) {
      autoRunFiredRef.current = true;
      runSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun, search]);

  async function stopSearch() {
    if (!id) return;
    eventSourceRef.current?.close();
    await searchesApi.cancel(id);
    setRunning(false);
    setRunProgress({ type: 'error', message: 'Search stopped' });
  }

  function startSearchStream() {
    if (!id || running) return;
    eventSourceRef.current?.close();
    setPendingConfirm(null);

    setRunning(true);
    setRunProgress({ type: 'start', message: 'Starting...', current: 0, total: 0 });

    const apiBase = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
    const es = new EventSource(`${apiBase}/searches/${id}/run`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      const data: RunProgress = JSON.parse(e.data);
      setRunProgress(data);
      if (data.type === 'complete' || data.type === 'error') {
        setRunning(false);
        es.close();
        refetchChart();
        refetchLatest();
      }
    };

    es.onerror = () => {
      setRunning(false);
      setRunProgress({ type: 'error', message: 'Connection failed' });
      es.close();
    };
  }

  async function runSearch() {
    if (!id || running) return;

    if (apiStatus?.serpapi) {
      const limit = apiStatus.serpapi_limit;
      const threshold = Math.floor(limit / 5);
      let est: { serpapi_calls: number } | null = null;
      try { est = await searchesApi.estimate(id); } catch { /* ignore */ }

      if (est && est.serpapi_calls > threshold) {
        setPendingConfirm({ calls: est.serpapi_calls });
        return;
      }
    }

    startSearchStream();
  }

  if (searchLoading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  if (!search) return <div className="p-8 text-slate-400">Search not found</div>;

  const cashResults = activeTab === 'cash' ? (latestData?.results as FlightOffer[] || []) : [];
  const awardResults = activeTab === 'award' ? (latestData?.results as AwardOffer[] || []) : [];
  const showCash = search.search_mode === 'cash' || search.search_mode === 'both';
  const showAward = search.search_mode === 'award' || search.search_mode === 'both';

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">{search.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-slate-400">
            <span>{search.origin_label}</span>
            <ArrowRight className="w-4 h-4" />
            <span>{search.destination_label}</span>
            <span className="text-slate-600">•</span>
            <span className="capitalize">{search.trip_type}</span>
            <span className="text-slate-600">•</span>
            <span>{(Array.isArray(search.cabin_class) ? search.cabin_class : [search.cabin_class]).map(cabinLabel).join(' · ')}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/search/${id}/edit`)} disabled={running}>
            <Pencil className="w-4 h-4" />Edit
          </Button>
          {running ? (
            <Button variant="danger" onClick={stopSearch}>
              <Square className="w-4 h-4" />Stop
            </Button>
          ) : (
            <Button onClick={runSearch}>
              <Play className="w-4 h-4" />Search Now
            </Button>
          )}
        </div>
      </div>

      {/* Low quota warning banner */}
      {apiStatus && apiStatus.serpapi && apiStatus.serpapi_used >= apiStatus.serpapi_limit * 0.8 && !running && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-300">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
          <span>
            <strong className="text-amber-400">Low quota:</strong>{' '}
            {apiStatus.serpapi_limit - apiStatus.serpapi_used} of {apiStatus.serpapi_limit} SerpApi searches remaining this month.
          </span>
        </div>
      )}

      {/* Quota confirmation */}
      {pendingConfirm && (
        <Card className="mb-6 border-amber-500/40 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200 mb-1">This search uses {pendingConfirm.calls} SerpApi call{pendingConfirm.calls !== 1 ? 's' : ''}</p>
              <p className="text-xs text-slate-400 mb-4">
                That's more than 1/5 of your monthly quota
                {apiStatus ? ` (${apiStatus.serpapi_used}/${apiStatus.serpapi_limit} used so far)` : ''}.
                Continue anyway?
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={startSearchStream}>
                  <Play className="w-3 h-3" />Yes, search now
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setPendingConfirm(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Run progress */}
      {runProgress && running && (
        <Card className="mb-6 border-brand-500/30">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-brand-400">
            <Spinner className="w-4 h-4" />
            {runProgress.message}
          </div>
          {runProgress.total && runProgress.total > 0 && (
            <ProgressBar value={runProgress.current || 0} max={runProgress.total} label={`${runProgress.current || 0} / ${runProgress.total} checks`} />
          )}
        </Card>
      )}

      {/* Tabs */}
      {search.search_mode === 'both' && (
        <div className="flex gap-1 mb-6 bg-navy-800 rounded-xl p-1 w-fit border border-navy-600">
          {showCash && (
            <button
              onClick={() => setActiveTab('cash')}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'cash' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200')}
            >
              <Layers className="w-4 h-4" />Cash Fares
            </button>
          )}
          {showAward && (
            <button
              onClick={() => setActiveTab('award')}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'award' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-slate-200')}
            >
              <Award className="w-4 h-4" />Award Seats
            </button>
          )}
        </div>
      )}

      {/* Price Chart */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            Price History
            <Badge variant={activeTab === 'award' ? 'warning' : 'purple'} className="text-xs">
              {activeTab === 'cash' ? 'USD' : 'Points'}
            </Badge>
          </h2>
          <div className="flex gap-1.5">
            {[7, 30, 60, 90].map(d => (
              <button
                key={d}
                onClick={() => setChartDays(d)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  chartDays === d ? 'bg-brand-500 text-white' : 'bg-navy-700 text-slate-400 hover:text-slate-200'
                )}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <PriceAreaChart
          data={chartData || []}
          mode={activeTab}
          currentPrice={latestData?.min_price}
          allTimeLow={activeTab === 'cash' ? search.all_time_low_cash : search.all_time_low_points}
        />
      </Card>

      {/* Latest Results */}
      <Card>
        <div className="flex items-center justify-between mb-1 pb-4 border-b border-navy-700">
          <h2 className="text-base font-semibold text-slate-200">
            {activeTab === 'cash' ? 'Latest Cash Fares' : 'Latest Award Availability'}
          </h2>
          {latestData?.checked_at && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeTime(latestData.checked_at)}
            </div>
          )}
        </div>

        {activeTab === 'cash' && (
          cashResults.length > 0 ? (
            <div className="divide-y divide-navy-700 -mx-5 -mb-5">
              {cashResults.map((f, i) => <FlightRow key={i} flight={f} />)}
            </div>
          ) : (
            <EmptyState
              icon={<Plane className="w-10 h-10" />}
              title="No cash fares yet"
              description="Click Search Now to check for available flights"
            />
          )
        )}

        {activeTab === 'award' && (
          awardResults.length > 0 ? (
            <div className="divide-y divide-navy-700 -mx-5 -mb-5">
              {awardResults.map((a, i) => <AwardRow key={i} award={a} />)}
            </div>
          ) : (
            <EmptyState
              icon={<Award className="w-10 h-10" />}
              title="No award availability yet"
              description="Click Search Now to check for award seats"
            />
          )
        )}
      </Card>

      {/* Airports info */}
      <div className="mt-4 text-xs text-slate-600">
        Searching: {search.origin_airports.join(', ')} → {search.destination_airports.join(', ')} &bull; {search.window_start} to {search.window_end}
      </div>
    </div>
  );
}
