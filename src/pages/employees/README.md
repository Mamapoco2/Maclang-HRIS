# Employees module - redesign

Presentation-only redesign. Data loading, filtering, sorting, form state, hooks,
and API payloads are unchanged. Drop this folder over the existing `employees` folder.

## shadcn components used (imported from "@/components/ui/...")

Already used by the old code: alert-dialog, avatar, command, dialog, popover, select
New: button, input, badge, table, tabs, label, checkbox, skeleton

    npx shadcn@latest add button input badge table tabs label checkbox skeleton

## Notes
- Table: Username / Last / First / Middle name columns are merged into one "Employee" column (sorts by last name).
- Names are shown in Title Case for display only; saved values are still uppercase.
- The form dialog now uses EmployeeFormDialog (responsive, max-w-5xl) instead of a fixed 1400px dialog.
- New files: components/employeeToolbar.jsx, components/employeePagination.jsx,
  components/shared/StatusBadge.jsx, utils/employeeDisplay.js
