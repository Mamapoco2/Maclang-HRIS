import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import Leave from "../pages/leave/components/leavePage";
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
import Updates from "../pages/updates/update";
import Settings from "../pages/settings/settingsPage";
import { ProfileGate } from "../pages/profile/profileGate";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

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
            <Route
              path="/dashboard"
              element={
                <PermissionRoute permission="dashboard.view">
                  <Dashboard />
                </PermissionRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <PermissionRoute permission="employees.view">
                  <Employee />
                </PermissionRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PermissionRoute permission="analytics.view">
                  <Analytics />
                </PermissionRoute>
              }
            />
            <Route
              path="/trainings"
              element={
                <PermissionRoute permission="trainings.view">
                  <Trainings />
                </PermissionRoute>
              }
            />
            <Route path="/skillGapAnalysis" element={<SkillAnalysis />} />
            <Route
              path="/accounts"
              element={
                <PermissionRoute permission="accounts.view">
                  <Accounts />
                </PermissionRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <PermissionRoute permission="hiring.view">
                  <Applications />
                </PermissionRoute>
              }
            />
            <Route
              path="/applicants"
              element={
                <PermissionRoute permission="hiring.view">
                  <Applicants />
                </PermissionRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <PermissionRoute permission="hiring.view">
                  <OnboardingPage />
                </PermissionRoute>
              }
            />
            <Route
              path="/leave"
              element={
                <PermissionRoute permission="leave.view">
                  <Leave />
                </PermissionRoute>
              }
            />
            <Route
              path="/team"
              element={
                <PermissionRoute permission="team.view">
                  <Team />
                </PermissionRoute>
              }
            />
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
            <Route
              path="/manpower"
              element={
                <PermissionRoute permission="manpower.view">
                  <ManPower />
                </PermissionRoute>
              }
            />
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
            <Route path="/updates" element={<Updates />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;
