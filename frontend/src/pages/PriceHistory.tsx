import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { searchesApi, historyApi } from '../api/client';
import PriceAreaChart from '../components/charts/PriceAreaChart';
import { Spinner, Card, EmptyState, Badge } from '../components/ui';
import { formatCurrency, formatPoints, cabinLabel } from '../utils/formatters';
import { cn } from '../utils/cn';

export default function PriceHistory() {
  const { data: searches, isLoading } = useQuery({
    queryKey: ['searches'],
    queryFn: () => searchesApi.list(),
  });

  const activeSearches = searches?.filter(s => s.is_active && (s.snapshot_count || 0) > 0) || [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Price History</h1>
        <p className="text-slate-400 text-sm mt-1">Historical price trends across all your searches</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : activeSearches.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-12 h-12" />}
          title="No price history yet"
          description="Run a search to start building price history charts."
        />
      ) : (
        <div className="space-y-6">
          {activeSearches.map(search => (
            <SearchHistoryCard key={search.id} search={search} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchHistoryCard({ search }: { search: import('../api/client').SavedSearch }) {
  const [mode, setMode] = useState<'cash' | 'award'>('cash');
  const [days, setDays] = useState(30);

  const { data: chartData } = useQuery({
    queryKey: ['history', search.id, mode, days],
    queryFn: () => historyApi.get(search.id, mode, days),
    staleTime: 5 * 60 * 1000,
  });

  const showCash = search.search_mode === 'cash' || search.search_mode === 'both';
  const showAward = search.search_mode === 'award' || search.search_mode === 'both';

  return (
    <Card>
      <div className="flex items-start justify-between mb-5">
        <div>
          <Link to={`/search/${search.id}`} className="text-base font-semibold text-slate-100 hover:text-brand-400 transition-colors">
            {search.name}
          </Link>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
            <span>{search.origin_label}</span>
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{search.destination_label}</span>
            <span className="text-slate-600">•</span>
            <span>{cabinLabel(search.cabin_class)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {search.search_mode === 'both' && (
            <div className="flex gap-1 bg-navy-900 rounded-lg p-0.5 border border-navy-700">
              {showCash && (
                <button onClick={() => setMode('cash')} className={cn('px-3 py-1 rounded text-xs font-medium transition-all', mode === 'cash' ? 'bg-brand-500 text-white' : 'text-slate-400')}>Cash</button>
              )}
              {showAward && (
                <button onClick={() => setMode('award')} className={cn('px-3 py-1 rounded text-xs font-medium transition-all', mode === 'award' ? 'bg-amber-500 text-white' : 'text-slate-400')}>Award</button>
              )}
            </div>
          )}
          <div className="flex gap-1">
            {[7, 30, 60, 90].map(d => (
              <button key={d} onClick={() => setDays(d)} className={cn('px-2 py-0.5 rounded text-xs transition-all', days === d ? 'bg-navy-600 text-slate-200' : 'text-slate-600 hover:text-slate-400')}>
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-6 mb-5">
        {mode === 'cash' && (search.all_time_low_cash || search.latest_cash) && (
          <>
            {search.latest_cash && (
              <div>
                <div className="text-xs text-slate-500">Current Low</div>
                <div className="text-xl font-bold text-amber-400">{formatCurrency(search.latest_cash)}</div>
              </div>
            )}
            {search.all_time_low_cash && (
              <div>
                <div className="text-xs text-slate-500">All-Time Low</div>
                <div className="text-xl font-bold text-emerald-400">{formatCurrency(search.all_time_low_cash)}</div>
              </div>
            )}
          </>
        )}
        {mode === 'award' && search.all_time_low_points && (
          <div>
            <div className="text-xs text-slate-500">Best Award Found</div>
            <div className="text-xl font-bold text-amber-400">{formatPoints(search.all_time_low_points)}</div>
          </div>
        )}
        <div className="ml-auto">
          <Badge variant="default" className="text-xs">{search.snapshot_count} snapshots</Badge>
        </div>
      </div>

      <PriceAreaChart
        data={chartData || []}
        mode={mode}
        currentPrice={mode === 'cash' ? search.latest_cash : undefined}
        allTimeLow={mode === 'cash' ? search.all_time_low_cash : search.all_time_low_points}
      />
    </Card>
  );
}
