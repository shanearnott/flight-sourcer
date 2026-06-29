import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, TrendingUp, Minus, Play, ToggleLeft, ToggleRight, Trash2, Bell } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SavedSearch } from '../../api/client';
import { searchesApi } from '../../api/client';
import { formatCurrency, formatPoints, formatRelativeTime, cabinLabel } from '../../utils/formatters';
import { Badge, Button } from '../ui';
import { cn } from '../../utils/cn';

interface SearchCardProps {
  search: SavedSearch;
}

const TRIP_TYPE_LABELS = { weekend: 'Weekend', week: 'Week', custom: 'Custom' };
const MODE_LABELS = { cash: 'Cash', award: 'Award', both: 'Cash + Award' };

export default function SearchCard({ search }: SearchCardProps) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () => searchesApi.toggle(search.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['searches'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => searchesApi.delete(search.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['searches'] }),
  });

  const hasHistory = (search.snapshot_count || 0) > 0;
  const latestCash = search.latest_cash;
  const allTimeLow = search.all_time_low_cash;
  const priceTrend = latestCash && allTimeLow
    ? latestCash <= allTimeLow * 1.05 ? 'low' : latestCash >= allTimeLow * 1.3 ? 'high' : 'mid'
    : null;

  return (
    <div className={cn(
      'bg-navy-800 border rounded-xl overflow-hidden transition-all duration-200 group',
      search.is_active ? 'border-navy-500 hover:border-navy-400' : 'border-navy-600 opacity-60'
    )}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-100 truncate">{search.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-400">
              <span className="font-medium text-slate-300">{search.origin_label}</span>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium text-slate-300 truncate">{search.destination_label}</span>
            </div>
          </div>

          {hasHistory && latestCash && (
            <div className="text-right flex-shrink-0">
              <div className={cn(
                'text-2xl font-bold',
                priceTrend === 'low' ? 'text-emerald-400' : priceTrend === 'high' ? 'text-red-400' : 'text-amber-400'
              )}>
                {formatCurrency(latestCash)}
              </div>
              <div className="flex items-center justify-end gap-1 text-xs mt-0.5">
                {priceTrend === 'low' && <><TrendingDown className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Near low</span></>}
                {priceTrend === 'high' && <><TrendingUp className="w-3 h-3 text-red-400" /><span className="text-red-400">Above avg</span></>}
                {priceTrend === 'mid' && <><Minus className="w-3 h-3 text-slate-500" /><span className="text-slate-500">Mid range</span></>}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="default">{TRIP_TYPE_LABELS[search.trip_type]}</Badge>
          <Badge variant="purple">{MODE_LABELS[search.search_mode]}</Badge>
          <Badge variant="default">{cabinLabel(search.cabin_class)}</Badge>
          {search.alert_email && <Badge variant="warning"><Bell className="w-3 h-3 mr-1" />Alert</Badge>}
        </div>

        {/* Date window */}
        <div className="text-xs text-slate-500">
          {search.window_start} → {search.window_end} &bull;{' '}
          {search.origin_airports.join(', ')} → {search.destination_airports.join(', ')}
        </div>

        {/* All time low & award */}
        {(allTimeLow || search.all_time_low_points) && (
          <div className="mt-3 pt-3 border-t border-navy-700 flex gap-4 text-xs">
            {allTimeLow && (
              <div>
                <span className="text-slate-500">Best cash </span>
                <span className="text-emerald-400 font-medium">{formatCurrency(allTimeLow)}</span>
              </div>
            )}
            {search.all_time_low_points && (
              <div>
                <span className="text-slate-500">Best award </span>
                <span className="text-amber-400 font-medium">{formatPoints(search.all_time_low_points)}</span>
              </div>
            )}
          </div>
        )}

        {search.last_checked && (
          <div className="mt-2 text-xs text-slate-600">
            Checked {formatRelativeTime(search.last_checked)}
          </div>
        )}

        {!hasHistory && (
          <div className="mt-3 text-xs text-slate-500 italic">No price data yet</div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-navy-700 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Link to={`/search/${search.id}/run`}>
            <Button size="sm" variant="primary">
              <Play className="w-3 h-3" /> Search Now
            </Button>
          </Link>
          <Link to={`/search/${search.id}`}>
            <Button size="sm" variant="secondary">History</Button>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className="p-1.5 rounded-lg hover:bg-navy-700 text-slate-500 hover:text-slate-300 transition-colors"
            title={search.is_active ? 'Pause' : 'Resume'}
          >
            {search.is_active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => { if (confirm('Delete this search?')) deleteMutation.mutate(); }}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
            title="Delete search"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
