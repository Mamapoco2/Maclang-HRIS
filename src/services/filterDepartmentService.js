export function filterTreeByDepartment(nodes, department) {
  // Show all if "All"
  if (department === "All") return nodes;

  function filterNode(node) {
    // If this node belongs to the department,
    // return the entire subtree untouched
    if (node.data?.department === department) {
      return node;
    }

    // Otherwise, check children
    if (node.children) {
      const filteredChildren = node.children
        .map(filterNode)
        .filter(Boolean);

      if (filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
    }

    return null;
  }

  return nodes.map(filterNode).filter(Boolean);
}
