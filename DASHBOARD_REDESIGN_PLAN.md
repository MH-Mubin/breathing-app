# Dashboard Redesign Plan

## Overview
Complete redesign of the dashboard to be highly informative, motivational, and visually appealing with data visualization.

## Backend Requirements

### New API Endpoints Needed:
1. `GET /api/dashboard/stats` - Comprehensive dashboard statistics
2. `GET /api/dashboard/weekly-activity` - Week-by-week activity data
3. `GET /api/dashboard/pattern-usage` - Breathing pattern analytics
4. `GET /api/dashboard/insights` - Personalized insights

### Data to Return:
- Daily overview (today's sessions, minutes, streak, state)
- Weekly/monthly consistency data
- Progress metrics (all-time stats, trends)
- Pattern usage statistics
- Achievement progress
- Personalized insights

## Frontend Components

### Main Dashboard Sections:
1. **Hero Stats** - Key metrics at a glance
2. **Daily Overview Card** - Today's progress
3. **Streak Visualization** - Calendar heatmap
4. **Progress Charts** - Line/bar charts for trends
5. **Pattern Usage** - Pie/donut chart
6. **Achievements Grid** - Gamification
7. **Recent Activity** - Session list
8. **Insights Card** - AI-like suggestions

### Libraries to Use:
- **Recharts** - For charts and data visualization
- **Framer Motion** - For animations
- **React Icons** - For consistent iconography

## Implementation Steps:

### Phase 1: Backend API
1. Create dashboard routes file
2. Implement stats aggregation logic
3. Add weekly activity calculation
4. Add pattern usage analytics
5. Generate personalized insights

### Phase 2: Frontend Components
1. Install Recharts library
2. Create individual dashboard cards
3. Implement data fetching
4. Add loading states
5. Add animations

### Phase 3: Polish
1. Responsive design
2. Empty states
3. Error handling
4. Performance optimization

## Design Principles:
- Calm, minimal aesthetic
- Orange accent color (#FF8A1F)
- White cards with subtle shadows
- Smooth animations
- Clear data hierarchy
- Motivational messaging
