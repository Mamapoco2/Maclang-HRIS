// services/countEmployees.js

export function countEmployees(nodes) {
  const totals = {
    total: 0,
    plantilla: 0,
    cos: 0,
    consultant: 0,
    vacant: 0,
  };

  function traverse(nodeList) {
    nodeList.forEach((node) => {
      const staff = node.data?.staff || [];

      if (node.data?.employmentType) {
        totals.total++;
        const type = (node.data.employmentType || "").toLowerCase();
        if (type.includes("plantilla")) totals.plantilla++;
        else if (type.includes("cos") || type.includes("contract")) totals.cos++;
        else if (type.includes("consultant")) totals.consultant++;
        else totals.vacant++;
      } else {
        totals.vacant++;
      }

      // Count staff inside the node modal
      staff.forEach((s) => {
        totals.total++;
        const type = (s.employmentType || "").toLowerCase();
        if (type.includes("plantilla")) totals.plantilla++;
        else if (type.includes("cos") || type.includes("contract")) totals.cos++;
        else if (type.includes("consultant")) totals.consultant++;
        else totals.vacant++;
      });

      if (node.children) traverse(node.children);
    });
  }

  traverse(nodes);
  return totals;
}
