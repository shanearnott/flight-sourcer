import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Check, Plane } from 'lucide-react';
import { airlinesApi, type Airline } from '../../api/client';
import { cn } from '../../utils/cn';
import { Button } from '../ui';

interface AirlineSelectorProps {
  value: string[] | null;
  onChange: (codes: string[] | null) => void;
}

type FilterMode = 'all' | 'alliance' | 'custom';

const ALLIANCE_COLORS = {
  'Star Alliance': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-400' },
  'oneworld': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
  'SkyTeam': { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', dot: 'bg-sky-400' },
};

export default function AirlineSelector({ value, onChange }: AirlineSelectorProps) {
  const [mode, setMode] = useState<FilterMode>(value === null ? 'all' : 'custom');
  const [expandedAlliance, setExpandedAlliance] = useState<string | null>(null);
  const [selectedAlliance, setSelectedAlliance] = useState<string | null>(null);

  const { data: alliances } = useQuery({
    queryKey: ['airlines-alliances'],
    queryFn: () => airlinesApi.alliances(),
    staleTime: Infinity,
  });

  const { data: allAirlines } = useQuery({
    queryKey: ['airlines'],
    queryFn: () => airlinesApi.list(),
    staleTime: Infinity,
  });

  const selected = new Set(value || []);

  function toggleAirline(code: string) {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    onChange(next.size > 0 ? Array.from(next) : null);
  }

  function selectAlliance(allianceName: string) {
    const airline = alliances?.find(a => a.name === allianceName);
    if (!airline) return;
    const codes = airline.airlines.map((a: Airline) => a.code);
    onChange(codes);
    setSelectedAlliance(allianceName);
    setMode('alliance');
  }

  function clearFilter() {
    onChange(null);
    setMode('all');
    setSelectedAlliance(null);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">Airlines</label>

      {/* Mode selector */}
      <div className="flex gap-2">
        {(['all', 'alliance', 'custom'] as FilterMode[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => {
              if (m === 'all') clearFilter();
              else setMode(m);
            }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              mode === m
                ? 'bg-brand-500 text-white'
                : 'bg-navy-700 text-slate-400 hover:text-slate-200 hover:bg-navy-600'
            )}
          >
            {m === 'all' ? 'Any Airline' : m === 'alliance' ? 'By Alliance' : 'Pick Airlines'}
          </button>
        ))}
      </div>

      {mode === 'all' && (
        <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
          Searching all available airlines
        </div>
      )}

      {mode === 'alliance' && (
        <div className="space-y-2">
          {alliances?.map(alliance => {
            const colors = ALLIANCE_COLORS[alliance.name as keyof typeof ALLIANCE_COLORS] || ALLIANCE_COLORS['Star Alliance'];
            const isSelected = selectedAlliance === alliance.name;
            return (
              <div key={alliance.name} className={cn('border rounded-xl overflow-hidden transition-all', colors.border, isSelected ? colors.bg : 'border-navy-500 bg-navy-800/50')}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  onClick={() => selectAlliance(alliance.name)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-2 h-2 rounded-full', colors.dot)} />
                    <span className={cn('font-medium text-sm', isSelected ? colors.text : 'text-slate-200')}>{alliance.name}</span>
                    <span className="text-xs text-slate-500">{alliance.airlines.length} airlines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && <Check className={cn('w-4 h-4', colors.text)} />}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setExpandedAlliance(expandedAlliance === alliance.name ? null : alliance.name); }}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {expandedAlliance === alliance.name ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </button>
                {expandedAlliance === alliance.name && (
                  <div className="px-4 pb-3 grid grid-cols-2 gap-1">
                    {alliance.airlines.map((airline: Airline) => (
                      <div key={airline.code} className="flex items-center gap-1.5 text-xs text-slate-400 py-0.5">
                        <Plane className="w-3 h-3" />
                        <span className="font-medium text-slate-300">{airline.code}</span>
                        <span className="truncate">{airline.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {mode === 'custom' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{selected.size} selected</span>
            {selected.size > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilter} className="text-xs">Clear all</Button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {allAirlines?.map(airline => {
              const isSelected = selected.has(airline.code);
              const allianceColors = airline.alliance ? ALLIANCE_COLORS[airline.alliance as keyof typeof ALLIANCE_COLORS] : null;
              return (
                <button
                  key={airline.code}
                  type="button"
                  onClick={() => toggleAirline(airline.code)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm',
                    isSelected
                      ? 'bg-brand-500/15 border border-brand-500/30'
                      : 'hover:bg-navy-700 border border-transparent'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors',
                    isSelected ? 'bg-brand-500 border-brand-500' : 'border-navy-400 bg-navy-700'
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-mono text-xs w-7 text-brand-400 flex-shrink-0">{airline.code}</span>
                  <span className="flex-1 truncate text-slate-200">{airline.name}</span>
                  {airline.alliance && allianceColors && (
                    <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0', allianceColors.bg, allianceColors.text)}>
                      {airline.alliance.split(' ')[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
