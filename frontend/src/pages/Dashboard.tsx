import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, TrendingDown, Bell, Database, Plane } from 'lucide-react';
import { searchesApi, historyApi } from '../api/client';
import SearchCard from '../components/search/SearchCard';
import { Button, EmptyState, Spinner, Card } from '../components/ui';
import { formatCurrency, formatPoints, formatRelativeTime } from '../utils/formatters';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Search;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </Card>
  );
}

export default function Dashboard() {
  const { data: searches, isLoading: searchesLoading } = useQuery({
    queryKey: ['searches'],
    queryFn: () => searchesApi.list(),
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => historyApi.stats(),
    refetchInterval: 30000,
  });

  const activeSearches = searches?.filter(s => s.is_active) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Flight price monitoring at a glance</p>
        </div>
        <Link to="/searches/new">
          <Button>
            <Plus className="w-4 h-4" />
            New Search
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Search}
          label="Active Searches"
          value={stats?.activeSearches ?? (searches?.filter(s => s.is_active).length ?? '—')}
          color="bg-brand-500/15 text-brand-400"
        />
        <StatCard
          icon={Bell}
          label="Alerts Today"
          value={stats?.alertsToday ?? '—'}
          sub="Email notifications sent"
          color="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          icon={Database}
          label="Price Records"
          value={stats?.totalSnapshots ?? '—'}
          sub="Stored snapshots"
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          icon={TrendingDown}
          label="Best Find"
          value={(() => {
            if (!stats?.recentLows?.length) return '—';
            const low = stats.recentLows[0];
            return low.snapshot_type === 'cash' ? formatCurrency(low.min_price) : formatPoints(low.min_price);
          })()}
          sub={stats?.recentLows?.[0] ? `${stats.recentLows[0].origin_label} → ${stats.recentLows[0].destination_label}` : 'Last 24h'}
          color="bg-sky-500/15 text-sky-400"
        />
      </div>

      {/* Recent Lows */}
      {stats?.recentLows && stats.recentLows.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            Recent Price Lows (last 24h)
          </h2>
          <div className="space-y-2">
            {stats.recentLows.map((low, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-navy-700 last:border-0">
                <div>
                  <span className="text-sm font-medium text-slate-200">{low.name}</span>
                  <span className="text-xs text-slate-500 ml-2">{low.origin_label} → {low.destination_label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-emerald-400">
                    {low.snapshot_type === 'cash' ? formatCurrency(low.min_price) : formatPoints(low.min_price)}
                  </span>
                  <span className="text-xs text-slate-600">{formatRelativeTime(low.checked_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active searches */}
      <div>
        <h2 className="text-base font-semibold text-slate-200 mb-4">
          Active Searches
          {activeSearches.length > 0 && <span className="ml-2 text-slate-500 font-normal">({activeSearches.length})</span>}
        </h2>

        {searchesLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : activeSearches.length === 0 ? (
          <EmptyState
            icon={<Plane className="w-12 h-12" />}
            title="No active searches"
            description="Create your first flight search to start tracking prices and get alerts when fares drop."
            action={
              <Link to="/searches/new">
                <Button><Plus className="w-4 h-4" />Create Search</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeSearches.map(search => (
              <SearchCard key={search.id} search={search} />
            ))}
          </div>
        )}
      </div>

      {/* Paused searches */}
      {searches?.some(s => !s.is_active) && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-slate-400 mb-4">
            Paused Searches ({searches.filter(s => !s.is_active).length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {searches.filter(s => !s.is_active).map(search => (
              <SearchCard key={search.id} search={search} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
