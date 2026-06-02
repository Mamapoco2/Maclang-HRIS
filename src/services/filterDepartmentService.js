export function filterTreeByDepartment(nodes, department) {
  if (!Array.isArray(nodes)) return [];

  if (department === "All") return nodes;

  function filterNode(node) {
    if (!node || typeof node !== "object") return null;

    const children = Array.isArray(node.children)
      ? node.children.map(filterNode).filter(Boolean)
      : [];

    const matches = node?.data?.department === department;

    if (matches || children.length > 0) {
      return {
        ...node,
        expanded: node?.expanded ?? true,
        children,
      };
    }

    return null;
  }

  return nodes.map(filterNode).filter(Boolean);
}
