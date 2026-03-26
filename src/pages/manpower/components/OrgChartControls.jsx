import { useState, useMemo } from "react";
import { OrganizationChart } from "primereact/organizationchart";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import NodeTemplate from "./NodeTemplate";
import OrgChartControls from "./OrgChartControls";

/* Safe Tree Builder */
function buildSafeTree(nodes) {
  if (!Array.isArray(nodes)) return [];

  return nodes.filter(Boolean).map((n, index) => ({
    ...n,
    key: n.key ?? `node-${index}`,
    expanded: true,
    children: buildSafeTree(n.children ?? []),
  }));
}

export default function OrgChart({
  orgData = [],
  department,
  setDepartment,
  departmentList = [],
  reportData,
}) {
  const [scale, setScale] = useState(0.8);

  const safeTree = useMemo(() => buildSafeTree(orgData), [orgData]);

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col overflow-hidden">
      <TransformWrapper
        initialScale={0.8}
        minScale={0.2}
        maxScale={3}
        wheel={{ step: 0.15 }}
        doubleClick={{ disabled: true }}
        limitToBounds={false}
        centerOnInit
        centerZoomedOut
        alignmentAnimation={{ disabled: true }}
        panning={{ velocityDisabled: true }}
        onZoom={({ state }) => setScale(state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls */}
            <OrgChartControls
              department={department}
              setDepartment={setDepartment}
              departmentList={departmentList}
              zoomIn={() => zoomIn(0.3)}
              zoomOut={() => zoomOut(0.3)}
              resetTransform={() => {
                resetTransform();
                setScale(0.8);
              }}
              scale={scale}
              reportData={reportData}
            />

            {/* Chart Canvas */}
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "calc(100vh - 70px)",
                overflow: "hidden",
              }}
            >
              <div className="flex items-center justify-center w-full h-full">
                {safeTree.length > 0 ? (
                  <OrganizationChart
                    value={safeTree}
                    nodeTemplate={NodeTemplate}
                  />
                ) : (
                  <div className="text-center text-gray-400 py-10">
                    No employee hierarchy found.
                  </div>
                )}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
