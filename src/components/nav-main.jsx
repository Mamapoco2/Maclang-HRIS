import { Link, useLocation } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { usePendingUsersCount } from "@/hooks/usePendingUsersCount";

// ─── Helper: does any descendant URL match the current path? ──────────────────

function hasActiveDescendant(node, pathname) {
  if (node.url) return pathname.startsWith(node.url);
  return (node.items ?? []).some((child) =>
    hasActiveDescendant(child, pathname),
  );
}

// ─── Recursive node — handles any depth ──────────────────────────────────────

function NavNode({ node, depth, pendingUserCount }) {
  const { pathname } = useLocation();

  const notificationCount =
    node.url === "/accounts" ? pendingUserCount : (node.notificationCount ?? 0);

  const isActive = node.url ? pathname.startsWith(node.url) : false;
  const defaultOpen = hasActiveDescendant(node, pathname);

  // ── Leaf ──
  if (!node.items) {
    if (depth === 0) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isActive} tooltip={node.title}>
            <Link to={node.url} className="relative flex items-center gap-2">
              {node.icon && <node.icon />}
              <span>{node.title}</span>
              {notificationCount > 0 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-5 text-center">
                  {notificationCount}
                </span>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={isActive}>
          <Link
            to={node.url}
            className="py-2 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {node.title}
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  // ── Branch at depth 0 (top-level collapsible with icon) ──
  if (depth === 0) {
    return (
      <SidebarMenuItem>
        <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={node.title}>
              {node.icon && <node.icon />}
              <span>{node.title}</span>
              <IconChevronRight
                size={16}
                stroke={1.5}
                className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1">
            <SidebarMenuSub>
              {node.items.map((child) => (
                <NavNode
                  key={child.url ?? child.title}
                  node={child}
                  depth={depth + 1}
                  pendingUserCount={pendingUserCount}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  }

  // ── Branch at depth > 0 (nested collapsible, no icon) ──
  return (
    <SidebarMenuSubItem>
      <Collapsible
        defaultOpen={defaultOpen}
        className="group/collapsible w-full"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton className="w-full justify-between px-2 py-2">
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {node.title}
            </span>
            <IconChevronRight
              size={14}
              stroke={1.5}
              className="ml-2 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 flex-shrink-0"
            />
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <SidebarMenuSub className="ml-2 border-l border-gray-200 dark:border-gray-700 pl-2 space-y-1">
            {node.items.map((child) => (
              <NavNode
                key={child.url ?? child.title}
                node={child}
                depth={depth + 1}
                pendingUserCount={pendingUserCount}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuSubItem>
  );
}

// ─── NavMain ──────────────────────────────────────────────────────────────────

export function NavMain({ items }) {
  const pendingUserCount = usePendingUsersCount();

  return (
    <SidebarGroup className="w-full">
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <NavNode
              key={item.url ?? item.title}
              node={item}
              depth={0}
              pendingUserCount={pendingUserCount}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
