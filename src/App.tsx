import { useState } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar as CalendarIcon, 
  Settings, 
  ChevronRight,
  Zap
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import IssueList from './components/IssueList';
import CalendarView from './components/CalendarView';
import ConfigPanel from './components/ConfigPanel';
import { clsx } from 'clsx';

type View = 'dashboard' | 'issues' | 'calendar' | 'settings';

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'issues' as const, label: 'Issues', icon: ListTodo },
  { id: 'calendar' as const, label: 'Calendar', icon: CalendarIcon },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside 
        className={clsx(
          'glass fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-ink-800/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ember-500 to-ember-700 flex items-center justify-center shadow-lg shadow-ember-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display text-lg font-semibold text-ink-50">Redmine</h1>
              <p className="text-xs text-ink-400">Modern Interface</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive 
                    ? 'bg-ember-600/20 text-ember-400 border border-ember-500/30' 
                    : 'text-ink-400 hover:text-ink-200 hover:bg-ink-800/50'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium animate-fade-in">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="m-4 p-3 rounded-xl text-ink-400 hover:text-ink-200 hover:bg-ink-800/50 transition-all"
        >
          <ChevronRight 
            className={clsx(
              'w-5 h-5 transition-transform duration-300',
              sidebarCollapsed ? '' : 'rotate-180'
            )} 
          />
        </button>
      </aside>

      {/* Main Content */}
      <main 
        className={clsx(
          'flex-1 transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="p-8 max-w-[1800px] mx-auto">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'issues' && <IssueList />}
          {activeView === 'calendar' && <CalendarView />}
          {activeView === 'settings' && <ConfigPanel />}
        </div>
      </main>
    </div>
  );
}

export default App;

