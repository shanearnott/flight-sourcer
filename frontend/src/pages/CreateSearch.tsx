import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, CheckCircle, Plane, Calendar, Filter, Bell } from 'lucide-react';
import { searchesApi, settingsApi } from '../api/client';
import LocationInput from '../components/search/LocationInput';
import AirlineSelector from '../components/search/AirlineSelector';
import { Button, Input, Select, Card } from '../components/ui';
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
  cabin_class: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  adults: number;
  search_mode: 'cash' | 'award' | 'both';
  airline_codes: string[] | null;
  alert_email: string;
  alert_threshold_cash: string;
  alert_threshold_points: string;
}

const today = new Date().toISOString().split('T')[0];
const inThreeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const defaultForm: FormData = {
  name: '',
  origin: null,
  destination: null,
  trip_type: 'weekend',
  window_start: today,
  window_end: inThreeMonths,
  min_nights: 2,
  max_nights: 7,
  cabin_class: 'ECONOMY',
  adults: 1,
  search_mode: 'both',
  airline_codes: null,
  alert_email: '',
  alert_threshold_cash: '',
  alert_threshold_points: '',
};

export default function CreateSearch() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: appSettings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: settingsApi.get,
  });

  useEffect(() => {
    if (appSettings?.alert_email && !form.alert_email) {
      setForm(f => ({ ...f, alert_email: appSettings.alert_email ?? '' }));
    }
  }, [appSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  const createMutation = useMutation({
    mutationFn: () => searchesApi.create({
      name: form.name,
      origin_label: form.origin?.label || '',
      destination_label: form.destination?.label || '',
      origin_airports: form.origin?.airports || [],
      destination_airports: form.destination?.airports || [],
      trip_type: form.trip_type,
      window_start: form.window_start,
      window_end: form.window_end,
      min_nights: form.min_nights,
      max_nights: form.max_nights,
      cabin_class: form.cabin_class,
      adults: form.adults,
      airline_codes: form.airline_codes,
      search_mode: form.search_mode,
      alert_email: form.alert_email || null,
      alert_threshold_cash: form.alert_threshold_cash ? parseFloat(form.alert_threshold_cash) : null,
      alert_threshold_points: form.alert_threshold_points ? parseInt(form.alert_threshold_points) : null,
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['searches'] });
      navigate(`/search/${data.id}`);
    },
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const next = { ...e }; delete next[key]; return next; });
  }

  function validateStep(): boolean {
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

  function next() {
    if (validateStep()) setStep(s => Math.min(4, s + 1));
  }

  function prev() {
    setStep(s => Math.max(1, s - 1));
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Flight Search</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your search and alert preferences</p>
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
        {/* Step 1: Route */}
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
            <div className="grid grid-cols-3 gap-4">
              <Select label="Cabin Class" value={form.cabin_class} onChange={e => set('cabin_class', e.target.value as FormData['cabin_class'])}>
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First Class</option>
              </Select>
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

        {/* Step 2: Dates */}
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
                <Input
                  type="number"
                  label="Min Nights"
                  value={form.min_nights}
                  onChange={e => set('min_nights', parseInt(e.target.value))}
                  min={1} max={30}
                />
                <Input
                  type="number"
                  label="Max Nights"
                  value={form.max_nights}
                  onChange={e => set('max_nights', parseInt(e.target.value))}
                  min={1} max={30}
                />
              </div>
            )}

            <div className="px-4 py-3 bg-brand-500/5 border border-brand-500/20 rounded-lg text-sm text-slate-400">
              {form.trip_type === 'weekend' && <>Will check all <strong className="text-brand-400">Friday → Sunday</strong> combinations within your window</>}
              {form.trip_type === 'week' && <>Will check all <strong className="text-brand-400">Monday → Sunday</strong> combinations within your window</>}
              {form.trip_type === 'custom' && <>Will check trips of <strong className="text-brand-400">{form.min_nights}–{form.max_nights} nights</strong> within your window</>}
            </div>
          </div>
        )}

        {/* Step 3: Airlines */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-slate-200 mb-4">Airline Preferences</h2>
            <AirlineSelector value={form.airline_codes} onChange={v => set('airline_codes', v)} />
          </div>
        )}

        {/* Step 4: Alerts */}
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
                Configure SMTP settings in your <code className="text-xs bg-navy-700 px-1 rounded">.env</code> file.
              </div>
            )}

            {/* Summary */}
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
                <div className="text-slate-200">{form.cabin_class}</div>
                <div className="text-slate-500">Search type</div>
                <div className="text-slate-200 capitalize">{form.search_mode}</div>
                <div className="text-slate-500">Airlines</div>
                <div className="text-slate-200">{form.airline_codes ? `${form.airline_codes.length} selected` : 'All airlines'}</div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={step === 1 ? () => navigate('/searches') : prev}>
          {step === 1 ? 'Cancel' : <><ChevronLeft className="w-4 h-4" />Back</>}
        </Button>
        {step < 4 ? (
          <Button onClick={next}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => createMutation.mutate()}
            loading={createMutation.isPending}
          >
            Create Search
          </Button>
        )}
      </div>
    </div>
  );
}
