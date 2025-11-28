import { RedmineConfig, RedmineIssue, RedmineIssuesResponse, RedmineProject, RedmineProjectsResponse } from '../types/redmine';

class RedmineAPI {
  private config: RedmineConfig | null = null;

  configure(config: RedmineConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return this.config !== null && this.config.apiKey !== '' && this.config.baseUrl !== '';
  }

  getConfig(): RedmineConfig | null {
    return this.config;
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    if (!this.config) {
      throw new Error('Redmine API not configured');
    }

    // Use proxy in development to avoid CORS issues
    // The proxy is configured in vite.config.ts to forward /api/* to the Redmine server
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? '/api' : this.config.baseUrl;

    const url = new URL(`${baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    url.searchParams.append('key', this.config.apiKey);

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getIssues(params?: {
    project_id?: string;
    status_id?: string;
    assigned_to_id?: string;
    tracker_id?: string;
    priority_id?: string;
    limit?: number;
    offset?: number;
    sort?: string;
  }): Promise<RedmineIssuesResponse> {
    const queryParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams[key] = String(value);
        }
      });
    }
    return this.fetch<RedmineIssuesResponse>('/issues.json', queryParams);
  }

  async getIssue(id: number): Promise<{ issue: RedmineIssue }> {
    return this.fetch<{ issue: RedmineIssue }>(`/issues/${id}.json`);
  }

  async getProjects(params?: {
    limit?: number;
    offset?: number;
  }): Promise<RedmineProjectsResponse> {
    const queryParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams[key] = String(value);
        }
      });
    }
    return this.fetch<RedmineProjectsResponse>('/projects.json', queryParams);
  }

  async getProject(identifier: string): Promise<{ project: RedmineProject }> {
    return this.fetch<{ project: RedmineProject }>(`/projects/${identifier}.json`);
  }
}

export const redmineAPI = new RedmineAPI();
export default redmineAPI;
