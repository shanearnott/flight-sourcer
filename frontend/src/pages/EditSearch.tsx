import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, CheckCircle, Plane, Calendar, Filter, Bell } from 'lucide-react';
import { searchesApi } from '../api/client';
import LocationInput from '../components/search/LocationInput';
import AirlineSelector from '../components/search/AirlineSelector';
import { Button, Input, Select, Card, Spinner } from '../components/ui';
import { cn } from '../utils/cn';

const STEPS = [
  { id: 1, label: 'Route', icon: Plane },
  { id: 2, label: 'Dates', icon: Calendar },
  { id: 3, label: 'Airlines', icon: Filter },
  { id: 4, label: 'Alerts', icon: Bell },
];

interface FormData {
  name: string;
  origin: { label: string; airports: string[] } | null;
  destination: { label: string; airports: string[] } | null;
  trip_type: 'weekend' | 'week' | 'custom';
  window_start: string;
  window_end: string;
  min_nights: number;
  max_nights: number;
  cabin_class: string[];
  adults: number;
  search_mode: 'cash' | 'award' | 'both';
  airline_codes: string[] | null;
  alert_email: string;
  alert_threshold_cash: string;
  alert_threshold_points: string;
}

export default function EditSearch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: search, isLoading } = useQuery({
    queryKey: ['search', id],
    queryFn: () => searchesApi.get(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (search && !form) {
      setForm({
        name: search.name,
        origin: { label: search.origin_label, airports: search.origin_airports },
        destination: { label: search.destination_label, airports: search.destination_airports },
        trip_type: search.trip_type,
        window_start: search.window_start,
        window_end: search.window_end,
        min_nights: search.min_nights,
        max_nights: search.max_nights,
        cabin_class: Array.isArray(search.cabin_class) ? search.cabin_class : [search.cabin_class],
        adults: search.adults,
        search_mode: search.search_mode,
        airline_codes: search.airline_codes,
        alert_email: search.alert_email || '',
        alert_threshold_cash: search.alert_threshold_cash?.toString() || '',
        alert_threshold_points: search.alert_threshold_points?.toString() || '',
      });
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMutation = useMutation({
    mutationFn: () => searchesApi.update(id!, {
      name: form!.name,
      origin_label: form!.origin?.label || '',
      destination_label: form!.destination?.label || '',
      origin_airports: form!.origin?.airports || [],
      destination_airports: form!.destination?.airports || [],
      trip_type: form!.trip_type,
      window_start: form!.window_start,
      window_end: form!.window_end,
      min_nights: form!.min_nights,
      max_nights: form!.max_nights,
      cabin_class: form!.cabin_class,
      adults: form!.adults,
      airline_codes: form!.airline_codes,
      search_mode: form!.search_mode,
      alert_email: form!.alert_email || null,
      alert_threshold_cash: form!.alert_threshold_cash ? parseFloat(form!.alert_threshold_cash) : null,
      alert_threshold_points: form!.alert_threshold_points ? parseInt(form!.alert_threshold_points) : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search', id] });
      queryClient.invalidateQueries({ queryKey: ['searches'] });
      navigate(`/search/${id}`);
    },
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => f ? { ...f, [key]: value } : f);
    setErrors(e => { const next = { ...e }; delete next[key]; return next; });
  }

  function validateStep(): boolean {
    if (!form) return false;
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.name.trim()) errs.name = 'Name is required';
      if (!form.origin) errs.origin = 'Origin is required';
      if (!form.destination) errs.destination = 'Destination is required';
    }
    if (step === 2) {
      if (!form.window_start) errs.window_start = 'Start date required';
      if (!form.window_end) errs.window_end = 'End date required';
      if (form.window_start >= form.window_end) errs.window_end = 'End must be after start';
    }
    if (step === 4 && form.alert_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.alert_email)) {
      errs.alert_email = 'Invalid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() { if (validateStep()) setStep(s => Math.min(4, s + 1)); }
  function prev() { setStep(s => Math.max(1, s - 1)); }

  if (isLoading || !form) return <div className="flex justify-center items-center h-96"><Spinner /></div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Edit Search</h1>
        <p className="text-slate-400 text-sm mt-1">{form.name}</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all text-sm font-medium',
                  step === s.id ? 'bg-brand-500 text-white ring-4 ring-brand-500/20' :
                  step > s.id ? 'bg-brand-500/20 text-brand-400' :
                  'bg-navy-700 text-slate-500'
                )}
              >
                {step > s.id ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
              </button>
              <span className={cn('text-xs mt-1.5', step === s.id ? 'text-brand-400 font-medium' : 'text-slate-600')}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px mx-2 mb-5 transition-colors', step > s.id ? 'bg-brand-500/40' : 'bg-navy-700')} />
            )}
          </div>
        ))}
      </div>

      <Card className="mb-6">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-slate-200 mb-1">Route Details</h2>
            <Input
              label="Search Name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Sydney to London Easter weekend"
              error={errors.name}
            />
            <div className="grid grid-cols-2 gap-4">
              <LocationInput
                label="Origin"
                value={form.origin}
                onChange={v => set('origin', v)}
                placeholder="From city or airport..."
                error={errors.origin}
              />
              <LocationInput
                label="Destination"
                value={form.destination}
                onChange={v => set('destination', v)}
                placeholder="To city or airport..."
                error={errors.destination}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cabin Class <span className="text-slate-500 font-normal">(select one or more)</span></label>
              <div className="grid grid-cols-4 gap-2">
                {([['ECONOMY', 'Economy'], ['PREMIUM_ECONOMY', 'Prem. Economy'], ['BUSINESS', 'Business'], ['FIRST', 'First']] as const).map(([val, label]) => {
                  const selected = form.cabin_class.includes(val);
                  return (
                    <button key={val} type="button" onClick={() => {
                      const next = selected ? form.cabin_class.filter(c => c !== val) : [...form.cabin_class, val];
                      if (next.length > 0) set('cabin_class', next);
                    }} className={cn('p-2.5 rounded-xl border text-sm font-medium transition-all text-center', selected ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-navy-500 bg-navy-800/50 text-slate-400 hover:border-navy-400')}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Travellers" value={form.adults} onChange={e => set('adults', parseInt(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>{n} adult{n > 1 ? 's' : ''}</option>)}
              </Select>
              <Select label="Search Type" value={form.search_mode} onChange={e => set('search_mode', e.target.value as FormData['search_mode'])}>
                <option value="both">Cash + Award</option>
                <option value="cash">Cash Only</option>
                <option value="award">Award Only</option>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-slate-200 mb-1">Date Range</h2>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Trip Type</label>
              <div className="grid grid-cols-3 gap-3">
                {(['weekend', 'week', 'custom'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => set('trip_type', type)}
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all',
                      form.trip_type === type
                        ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                        : 'border-navy-500 bg-navy-800/50 text-slate-400 hover:border-navy-400'
                    )}
                  >
                    <div className="font-medium text-sm capitalize">{type}</div>
                    <div className="text-xs mt-0.5 opacity-75">
                      {type === 'weekend' ? 'Fri-Sun trips' : type === 'week' ? 'Mon-Sun trips' : 'Custom length'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Search Window Start"
                value={form.window_start}
                onChange={e => set('window_start', e.target.value)}
                error={errors.window_start}
                hint="Earliest departure date to check"
              />
              <Input
                type="date"
                label="Search Window End"
                value={form.window_end}
                onChange={e => set('window_end', e.target.value)}
                error={errors.window_end}
                hint="Latest departure date to check"
              />
            </div>
            {form.trip_type === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" label="Min Nights" value={form.min_nights} onChange={e => set('min_nights', parseInt(e.target.value))} min={1} max={30} />
                <Input type="number" label="Max Nights" value={form.max_nights} onChange={e => set('max_nights', parseInt(e.target.value))} min={1} max={30} />
              </div>
            )}
            <div className="px-4 py-3 bg-brand-500/5 border border-brand-500/20 rounded-lg text-sm text-slate-400">
              {form.trip_type === 'weekend' && <>Will check all <strong className="text-brand-400">Friday → Sunday</strong> combinations within your window</>}
              {form.trip_type === 'week' && <>Will check all <strong className="text-brand-400">Monday → Sunday</strong> combinations within your window</>}
              {form.trip_type === 'custom' && <>Will check trips of <strong className="text-brand-400">{form.min_nights}–{form.max_nights} nights</strong> within your window</>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-slate-200 mb-4">Airline Preferences</h2>
            <AirlineSelector value={form.airline_codes} onChange={v => set('airline_codes', v)} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-200">Price Alerts</h2>
              <p className="text-slate-500 text-sm mt-1">Get emailed when prices drop below your targets</p>
            </div>
            <Input
              type="email"
              label="Alert Email"
              value={form.alert_email}
              onChange={e => set('alert_email', e.target.value)}
              placeholder="you@example.com"
              error={errors.alert_email}
              hint="Leave blank to disable email alerts"
            />
            <div className="grid grid-cols-2 gap-4">
              {(form.search_mode === 'cash' || form.search_mode === 'both') && (
                <Input
                  type="number"
                  label="Cash Alert Threshold (USD)"
                  value={form.alert_threshold_cash}
                  onChange={e => set('alert_threshold_cash', e.target.value)}
                  placeholder="e.g. 800"
                  hint="Alert when price is at or below this"
                />
              )}
              {(form.search_mode === 'award' || form.search_mode === 'both') && (
                <Input
                  type="number"
                  label="Award Alert Threshold (pts)"
                  value={form.alert_threshold_points}
                  onChange={e => set('alert_threshold_points', e.target.value)}
                  placeholder="e.g. 50000"
                  hint="Alert when award is at or below this"
                />
              )}
            </div>
            {form.alert_email && (
              <div className="px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-sm text-slate-400">
                Daily alerts will be sent to <strong className="text-amber-400">{form.alert_email}</strong>.
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-navy-700 space-y-2">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Search Summary</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                <div className="text-slate-500">Route</div>
                <div className="text-slate-200">{form.origin?.label || '—'} → {form.destination?.label || '—'}</div>
                <div className="text-slate-500">Trip type</div>
                <div className="text-slate-200 capitalize">{form.trip_type}</div>
                <div className="text-slate-500">Window</div>
                <div className="text-slate-200">{form.window_start} to {form.window_end}</div>
                <div className="text-slate-500">Cabin</div>
                <div className="text-slate-200">{form.cabin_class.join(', ')}</div>
                <div className="text-slate-500">Search type</div>
                <div className="text-slate-200 capitalize">{form.search_mode}</div>
                <div className="text-slate-500">Airlines</div>
                <div className="text-slate-200">{form.airline_codes ? `${form.airline_codes.length} selected` : 'All airlines'}</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={step === 1 ? () => navigate(`/search/${id}`) : prev}>
          {step === 1 ? 'Cancel' : <><ChevronLeft className="w-4 h-4" />Back</>}
        </Button>
        {step < 4 ? (
          <Button onClick={next}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={() => updateMutation.mutate()} loading={updateMutation.isPending}>
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}
