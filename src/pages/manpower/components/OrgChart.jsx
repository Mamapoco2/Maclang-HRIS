import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { OrganizationChart } from "primereact/organizationchart";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  IconCheck,
  IconSelector,
  IconZoomIn,
  IconZoomOut,
  IconRefresh,
  IconBuilding,
  IconSitemap,
} from "@tabler/icons-react";
import { FolderOpen, FolderClosed } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import NodeTemplate from "./NodeTemplate";
import ReportGeneration from "./ReportGeneration";
import api from "../../../api/api";

function buildSafeTree(nodes, expanded = false) {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node, index) => ({
    ...node,
    key: node.key ?? node.data?.employeeId ?? node.id ?? `node-${index}`,
    expanded,
    children: buildSafeTree(node.children ?? [], expanded),
  }));
}

function setAllExpanded(nodes, expanded) {
  return nodes.map((node) => ({
    ...node,
    expanded,
    children: setAllExpanded(node.children ?? [], expanded),
  }));
}

export default function OrgChart() {
  const [orgData, setOrgData] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [chartKey, setChartKey] = useState(0); // ← force remount
  const [division, setDivision] = useState("All");
  const [department, setDepartment] = useState("All");
  const [departmentList, setDepartmentList] = useState([]);
  const [scale, setScale] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [openDept, setOpenDept] = useState(false);

  // Fetch departments
  useEffect(() => {
    api
      .get("/departments")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.data ?? []);
        setDepartmentList(list);
      })
      .catch(() => setDepartmentList([]));
  }, []);

  // Fetch tree
  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const res = await api.get("/manpower/tree", {
          params: { division_id: division, department_id: department },
        });
        const nodes = Array.isArray(res.data?.nodes) ? res.data.nodes : [];
        setOrgData(nodes);
        setTreeData(buildSafeTree(nodes, false));
        setChartKey((k) => k + 1); // remount on new data
      } catch (err) {
        console.error("Tree fetch error:", err);
        setOrgData([]);
        setTreeData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [division, department]);

  const expandAll = useCallback(() => {
    setTreeData((prev) => setAllExpanded(prev, true));
    setChartKey((k) => k + 1); // force PrimeReact to re-read expanded state
  }, []);

  const collapseAll = useCallback(() => {
    setTreeData((prev) => setAllExpanded(prev, false));
    setChartKey((k) => k + 1);
  }, []);

  const selectedDepartment =
    department === "All"
      ? "All Departments"
      : (departmentList.find((d) => d.id === department)?.name ??
        "Select Department");

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden">
      <TransformWrapper
        initialScale={0.8}
        minScale={0.1}
        maxScale={4}
        limitToBounds={false}
        centerOnInit
        centerZoomedOut
        alignmentAnimation={{ disabled: true }}
        wheel={{ step: 0.05 }}
        doubleClick={{ disabled: true }}
        panning={{ velocityDisabled: true }}
        onZoomStop={({ state }) => setScale(state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <div className="flex flex-col h-full">
            {/* ── TOOLBAR ─────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border-b shadow-sm flex-wrap shrink-0">
              <div className="flex items-center gap-2">
                <IconBuilding size={16} className="text-gray-400" />
                <span className="text-xs font-semibold uppercase text-gray-400 tracking-wide">
                  Department
                </span>
                <Popover open={openDept} onOpenChange={setOpenDept}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-between text-sm h-9"
                    >
                      <span className="truncate">{selectedDepartment}</span>
                      <IconSelector className="ml-2 h-4 w-4 opacity-40 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0">
                    <Command>
                      <CommandInput placeholder="Search department..." />
                      <CommandEmpty>No department found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="All"
                          onSelect={() => {
                            setDepartment("All");
                            setOpenDept(false);
                          }}
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 h-4 w-4",
                              department === "All"
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          All Departments
                        </CommandItem>
                        {departmentList.map((dept) => (
                          <CommandItem
                            key={dept.id}
                            value={dept.name}
                            onSelect={() => {
                              setDepartment(dept.id);
                              setOpenDept(false);
                            }}
                          >
                            <IconCheck
                              className={cn(
                                "mr-2 h-4 w-4",
                                department === dept.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {dept.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="w-px h-6 bg-gray-200" />

              <button
                onClick={() => zoomIn()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors"
              >
                <IconZoomIn size={14} /> Zoom In
              </button>
              <button
                onClick={() => zoomOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors"
              >
                <IconZoomOut size={14} /> Zoom Out
              </button>
              <button
                onClick={() => {
                  resetTransform();
                  setScale(0.8);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded-md text-xs font-medium transition-colors"
              >
                <IconRefresh size={14} /> Reset
              </button>

              <div className="w-px h-6 bg-gray-200" />

              <button
                onClick={expandAll}
                disabled={loading || treeData.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-md text-xs font-medium transition-colors"
              >
                <FolderOpen size={14} /> Expand All
              </button>
              <button
                onClick={collapseAll}
                disabled={loading || treeData.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-md text-xs font-medium transition-colors"
              >
                <FolderClosed size={14} /> Collapse All
              </button>

              <div className="w-px h-6 bg-gray-200" />

              <ReportGeneration department={department} division={division} />

              <span className="ml-auto text-xs text-gray-400 font-mono">
                {((Math.round(scale * 100) / 100) * 100).toFixed(0)}%
              </span>
            </div>

            {/* ── CHART CANVAS ─────────────────────────────────── */}
            <TransformComponent
              wrapperClass="flex-1"
              wrapperStyle={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
              contentStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "2.5rem",
                paddingBottom: "5rem",
                paddingLeft: "2.5rem",
                paddingRight: "2.5rem",
              }}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-3 mt-40 text-gray-400">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading hierarchy...</span>
                </div>
              ) : treeData.length > 0 ? (
                <OrganizationChart
                  key={chartKey}
                  value={treeData}
                  nodeTemplate={NodeTemplate}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 mt-40 text-gray-400">
                  <IconSitemap size={40} className="opacity-30" />
                  <span className="text-sm">No employee hierarchy found.</span>
                </div>
              )}
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
}
