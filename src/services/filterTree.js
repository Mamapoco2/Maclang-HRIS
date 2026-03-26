export const filterTreeByDepartment = (nodes, department) => {
  if (!Array.isArray(nodes)) return [];

  if (department === "All") return nodes;

  const filterNode = (node) => {
    if (node.data?.department === department) {
      return node;
    }

    if (node.children?.length) {
      const filteredChildren = node.children.map(filterNode).filter(Boolean);

      if (filteredChildren.length > 0) {
        return {
          ...node,
          expanded: true,
          children: filteredChildren,
        };
      }
    }

    return null;
  };

  return nodes.map(filterNode).filter(Boolean);
};
