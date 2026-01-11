# Dashboard Implementation (Issue #7)

## Overview

This document describes the implementation of the Dashboard screen (S-002) for the 営業日報システム (Daily Report System).

## Implementation Summary

The dashboard screen has been fully implemented following the specifications in `doc/screen-specification.md` (S-002 Dashboard).

### Features Implemented

1. **Statistics Cards** - Display monthly metrics
   - Number of submitted daily reports this month
   - Number of approved daily reports this month
   - Number of visits this month
   - Pending approval count (manager only)

2. **Today's Report Card** - Quick access to today's daily report
   - Shows current status (未作成/下書き/提出済み/承認済み/差し戻し)
   - Quick action buttons (Create/Edit/View)
   - Visit count display

3. **Recent Reports List** - Last 5 daily reports
   - Date, status, visit count
   - Summary preview
   - Click to view details
   - Shows sales name for manager view

4. **Pending Approval List** (Manager Only)
   - Reports awaiting approval
   - Sales name, date, submission time
   - Quick access to approve/reject

5. **Role-Based Content Display**
   - Regular sales (一般): Own reports and statistics
   - Manager (上長): Team statistics, pending approvals, all reports

6. **Responsive Design**
   - Mobile-first approach
   - Grid layout adapts to screen size
   - Touch-friendly buttons and links

## File Structure

```
src/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── page.tsx                 # Main dashboard page
├── components/
│   ├── features/
│   │   └── dashboard/
│   │       ├── index.ts                 # Exports
│   │       ├── StatsCard.tsx            # Statistics card component
│   │       ├── TodayReportCard.tsx      # Today's report card
│   │       ├── RecentReportsList.tsx    # Recent reports list
│   │       └── PendingApprovalList.tsx  # Pending approvals (manager)
│   └── ui/
│       ├── card.tsx                     # shadcn/ui card
│       ├── badge.tsx                    # shadcn/ui badge
│       └── button.tsx                   # shadcn/ui button
├── types/
│   ├── dashboard.ts                     # Dashboard type definitions
│   └── index.ts                         # Type exports
└── lib/
    └── mock-dashboard-data.ts           # Mock data for development
```

## Component Architecture

### 1. StatsCard Component

**Purpose:** Display a single statistic with title, value, and optional icon.

**Props:**

- `title`: Card title
- `value`: Numeric value to display
- `description`: Optional description text
- `icon`: Optional Lucide icon component
- `iconColor`: Icon color class
- `variant`: Color theme (default/primary/success/warning)

**Usage:**

```tsx
<StatsCard
  title="今月の提出"
  value={15}
  description="件の日報を提出"
  icon={FileText}
  iconColor="text-blue-500"
  variant="primary"
/>
```

### 2. TodayReportCard Component

**Purpose:** Display today's report status with quick actions.

**Props:**

- `report`: TodayReport object with status and metadata

**Features:**

- Shows different CTAs based on status
- Status badge with appropriate colors
- Visit count display
- Responsive button layout

### 3. RecentReportsList Component

**Purpose:** Display recent daily reports in a card.

**Props:**

- `reports`: Array of recent reports (max 5)
- `showSalesName`: Whether to show sales name (manager view)

**Features:**

- Click to view report details
- Status badges
- Hover states for better UX
- "View all" link to reports page

### 4. PendingApprovalList Component (Manager Only)

**Purpose:** Display reports awaiting approval.

**Props:**

- `reports`: Array of pending reports

**Features:**

- Relative time display (e.g., "2時間前")
- Empty state when no pending reports
- Badge showing count
- Quick navigation to report details

## Type Definitions

### DashboardData

Main data structure for the dashboard:

```typescript
interface DashboardData {
  user: {
    salesId: number;
    salesName: string;
    role: '一般' | '上長';
  };
  stats: DashboardStats;
  todayReport: TodayReport;
  recentReports: RecentReport[];
  pendingReports?: PendingReport[]; // Manager only
}
```

See `src/types/dashboard.ts` for complete type definitions.

## Mock Data

For development purposes, mock data is provided in `src/lib/mock-dashboard-data.ts`.

**Functions:**

- `getMockDashboardDataForSales()`: Mock data for regular sales user
- `getMockDashboardDataForManager()`: Mock data for manager user
- `getMockDashboardData(role)`: Get mock data by role

**To test manager view:**

```typescript
// In src/app/(dashboard)/dashboard/page.tsx
const mockRole: '一般' | '上長' = '上長'; // Change to '上長'
```

## Responsive Design

The dashboard uses a responsive grid layout:

- **Mobile (< 768px)**: Single column, stacked cards
- **Tablet (≥ 768px)**: 2-column grid for statistics
- **Desktop (≥ 1024px)**: 4-column grid for statistics

Example:

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{/* Cards */}</div>
```

## Accessibility Features

1. **Semantic HTML**: Proper heading hierarchy, landmarks
2. **ARIA Labels**: Where needed for screen readers
3. **Keyboard Navigation**: All interactive elements are keyboard accessible
4. **Color Contrast**: Meets WCAG 2.1 AA standards
5. **Focus Indicators**: Clear focus states on all interactive elements

## Integration Points

### TODO: Replace Mock Data with Real Data

1. **Authentication**

   ```typescript
   // Replace in page.tsx
   const session = await getServerSession();
   const user = await getUserFromSession(session);
   ```

2. **Data Fetching**

   ```typescript
   // Create Server Action or API call
   const dashboardData = await getDashboardData(user.salesId, user.role);
   ```

3. **Database Queries**
   - Get today's report for user
   - Count submitted/approved reports this month
   - Count visits this month
   - Get recent reports (last 5)
   - Get pending approvals (manager only)

### Recommended Server Actions

Create in `src/app/actions/dashboard.ts`:

```typescript
'use server';

export async function getDashboardStats(salesId: number, role: string) {
  // Query database for statistics
}

export async function getTodayReport(salesId: number, date: string) {
  // Query today's report
}

export async function getRecentReports(salesId: number, limit: number) {
  // Query recent reports
}

export async function getPendingApprovals(managerId: number) {
  // Query pending approvals for manager
}
```

## Testing

### Manual Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Statistics cards display correct values
- [ ] Today's report card shows appropriate CTA
- [ ] Recent reports list displays correctly
- [ ] Click on report navigates to details
- [ ] Manager view shows pending approvals
- [ ] Manager view shows "承認待ち" statistics card
- [ ] Regular sales view hides manager-only content
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] All links work correctly
- [ ] Status badges have correct colors
- [ ] Icons display properly

### Test Different User Roles

1. **Regular Sales (一般)**:
   - Change `mockRole` to `'一般'`
   - Verify no pending approval section
   - Verify only own reports shown

2. **Manager (上長)**:
   - Change `mockRole` to `'上長'`
   - Verify pending approval section appears
   - Verify team reports shown with sales names

## Performance Considerations

1. **Server Components**: Dashboard uses React Server Components for better performance
2. **Data Fetching**: Will use Server Actions to fetch data on the server
3. **No Client-Side State**: Minimal client-side JavaScript
4. **Optimized Images**: When adding images, use Next.js `<Image>` component

## Future Enhancements

1. **Calendar View** (Optional in spec)
   - Monthly calendar with report status indicators
   - Click date to view/create report

2. **Charts and Graphs**
   - Trend charts for monthly statistics
   - Visit count over time
   - Approval rate metrics

3. **Real-time Updates**
   - WebSocket for real-time approval notifications
   - Badge counts update automatically

4. **Filters and Sorting**
   - Filter recent reports by status
   - Sort by date/status/visit count

## Dependencies

- **Next.js 14**: App Router, Server Components
- **React**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components (Card, Badge, Button)
- **Lucide React**: Icons
- **class-variance-authority**: Component variants
- **clsx/tailwind-merge**: Utility for className merging

## References

- **Screen Specification**: `doc/screen-specification.md` (S-002)
- **API Specification**: `doc/api-specification.md`
- **Screen Transition**: `doc/screen-transition.md`
- **Project Documentation**: `CLAUDE.md`

## Completion Status

✅ Dashboard UI implementation complete
✅ Role-based content display implemented
✅ Responsive design implemented
✅ TypeScript type definitions created
✅ Mock data for development testing
✅ All components documented
⏳ Pending: Integration with real data/API
⏳ Pending: Authentication integration
⏳ Pending: E2E testing

## Notes

- The implementation follows the project's established patterns from Issue #5 (layout components)
- All components use shadcn/ui for consistency
- Code includes comprehensive JSDoc comments
- TypeScript strict mode enabled with no errors
- ESLint passes with no warnings
- Ready for integration with backend/database

---

**Implementation Date**: 2026-01-11
**Issue**: #7
**Implemented By**: Claude Code
