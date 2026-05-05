import { useEffect, useState } from "react";
import { Activity, Building2, Check, ChevronsUpDown } from "lucide-react";
import authService from "@/services/authService";
import { departmentService } from "@/services/departmentServices";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function Header() {
  // ✅ State managed internally
  const [departmentId, setDepartmentId] = useState(null);
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await authService.me();

        if (userRes && userRes.success && userRes.user) {
          const user = userRes.user;

          // Set employee ID
          setEmployeeId(user.id);

          // Set employee name
          let fullName = "";
          if (user.first_name && user.last_name) {
            fullName = `${user.first_name} ${user.last_name}`;
          } else if (user.name) {
            fullName = user.name;
          }
          setEmployeeName(fullName);
          // ✅ Save to localStorage
          localStorage.setItem("employeeName", fullName);

          // Set default department
          if (user.departments && user.departments.length > 0) {
            const dept = user.departments[0];
            setDepartmentId(dept.id);
            setDepartment(dept.name);
            // ✅ Save to localStorage
            localStorage.setItem("department", dept.name);
          }
        }

        // Fetch all departments
        const deptRes = await departmentService.getDepartments();

        const deptList = Array.isArray(deptRes)
          ? deptRes
          : (deptRes?.data ?? []);
        setDepartments(deptList);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedDept = departments.find((d) => d.id === departmentId);

  const handleDepartmentSelect = (deptId) => {
    const selected = departments.find((d) => d.id === deptId);
    if (selected) {
      setDepartmentId(deptId);
      setDepartment(selected.name);
      // ✅ Save to localStorage
      localStorage.setItem("department", selected.name);
      setOpen(false);
    }
  };

  const handleEmployeeNameChange = (e) => {
    const name = e.target.value;
    setEmployeeName(name);
    // ✅ Save to localStorage
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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                  disabled={loading}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {loading
                      ? "Loading departments..."
                      : selectedDept
                        ? selectedDept.name
                        : "Select department…"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search departments..." />
                  <CommandEmpty>No department found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {departments.map((d) => (
                        <CommandItem
                          key={d.id}
                          value={d.id.toString()}
                          onSelect={(currentValue) => {
                            handleDepartmentSelect(parseInt(currentValue));
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              departmentId === d.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {d.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
