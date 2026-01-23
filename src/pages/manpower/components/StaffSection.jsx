import StaffCard from "./StaffCard";
import { groupStaffByLabel } from "../../../services/utils";

const StaffSection = ({ staff, darkMode = false }) => {
  const groupedStaff = groupStaffByLabel(staff);

  return (
    <div
      className="mt-4 w-full max-h-[350px] overflow-y-auto px-2"
      style={{ scrollbarGutter: "stable" }}
    >
      {Object.entries(groupedStaff).map(([motherUnit, members]) => (
        <div key={motherUnit} className="mb-6">
          {/* Group Label */}
          <div
            className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm w-max mb-3 ${
              darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {motherUnit}
          </div>

          {/* Cards Container */}
          <div className="flex flex-wrap gap-4 justify-center">
            {members.map((member, idx) => (
              <StaffCard key={idx} {...member} darkMode={darkMode} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StaffSection;
