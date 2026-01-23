import { useState } from "react";
import StaffSection from "./StaffSection";
import { resolveBorderColor } from "../../../services/utils";
import { FaPlus, FaMinus } from "react-icons/fa";
import NodeModal from "./NodeModal";

const NodeTemplate = (node) => {
  const [open, setOpen] = useState(false);
  const [showStaff, setShowStaff] = useState(false);

  const staff = node.data?.staff || [];
  const borderColor = resolveBorderColor(node.data);

  return (
    <>
      <style jsx global>{`
        .p-organizationchart .p-organizationchart-line-down {
          background-color: #000000 !important;
        }
        .p-organizationchart .p-organizationchart-line-left {
          border-right: 2px solid #000000 !important;
        }
        .p-organizationchart .p-organizationchart-line-right {
          border-left: 2px solid #000000 !important;
        }
        .p-organizationchart .p-organizationchart-line-top {
          border-top: 2px solid #000000 !important;
        }
      `}</style>

      <div className="flex flex-col items-center relative">
        <div
          onClick={() => setOpen(true)}
          className="
    relative rounded-xl cursor-pointer
    flex flex-row items-center gap-6 p-6
    bg-card text-card-foreground
    border border-border
    hover:shadow-lg transition
  "
          style={{
            borderColor,
            width: "650px", // FIXED width
            height: "200px", // FIXED height (adjust as needed)
          }}
        >
          {/* Avatar */}
          {node.data?.image && (
            <img
              src={node.data.image}
              alt={node.data?.name}
              className="w-24 h-24 rounded-full object-cover flex-shrink-0"
            />
          )}

          {/* Text */}
          <div className="flex flex-col flex-1">
            {node.data?.motherUnit && (
              <div
                className="text-base font-semibold uppercase tracking-wide mb-2"
                style={{ color: borderColor }}
              >
                {node.data.label}
              </div>
            )}

            <div className="font-extrabold text-xl break-words">
              {node.data?.name}
            </div>

            {/* Role (bolded) */}
            {node.data?.role && (
              <div className="text-lg font-semibold text-muted-foreground mt-1">
                {node.data.role}
              </div>
            )}

            {/* Employee ID */}
            {node.data?.employeeId && (
              <div className="text-lg text-muted-foreground mt-1">
                {node.data.employeeId}
              </div>
            )}
          </div>

          {/* STAFF TOGGLE */}
          {staff.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStaff(!showStaff);
              }}
              className="
                absolute top-1/2 -right-4 -translate-y-1/2
                w-6 h-6 rounded-full
                flex items-center justify-center
                bg-background border border-border
                hover:bg-accent transition
              "
            >
              {showStaff ? (
                <FaMinus className="text-[14px]" />
              ) : (
                <FaPlus className="text-[14px]" />
              )}
            </button>
          )}
        </div>

        {/* STAFF SECTION */}
        {showStaff && staff.length > 0 && (
          <div className="mt-5 w-full flex justify-center">
            <StaffSection staff={staff} />
          </div>
        )}
      </div>

      {/* MODAL */}
      <NodeModal open={open} onClose={() => setOpen(false)} node={node} />
    </>
  );
};

export default NodeTemplate;
