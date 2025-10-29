import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "../layout/layout";

import Dashboard from "../pages/dashboard/dashboard";
import EmployeePage from "../pages/employees/components/employeePage";
import Login from "../pages/login/components/loginPage";

import Inbox from "../pages/announcement/inbox/inbox";
import Forward from "../pages/announcement/Forward/forward";
import Sent from "../pages/announcement/sent/sent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/forward" element={<Forward />} />
          <Route path="/sent" element={<Sent />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
