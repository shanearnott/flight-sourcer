import { useQuery } from '@tanstack/react-query';
import { Bell, BellOff, ArrowRight } from 'lucide-react';
import { searchesApi, historyApi } from '../api/client';
import { EmptyState, Spinner, Badge, Card } from '../components/ui';
import { formatCurrency, formatPoints, formatRelativeTime } from '../utils/formatters';
import { Link } from 'react-router-dom';

export default function AlertLog() {
  const { data: searches, isLoading } = useQuery({
    queryKey: ['searches'],
    queryFn: () => searchesApi.list(),
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Alert Log</h1>
        <p className="text-slate-400 text-sm mt-1">History of price alerts sent</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : !searches?.length ? (
        <EmptyState
          icon={<BellOff className="w-12 h-12" />}
          title="No searches configured"
          description="Create a search with an alert email to start receiving notifications."
        />
      ) : (
        <div className="space-y-4">
          {searches.map(search => (
            <SearchAlerts key={search.id} searchId={search.id} searchName={search.name} route={`${search.origin_label} → ${search.destination_label}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchAlerts({ searchId, searchName, route }: { searchId: string; searchName: string; route: string }) {
  const { data: alerts } = useQuery({
    queryKey: ['alerts', searchId],
    queryFn: () => historyApi.alerts(searchId),
  });

  if (!alerts?.length) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-200">{searchName}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
            {route.split(' → ').map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                {part}
                {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
              </span>
            ))}
          </p>
        </div>
        <Link to={`/search/${searchId}`} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View History →</Link>
      </div>

      <div className="space-y-2">
        {(alerts as Array<{ alert_type: string; price: number; sent_at: string; details: string }>).map((alert, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-navy-900/50 border border-navy-700">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-sm text-slate-200">
                  {alert.alert_type === 'cash' ? formatCurrency(alert.price) : formatPoints(alert.price)}
                </div>
                <div className="text-xs text-slate-500">{formatRelativeTime(alert.sent_at)}</div>
              </div>
            </div>
            <Badge variant={alert.alert_type === 'cash' ? 'info' : 'warning'}>
              {alert.alert_type === 'cash' ? 'Cash' : 'Award'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
