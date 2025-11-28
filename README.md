# Redmine Modern Interface

A modern, clean interface for viewing and analyzing Redmine issues. Built with React, TypeScript, and Tailwind CSS.

![Dashboard Preview](./docs/dashboard.png)

## Features

### 📊 Analytics Dashboard
- Real-time statistics for total, open, closed, and overdue issues
- Issue trends over the last 30 days
- Distribution by status, priority, tracker, and assignee
- Project-level breakdowns
- Team performance metrics

### 📋 Smart Issue List
- Advanced filtering by project, status, and priority
- Smart grouping by status, priority, project, assignee, or tracker
- Flexible sorting options (updated, created, priority, due date)
- Full-text search across issue titles and IDs
- Visual indicators for overdue items

### 📅 Calendar View
- Monthly calendar showing issues by due date
- Visual tracker type indicators
- Overdue issue highlighting
- Click to view daily issue details
- Upcoming deadlines sidebar

### ⚙️ Easy Configuration
- Simple API key setup
- Secure credential storage
- Connection testing
- CORS configuration guidance

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Redmine instance with API access enabled

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd redmine-upgrade

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Configuration

1. Open the application in your browser (default: http://localhost:5173)
2. Navigate to **Settings**
3. Enter your Redmine URL (e.g., `https://redmine.example.com`)
4. Enter your API key (found in Redmine → My Account → API access key)
5. Click **Save & Test Connection**

### CORS Setup

If your Redmine server doesn't allow cross-origin requests, you'll need to configure CORS:

**Apache:**
```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Headers "Content-Type"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
```

**Nginx:**
```nginx
add_header 'Access-Control-Allow-Origin' '*';
add_header 'Access-Control-Allow-Headers' 'Content-Type';
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
```

Alternatively, you can use a proxy server or browser extension to handle CORS.

## Demo Mode

The application ships with demo data so you can explore all features without connecting to a real Redmine instance. Once configured, it will automatically use your Redmine data.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **date-fns** - Date utilities
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx      # Analytics dashboard
│   ├── IssueList.tsx      # Issue list with filters
│   ├── CalendarView.tsx   # Calendar timeline view
│   └── ConfigPanel.tsx    # Settings panel
├── services/
│   ├── api.ts             # Redmine API client
│   └── mockData.ts        # Demo data generator
├── types/
│   └── redmine.ts         # TypeScript interfaces
├── App.tsx                # Main application
├── main.tsx               # Entry point
└── index.css              # Global styles
```

## Future Enhancements

This is a read-only interface focused on visualization. Future versions may include:

- Issue creation and editing
- Time tracking
- Gantt chart view
- Custom field support
- Multiple project views
- Export functionality
- Dark/light theme toggle

## License

MIT License - feel free to use and modify for your needs.
