import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Bug,
  Sparkles,
  HelpCircle,
  CheckSquare,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  addMonths,
  subMonths,
  parseISO,
  isToday,
  startOfWeek,
  endOfWeek,
  isBefore
} from 'date-fns';
import { useRedmineData } from '../hooks/useRedmineData';
import { RedmineIssue } from '../types/redmine';
import { clsx } from 'clsx';

const trackerIcons: Record<string, React.ElementType> = {
  'Bug': Bug,
  'Feature': Sparkles,
  'Support': HelpCircle,
  'Task': CheckSquare,
};

const trackerColors: Record<string, string> = {
  'Bug': 'bg-ember-500/80 hover:bg-ember-500',
  'Feature': 'bg-jade-500/80 hover:bg-jade-500',
  'Support': 'bg-azure-500/80 hover:bg-azure-500',
  'Task': 'bg-honey-500/80 hover:bg-honey-500',
};

function IssueChip({ issue, compact = false }: { issue: RedmineIssue; compact?: boolean }) {
  const TrackerIcon = trackerIcons[issue.tracker.name] || CheckSquare;
  const isOverdue = issue.due_date && isBefore(parseISO(issue.due_date), new Date()) && !issue.status.is_closed;
  
  if (compact) {
    return (
      <div 
        className={clsx(
          'w-2 h-2 rounded-full flex-shrink-0',
          trackerColors[issue.tracker.name]?.replace('hover:bg-', '') || 'bg-ink-500'
        )}
        title={`#${issue.id}: ${issue.subject}`}
      />
    );
  }

  return (
    <div 
      className={clsx(
        'group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-white cursor-pointer transition-all truncate',
        trackerColors[issue.tracker.name] || 'bg-ink-600 hover:bg-ink-500',
        isOverdue && 'ring-1 ring-ember-400'
      )}
      title={`#${issue.id}: ${issue.subject}`}
    >
      <TrackerIcon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate">#{issue.id}</span>
      {isOverdue && <AlertCircle className="w-3 h-3 flex-shrink-0 text-ember-300" />}
    </div>
  );
}

function DayCell({ 
  date, 
  issues, 
  currentMonth,
  onSelectDay 
}: { 
  date: Date;
  issues: RedmineIssue[];
  currentMonth: Date;
  onSelectDay: (date: Date) => void;
}) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isCurrentDay = isToday(date);

  const displayIssues = issues.slice(0, 3);
  const moreCount = issues.length - displayIssues.length;

  return (
    <div 
      onClick={() => issues.length > 0 && onSelectDay(date)}
      className={clsx(
        'min-h-[100px] p-2 border-b border-r border-ink-800/50 transition-colors',
        isCurrentMonth ? 'bg-ink-900/20' : 'bg-ink-950/50',
        issues.length > 0 && 'cursor-pointer hover:bg-ink-800/30',
        isCurrentDay && 'ring-1 ring-inset ring-ember-500/50'
      )}
    >
      <div className={clsx(
        'text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full',
        isCurrentDay && 'bg-ember-500 text-white',
        !isCurrentDay && isCurrentMonth && 'text-ink-200',
        !isCurrentDay && !isCurrentMonth && 'text-ink-600'
      )}>
        {format(date, 'd')}
      </div>
      
      <div className="space-y-1">
        {displayIssues.map(issue => (
          <IssueChip key={issue.id} issue={issue} />
        ))}
        {moreCount > 0 && (
          <div className="text-xs text-ink-400 px-2">
            +{moreCount} more
          </div>
        )}
      </div>
    </div>
  );
}

function IssueDetailPanel({ 
  date, 
  issues, 
  onClose 
}: { 
  date: Date | null;
  issues: RedmineIssue[];
  onClose: () => void;
}) {
  if (!date) return null;

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-ink-100">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h3>
        <button 
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-ink-800/50 text-ink-400 hover:text-ink-200"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3">
        {issues.map(issue => {
          const TrackerIcon = trackerIcons[issue.tracker.name] || CheckSquare;
          const isOverdue = issue.due_date && isBefore(parseISO(issue.due_date), new Date()) && !issue.status.is_closed;
          
          return (
            <div 
              key={issue.id}
              className={clsx(
                'p-4 rounded-xl bg-ink-800/30 border border-ink-700/50 hover:border-ink-600/50 transition-colors cursor-pointer',
                isOverdue && 'border-l-4 border-l-ember-500'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'p-2 rounded-lg flex-shrink-0',
                  issue.tracker.name === 'Bug' && 'bg-ember-500/20 text-ember-400',
                  issue.tracker.name === 'Feature' && 'bg-jade-500/20 text-jade-400',
                  issue.tracker.name === 'Support' && 'bg-azure-500/20 text-azure-400',
                  issue.tracker.name === 'Task' && 'bg-honey-500/20 text-honey-400',
                  !trackerIcons[issue.tracker.name] && 'bg-ink-700/50 text-ink-400'
                )}>
                  <TrackerIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-ink-400 text-sm font-mono">#{issue.id}</span>
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium text-white',
                      issue.status.name === 'New' && 'bg-azure-500',
                      issue.status.name === 'In Progress' && 'bg-honey-500',
                      issue.status.name === 'Resolved' && 'bg-jade-500',
                      issue.status.name === 'Feedback' && 'bg-ember-400',
                      issue.status.name === 'Closed' && 'bg-ink-500',
                      !['New', 'In Progress', 'Resolved', 'Feedback', 'Closed'].includes(issue.status.name) && 'bg-ink-600'
                    )}>
                      {issue.status.name}
                    </span>
                    {isOverdue && (
                      <span className="flex items-center gap-1 text-xs text-ember-400">
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                      </span>
                    )}
                  </div>
                  <h4 className="text-ink-100 font-medium truncate">{issue.subject}</h4>
                  <div className="flex items-center gap-3 mt-2 text-sm text-ink-400">
                    <span>{issue.project.name}</span>
                    {issue.assigned_to && (
                      <>
                        <span>•</span>
                        <span>{issue.assigned_to.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarView() {
  const { issues, loading, isConnected, refresh } = useRedmineData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get issues with due dates mapped by date
  const issuesByDate = useMemo(() => {
    const map: Record<string, RedmineIssue[]> = {};
    
    issues.forEach(issue => {
      if (issue.due_date) {
        const dateKey = issue.due_date.split('T')[0]; // Handle both date and datetime formats
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(issue);
      }
    });
    
    return map;
  }, [issues]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedIssues = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return issuesByDate[dateKey] || [];
  }, [selectedDate, issuesByDate]);

  // Stats for the month
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    let total = 0;
    let overdue = 0;
    
    Object.entries(issuesByDate).forEach(([dateStr, dateIssues]) => {
      const date = parseISO(dateStr);
      if (date >= monthStart && date <= monthEnd) {
        total += dateIssues.length;
        overdue += dateIssues.filter(i => 
          i.due_date && 
          isBefore(parseISO(i.due_date), new Date()) && 
          !i.status.is_closed
        ).length;
      }
    });
    
    return { total, overdue };
  }, [currentMonth, issuesByDate]);

  // Get unique tracker types from actual data
  const uniqueTrackers = useMemo(() => {
    const trackerSet = new Set<string>();
    issues.forEach(issue => trackerSet.add(issue.tracker.name));
    return Array.from(trackerSet);
  }, [issues]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-50 mb-2">Calendar</h1>
          <p className="text-ink-400">View issues by due date timeline</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-800/50 text-ink-300">
              <CalendarIcon className="w-4 h-4" />
              {monthStats.total} issues this month
            </span>
            {monthStats.overdue > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ember-500/20 text-ember-400">
                <AlertCircle className="w-4 h-4" />
                {monthStats.overdue} overdue
              </span>
            )}
          </div>
          {/* Connection Status */}
          <div className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
            isConnected ? 'bg-jade-500/20 text-jade-400' : 'bg-ink-800/50 text-ink-400'
          )}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isConnected ? 'Connected' : 'Demo'}
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
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1 glass rounded-2xl overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-ink-800/50">
            <h2 className="text-xl font-display font-semibold text-ink-100">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-ink-800/50 text-ink-400 hover:text-ink-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 rounded-lg hover:bg-ink-800/50 text-ink-300 hover:text-ink-100 text-sm font-medium transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-ink-800/50 text-ink-400 hover:text-ink-200 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-ink-800/50">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-ink-400 border-r border-ink-800/50 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <RefreshCw className="w-8 h-8 text-ink-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map(date => {
                const dateKey = format(date, 'yyyy-MM-dd');
                const dayIssues = issuesByDate[dateKey] || [];
                
                return (
                  <DayCell
                    key={dateKey}
                    date={date}
                    issues={dayIssues}
                    currentMonth={currentMonth}
                    onSelectDay={setSelectedDate}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Legend and Selected Day Panel */}
        <div className="w-80 space-y-4">
          {/* Legend */}
          <div className="glass rounded-2xl p-4 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <h3 className="text-sm font-medium text-ink-300 mb-3">Issue Types</h3>
            <div className="space-y-2">
              {uniqueTrackers.map((name) => {
                const Icon = trackerIcons[name] || CheckSquare;
                return (
                  <div key={name} className="flex items-center gap-2 text-sm">
                    <div className={clsx(
                      'p-1.5 rounded',
                      name === 'Bug' && 'bg-ember-500/20 text-ember-400',
                      name === 'Feature' && 'bg-jade-500/20 text-jade-400',
                      name === 'Support' && 'bg-azure-500/20 text-azure-400',
                      name === 'Task' && 'bg-honey-500/20 text-honey-400',
                      !trackerIcons[name] && 'bg-ink-700/50 text-ink-400'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-ink-300">{name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass rounded-2xl p-4 opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            <h3 className="text-sm font-medium text-ink-300 mb-3">Upcoming Deadlines</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {issues
                .filter(i => i.due_date && !i.status.is_closed)
                .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                .slice(0, 8)
                .map(issue => {
                  const isOverdue = isBefore(parseISO(issue.due_date!), new Date());
                  return (
                    <div 
                      key={issue.id}
                      className={clsx(
                        'p-2 rounded-lg text-sm',
                        isOverdue ? 'bg-ember-500/10 border border-ember-500/30' : 'bg-ink-800/30'
                      )}
                    >
                      <div className="flex items-center gap-2 text-ink-400 text-xs mb-1">
                        <span className={isOverdue ? 'text-ember-400' : ''}>
                          {format(parseISO(issue.due_date!), 'MMM d')}
                        </span>
                        {isOverdue && <AlertCircle className="w-3 h-3 text-ember-400" />}
                      </div>
                      <p className="text-ink-200 truncate">#{issue.id} {issue.subject}</p>
                    </div>
                  );
                })}
              {issues.filter(i => i.due_date && !i.status.is_closed).length === 0 && (
                <p className="text-sm text-ink-500">No upcoming deadlines</p>
              )}
            </div>
          </div>

          {/* Selected Day Details */}
          {selectedDate && (
            <IssueDetailPanel
              date={selectedDate}
              issues={selectedIssues}
              onClose={() => setSelectedDate(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
