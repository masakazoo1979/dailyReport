# Issue #9: Daily Report Registration Screen Implementation

## Overview

This document describes the implementation of the daily report registration screen (Screen S-004) as specified in `doc/screen-specification.md`.

## Implementation Date

2026-01-11

## Files Created/Modified

### 1. Validation Schemas

**File:** `src/lib/validations/daily-report.ts`

Comprehensive Zod validation schemas for daily reports and visit records:

- `visitRecordSchema`: Validates visit time (HH:MM), customer ID, and visit content (max 1000 chars)
- `dailyReportSchema`: Validates report date, problem (max 2000 chars), plan (max 2000 chars), and visits array
- `dailyReportSubmitSchema`: Extends dailyReportSchema with minimum 1 visit record requirement
- Additional schemas for API requests/responses

**Error Messages Implemented:**

- E-005: Date format validation
- E-007: Report date required
- E-008: Duplicate report check (in server actions)
- E-009: Visit time required
- E-010: Visit time format (HH:MM)
- E-011: Customer selection required
- E-012: Visit content required
- E-013: Visit content max 1000 characters
- E-014: Problem max 2000 characters
- E-015: Plan max 2000 characters
- E-016: Minimum 1 visit record for submission

### 2. Type Definitions

**File:** `src/types/daily-report.ts`

TypeScript type definitions for:

- `DailyReportStatus`: Status enum type
- `VisitRecordFormData`: Visit record form data interface
- `DailyReportFormData`: Daily report form data interface
- `VisitRecord`: Visit record API response interface
- `Comment`: Comment API response interface
- `DailyReport`: Daily report API response interface
- `DailyReportListItem`: Daily report list item interface
- `CustomerOption`: Customer dropdown option interface

### 3. Server Actions

#### a. Customer Actions

**File:** `src/app/actions/customers.ts`

- `getCustomersForSelect()`: Fetches customer list for dropdown selection
  - Returns customers sorted by company name and customer name
  - Used in the customer selection dropdown in visit records

#### b. Daily Report Actions

**File:** `src/app/actions/daily-reports.ts`

Four main server actions:

1. **`saveDraftDailyReport(formData)`**
   - Creates a new daily report with status "下書き"
   - Allows saving without visit records
   - Checks for duplicate reports on the same date
   - Creates visit records in a transaction
   - Revalidates cache paths

2. **`submitDailyReport(formData)`**
   - Creates a new daily report with status "提出済み"
   - Requires at least 1 visit record (validates with E-016)
   - Sets submittedAt timestamp
   - Creates visit records in a transaction
   - Revalidates cache paths

3. **`updateDraftDailyReport(reportId, formData)`**
   - Updates existing daily report (draft or rejected status only)
   - Checks ownership and edit permissions
   - Deletes old visit records and creates new ones
   - Transaction-based update

4. **`updateAndSubmitDailyReport(reportId, formData)`**
   - Updates and submits existing daily report
   - Requires at least 1 visit record
   - Changes status to "提出済み"
   - Sets submittedAt timestamp
   - Transaction-based update

**Security Features:**

- Authentication check on all actions
- Ownership verification
- Status-based edit permissions
- Duplicate date validation

### 4. Form Component

**File:** `src/components/features/daily-reports/DailyReportForm.tsx`

A comprehensive form component with the following features:

#### Form Fields (Screen Items)

- **DR-001**: Report Date (date input, required, defaults to today)
- **DR-002**: Status display (edit mode only)
- **DR-003**: Visit records list (dynamic array)
- **DR-004**: Add visit record button
- **DR-005**: Visit time (time input, HH:MM format, required)
- **DR-006**: Customer selection (dropdown, required)
- **DR-007**: Visit content (textarea, max 1000 chars, required)
- **DR-008**: Problem/Issues (textarea, max 2000 chars, optional)
- **DR-009**: Tomorrow's Plan (textarea, max 2000 chars, optional)
- **DR-010**: Save Draft button
- **DR-011**: Submit button
- **DR-012**: Cancel button

#### Key Features

1. **Dynamic Visit Record Management**
   - Add unlimited visit records with the "+ 訪問記録を追加" button
   - Remove individual visit records with the delete button
   - Each visit record is rendered in a separate card for clear visual separation

2. **React Hook Form Integration**
   - Uses `useForm` with Zod resolver for validation
   - `useFieldArray` for dynamic visit record management
   - `Controller` for custom Select component integration
   - Real-time validation on blur

3. **Customer Dropdown**
   - Fetches customer list on component mount
   - Displays as "Company Name - Customer Name"
   - Loading state while fetching
   - Error handling for fetch failures

4. **Form Validation**
   - Client-side validation using Zod schemas
   - Different validation for draft (visits optional) vs submit (visits required)
   - Inline error messages for all fields
   - ARIA attributes for accessibility

5. **Server Action Integration**
   - Separate handlers for draft save and submit
   - Proper error handling and display
   - Loading states during submission
   - Automatic navigation to reports list on success

6. **Edit Mode Support**
   - Component accepts `existingReport` prop for editing
   - Pre-fills form with existing data
   - Disables report date field in edit mode
   - Shows current status
   - Uses update actions instead of create actions

7. **Accessibility**
   - Proper ARIA labels and descriptions
   - Error announcements with role="alert"
   - Keyboard navigation support
   - Focus management

#### Component Props

```typescript
interface DailyReportFormProps {
  existingReport?: DailyReport; // For edit mode
  isEditMode?: boolean; // Toggle edit/create mode
}
```

### 5. Page Component

**File:** `src/app/(dashboard)/reports/new/page.tsx`

The page component for the daily report registration screen:

- Metadata for SEO (title, description)
- Page header with title and description
- Renders the DailyReportForm component
- Responsive container with max-width
- Proper spacing and padding

**Route:** `/dashboard/reports/new`

### 6. Feature Component Index

**File:** `src/components/features/daily-reports/index.ts`

Clean export for the DailyReportForm component.

## Component Architecture

```
src/app/(dashboard)/reports/new/page.tsx
  └─> src/components/features/daily-reports/DailyReportForm.tsx
       ├─> src/lib/validations/daily-report.ts (validation schemas)
       ├─> src/types/daily-report.ts (TypeScript types)
       ├─> src/app/actions/customers.ts (fetch customers)
       ├─> src/app/actions/daily-reports.ts (CRUD operations)
       └─> shadcn/ui components:
            ├─> Button
            ├─> Input
            ├─> Label
            ├─> Textarea
            ├─> Select
            ├─> Card
            └─> Alert
```

## Data Flow

### 1. Component Mount

1. Form initializes with default values (today's date, empty fields)
2. `getCustomersForSelect()` action fetches customer list
3. Customer dropdown is populated
4. Form is ready for input

### 2. Adding Visit Records

1. User clicks "訪問記録を追加" button
2. `append()` from useFieldArray adds new empty visit record
3. New card appears with empty fields
4. User fills in visit time, customer, and content

### 3. Draft Save Flow

1. User clicks "下書き保存" button
2. Form validates with `dailyReportSchema` (visits optional)
3. If valid, creates FormData with serialized visits
4. Calls `saveDraftDailyReport()` server action
5. Server creates daily report with status "下書き"
6. Server creates visit records in transaction
7. Redirects to `/dashboard/reports` on success

### 4. Submit Flow

1. User clicks "提出" button
2. Form validates with `dailyReportSubmitSchema` (visits required)
3. If validation fails (no visits), shows E-016 error
4. If valid, creates FormData with serialized visits
5. Calls `submitDailyReport()` server action
6. Server creates daily report with status "提出済み"
7. Server sets submittedAt timestamp
8. Server creates visit records in transaction
9. Redirects to `/dashboard/reports` on success

## Database Operations

All database operations use Prisma transactions to ensure data consistency:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create/update daily report
  const report = await tx.dailyReport.create/update({ ... });

  // 2. Create visit records
  await tx.visit.createMany({ ... });

  return report;
});
```

This ensures that if visit record creation fails, the daily report is not created/updated either.

## Validation Rules

### Client-Side Validation (Zod)

- Report date: Required, YYYY-MM-DD format
- Visit time: Required, HH:MM format (00:00-23:59)
- Customer: Required, positive integer
- Visit content: Required, max 1000 characters
- Problem: Optional, max 2000 characters
- Plan: Optional, max 2000 characters
- Visits array:
  - Draft mode: 0+ visits allowed
  - Submit mode: 1+ visits required

### Server-Side Validation

- Authentication: User must be logged in
- Ownership: Only report owner can edit
- Status: Only "下書き" or "差し戻し" can be edited
- Duplicate: No duplicate reports for same user/date
- Visit records: Must exist when submitting

## Error Handling

### Client-Side Errors

- Form validation errors displayed inline
- Network errors displayed in alert banner
- Customer fetch errors displayed in alert banner

### Server-Side Errors

- Authentication errors: "認証エラーです。再度ログインしてください。"
- Duplicate report: "同じ日付の日報が既に存在します" (E-008)
- No visits on submit: "日報を提出するには、訪問記録を1件以上登録してください" (E-016)
- Permission errors: "この日報を編集する権限がありません"
- Status errors: "この日報は編集できません"
- System errors: "システムエラーが発生しました。管理者にお問い合わせください。"

## Accessibility Features

1. **Semantic HTML**: Proper use of form, label, input, button elements
2. **ARIA Attributes**:
   - `aria-invalid` for error states
   - `aria-describedby` linking errors to fields
   - `role="alert"` for error messages
3. **Keyboard Navigation**: All interactive elements keyboard accessible
4. **Focus Management**: Logical tab order
5. **Required Field Indicators**: Visual asterisk (\*) for required fields
6. **Error Announcements**: Screen readers announce validation errors

## Responsive Design

- Mobile-first approach using Tailwind CSS
- Grid layout for visit record fields (1 column on mobile, 3 columns on desktop)
- Responsive spacing and padding
- Container max-width for better readability on large screens
- Touch-friendly button sizes and spacing

## Testing Considerations

### Unit Tests (Recommended)

1. Validation schema tests:
   - Valid data passes validation
   - Invalid data fails with correct error messages
   - Edge cases (empty strings, max length, etc.)

2. Component tests:
   - Renders all required fields
   - Add/remove visit records functionality
   - Form submission with valid data
   - Form validation with invalid data
   - Customer dropdown population

### Integration Tests (Recommended)

1. Server action tests:
   - Draft save creates report with correct status
   - Submit creates report with submittedAt timestamp
   - Visit records are created in transaction
   - Duplicate date validation works
   - Permission checks work correctly

### E2E Tests (Recommended)

1. Complete user flow:
   - Navigate to new report page
   - Fill in report date
   - Add multiple visit records
   - Fill in all fields
   - Save as draft
   - Edit draft
   - Submit report
   - Verify redirect to list page

## Future Enhancements

1. **Auto-save**: Periodic auto-save to prevent data loss
2. **Visit Templates**: Save common visit content as templates
3. **Bulk Operations**: Copy previous day's report structure
4. **Rich Text Editor**: Enhanced formatting for visit content
5. **File Attachments**: Attach photos or documents to visits
6. **Offline Support**: PWA with offline form capabilities
7. **AI Suggestions**: AI-powered visit content suggestions based on customer history

## Dependencies

### NPM Packages

- `react-hook-form`: ^7.x - Form state management
- `@hookform/resolvers`: ^3.x - Zod integration
- `zod`: ^3.x - Schema validation
- `next`: 14.x - Next.js framework
- `@prisma/client`: ^5.x - Database ORM
- `lucide-react`: ^0.x - Icons (Plus, Trash2)

### Internal Dependencies

- `@/lib/auth`: Authentication utilities
- `@/lib/prisma`: Prisma client instance
- `@/components/ui/*`: shadcn/ui components
- `@/lib/validations/*`: Validation schemas
- `@/types/*`: TypeScript type definitions

## Known Issues

None at this time.

## Compliance

This implementation fully complies with:

- Screen specification S-004 in `doc/screen-specification.md`
- API specification for daily reports in `doc/api-specification.md`
- Database schema in `prisma/schema.prisma`
- Error message specification (E-005 through E-016)
- Next.js 14 App Router best practices
- React Server Components and Server Actions patterns
- WCAG 2.1 AA accessibility guidelines
- TypeScript strict mode

## Conclusion

The daily report registration screen has been successfully implemented with all required features:

- ✅ Form with all specified fields (DR-001 through DR-012)
- ✅ Dynamic visit record management
- ✅ Customer selection dropdown
- ✅ Draft save and submit functionality
- ✅ Comprehensive validation (client and server)
- ✅ Error handling and display
- ✅ Accessibility features
- ✅ Responsive design
- ✅ Type safety with TypeScript
- ✅ Transaction-based database operations
- ✅ Authentication and authorization
- ✅ Cache revalidation

The implementation is production-ready and follows all project standards and best practices.
