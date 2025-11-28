export interface RedmineUser {
  id: number;
  name: string;
  login?: string;
  mail?: string;
  avatar_url?: string;
}

export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  status: number;
  is_public?: boolean;
  created_on?: string;
  updated_on?: string;
}

export interface RedmineStatus {
  id: number;
  name: string;
  is_closed?: boolean;
}

export interface RedmineTracker {
  id: number;
  name: string;
}

export interface RedminePriority {
  id: number;
  name: string;
}

export interface RedmineCategory {
  id: number;
  name: string;
}

export interface RedmineVersion {
  id: number;
  name: string;
  status?: string;
  due_date?: string;
}

export interface RedmineCustomField {
  id: number;
  name: string;
  value: string | string[];
}

export interface RedmineIssue {
  id: number;
  project: RedmineProject;
  tracker: RedmineTracker;
  status: RedmineStatus;
  priority: RedminePriority;
  author: RedmineUser;
  assigned_to?: RedmineUser;
  category?: RedmineCategory;
  fixed_version?: RedmineVersion;
  subject: string;
  description?: string;
  start_date?: string;
  due_date?: string;
  done_ratio: number;
  is_private?: boolean;
  estimated_hours?: number;
  spent_hours?: number;
  custom_fields?: RedmineCustomField[];
  created_on: string;
  updated_on: string;
  closed_on?: string;
}

export interface RedmineIssuesResponse {
  issues: RedmineIssue[];
  total_count: number;
  offset: number;
  limit: number;
}

export interface RedmineProjectsResponse {
  projects: RedmineProject[];
  total_count: number;
  offset: number;
  limit: number;
}

export interface RedmineConfig {
  baseUrl: string;
  apiKey: string;
}

// Analytics types
export interface IssuesByStatus {
  status: string;
  count: number;
  color: string;
}

export interface IssuesByPriority {
  priority: string;
  count: number;
  color: string;
}

export interface IssuesByTracker {
  tracker: string;
  count: number;
}

export interface IssuesByAssignee {
  assignee: string;
  count: number;
  open: number;
  closed: number;
}

export interface IssuesTrend {
  date: string;
  created: number;
  closed: number;
  cumulative: number;
}

export interface ProjectStats {
  totalIssues: number;
  openIssues: number;
  closedIssues: number;
  overdueIssues: number;
  avgCompletionTime: number;
  completionRate: number;
}

