import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, Globe2, X } from 'lucide-react';
import { flightsApi, type LocationResult } from '../../api/client';
import { matchRegions, type Region } from '../../data/regions';
import { cn } from '../../utils/cn';

interface LocationValue {
  label: string;
  airports: string[];
}

interface LocationInputProps {
  label: string;
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  placeholder?: string;
  error?: string;
}

function buildLabel(codes: string[]): string {
  if (codes.length === 0) return '';
  if (codes.length <= 3) return codes.join(', ');
  return `${codes.slice(0, 2).join(', ')} +${codes.length - 2} more`;
}

export default function LocationInput({ label, value, onChange, placeholder, error }: LocationInputProps) {
  const [query, setQuery] = useState('');
  const [apiResults, setApiResults] = useState<LocationResult[]>([]);
  const [regionResults, setRegionResults] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = value?.airports ?? [];

  const search = useCallback(async (q: string) => {
    setRegionResults(matchRegions(q));
    if (q.length < 2) { setApiResults([]); return; }
    setLoading(true);
    try {
      const data = await flightsApi.locations(q);
      setApiResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function merge(incoming: string[]) {
    const next = [...new Set([...selected, ...incoming])];
    onChange({ label: buildLabel(next), airports: next });
    setQuery('');
    setApiResults([]);
    setRegionResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  function remove(code: string) {
    const next = selected.filter(c => c !== code);
    if (next.length === 0) {
      onChange(null);
    } else {
      onChange({ label: buildLabel(next), airports: next });
    }
  }

  function handleSelectRegion(region: Region) {
    merge(region.airports.map(a => a.code));
  }

  function handleSelectLocation(loc: LocationResult) {
    merge([loc.iataCode]);
  }

  const hasResults = regionResults.length > 0 || apiResults.length > 0;

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-sm font-medium text-slate-300">{label}</label>

      {/* Airport chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(code => (
            <span
              key={code}
              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold"
            >
              {code}
              <button
                type="button"
                onClick={() => remove(code)}
                className="ml-0.5 rounded hover:bg-brand-500/30 p-0.5 transition-colors"
                aria-label={`Remove ${code}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading
            ? <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
            : <MapPin className="w-4 h-4 text-slate-500" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length > 0 ? 'Add another airport or region…' : (placeholder || 'Airport, city, or region…')}
          className={cn(
            'w-full pl-9 pr-3 py-2.5 bg-navy-800 border rounded-lg text-slate-100 placeholder-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm',
            error && selected.length === 0 ? 'border-red-500/50' : 'border-navy-500 hover:border-navy-400',
          )}
        />

        {open && hasResults && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-navy-800 border border-navy-500 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">

            {/* Region results */}
            {regionResults.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 bg-navy-850 border-b border-navy-700">
                  Regions
                </div>
                {regionResults.map(region => {
                  const newCodes = region.airports.map(a => a.code).filter(c => !selected.includes(c));
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => handleSelectRegion(region)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-navy-700 transition-colors border-b border-navy-700 last:border-0"
                    >
                      <div className="w-10 h-7 bg-brand-500/15 border border-brand-500/25 rounded flex items-center justify-center flex-shrink-0">
                        <Globe2 className="w-3.5 h-3.5 text-brand-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-100">{region.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-brand-500/20 text-brand-400 rounded font-medium">
                            {newCodes.length > 0 ? `+${newCodes.length}` : 'all added'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-2">
                          {region.airports.map(a => (
                            <span key={a.code} className={cn('font-mono font-bold', selected.includes(a.code) ? 'text-slate-600 line-through' : 'text-slate-300')}>
                              {a.code}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {/* Airport / city results */}
            {apiResults.length > 0 && (
              <>
                {regionResults.length > 0 && (
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 bg-navy-850 border-b border-navy-700">
                    Airports &amp; Cities
                  </div>
                )}
                {apiResults.map(loc => {
                  const alreadyAdded = selected.includes(loc.iataCode);
                  return (
                    <button
                      key={loc.iataCode}
                      type="button"
                      onClick={() => !alreadyAdded && handleSelectLocation(loc)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-navy-700 last:border-0',
                        alreadyAdded ? 'opacity-50 cursor-default' : 'hover:bg-navy-700',
                      )}
                    >
                      <div className="w-10 h-7 bg-navy-600 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold font-mono text-brand-400">{loc.iataCode}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-100 truncate">
                          {loc.cityName || loc.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {loc.name !== loc.cityName && loc.name}&nbsp;
                          {loc.countryName}
                          {loc.subType === 'CITY' && <span className="ml-1 text-amber-400/70">· all airports</span>}
                        </div>
                      </div>
                      {alreadyAdded && <span className="text-xs text-slate-600 flex-shrink-0">Added</span>}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {error && selected.length === 0 && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
