import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "../layout/layout";

import Dashboard from "../pages/dashboard/dashboard";
import EmployeePage from "../pages/employees/components/employeePage";
import Login from "../login";
import Inbox from "../pages/announcement/inbox";
import Sentbox from "../pages/announcement/sentbox";





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeePage />} /> 
          <Route path="/inbox" element={<Inbox />} /> 
          <Route path="/sentbox" element={<Sentbox />} />     
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
