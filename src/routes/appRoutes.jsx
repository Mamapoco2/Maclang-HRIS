import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "../layout/layout";
import Dashboard from "../pages/dashboard/dashboard";
import EmployeePage from "../pages/employees/components/employeePage";
import AnnouncementPage from "../pages/announcement/announcement";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/announcement" element={<AnnouncementPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
