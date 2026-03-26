import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  User,
  Building2,
  TrendingUp,
} from "lucide-react";

const formatRole = (role) =>
  (Array.isArray(role) ? role : [role].filter(Boolean))
    .filter(Boolean)
    .join(", ") || null;

const getDeptNames = (employee) => {
  if (Array.isArray(employee.departments) && employee.departments.length > 0) {
    return employee.departments.map((d) => d.name).filter(Boolean);
  }
  if (employee.department?.name) return [employee.department.name];
  return [];
};

const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:8000"}/storage/${url}`;
};

const getStatusFromInfo = (employee, info) => {
  const manual = employee.employment_status?.toUpperCase();

  if (manual === "RESIGN") return "Resign";
  if (manual === "INACTIVE") return "Inactive";
  if (manual === "ACTIVE") return "Active";

  if (!info?.status || info.status === "EMPTY") return "Inactive";
  return "Active";
};

export default function EmployeeViewDialog({ open, onClose, employee }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!employee) return null;

  const info = employee.info || {};
  const assignment =
    employee.primaryAssignment || employee.primary_assignment || {};
  const plantillaItem =
    assignment.plantilla_item || assignment.plantillaItem || {};
  const salaryGrade =
    plantillaItem.salary_grade || plantillaItem.salaryGrade || {};
  const stepIncrement =
    assignment.step_increment || assignment.stepIncrement || {};
  const deptNames = getDeptNames(employee);
  const avatarSrc = getAvatarUrl(employee.avatar_url);
  const email = employee.user?.email ?? info.email ?? null;
  const status = getStatusFromInfo(employee, info);

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b last:border-none">
      <Icon className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900 mt-1 uppercase break-words break-all">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  const statusStyles = {
    Active: "border-green-500 text-green-600",
    Inactive: "border-gray-400 text-gray-500",
    Resign: "border-red-500 text-red-600",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl p-6 uppercase">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-semibold text-gray-800 normal-case">
              Employee Profile
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div
              className="cursor-pointer transition hover:scale-105"
              onClick={() => avatarSrc && setPreviewOpen(true)}
            >
              <Avatar className="h-20 w-20 ring-2 ring-white shadow-md">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-bold">
                  {employee.first_name?.[0]}
                  {employee.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                {employee.employee_number || ""}
              </p>
              <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                {employee.full_name ||
                  `${employee.first_name} ${employee.last_name}`}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {formatRole(employee.role_position) ||
                  employee.position_designation ||
                  "No position assigned"}
              </p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={statusStyles[status] || statusStyles.Inactive}
                >
                  {status}
                </Badge>
                {employee.employment_type && (
                  <Badge
                    variant="outline"
                    className="border-blue-300 text-blue-600"
                  >
                    {employee.employment_type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Personal Information
              </p>
              <InfoItem icon={Mail} label="Email" value={email} />
              <InfoItem icon={Phone} label="Contact" value={info.contact} />
              <InfoItem icon={MapPin} label="Address" value={info.address} />
              <InfoItem icon={User} label="Gender" value={info.gender} />
              <InfoItem
                icon={Calendar}
                label="Birthdate"
                value={
                  info.birthdate
                    ? new Date(info.birthdate).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : null
                }
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Employment Information
              </p>
              <InfoItem
                icon={Building2}
                label="Division"
                value={employee.division?.name}
              />
              <InfoItem
                icon={Users}
                label="Department"
                value={deptNames.length > 0 ? deptNames.join(", ") : null}
              />
              <InfoItem
                icon={Briefcase}
                label="Position Title (Plantilla)"
                value={plantillaItem.title}
              />
              <InfoItem
                icon={TrendingUp}
                label="Salary Grade"
                value={
                  salaryGrade.salary_grade
                    ? `SG-${salaryGrade.salary_grade}`
                    : null
                }
              />
              <InfoItem
                icon={TrendingUp}
                label="Step"
                value={stepIncrement.step ? `Step ${stepIncrement.step}` : null}
              />
              <InfoItem
                icon={DollarSign}
                label="Monthly Salary"
                value={
                  salaryGrade.monthly_salary
                    ? `₱${Number(salaryGrade.monthly_salary).toLocaleString(
                        "en-PH",
                        {
                          minimumFractionDigits: 2,
                        },
                      )}`
                    : null
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-xl p-2 border-none">
          <div className="flex justify-center items-center">
            <img
              src={avatarSrc}
              alt="Employee"
              className="max-h-[80vh] rounded-lg shadow-2xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
