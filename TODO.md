# TODO: Fix Role-wise Report Visibility Rules

## Backend Changes
- [ ] Fix submitReport in reportController.js: Set status="pending" and department=category
- [ ] Update getAllReports in reportController.js: Enforce exact visibility rules
  - [ ] Field-head: ONLY status="pending" AND department=user.department
  - [ ] Maintainer: status IN ["verified", "assigned", "in_progress"] AND department=user.department, NEVER pending
  - [ ] User: own reports, hide fake

## Frontend Changes
- [ ] Update FieldHeadDashboard.js: Change to "Pending Reports" tab with <ReportList status="pending" />
- [ ] Update MaintainerDashboard.js: Change tabs to ONLY "Verified", "Assigned", "In-Progress" (remove resolved)

## Testing and Verification
- [ ] Verify no other workflows are broken (verifyReport, updateReportStatus, fake migration, notifications)
- [ ] Test role-based access for all user types
