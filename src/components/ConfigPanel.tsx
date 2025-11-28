import { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Globe, 
  Save, 
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Info,
  Shield,
  User
} from 'lucide-react';
import { redmineAPI } from '../services/api';
import { clsx } from 'clsx';

// The proxy target - change this to your Redmine URL
const REDMINE_URL = 'https://ticket.gyselroth.net';

export default function ConfigPanel() {
  const [apiKey, setApiKey] = useState('');
  const [userId, setUserId] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  // Load saved config on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('redmine_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setApiKey(config.apiKey || '');
        setUserId(config.userId || '');
        if (config.apiKey) {
          redmineAPI.configure({ baseUrl: REDMINE_URL, apiKey: config.apiKey });
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleSave = async () => {
    setError(null);
    setSaved(false);

    if (!apiKey) {
      setError('Please enter your API key');
      return;
    }

    if (!userId) {
      setError('Please enter your Redmine user ID');
      return;
    }

    // Configure the API
    redmineAPI.configure({ baseUrl: REDMINE_URL, apiKey });

    // Test the connection
    setTesting(true);
    try {
      await redmineAPI.getProjects({ limit: 1 });
      setSaved(true);
      localStorage.setItem('redmine_config', JSON.stringify({ baseUrl: REDMINE_URL, apiKey, userId }));
      // Dispatch event to trigger data refresh in other components
      window.dispatchEvent(new Event('redmine-config-updated'));
    } catch (err) {
      setError('Failed to connect. Please check your API key.');
      console.error('Connection error:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
        <h1 className="text-3xl font-display font-bold text-ink-50 mb-2">Settings</h1>
        <p className="text-ink-400">Configure your Redmine connection</p>
      </div>

      {/* Connection Settings */}
      <div className="glass rounded-2xl p-6 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-ember-500/20">
            <Settings className="w-5 h-5 text-ember-400" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-ink-100">Redmine Connection</h2>
            <p className="text-sm text-ink-400">Connect to your Redmine instance</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Connected Server Info */}
          <div className="p-4 rounded-xl bg-ink-800/30 border border-ink-700/50">
            <div className="flex items-center gap-2 text-sm text-ink-300 mb-1">
              <Globe className="w-4 h-4" />
              Connected Server
            </div>
            <p className="text-ink-100 font-mono">{REDMINE_URL}</p>
            <p className="mt-1 text-xs text-ink-500">
              To change the server, edit <code className="px-1 py-0.5 rounded bg-ink-800">vite.config.ts</code>
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-2">
              <Key className="w-4 h-4 inline mr-2" />
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Redmine API key"
              className="w-full px-4 py-3 bg-ink-800/50 border border-ink-700/50 rounded-xl text-ink-100 placeholder-ink-500 focus:outline-none focus:border-ember-500/50 focus:ring-1 focus:ring-ember-500/30 transition-all font-mono"
            />
            <p className="mt-1.5 text-xs text-ink-500">
              Find your API key in Redmine → My Account → API access key
            </p>
          </div>

          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Your User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 833"
              className="w-full px-4 py-3 bg-ink-800/50 border border-ink-700/50 rounded-xl text-ink-100 placeholder-ink-500 focus:outline-none focus:border-ember-500/50 focus:ring-1 focus:ring-ember-500/30 transition-all font-mono"
            />
            <p className="mt-1.5 text-xs text-ink-500">
              Your numeric user ID (find it in URLs like /users/833 or in issue filters)
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-ember-500/10 border border-ember-500/30 text-ember-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-jade-500/10 border border-jade-500/30 text-jade-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Successfully connected to Redmine!</span>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={testing}
            className={clsx(
              'flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-all',
              testing
                ? 'bg-ink-700 text-ink-400 cursor-not-allowed'
                : 'bg-ember-600 hover:bg-ember-500 text-white'
            )}
          >
            {testing ? (
              <>
                <div className="w-5 h-5 border-2 border-ink-400 border-t-transparent rounded-full animate-spin" />
                Testing connection...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save & Test Connection
              </>
            )}
          </button>
        </div>
      </div>

      {/* Proxy Info */}
      <div className="glass rounded-2xl p-6 border-l-4 border-l-jade-500 opacity-0 animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-jade-500/20 flex-shrink-0">
            <Shield className="w-5 h-5 text-jade-400" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-ink-100 mb-2">CORS Proxy Enabled</h3>
            <p className="text-sm text-ink-400">
              This app uses a development proxy to bypass CORS restrictions. Your API requests 
              are routed through the Vite dev server, which forwards them to your Redmine instance.
              This means you don't need to configure CORS on your Redmine server.
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass rounded-2xl p-6 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-azure-500/20 flex-shrink-0">
            <Info className="w-5 h-5 text-azure-400" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-ink-100 mb-2">Getting Your API Key & User ID</h3>
            <p className="text-sm font-medium text-ink-300 mb-2">API Key:</p>
            <ol className="space-y-2 text-sm text-ink-400 mb-4">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ink-800 text-ink-300 text-xs flex items-center justify-center">1</span>
                Log in to Redmine → Click "My Account"
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ink-800 text-ink-300 text-xs flex items-center justify-center">2</span>
                Find "API access key" on the right sidebar → Click "Show"
              </li>
            </ol>
            <p className="text-sm font-medium text-ink-300 mb-2">User ID:</p>
            <ol className="space-y-2 text-sm text-ink-400">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ink-800 text-ink-300 text-xs flex items-center justify-center">1</span>
                Go to "My Account" - check the URL: <code className="px-1 py-0.5 rounded bg-ink-800 text-ink-300">/users/833</code>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ink-800 text-ink-300 text-xs flex items-center justify-center">2</span>
                Or find it in issue filters: <code className="px-1 py-0.5 rounded bg-ink-800 text-ink-300">assigned_to_id[]=833</code>
              </li>
            </ol>
            <a 
              href="https://www.redmine.org/projects/redmine/wiki/Rest_api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-4 text-sm text-ember-400 hover:text-ember-300 transition-colors"
            >
              Learn more about Redmine API
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* What Gets Loaded */}
      <div className="glass rounded-2xl p-6 border-l-4 border-l-azure-500 opacity-0 animate-slide-up" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-azure-500/20 flex-shrink-0">
            <User className="w-5 h-5 text-azure-400" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-ink-100 mb-2">What Gets Loaded</h3>
            <p className="text-sm text-ink-400 mb-2">
              When connected, the app will only fetch <strong className="text-ink-200">issues assigned to you</strong> 
              {' '}(based on your User ID). This keeps the data focused and loading fast.
            </p>
            <ul className="text-sm text-ink-400 space-y-1">
              <li>• All your assigned issues (open + closed)</li>
              <li>• Sorted by priority and last update</li>
              <li>• Projects you have access to</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Mode Notice */}
      <div className="glass rounded-2xl p-6 border-l-4 border-l-honey-500 opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-honey-500/20 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-honey-400" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-ink-100 mb-2">Demo Mode</h3>
            <p className="text-sm text-ink-400">
              Without a valid configuration, the app shows demo data so you can explore all features.
            </p>
          </div>
        </div>
      </div>

      {/* Changing Server */}
      <div className="glass rounded-2xl p-6 opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-ink-700 flex-shrink-0">
            <Settings className="w-5 h-5 text-ink-400" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-ink-100 mb-2">Changing Redmine Server</h3>
            <p className="text-sm text-ink-400 mb-3">
              To connect to a different Redmine server, update the proxy target in <code className="px-1.5 py-0.5 rounded bg-ink-800 text-ink-300">vite.config.ts</code>:
            </p>
            <div className="p-3 rounded-lg bg-ink-900/50 font-mono text-xs text-ink-300 overflow-x-auto">
              <pre>{`server: {
  proxy: {
    '/api': {
      target: 'https://your-redmine.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\\/api/, ''),
    }
  }
}`}</pre>
            </div>
            <p className="mt-3 text-xs text-ink-500">
              After changing, restart the dev server with <code className="px-1.5 py-0.5 rounded bg-ink-800">npm run dev</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
