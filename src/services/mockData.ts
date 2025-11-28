import { RedmineIssue, RedmineProject } from '../types/redmine';
import { addDays, subDays, format } from 'date-fns';

const statuses = [
  { id: 1, name: 'New', is_closed: false },
  { id: 2, name: 'In Progress', is_closed: false },
  { id: 3, name: 'Resolved', is_closed: false },
  { id: 4, name: 'Feedback', is_closed: false },
  { id: 5, name: 'Closed', is_closed: true },
  { id: 6, name: 'Rejected', is_closed: true },
];

const trackers = [
  { id: 1, name: 'Bug' },
  { id: 2, name: 'Feature' },
  { id: 3, name: 'Support' },
  { id: 4, name: 'Task' },
];

const priorities = [
  { id: 1, name: 'Low' },
  { id: 2, name: 'Normal' },
  { id: 3, name: 'High' },
  { id: 4, name: 'Urgent' },
  { id: 5, name: 'Immediate' },
];

const users = [
  { id: 1, name: 'Alice Johnson', login: 'alice' },
  { id: 2, name: 'Bob Smith', login: 'bob' },
  { id: 3, name: 'Charlie Brown', login: 'charlie' },
  { id: 4, name: 'Diana Prince', login: 'diana' },
  { id: 5, name: 'Edward Norton', login: 'edward' },
  { id: 6, name: 'Fiona Apple', login: 'fiona' },
];

export const mockProjects: RedmineProject[] = [
  { id: 1, name: 'Web Platform', identifier: 'web-platform', status: 1, description: 'Main web application platform' },
  { id: 2, name: 'Mobile App', identifier: 'mobile-app', status: 1, description: 'iOS and Android mobile applications' },
  { id: 3, name: 'API Services', identifier: 'api-services', status: 1, description: 'Backend API microservices' },
  { id: 4, name: 'Infrastructure', identifier: 'infrastructure', status: 1, description: 'DevOps and cloud infrastructure' },
  { id: 5, name: 'Design System', identifier: 'design-system', status: 1, description: 'UI component library and design tokens' },
];

const issueSubjects = [
  'Fix authentication timeout issue',
  'Implement dark mode support',
  'Add export to CSV functionality',
  'Performance optimization for dashboard',
  'Update user profile page design',
  'Fix mobile responsive layout',
  'Add batch operations support',
  'Implement real-time notifications',
  'Database query optimization',
  'Add multi-language support',
  'Fix file upload validation',
  'Improve search functionality',
  'Add two-factor authentication',
  'Update API documentation',
  'Fix session management bug',
  'Implement caching layer',
  'Add audit logging',
  'Fix timezone handling',
  'Implement rate limiting',
  'Add analytics dashboard',
  'Fix memory leak in worker',
  'Update payment integration',
  'Add webhook support',
  'Fix email template rendering',
  'Implement SSO integration',
  'Add role-based permissions',
  'Fix image compression',
  'Update CI/CD pipeline',
  'Add health check endpoints',
  'Fix data migration script',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function generateMockIssues(count: number): RedmineIssue[] {
  const issues: RedmineIssue[] = [];
  const now = new Date();
  
  for (let i = 1; i <= count; i++) {
    const status = randomElement(statuses);
    const createdDaysAgo = randomInt(1, 90);
    const createdDate = subDays(now, createdDaysAgo);
    const hasStartDate = Math.random() > 0.3;
    const hasDueDate = Math.random() > 0.2;
    const startDate = hasStartDate ? subDays(now, randomInt(0, createdDaysAgo)) : undefined;
    const dueDate = hasDueDate ? addDays(now, randomInt(-10, 30)) : undefined;
    
    const issue: RedmineIssue = {
      id: 1000 + i,
      project: randomElement(mockProjects),
      tracker: randomElement(trackers),
      status: status,
      priority: randomElement(priorities),
      author: randomElement(users),
      assigned_to: Math.random() > 0.2 ? randomElement(users) : undefined,
      subject: randomElement(issueSubjects) + ` #${i}`,
      description: `This is a detailed description for issue #${i}. It contains all the relevant information about the task.`,
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      done_ratio: status.is_closed ? 100 : randomInt(0, 9) * 10,
      estimated_hours: Math.random() > 0.5 ? randomInt(1, 40) : undefined,
      spent_hours: Math.random() > 0.5 ? randomInt(0, 30) : undefined,
      created_on: createdDate.toISOString(),
      updated_on: subDays(now, randomInt(0, createdDaysAgo)).toISOString(),
      closed_on: status.is_closed ? subDays(now, randomInt(0, createdDaysAgo - 1)).toISOString() : undefined,
    };
    
    issues.push(issue);
  }
  
  return issues.sort((a, b) => new Date(b.updated_on).getTime() - new Date(a.updated_on).getTime());
}

export const mockIssues = generateMockIssues(75);

export function getMockStats() {
  const totalIssues = mockIssues.length;
  const openIssues = mockIssues.filter(i => !i.status.is_closed).length;
  const closedIssues = mockIssues.filter(i => i.status.is_closed).length;
  const now = new Date();
  const overdueIssues = mockIssues.filter(i => 
    !i.status.is_closed && i.due_date && new Date(i.due_date) < now
  ).length;
  
  return {
    totalIssues,
    openIssues,
    closedIssues,
    overdueIssues,
    avgCompletionTime: 5.2,
    completionRate: Math.round((closedIssues / totalIssues) * 100),
  };
}

export function getIssuesByStatus() {
  const statusColors: Record<string, string> = {
    'New': '#60bcfa',
    'In Progress': '#ffbe20',
    'Resolved': '#43e5aa',
    'Feedback': '#f87a71',
    'Closed': '#737384',
    'Rejected': '#91919f',
  };
  
  const counts: Record<string, number> = {};
  mockIssues.forEach(issue => {
    counts[issue.status.name] = (counts[issue.status.name] || 0) + 1;
  });
  
  return Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    color: statusColors[status] || '#737384',
  }));
}

export function getIssuesByPriority() {
  const priorityColors: Record<string, string> = {
    'Low': '#737384',
    'Normal': '#60bcfa',
    'High': '#ffbe20',
    'Urgent': '#f87a71',
    'Immediate': '#ef5144',
  };
  
  const counts: Record<string, number> = {};
  mockIssues.forEach(issue => {
    counts[issue.priority.name] = (counts[issue.priority.name] || 0) + 1;
  });
  
  return Object.entries(counts).map(([priority, count]) => ({
    priority,
    count,
    color: priorityColors[priority] || '#737384',
  }));
}

export function getIssuesByTracker() {
  const counts: Record<string, number> = {};
  mockIssues.forEach(issue => {
    counts[issue.tracker.name] = (counts[issue.tracker.name] || 0) + 1;
  });
  
  return Object.entries(counts).map(([tracker, count]) => ({
    tracker,
    count,
  }));
}

export function getIssuesByAssignee() {
  const data: Record<string, { count: number; open: number; closed: number }> = {};
  
  mockIssues.forEach(issue => {
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

export function getIssuesTrend() {
  const now = new Date();
  const trend: { date: string; created: number; closed: number }[] = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = subDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, 'MMM d');
    
    const created = mockIssues.filter(issue => 
      format(new Date(issue.created_on), 'yyyy-MM-dd') === dateStr
    ).length;
    
    const closed = mockIssues.filter(issue => 
      issue.closed_on && format(new Date(issue.closed_on), 'yyyy-MM-dd') === dateStr
    ).length;
    
    trend.push({ date: displayDate, created, closed });
  }
  
  // Calculate cumulative
  let cumulative = mockIssues.filter(issue => {
    const created = new Date(issue.created_on);
    return created < subDays(now, 30);
  }).length;
  
  return trend.map(day => {
    cumulative += day.created - day.closed;
    return { ...day, cumulative: Math.max(0, cumulative) };
  });
}

export function getIssuesByProject() {
  const counts: Record<string, number> = {};
  mockIssues.forEach(issue => {
    counts[issue.project.name] = (counts[issue.project.name] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([project, count]) => ({ project, count }))
    .sort((a, b) => b.count - a.count);
}

