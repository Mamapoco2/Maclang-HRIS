import { Link } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";

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

import { getPendingUserCount } from "@/services/accountsService";

export function NavMain({ items }) {
  const [pendingUserCount, setPendingUserCount] = useState(0);

  useEffect(() => {
    getPendingUserCount()
      .then(setPendingUserCount)
      .catch(() => setPendingUserCount(0));
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const notificationCount =
              item.url === "/accounts"
                ? pendingUserCount
                : item.notificationCount;

            return (
              <SidebarMenuItem key={item.title}>
                {item.items ? (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>

                        <IconChevronRight
                          size={16}
                          stroke={1.5}
                          className="ml-auto transition-transform duration-200
                                     group-data-[state=open]/collapsible:rotate-90"
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link
                      to={item.url}
                      className="relative flex items-center gap-2"
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>

                      {notificationCount > 0 && (
                        <span
                          className="absolute right-0 top-1/2 -translate-y-1/2
                                     bg-red-600 text-white text-xs font-semibold
                                     rounded-full px-2 py-0.5 min-w-5 text-center"
                        >
                          {notificationCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
