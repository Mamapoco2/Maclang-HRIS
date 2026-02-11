import { useState, useMemo, useRef } from "react";
import { OrganizationChart } from "primereact/organizationchart";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import NodeTemplate from "./NodeTemplate";
import OrgChartSummary from "./OrgChartSummary";
import OrgChartControls from "./OrgChartControls";
import { orgChartData } from "../../../lib/orgchartData";
import { filterTreeByDepartment } from "../../../services/filterTree";
import { countEmployees } from "../../../services/countEmployees";

function extractDepartments(nodes, acc = new Set()) {
  nodes.forEach((node) => {
    if (node.data?.department) acc.add(node.data.department);
    if (node.children) extractDepartments(node.children, acc);
  });
  return acc;
}

export default function OrgChart({ darkMode, setDarkMode }) {
  const [department, setDepartment] = useState("All");
  const [scale, setScale] = useState(1);
  const transformRef = useRef(null);

  const filteredData = useMemo(
    () => filterTreeByDepartment(orgChartData, department),
    [department],
  );

  // Calculate totals for the filtered data
  const totals = useMemo(() => countEmployees(filteredData), [filteredData]);

  const departmentList = useMemo(
    () => Array.from(extractDepartments(orgChartData)),
    [],
  );

  // Total staff count
  const staffCount = useMemo(() => orgChartData.length, []);

  return (
    <div
      className={`w-full h-full flex flex-col ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Legend / Summary */}
      <OrgChartSummary totals={totals} staffCount={staffCount} />

      <TransformWrapper
        ref={transformRef}
        initialScale={0.4}
        minScale={0.2}
        maxScale={1.5}
        wheel={{ step: 0.05 }}
        doubleClick={{ disabled: true }}
        onTransformed={({ state }) => setScale(state.scale)}
        centerOnInit={true}
        limitToBounds={false}
        initialPositionX={100}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => {
          const handleReset = () => {
            resetTransform();
            setTimeout(() => centerView(0.4), 50);
          };

          return (
            <>
              {/* Controls */}
              <OrgChartControls
                department={department}
                setDepartment={setDepartment}
                departmentList={departmentList}
                zoomIn={() => zoomIn(0.1)}
                zoomOut={() => zoomOut(0.1)}
                resetTransform={handleReset}
                scale={scale}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                reportData={filteredData}
              />

              {/* Chart Area */}
              <div className="flex-1 relative overflow-hidden ">
                {/* Background logo */}
                <img
                  src="https://qcwebsite.sparksoft-demo.com/wp-content/uploads/2020/09/rmbgh-logo-sm.png"
                  alt="RMBGH Logo"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ width: "40%", opacity: 0.05, zIndex: 0 }}
                />

                <TransformComponent
                  wrapperClass="w-full h-full overflow-auto"
                  contentClass="w-full h-full flex items-start justify-center pt-8 pl-24"
                  wrapperStyle={{ width: "100%", height: "100%" }}
                >
                  <div className="inline-block px-8 py-4 ml-12 mt-150">
                    <OrganizationChart
                      value={filteredData}
                      nodeTemplate={NodeTemplate}
                    />
                  </div>
                </TransformComponent>
              </div>
            </>
          );
        }}
      </TransformWrapper>
    </div>
  );
}
