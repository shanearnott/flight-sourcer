import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { flightsApi, type LocationResult } from '../../api/client';
import { cn } from '../../utils/cn';

interface LocationInputProps {
  label: string;
  value: { label: string; airports: string[] } | null;
  onChange: (value: { label: string; airports: string[] } | null) => void;
  placeholder?: string;
  error?: string;
}

export default function LocationInput({ label, value, onChange, placeholder, error }: LocationInputProps) {
  const [query, setQuery] = useState(value?.label || '');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await flightsApi.locations(q);
      setResults(data);
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

  function handleSelect(loc: LocationResult) {
    onChange({ label: `${loc.cityName || loc.name}, ${loc.countryName}`, airports: [loc.iataCode] });
    setQuery(`${loc.cityName || loc.name} (${loc.iataCode})`);
    setOpen(false);
    setResults([]);
  }

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? <Loader2 className="w-4 h-4 text-slate-500 animate-spin" /> : <MapPin className="w-4 h-4 text-slate-500" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onChange(null); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'City or airport code...'}
          className={cn(
            'w-full pl-9 pr-3 py-2.5 bg-navy-800 border rounded-lg text-slate-100 placeholder-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm',
            error ? 'border-red-500/50' : 'border-navy-500 hover:border-navy-400',
          )}
        />

        {open && results.length > 0 && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-navy-800 border border-navy-500 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
            {results.map(loc => (
              <button
                key={loc.iataCode}
                type="button"
                onClick={() => handleSelect(loc)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-navy-700 transition-colors border-b border-navy-700 last:border-0"
              >
                <div className="w-10 h-7 bg-navy-600 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-brand-400">{loc.iataCode}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-100 truncate">{loc.name}</div>
                  <div className="text-xs text-slate-500">{loc.cityName}, {loc.countryName} &bull; {loc.subType}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {value?.airports && value.airports.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.airports.map(code => (
            <span key={code} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-500/15 border border-brand-500/30 rounded text-xs font-medium text-brand-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              {code}
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
