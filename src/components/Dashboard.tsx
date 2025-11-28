import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target,
  Users,
  Layers,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  useRedmineData,
  calculateStats,
  getIssuesByStatus,
  getIssuesByPriority,
  getIssuesTrend,
  getIssuesByAssignee,
  getIssuesByProject
} from '../hooks/useRedmineData';
import { clsx } from 'clsx';

function StatCard({ 
  label, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color,
  delay
}: { 
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  const colorClasses: Record<string, string> = {
    ember: 'from-ember-500/20 to-ember-600/5 border-ember-500/30 text-ember-400',
    jade: 'from-jade-500/20 to-jade-600/5 border-jade-500/30 text-jade-400',
    azure: 'from-azure-500/20 to-azure-600/5 border-azure-500/30 text-azure-400',
    honey: 'from-honey-500/20 to-honey-600/5 border-honey-500/30 text-honey-400',
  };

  return (
    <div 
      className={clsx(
        'glass rounded-2xl p-6 bg-gradient-to-br border opacity-0 animate-slide-up',
        colorClasses[color]
      )}
      style={{ animationDelay: `${delay * 0.1}s`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-ink-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-display font-semibold text-ink-50">{value}</p>
          {change && (
            <div className={clsx(
              'flex items-center gap-1 mt-2 text-sm',
              changeType === 'positive' && 'text-jade-400',
              changeType === 'negative' && 'text-ember-400',
              changeType === 'neutral' && 'text-ink-400'
            )}>
              {changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
              {changeType === 'negative' && <TrendingDown className="w-4 h-4" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl bg-ink-900/50')}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ 
  title, 
  children, 
  delay,
  className 
}: { 
  title: string;
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <div 
      className={clsx(
        'glass rounded-2xl p-6 opacity-0 animate-slide-up',
        className
      )}
      style={{ animationDelay: `${delay * 0.1}s`, animationFillMode: 'forwards' }}
    >
      <h3 className="text-lg font-display font-semibold text-ink-100 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { issues, loading, error, isConnected, refresh } = useRedmineData();
  
  const stats = calculateStats(issues);
  const issuesByStatus = getIssuesByStatus(issues);
  const issuesByPriority = getIssuesByPriority(issues);
  const trend = getIssuesTrend(issues);
  const byAssignee = getIssuesByAssignee(issues);
  const byProject = getIssuesByProject(issues);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between opacity-0 animate-fade-in" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-50 mb-2">Dashboard</h1>
          <p className="text-ink-400">Overview of your project issues and team performance</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
            isConnected ? 'bg-jade-500/20 text-jade-400' : 'bg-ink-800/50 text-ink-400'
          )}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isConnected ? 'Connected' : 'Demo Mode'}
          </div>
          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={loading}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              loading 
                ? 'bg-ink-800/50 text-ink-500 cursor-not-allowed' 
                : 'bg-ink-800/50 text-ink-300 hover:bg-ink-700/50 hover:text-ink-100'
            )}
          >
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-ember-500/10 border border-ember-500/30 text-ember-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Issues"
          value={stats.totalIssues}
          icon={Layers}
          color="azure"
          delay={1}
        />
        <StatCard
          label="Open Issues"
          value={stats.openIssues}
          icon={Clock}
          color="honey"
          delay={2}
        />
        <StatCard
          label="Closed Issues"
          value={stats.closedIssues}
          icon={CheckCircle2}
          color="jade"
          delay={3}
        />
        <StatCard
          label="Overdue"
          value={stats.overdueIssues}
          change={stats.overdueIssues > 0 ? "Need attention" : "All on track"}
          changeType={stats.overdueIssues > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          color="ember"
          delay={4}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <ChartCard title="Issue Trend (30 days)" delay={5} className="lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60bcfa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60bcfa" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="closedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43e5aa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#43e5aa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#737384" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#737384" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1f', 
                    border: '1px solid #41414b',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)'
                  }}
                  labelStyle={{ color: '#eeeef0' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#60bcfa" 
                  fill="url(#createdGradient)" 
                  strokeWidth={2}
                  name="Created"
                />
                <Area 
                  type="monotone" 
                  dataKey="closed" 
                  stroke="#43e5aa" 
                  fill="url(#closedGradient)" 
                  strokeWidth={2}
                  name="Closed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Status Pie Chart */}
        <ChartCard title="Issues by Status" delay={6}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issuesByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {issuesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1f', 
                    border: '1px solid #41414b',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)'
                  }}
                  labelStyle={{ color: '#eeeef0' }}
                />
                <Legend 
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-ink-300 text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignee Bar Chart */}
        <ChartCard title="Issues by Assignee" delay={7}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byAssignee.slice(0, 6)} layout="vertical">
                <XAxis type="number" stroke="#737384" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  dataKey="assignee" 
                  type="category" 
                  stroke="#737384" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1f', 
                    border: '1px solid #41414b',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)'
                  }}
                  labelStyle={{ color: '#eeeef0' }}
                />
                <Bar dataKey="open" stackId="a" fill="#ffbe20" name="Open" radius={[0, 0, 0, 0]} />
                <Bar dataKey="closed" stackId="a" fill="#43e5aa" name="Closed" radius={[0, 4, 4, 0]} />
                <Legend formatter={(value) => <span className="text-ink-300 text-sm">{value}</span>} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Priority Distribution */}
        <ChartCard title="Issues by Priority" delay={8}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuesByPriority}>
                <XAxis 
                  dataKey="priority" 
                  stroke="#737384" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#737384" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1f', 
                    border: '1px solid #41414b',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)'
                  }}
                  labelStyle={{ color: '#eeeef0' }}
                />
                <Bar dataKey="count" name="Issues" radius={[8, 8, 0, 0]}>
                  {issuesByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Distribution */}
        <ChartCard title="Issues by Project" delay={9}>
          <div className="space-y-3">
            {byProject.slice(0, 5).map((item, index) => (
              <div key={item.project} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-200 truncate">{item.project}</span>
                    <span className="text-ink-400 ml-2">{item.count}</span>
                  </div>
                  <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(item.count / byProject[0].count) * 100}%`,
                        backgroundColor: ['#60bcfa', '#43e5aa', '#ffbe20', '#f87a71', '#a855f7'][index % 5],
                        transitionDelay: `${index * 0.1}s`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Completion Stats */}
        <ChartCard title="Completion Metrics" delay={10}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-jade-500/20">
                  <Target className="w-5 h-5 text-jade-400" />
                </div>
                <div>
                  <p className="text-sm text-ink-400">Completion Rate</p>
                  <p className="text-2xl font-display font-semibold text-ink-50">{stats.completionRate}%</p>
                </div>
              </div>
            </div>
            <div className="h-3 bg-ink-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-jade-500 to-jade-400 rounded-full transition-all duration-1000"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-azure-500/20">
                  <Clock className="w-5 h-5 text-azure-400" />
                </div>
                <div>
                  <p className="text-sm text-ink-400">Avg. Resolution Time</p>
                  <p className="text-2xl font-display font-semibold text-ink-50">{stats.avgCompletionTime} days</p>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Team Activity */}
        <ChartCard title="Team Overview" delay={11}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-800/30">
              <div className="p-2 rounded-lg bg-azure-500/20">
                <Users className="w-5 h-5 text-azure-400" />
              </div>
              <div>
                <p className="text-sm text-ink-400">Active Team Members</p>
                <p className="text-xl font-semibold text-ink-50">{byAssignee.filter(a => a.assignee !== 'Unassigned').length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-800/30">
              <div className="p-2 rounded-lg bg-honey-500/20">
                <TrendingUp className="w-5 h-5 text-honey-400" />
              </div>
              <div>
                <p className="text-sm text-ink-400">Most Active</p>
                <p className="text-xl font-semibold text-ink-50 truncate">{byAssignee.filter(a => a.assignee !== 'Unassigned')[0]?.assignee || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-800/30">
              <div className="p-2 rounded-lg bg-jade-500/20">
                <CheckCircle2 className="w-5 h-5 text-jade-400" />
              </div>
              <div>
                <p className="text-sm text-ink-400">Top Closer</p>
                <p className="text-xl font-semibold text-ink-50 truncate">
                  {byAssignee.filter(a => a.assignee !== 'Unassigned').sort((a, b) => b.closed - a.closed)[0]?.assignee || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
