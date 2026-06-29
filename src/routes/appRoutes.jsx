// src/routes/appRoutes.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { useFirstAccessibleRoute } from "../hooks/useFirstAccessibleRoute";

import MainLayout from "../layout/layout";
import Dashboard from "../pages/dashboard/dashboard";
import Employee from "../pages/employees/components/employeePage";
import Login from "../pages/login/components/loginPage";
import Register from "../pages/register/registerPage";
import Team from "../pages/team/components/teamPage";
import Analytics from "../pages/analytics/components/analyticsPage";
import Trainings from "../pages/trainings/training/trainingPage";
import SkillAnalysis from "../pages/trainings/skillGapAnalysis/skillGapTest";
import Applications from "../pages/hiring/application/components/applicationPage";
import OnboardingPage from "../pages/hiring/onboarding/onboardingPage";
import Leave from "../pages/leave/DashboardPage";
import LeaveBalance from "../pages/leave/BalancesPage";
import LeaveCalendar from "../pages/leave/CalendarPage";
import LeaveApproval from "../pages/leave/ApprovalsPage";
import LeaveRequest from "../pages/leave/RequestsPage";
import NewLeaveRequest from "../pages/leave/NewRequestPage";
import Applicants from "../pages/hiring/applicants/components/applicantsPage";
import Accounts from "../pages/accounts/components/accountsPage";
import ManPower from "../pages/manpower/manPowerPage";
import IPCRForm from "../pages/spms/ipcr/IPCRForm";
import OPCRForm from "../pages/spms/OPCRPage";
import MFOPage from "../pages/spms/MFOPage";
import PerformancePeriod from "../pages/spms/PerformancePeriodPage";
import Departments from "../pages/departments/departmentPage";
import PlantillaItems from "../pages/plantillaItems/plantillaItemsPage";
import Status403 from "../pages/status/403/403Status";
import Inbox from "../pages/announcement/inbox/inbox";
import Forward from "../pages/announcement/Forward/forward";
import Sent from "../pages/announcement/sent/sent";
import ProtectedRoute from "./protectedRoutes";
import PublicRoute from "./publicRoute";
import PermissionRoute from "./permissionRoute";
import Updates from "../components/update";
import Settings from "../pages/settings/settingsPage";
import AccountPage from "../pages/account/accountPage";
import { ProfileGate } from "../pages/profile/profileGate";
import TopPeformerDepartmentPage from "../pages/topPerformer/topDepartmentPerformer/topDepartmentPerformerPage";
import TopPeformerHospitalPage from "../pages/topPerformer/topHospitalPerformer/topHospitalPerformerPage";
import TrainingEffectivenessPage from "../pages/trainings/trainingEffectiveness/trainingEffectivenessPage";
import CosPage from "../pages/positions/CosPositionsPage";
import ConsultantPositionsPage from "../pages/positions/ConsultantPositionsPage";
import OrientationPage from "../pages/orientation/orientationPage";
import OrientationMonitoringPage from "../pages/orientation/monitoring/orientationMonitoring";
import TaskMonitoringPage from "../pages/taskMonitoring/taskMonitoringPage";
import BugReportsPage from "../pages/bugReport/bugReportPage";
import ReleaseManagerPage from "../pages/releaseManager/releaseManagerPage";
import AuditLogsPage from "../pages/audit/auditLogsPage";
import RenewalsPage from "../pages/renewals/renewalsPage";

function RootRedirect() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const firstAccessibleRoute = useFirstAccessibleRoute();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to={firstAccessibleRoute} replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/status/403" element={<Status403 />} />

        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <ProfileGate>
                <MainLayout />
              </ProfileGate>
            }
          >
            {/* ── Always accessible to authenticated users ── */}
            <Route path="/updates" element={<Updates />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/Orientation" element={<OrientationPage />} />

            {/* ── Dashboard ── */}
            <Route
              path="/dashboard"
              element={
                <PermissionRoute permission="dashboard.view">
                  <Dashboard />
                </PermissionRoute>
              }
            />

            {/* ── Employees ── */}
            <Route
              path="/employees"
              element={
                <PermissionRoute permission="employees.view">
                  <Employee />
                </PermissionRoute>
              }
            />

            {/* ── Analytics ── */}
            <Route
              path="/analytics"
              element={
                <PermissionRoute permission="analytics.view">
                  <Analytics />
                </PermissionRoute>
              }
            />

            {/* ── Hiring ── */}
            <Route
              path="/hiring/plantilla/applications"
              element={
                <PermissionRoute permission="hiring.view">
                  <Applications />
                </PermissionRoute>
              }
            />
            <Route
              path="/hiring/plantilla/applicants"
              element={
                <PermissionRoute permission="hiring.view">
                  <Applicants />
                </PermissionRoute>
              }
            />
            <Route
              path="/hiring/plantilla/onboarding"
              element={
                <PermissionRoute permission="hiring.view">
                  <OnboardingPage />
                </PermissionRoute>
              }
            />

            {/* ── Leave ── */}
            <Route
              path="/leaveDashboard"
              element={
                <PermissionRoute permission="leave.view">
                  <Leave />
                </PermissionRoute>
              }
            />
            <Route
              path="/leaveApproval"
              element={
                <PermissionRoute permission="leave.view">
                  <LeaveApproval />
                </PermissionRoute>
              }
            />
            <Route
              path="/leaveBalance"
              element={
                <PermissionRoute permission="leave.view">
                  <LeaveBalance />
                </PermissionRoute>
              }
            />
            <Route
              path="/leaveCalendar"
              element={
                <PermissionRoute permission="leave.view">
                  <LeaveCalendar />
                </PermissionRoute>
              }
            />
            <Route
              path="/leaveRequest"
              element={
                <PermissionRoute permission="leave.view">
                  <LeaveRequest />
                </PermissionRoute>
              }
            />
            <Route
              path="/NewLeaveRequest"
              element={
                <PermissionRoute permission="leave.view">
                  <NewLeaveRequest />
                </PermissionRoute>
              }
            />

            {/* ── Team ── */}
            <Route
              path="/team"
              element={
                <PermissionRoute permission="team.view">
                  <Team />
                </PermissionRoute>
              }
            />

            {/* ── Orientation ── */}
            <Route
              path="/orientationMonitoring"
              element={
                <PermissionRoute permission="orientation.view">
                  <OrientationMonitoringPage />
                </PermissionRoute>
              }
            />

            {/* ── Trainings ── */}
            <Route
              path="/trainings"
              element={
                <PermissionRoute permission="trainings.view">
                  <Trainings />
                </PermissionRoute>
              }
            />
            <Route
              path="/skillGapAnalysis"
              element={
                <PermissionRoute permission="trainings.skill_gap">
                  <SkillAnalysis />
                </PermissionRoute>
              }
            />
            <Route
              path="/trainingEffectiveness"
              element={
                <PermissionRoute permission="trainings.effectiveness">
                  <TrainingEffectivenessPage />
                </PermissionRoute>
              }
            />

            {/* ── SPMS ── */}
            <Route
              path="/IPCR"
              element={
                <PermissionRoute permission="spms.view">
                  <IPCRForm />
                </PermissionRoute>
              }
            />
            <Route
              path="/OPCR"
              element={
                <PermissionRoute permission="spms.view">
                  <OPCRForm />
                </PermissionRoute>
              }
            />
            <Route
              path="/MFO"
              element={
                <PermissionRoute permission="spms.view">
                  <MFOPage />
                </PermissionRoute>
              }
            />
            <Route
              path="/PerformancePeriod"
              element={
                <PermissionRoute permission="spms.view">
                  <PerformancePeriod />
                </PermissionRoute>
              }
            />

            {/* ── Announcements ── */}
            <Route
              path="/inbox"
              element={
                <PermissionRoute permission="announcements.view">
                  <Inbox />
                </PermissionRoute>
              }
            />
            <Route
              path="/forward"
              element={
                <PermissionRoute permission="announcements.view">
                  <Forward />
                </PermissionRoute>
              }
            />
            <Route
              path="/sent"
              element={
                <PermissionRoute permission="announcements.view">
                  <Sent />
                </PermissionRoute>
              }
            />

            {/* ── Manpower ── */}
            <Route
              path="/manpower"
              element={
                <PermissionRoute permission="manpower.view">
                  <ManPower />
                </PermissionRoute>
              }
            />

            {/* ── System Management ── */}
            <Route
              path="/accounts"
              element={
                <PermissionRoute permission="accounts.view">
                  <Accounts />
                </PermissionRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <PermissionRoute permission="departments.view">
                  <Departments />
                </PermissionRoute>
              }
            />
            <Route
              path="/plantillaItems"
              element={
                <PermissionRoute permission="plantilla_items.view">
                  <PlantillaItems />
                </PermissionRoute>
              }
            />
            <Route
              path="/COSList"
              element={
                <PermissionRoute permission="positions.view">
                  <CosPage />
                </PermissionRoute>
              }
            />
            <Route
              path="/ConsultantList"
              element={
                <PermissionRoute permission="positions.view">
                  <ConsultantPositionsPage />
                </PermissionRoute>
              }
            />

            {/* ── Rewards & Recognition ── */}
            <Route
              path="/TopDepartment"
              element={
                <PermissionRoute permission="rewards.view">
                  <TopPeformerDepartmentPage />
                </PermissionRoute>
              }
            />
            <Route
              path="/TopHospital"
              element={
                <PermissionRoute permission="rewards.view">
                  <TopPeformerHospitalPage />
                </PermissionRoute>
              }
            />

            {/* ── Task Monitoring ── */}
            <Route
              path="/task-monitoring"
              element={
                <PermissionRoute permission="task_monitoring.view">
                  <TaskMonitoringPage />
                </PermissionRoute>
              }
            />

            {/* ── Bug Reports ── */}
            <Route
              path="/bug-reports"
              element={
                <PermissionRoute permission="bug-reports.view">
                  <BugReportsPage />
                </PermissionRoute>
              }
            />

            {/* ── Release Manager ── */}
            <Route
              path="/release-manager"
              element={
                <PermissionRoute permission="accounts.manage">
                  <ReleaseManagerPage />
                </PermissionRoute>
              }
            />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/renewals" element={<RenewalsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;
