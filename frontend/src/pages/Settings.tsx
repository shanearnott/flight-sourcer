import { useState, useEffect } from 'react';
import { Settings2, ExternalLink, CheckCircle, XCircle, AlertTriangle, FlaskConical, Trash2, Loader2, Bell, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, demoApi, settingsApi } from '../api/client';
import { Card, Badge } from '../components/ui';
import { Input } from '../components/ui';

const isGHPages = import.meta.env.BASE_URL !== '/' && !import.meta.env.VITE_API_URL;

interface HealthStatus {
  status: string;
  timestamp: string;
}

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<HealthStatus>('/health').then(r => r.data),
    refetchInterval: 30000,
  });

  // Alert email setting
  const [alertEmail, setAlertEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const { data: appSettings } = useQuery({
    queryKey: ['app-settings'],
    queryFn: settingsApi.get,
  });

  const { data: apiStatus } = useQuery({
    queryKey: ['api-status'],
    queryFn: settingsApi.status,
    enabled: !!health,
  });

  useEffect(() => {
    if (appSettings?.alert_email) setAlertEmail(appSettings.alert_email);
  }, [appSettings]);

  const saveEmailMutation = useMutation({
    mutationFn: () => settingsApi.save({ alert_email: alertEmail || null }),
    onSuccess: () => {
      setEmailMsg({ text: 'Saved — new searches will pre-fill this address.', ok: true });
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      setTimeout(() => setEmailMsg(null), 4000);
    },
    onError: () => setEmailMsg({ text: 'Could not save — backend not reachable.', ok: false }),
  });

  const [demoMsg, setDemoMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const seedMutation = useMutation({
    mutationFn: demoApi.seed,
    onSuccess: (data) => {
      if (data.seeded) {
        setDemoMsg({ text: `Loaded ${data.searches} demo searches with 90 days of price history.`, ok: true });
        queryClient.invalidateQueries();
      } else {
        setDemoMsg({ text: data.message || 'Demo data already present.', ok: false });
      }
    },
    onError: () => setDemoMsg({ text: 'Could not reach the backend. Make sure it is running.', ok: false }),
  });

  const clearMutation = useMutation({
    mutationFn: demoApi.clear,
    onSuccess: (data) => {
      setDemoMsg({ text: `Removed ${data.removed} demo search${data.removed !== 1 ? 'es' : ''} and all associated data.`, ok: true });
      queryClient.invalidateQueries();
    },
    onError: () => setDemoMsg({ text: 'Could not reach the backend.', ok: false }),
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-brand-400" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configuration and API status</p>
      </div>

      {isGHPages && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium mb-1">Backend not connected</div>
            <div className="text-amber-400/70">
              This UI is running on GitHub Pages. To search flights, set the{' '}
              <code className="text-xs bg-amber-500/20 px-1.5 py-0.5 rounded">VITE_API_URL</code> repository secret
              to your backend URL (e.g. <code className="text-xs bg-amber-500/20 px-1.5 py-0.5 rounded">https://your-backend.railway.app</code>)
              and re-run the deployment workflow.
            </div>
          </div>
        </div>
      )}

      {/* API Status */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-slate-200 mb-4">API Status</h2>
        <div className="space-y-3">
          <StatusRow
            label="FlightSourcer API"
            description="Backend server"
            ok={!!health}
            detail={health ? 'Connected' : 'Not reachable'}
          />
          <StatusRow
            label="SerpApi"
            description="Cash fare search (Google Flights)"
            ok={apiStatus ? apiStatus.serpapi : null}
            detail={apiStatus ? (apiStatus.serpapi ? 'Configured' : 'SERPAPI_KEY not set') : 'Checking...'}
          />
          <StatusRow
            label="AviationStack"
            description="Airport search (optional)"
            ok={apiStatus ? apiStatus.aviationstack : null}
            detail={apiStatus ? (apiStatus.aviationstack ? 'Configured' : 'AVIATIONSTACK_KEY not set') : 'Checking...'}
          />
          <StatusRow
            label="Seat.aero API"
            description="Award seat search"
            ok={apiStatus ? apiStatus.seat_aero : null}
            detail={apiStatus ? (apiStatus.seat_aero ? 'Configured' : 'SEAT_AERO_API_KEY not set') : 'Checking...'}
          />
          <StatusRow
            label="Email (SMTP)"
            description="Price alerts"
            ok={apiStatus ? apiStatus.smtp : null}
            detail={apiStatus ? (apiStatus.smtp ? 'Configured' : 'SMTP credentials not set') : 'Checking...'}
          />
        </div>
      </Card>

      {/* Alert Email */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-slate-200 mb-1 flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-400" />
          Alert Email
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Your email address for price alert notifications. Used as the default for all searches —
          you can still override it per search. SMTP credentials stay in the server's <code className="text-xs bg-navy-700 px-1 py-0.5 rounded text-brand-400">.env</code> file.
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label="Your email address"
              type="email"
              value={alertEmail}
              onChange={e => { setAlertEmail(e.target.value); setEmailMsg(null); }}
              placeholder="you@example.com"
            />
          </div>
          <button
            onClick={() => saveEmailMutation.mutate()}
            disabled={saveEmailMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition-colors mb-0.5"
          >
            {saveEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
        {emailMsg && (
          <p className={`mt-2 text-sm ${emailMsg.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
            {emailMsg.ok
              ? <CheckCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
              : <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
            {emailMsg.text}
          </p>
        )}
      </Card>

      {/* Configuration guide */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-slate-200 mb-4">Configuration Guide</h2>
        <div className="space-y-4 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info">1</Badge>
              <span className="font-medium text-slate-200">SerpApi — Google Flights (Cash fares)</span>
            </div>
            <p className="text-slate-500 ml-7 mb-2">Register at serpapi.com and copy your API key to <code className="text-xs bg-navy-700 px-1.5 py-0.5 rounded text-brand-400">SERPAPI_KEY</code> in your <code className="text-xs bg-navy-700 px-1.5 py-0.5 rounded text-brand-400">.env</code> file. Free tier: 100 searches/month.</p>
            <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="ml-7 inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors text-xs">
              serpapi.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="border-t border-navy-700 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info">2</Badge>
              <span className="font-medium text-slate-200">AviationStack — Airport search (optional)</span>
            </div>
            <p className="text-slate-500 ml-7 mb-2">Supplements the built-in airport database for obscure airports. Free tier (100 calls/month) is sufficient. Add key as <code className="text-xs bg-navy-700 px-1.5 py-0.5 rounded text-brand-400">AVIATIONSTACK_KEY</code>.</p>
            <a href="https://aviationstack.com" target="_blank" rel="noopener noreferrer" className="ml-7 inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors text-xs">
              aviationstack.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="border-t border-navy-700 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="warning">3</Badge>
              <span className="font-medium text-slate-200">Seat.aero — Award availability</span>
            </div>
            <p className="text-slate-500 ml-7 mb-2">Personal and Partner plans both use the same API endpoint. Sign up at seats.aero and add your key as <code className="text-xs bg-navy-700 px-1.5 py-0.5 rounded text-brand-400">SEAT_AERO_API_KEY</code>.</p>
            <a href="https://seats.aero" target="_blank" rel="noopener noreferrer" className="ml-7 inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors text-xs">
              seats.aero <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="border-t border-navy-700 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">4</Badge>
              <span className="font-medium text-slate-200">Email Alerts (SMTP)</span>
            </div>
            <p className="text-slate-500 ml-7">Configure SMTP settings in <code className="text-xs bg-navy-700 px-1.5 py-0.5 rounded text-brand-400">.env</code>. For Gmail, use an App Password (not your main password). Alerts are sent daily at 6:00 AM when prices are below your threshold.</p>
          </div>
        </div>
      </Card>

      {/* Demo Data */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-slate-200 mb-1 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-brand-400" />
          Demo Data
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Populate the app with 4 sample searches (SYD→LAX, MEL→LHR, SYD→BKK, BNE→NRT) and 90 days of
          synthetic price history — no API keys required. Useful for exploring the UI before connecting a backend.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => { setDemoMsg(null); seedMutation.mutate(); }}
            disabled={seedMutation.isPending || clearMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            Load Demo Data
          </button>
          <button
            onClick={() => { setDemoMsg(null); clearMutation.mutate(); }}
            disabled={seedMutation.isPending || clearMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-500/40 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 transition-colors"
          >
            {clearMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Remove Demo Data
          </button>
        </div>
        {demoMsg && (
          <p className={`mt-3 text-sm ${demoMsg.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
            {demoMsg.ok ? <CheckCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
            {demoMsg.text}
          </p>
        )}
      </Card>

      {/* .env template */}
      <Card>
        <h2 className="text-base font-semibold text-slate-200 mb-3">Environment File Template</h2>
        <p className="text-sm text-slate-500 mb-3">Create <code className="text-xs bg-navy-700 px-1.5 py-0.5 rounded text-brand-400">backend/.env</code> with:</p>
        <pre className="bg-navy-950 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto border border-navy-700 font-mono leading-relaxed">
{`SERPAPI_KEY=your_serpapi_key

AVIATIONSTACK_KEY=your_aviationstack_key

SEAT_AERO_API_KEY=your_seat_aero_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=FlightSourcer <you@gmail.com>

PORT=3001
NODE_ENV=development
DB_PATH=./data/flights.db`}
        </pre>
      </Card>
    </div>
  );
}

function StatusRow({ label, description, ok, detail }: { label: string; description: string; ok: boolean | null; detail: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-navy-700 last:border-0">
      <div>
        <div className="text-sm font-medium text-slate-200">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">{detail}</span>
        {ok === true && <CheckCircle className="w-4 h-4 text-emerald-400" />}
        {ok === false && <XCircle className="w-4 h-4 text-red-400" />}
        {ok === null && <div className="w-4 h-4 rounded-full border-2 border-slate-600" />}
      </div>
    </div>
  );
}
