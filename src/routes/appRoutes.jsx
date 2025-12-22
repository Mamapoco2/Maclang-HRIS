import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "../layout/layout";

// Employee Pages
import Dashboard from "../pages/dashboard/dashboard";
import EmployeePage from "../pages/employees/components/employeePage";
import LeaveDashboard from "../pages/leave/LeaveDashboad";
import Login from "../pages/login/components/loginPage";

// Announcement Pages
import Inbox from "../pages/announcement/inbox/inbox";
import ViewInbox from "../pages/announcement/inbox/viewInbox";
import Sent from "../pages/announcement/sent/sent";
import Forward from "../pages/announcement/Forward/forward";

// Admin Pages (optional placeholders)
// import AdminLeaveDashboard from "../pages/admin/AdminLeaveDashboard"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected / Layout Routes */}
        <Route element={<AppLayout />}>
          {/* Employee Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/leave" element={<LeaveDashboard />} />

          {/* Announcement Pages */}
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/view/:id" element={<ViewInbox />} />
          <Route path="/sent" element={<Sent />} />
          <Route path="/forward" element={<Forward />} />

          {/* Admin Pages */}
          {/* <Route path="/admin/leave" element={<AdminLeaveDashboard />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
