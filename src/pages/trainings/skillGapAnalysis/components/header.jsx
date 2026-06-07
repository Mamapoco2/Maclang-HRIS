import { useEffect, useState } from "react";
import { Activity, Building2 } from "lucide-react";
import authService from "@/services/authService";

function Header() {
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await authService.me();

        if (userRes && userRes.success && userRes.user) {
          const user = userRes.user;

          let fullName = "";
          if (user.first_name && user.last_name) {
            fullName = `${user.first_name} ${user.last_name}`;
          } else if (user.name) {
            fullName = user.name;
          }
          setEmployeeName(fullName);
          localStorage.setItem("employeeName", fullName);

          if (user.departments && user.departments.length > 0) {
            const dept = user.departments[0];
            setDepartment(dept.name);
            localStorage.setItem("department", dept.name);
          }
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEmployeeNameChange = (e) => {
    const name = e.target.value;
    setEmployeeName(name);
    localStorage.setItem("employeeName", name);
  };

  return (
    <header className="bg-gradient-to-r from-sky-800 to-teal-700 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-2 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-sky-200 text-sm font-medium tracking-widest uppercase">
            Rosario Maclang Bautista General Hospital
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
          Skill Gap Analysis Tool
        </h1>
        <p className="text-sky-100 text-base mb-8">
          HR & Learning Development — Employee Self-Assessment & Development
          Planning
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sky-200 text-xs uppercase tracking-wider mb-1.5">
              Employee Name
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={handleEmployeeNameChange}
              placeholder="Enter your full name"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-1.5 text-white placeholder-sky-300 focus:outline-none focus:border-white/50 transition"
            />
          </div>

          <div>
            <label className="block text-sky-200 text-xs uppercase tracking-wider mb-1.5">
              Department
            </label>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-1.5 min-h-[38px]">
              <Building2 className="w-4 h-4 shrink-0 text-sky-200" />
              <span className="text-white">
                {loading
                  ? "Loading..."
                  : department || "No department assigned"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
