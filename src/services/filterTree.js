// src/components/org-chart/filterTree.js
export const filterTreeByDepartment = (nodes, department) => {
  if (!Array.isArray(nodes)) return [];

  if (department === "All") {
    return nodes;
  }

  return nodes.reduce((acc, node) => {
    const filteredChildren = filterTreeByDepartment(
      node.children || [],
      department
    );

    const matches = node.data?.label === department;

    if (matches || filteredChildren.length > 0) {
      acc.push({
        ...node,
        expanded: true,
        children: filteredChildren
      });
    }

    return acc;
  }, []);
};
