import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight,
  Bug,
  Sparkles,
  HelpCircle,
  CheckSquare,
  AlertCircle,
  Clock,
  User,
  Calendar,
  ExternalLink,
  Layers,
  ArrowUpDown,
  X,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useRedmineData } from '../hooks/useRedmineData';
import { RedmineIssue } from '../types/redmine';
import { clsx } from 'clsx';
import { format, parseISO, isBefore, isToday } from 'date-fns';

type GroupBy = 'none' | 'status' | 'priority' | 'project' | 'assignee' | 'tracker';
type SortBy = 'updated' | 'created' | 'priority' | 'due_date';

const trackerIcons: Record<string, React.ElementType> = {
  'Bug': Bug,
  'Feature': Sparkles,
  'Support': HelpCircle,
  'Task': CheckSquare,
};

const priorityColors: Record<string, string> = {
  'Low': 'bg-ink-600',
  'Normal': 'bg-azure-500',
  'High': 'bg-honey-500',
  'Urgent': 'bg-ember-400',
  'Immediate': 'bg-ember-600',
};

const statusColors: Record<string, string> = {
  'New': 'bg-azure-500',
  'In Progress': 'bg-honey-500',
  'Resolved': 'bg-jade-500',
  'Feedback': 'bg-ember-400',
  'Closed': 'bg-ink-500',
  'Rejected': 'bg-ink-600',
};

function IssueCard({ issue, index }: { issue: RedmineIssue; index: number }) {
  const TrackerIcon = trackerIcons[issue.tracker.name] || CheckSquare;
  const isOverdue = issue.due_date && isBefore(parseISO(issue.due_date), new Date()) && !issue.status.is_closed;
  const isDueToday = issue.due_date && isToday(parseISO(issue.due_date));
  const isDueSoon = issue.due_date && 
    !isOverdue && 
    !isDueToday && 
    isBefore(parseISO(issue.due_date), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));

  return (
    <div 
      className={clsx(
        'glass rounded-xl p-4 card-hover cursor-pointer opacity-0 animate-slide-up',
        isOverdue && 'border-l-4 border-l-ember-500'
      )}
      style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-4">
        {/* Tracker Icon */}
        <div className={clsx(
          'p-2 rounded-lg flex-shrink-0',
          issue.tracker.name === 'Bug' && 'bg-ember-500/20 text-ember-400',
          issue.tracker.name === 'Feature' && 'bg-jade-500/20 text-jade-400',
          issue.tracker.name === 'Support' && 'bg-azure-500/20 text-azure-400',
          issue.tracker.name === 'Task' && 'bg-honey-500/20 text-honey-400',
          !trackerIcons[issue.tracker.name] && 'bg-ink-700/50 text-ink-400'
        )}>
          <TrackerIcon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-ink-400 text-sm font-mono">#{issue.id}</span>
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              statusColors[issue.status.name] || 'bg-ink-600',
              'text-white'
            )}>
              {issue.status.name}
            </span>
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              priorityColors[issue.priority.name] || 'bg-ink-600',
              'text-white'
            )}>
              {issue.priority.name}
            </span>
          </div>
          
          <h3 className="text-ink-100 font-medium mb-2 truncate">{issue.subject}</h3>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-400">
            <span className="flex items-center gap-1">
              <Layers className="w-4 h-4" />
              {issue.project.name}
            </span>
            
            {issue.assigned_to && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {issue.assigned_to.name}
              </span>
            )}
            
            {issue.due_date && (
              <span className={clsx(
                'flex items-center gap-1',
                isOverdue && 'text-ember-400',
                isDueToday && 'text-honey-400',
                isDueSoon && 'text-azure-400'
              )}>
                <Calendar className="w-4 h-4" />
                {format(parseISO(issue.due_date), 'MMM d, yyyy')}
                {isOverdue && <AlertCircle className="w-3 h-3" />}
              </span>
            )}
            
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(parseISO(issue.updated_on), 'MMM d')}
            </span>
          </div>

          {/* Progress bar for done_ratio */}
          {issue.done_ratio > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-ink-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-jade-500 rounded-full transition-all"
                  style={{ width: `${issue.done_ratio}%` }}
                />
              </div>
              <span className="text-xs text-ink-400">{issue.done_ratio}%</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <button className="p-2 rounded-lg hover:bg-ink-700/50 text-ink-400 hover:text-ink-200 transition-colors">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function GroupHeader({ 
  label, 
  count, 
  isExpanded, 
  onToggle 
}: { 
  label: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button 
      onClick={onToggle}
      className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-ink-800/30 hover:bg-ink-800/50 transition-colors"
    >
      {isExpanded ? (
        <ChevronDown className="w-5 h-5 text-ink-400" />
      ) : (
        <ChevronRight className="w-5 h-5 text-ink-400" />
      )}
      <span className="text-ink-100 font-medium">{label}</span>
      <span className="px-2 py-0.5 rounded-full bg-ink-700 text-ink-300 text-sm">{count}</span>
    </button>
  );
}

export default function IssueList() {
  const { issues, projects, loading, isConnected, refresh } = useRedmineData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('status');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['New', 'In Progress', 'Feedback', 'Offen', 'In Bearbeitung']));
  const [showFilters, setShowFilters] = useState(false);

  // Get unique statuses and priorities from actual data
  const uniqueStatuses = useMemo(() => {
    const statusSet = new Set<string>();
    issues.forEach(issue => statusSet.add(issue.status.name));
    return Array.from(statusSet);
  }, [issues]);

  const uniquePriorities = useMemo(() => {
    const prioritySet = new Set<string>();
    issues.forEach(issue => prioritySet.add(issue.priority.name));
    return Array.from(prioritySet);
  }, [issues]);

  // Filter and sort issues
  const filteredIssues = useMemo(() => {
    let filtered = [...issues];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.subject.toLowerCase().includes(query) ||
        issue.id.toString().includes(query) ||
        issue.project.name.toLowerCase().includes(query) ||
        issue.assigned_to?.name.toLowerCase().includes(query)
      );
    }

    // Project filter
    if (selectedProject !== 'all') {
      filtered = filtered.filter(issue => issue.project.id.toString() === selectedProject);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'open') {
        filtered = filtered.filter(issue => !issue.status.is_closed);
      } else if (selectedStatus === 'closed') {
        filtered = filtered.filter(issue => issue.status.is_closed);
      } else {
        filtered = filtered.filter(issue => issue.status.name === selectedStatus);
      }
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(issue => issue.priority.name === selectedPriority);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
        case 'priority':
          // Sort by priority ID (higher = more urgent in Redmine)
          return (b.priority.id || 0) - (a.priority.id || 0);
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        default:
          return new Date(b.updated_on).getTime() - new Date(a.updated_on).getTime();
      }
    });

    return filtered;
  }, [issues, searchQuery, selectedProject, selectedStatus, selectedPriority, sortBy]);

  // Group issues
  const groupedIssues = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Issues': filteredIssues };
    }

    const groups: Record<string, RedmineIssue[]> = {};

    filteredIssues.forEach(issue => {
      let key: string;
      switch (groupBy) {
        case 'status':
          key = issue.status.name;
          break;
        case 'priority':
          key = issue.priority.name;
          break;
        case 'project':
          key = issue.project.name;
          break;
        case 'assignee':
          key = issue.assigned_to?.name || 'Unassigned';
          break;
        case 'tracker':
          key = issue.tracker.name;
          break;
        default:
          key = 'Other';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(issue);
    });

    return groups;
  }, [filteredIssues, groupBy]);

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const hasActiveFilters = selectedProject !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all';

  const clearFilters = () => {
    setSelectedProject('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between opacity-0 animate-fade-in" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
        <div>
          <h1 className="text-3xl font-display font-bold text-ink-50 mb-2">Issues</h1>
          <p className="text-ink-400">Browse and filter all project issues</p>
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

      {/* Search and Filters Bar */}
      <div className="glass rounded-xl p-4 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-ink-800/50 border border-ink-700/50 rounded-xl text-ink-100 placeholder-ink-500 focus:outline-none focus:border-ember-500/50 focus:ring-1 focus:ring-ember-500/30 transition-all"
            />
          </div>

          {/* Group By */}
          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-ink-800/50 border border-ink-700/50 rounded-xl text-ink-200 focus:outline-none focus:border-ember-500/50 cursor-pointer"
            >
              <option value="none">No grouping</option>
              <option value="status">Group by Status</option>
              <option value="priority">Group by Priority</option>
              <option value="project">Group by Project</option>
              <option value="assignee">Group by Assignee</option>
              <option value="tracker">Group by Tracker</option>
            </select>
            <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-ink-800/50 border border-ink-700/50 rounded-xl text-ink-200 focus:outline-none focus:border-ember-500/50 cursor-pointer"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Recently Created</option>
              <option value="priority">Priority</option>
              <option value="due_date">Due Date</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors',
              showFilters || hasActiveFilters
                ? 'bg-ember-600/20 border-ember-500/30 text-ember-400'
                : 'bg-ink-800/50 border-ink-700/50 text-ink-200 hover:border-ink-600'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-ember-500" />
            )}
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-ink-800/50 flex flex-wrap gap-4 animate-slide-up">
            {/* Project Filter */}
            <div>
              <label className="block text-sm text-ink-400 mb-1">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="appearance-none px-4 py-2 bg-ink-800/50 border border-ink-700/50 rounded-lg text-ink-200 focus:outline-none focus:border-ember-500/50 cursor-pointer"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id.toString()}>{project.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm text-ink-400 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none px-4 py-2 bg-ink-800/50 border border-ink-700/50 rounded-lg text-ink-200 focus:outline-none focus:border-ember-500/50 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open Issues</option>
                <option value="closed">Closed Issues</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm text-ink-400 mb-1">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="appearance-none px-4 py-2 bg-ink-800/50 border border-ink-700/50 rounded-lg text-ink-200 focus:outline-none focus:border-ember-500/50 cursor-pointer"
              >
                <option value="all">All Priorities</option>
                {uniquePriorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-ink-400 hover:text-ink-200 self-end"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-ink-400 text-sm">
        Showing {filteredIssues.length} of {issues.length} issues
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-ink-500 animate-spin" />
        </div>
      )}

      {/* Issue Groups */}
      {!loading && (
        <div className="space-y-4">
          {Object.entries(groupedIssues).map(([group, groupIssues]) => (
            <div key={group} className="space-y-2">
              {groupBy !== 'none' && (
                <GroupHeader
                  label={group}
                  count={groupIssues.length}
                  isExpanded={expandedGroups.has(group)}
                  onToggle={() => toggleGroup(group)}
                />
              )}
              
              {(groupBy === 'none' || expandedGroups.has(group)) && (
                <div className="space-y-2 pl-0">
                  {groupIssues.map((issue, index) => (
                    <IssueCard key={issue.id} issue={issue} index={index} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filteredIssues.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-800/50 flex items-center justify-center">
            <Search className="w-8 h-8 text-ink-500" />
          </div>
          <h3 className="text-lg font-medium text-ink-300 mb-2">No issues found</h3>
          <p className="text-ink-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
