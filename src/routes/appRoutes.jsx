import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "../layout/layout";

import Dashboard from "../pages/dashboard/dashboard";
import EmployeePage from "../pages/employees/components/employeePage";
import Login from "../pages/login/components/loginPage"
import Inbox from "../pages/announcement/inbox/inbox";
import ViewInbox from "../pages/announcement/inbox/viewInbox";
import Sent from "../pages/announcement/sent/sent";
import Forward from "../pages/announcement/Forward/forward";







function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeePage />} /> 
          <Route path="/inbox" element={<Inbox />} /> 
          <Route path="/view/:id" element={<ViewInbox />} />
          <Route path="/sent" element={<Sent />} />
          <Route path="/forward" element={<Forward />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
