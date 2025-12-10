import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "../layout/layout";

import Dashboard from "../pages/dashboard/dashboard";
import Employee from "../pages/employees/components/employeePage";
import Login from "../pages/login/components/loginPage";
import Register from "../pages/register/components/registerAccount";
import Team from "../pages/team/components/teamPage";
import Analytics from "../pages/analytics/components/analyticsPage";
import Trainings from "../pages/trainings/components/trainingPage";
import Applications from "../pages/application/components/applicationsPage";
import Leave from "../pages/leave/components/leavePage";
import Applicants from "../pages/applicants/components/applicantsPage";

import Inbox from "../pages/announcement/inbox/inbox";
import Forward from "../pages/announcement/Forward/forward";
import Sent from "../pages/announcement/sent/sent";

import ProtectedRoute from "./protectedRoutes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employee />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/trainings" element={<Trainings />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applicants" element={<Applicants />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/team" element={<Team />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/forward" element={<Forward />} />
          <Route path="/sent" element={<Sent />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
