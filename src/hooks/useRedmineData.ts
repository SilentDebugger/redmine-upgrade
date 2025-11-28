import { useState, useEffect, useCallback } from 'react';
import { redmineAPI } from '../services/api';
import { RedmineIssue, RedmineProject } from '../types/redmine';
import { mockIssues, mockProjects } from '../services/mockData';

interface RedmineData {
  issues: RedmineIssue[];
  projects: RedmineProject[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  userId: string | null;
  refresh: () => Promise<void>;
}

export function useRedmineData(): RedmineData {
  const [issues, setIssues] = useState<RedmineIssue[]>(mockIssues);
  const [projects, setProjects] = useState<RedmineProject[]>(mockProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Check saved config
    const savedConfig = localStorage.getItem('redmine_config');
    let currentUserId: string | null = null;
    
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        currentUserId = config.userId || null;
        setUserId(currentUserId);
        
        if (config.apiKey) {
          redmineAPI.configure({ 
            baseUrl: config.baseUrl || 'https://ticket.gyselroth.net', 
            apiKey: config.apiKey 
          });
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Check if API is configured
    if (!redmineAPI.isConfigured() || !currentUserId) {
      setIsConnected(false);
      setIssues(mockIssues);
      setProjects(mockProjects);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch issues assigned to the user (paginated)
      // Using status_id=* to get all statuses, and assigned_to_id for the user
      const allIssues: RedmineIssue[] = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await redmineAPI.getIssues({ 
          limit, 
          offset,
          assigned_to_id: currentUserId,
          status_id: '*', // Get all statuses including closed
          sort: 'priority:desc,updated_on:desc'
        });
        allIssues.push(...response.issues);
        offset += limit;
        hasMore = response.issues.length === limit && offset < response.total_count;
        
        // Safety limit to prevent infinite loops
        if (offset > 500) break;
      }

      // Fetch projects (only active ones the user has access to)
      const projectsResponse = await redmineAPI.getProjects({ limit: 100 });

      setIssues(allIssues);
      setProjects(projectsResponse.projects);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to fetch Redmine data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      // Keep showing mock data on error
      setIssues(mockIssues);
      setProjects(mockProjects);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - check for saved config
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for config changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'redmine_config') {
        fetchData();
      }
    };

    // Custom event for same-tab updates
    const handleConfigUpdate = () => {
      fetchData();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('redmine-config-updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('redmine-config-updated', handleConfigUpdate);
    };
  }, [fetchData]);

  return {
    issues,
    projects,
    loading,
    error,
    isConnected,
    refresh: fetchData,
  };
}

// Helper functions for analytics
export function calculateStats(issues: RedmineIssue[]) {
  const totalIssues = issues.length;
  const openIssues = issues.filter(i => !i.status.is_closed).length;
  const closedIssues = issues.filter(i => i.status.is_closed).length;
  const now = new Date();
  const overdueIssues = issues.filter(i => 
    !i.status.is_closed && i.due_date && new Date(i.due_date) < now
  ).length;

  // Calculate average completion time for closed issues
  let totalCompletionDays = 0;
  let completedCount = 0;
  issues.forEach(issue => {
    if (issue.closed_on && issue.created_on) {
      const created = new Date(issue.created_on);
      const closed = new Date(issue.closed_on);
      const days = (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      totalCompletionDays += days;
      completedCount++;
    }
  });

  return {
    totalIssues,
    openIssues,
    closedIssues,
    overdueIssues,
    avgCompletionTime: completedCount > 0 ? Math.round(totalCompletionDays / completedCount * 10) / 10 : 0,
    completionRate: totalIssues > 0 ? Math.round((closedIssues / totalIssues) * 100) : 0,
  };
}

export function getIssuesByStatus(issues: RedmineIssue[]) {
  const statusColors: Record<string, string> = {
    'New': '#60bcfa',
    'In Progress': '#ffbe20',
    'Resolved': '#43e5aa',
    'Feedback': '#f87a71',
    'Closed': '#737384',
    'Rejected': '#91919f',
  };

  const defaultColors = ['#60bcfa', '#43e5aa', '#ffbe20', '#f87a71', '#a855f7', '#737384'];
  
  const counts: Record<string, number> = {};
  issues.forEach(issue => {
    counts[issue.status.name] = (counts[issue.status.name] || 0) + 1;
  });
  
  return Object.entries(counts).map(([status, count], index) => ({
    status,
    count,
    color: statusColors[status] || defaultColors[index % defaultColors.length],
  }));
}

export function getIssuesByPriority(issues: RedmineIssue[]) {
  const priorityColors: Record<string, string> = {
    'Low': '#737384',
    'Normal': '#60bcfa',
    'High': '#ffbe20',
    'Urgent': '#f87a71',
    'Immediate': '#ef5144',
  };

  const defaultColors = ['#737384', '#60bcfa', '#ffbe20', '#f87a71', '#ef5144'];
  
  const counts: Record<string, number> = {};
  issues.forEach(issue => {
    counts[issue.priority.name] = (counts[issue.priority.name] || 0) + 1;
  });
  
  return Object.entries(counts).map(([priority, count], index) => ({
    priority,
    count,
    color: priorityColors[priority] || defaultColors[index % defaultColors.length],
  }));
}

export function getIssuesByTracker(issues: RedmineIssue[]) {
  const counts: Record<string, number> = {};
  issues.forEach(issue => {
    counts[issue.tracker.name] = (counts[issue.tracker.name] || 0) + 1;
  });
  
  return Object.entries(counts).map(([tracker, count]) => ({
    tracker,
    count,
  }));
}

export function getIssuesByAssignee(issues: RedmineIssue[]) {
  const data: Record<string, { count: number; open: number; closed: number }> = {};
  
  issues.forEach(issue => {
    const name = issue.assigned_to?.name || 'Unassigned';
    if (!data[name]) {
      data[name] = { count: 0, open: 0, closed: 0 };
    }
    data[name].count++;
    if (issue.status.is_closed) {
      data[name].closed++;
    } else {
      data[name].open++;
    }
  });
  
  return Object.entries(data)
    .map(([assignee, stats]) => ({
      assignee,
      ...stats,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getIssuesTrend(issues: RedmineIssue[]) {
  const now = new Date();
  const trend: { date: string; created: number; closed: number; cumulative: number }[] = [];
  
  // Get issues created before the 30-day window for cumulative calculation
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  let cumulative = issues.filter(issue => {
    const created = new Date(issue.created_on);
    return created < thirtyDaysAgo;
  }).length;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const created = issues.filter(issue => 
      issue.created_on.startsWith(dateStr)
    ).length;
    
    const closed = issues.filter(issue => 
      issue.closed_on && issue.closed_on.startsWith(dateStr)
    ).length;
    
    cumulative += created - closed;
    trend.push({ date: displayDate, created, closed, cumulative: Math.max(0, cumulative) });
  }
  
  return trend;
}

export function getIssuesByProject(issues: RedmineIssue[]) {
  const counts: Record<string, number> = {};
  issues.forEach(issue => {
    counts[issue.project.name] = (counts[issue.project.name] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([project, count]) => ({ project, count }))
    .sort((a, b) => b.count - a.count);
}

