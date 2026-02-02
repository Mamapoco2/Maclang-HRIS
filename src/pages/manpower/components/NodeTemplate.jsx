import { useState } from "react";
import { resolveBorderColor } from "../../../services/utils";
import { buildFullName } from "./useFormat";
import NodeModal from "./NodeModal";

const NodeTemplate = (node) => {
  const [open, setOpen] = useState(false);
  const borderColor = resolveBorderColor(node.data);
  const fullName = buildFullName(node.data) || "Vacant";

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="relative rounded-xl cursor-pointer flex items-center gap-6 p-6 bg-card border hover:shadow-lg transition"
        style={{
          borderColor,
          width: "550px", // mas compact
          minHeight: "150px",
        }}
      >
        {/* Profile Image */}
        {node.data?.image && (
          <img
            src={node.data.image}
            alt={fullName}
            className="w-20 h-20 rounded-full object-cover"
          />
        )}

        {/* Text Info */}
        <div className="flex flex-col flex-1 items-center">
          {/* Deployment Badge - laging visible */}
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-0.5 rounded-full w-max select-none mb-1">
            {node.data?.deployment || "No Deployment"}
          </div>

          {/* Name */}
          <div className="font-extrabold text-lg leading-tight text-center">
            {fullName}
          </div>

          {/* Employment Type */}
          {node.data?.employmentType && (
            <div className="text-sm text-muted-foreground mt-1 text-center">
              {node.data.employmentType}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <NodeModal open={open} onClose={() => setOpen(false)} node={node} />
    </>
  );
};

export default NodeTemplate;
