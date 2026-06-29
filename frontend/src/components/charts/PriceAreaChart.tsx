import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatDate, formatCurrency, formatPoints } from '../../utils/formatters';
import type { PriceSnapshot } from '../../api/client';

interface PriceAreaChartProps {
  data: PriceSnapshot[];
  mode: 'cash' | 'award';
  currentPrice?: number | null;
  allTimeLow?: number | null;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label, mode }: TooltipProps & { mode: 'cash' | 'award' }) {
  if (!active || !payload?.length) return null;

  const format = mode === 'cash' ? formatCurrency : (v: number) => formatPoints(v);
  const data = Object.fromEntries(payload.map(p => [p.name, p.value]));

  return (
    <div className="bg-navy-800 border border-navy-500 rounded-xl p-3 shadow-2xl text-sm">
      <div className="font-medium text-white mb-2">{label}</div>
      {data.max_price !== undefined && (
        <div className="flex justify-between gap-4 text-slate-400">
          <span>High</span>
          <span>{format(data.max_price)}</span>
        </div>
      )}
      {data.avg_price !== undefined && (
        <div className="flex justify-between gap-4 text-brand-400 font-medium">
          <span>Avg</span>
          <span>{format(data.avg_price)}</span>
        </div>
      )}
      {data.min_price !== undefined && (
        <div className="flex justify-between gap-4 text-emerald-400">
          <span>Low</span>
          <span>{format(data.min_price)}</span>
        </div>
      )}
    </div>
  );
}

export default function PriceAreaChart({ data, mode, currentPrice, allTimeLow }: PriceAreaChartProps) {
  const format = mode === 'cash'
    ? (v: number) => formatCurrency(v)
    : (v: number) => `${(v / 1000).toFixed(0)}k`;

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No price history yet. Run a search to start tracking.
      </div>
    );
  }

  const minVal = Math.min(...data.map(d => d.min_price));
  const maxVal = Math.max(...data.map(d => d.max_price));
  const padding = (maxVal - minVal) * 0.1 || 50;

  return (
    <div className="w-full">
      {/* Stats row */}
      {(currentPrice || allTimeLow) && (
        <div className="flex gap-6 mb-4">
          {currentPrice && (
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Current Low</div>
              <div className="text-xl font-bold text-amber-400">
                {mode === 'cash' ? formatCurrency(currentPrice) : formatPoints(currentPrice)}
              </div>
            </div>
          )}
          {allTimeLow && (
            <div>
              <div className="text-xs text-slate-500 mb-0.5">All-Time Low</div>
              <div className="text-xl font-bold text-emerald-400">
                {mode === 'cash' ? formatCurrency(allTimeLow) : formatPoints(allTimeLow)}
              </div>
            </div>
          )}
          {currentPrice && allTimeLow && currentPrice > allTimeLow && (
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Above Low</div>
              <div className="text-xl font-bold text-slate-300">
                +{mode === 'cash' ? formatCurrency(currentPrice - allTimeLow) : formatPoints(currentPrice - allTimeLow)}
              </div>
            </div>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#162440" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatDate(v)}
            interval="preserveStartEnd"
          />

          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={format}
            domain={[Math.max(0, minVal - padding), maxVal + padding]}
            width={60}
          />

          <Tooltip content={<CustomTooltip mode={mode} />} />

          {/* Shaded min-max band: fill area from top down to max, then "erase" bottom with white */}
          <Area
            type="monotone"
            dataKey="max_price"
            stroke="none"
            fill="url(#priceGradient)"
            fillOpacity={1}
            name="max_price"
            legendType="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="min_price"
            stroke="none"
            fill="#0d1629"
            fillOpacity={1}
            name="min_price"
            legendType="none"
            isAnimationActive={false}
          />

          {/* Boundary lines */}
          <Line
            type="monotone"
            dataKey="max_price"
            stroke="#6366f1"
            strokeWidth={1}
            strokeDasharray="4 2"
            dot={false}
            name="High"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="min_price"
            stroke="#10b981"
            strokeWidth={1.5}
            dot={false}
            name="Low"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="avg_price"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name="Avg"
            isAnimationActive={false}
          />

          <Legend
            wrapperStyle={{ paddingTop: '12px' }}
            formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
