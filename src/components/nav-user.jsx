import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authService } from "@/services/authService";
import LogoutConfirmDialog from "@/components/logoutConfirmModal";
import ProfileModal from "@/components/profile-Modal"; // Ensure ProfileModal is correctly imported
import SettingsProfile1 from "@/components/profile-modal"; // Correct default import for SettingsProfile1

export function NavUser({ user: propUser }) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const [user, setUser] = useState(propUser);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false); // Modal state

  useEffect(() => {
    if (!propUser) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } else {
      setUser(propUser);
    }
  }, [propUser]);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);

    const result = await authService.logout();

    setLoggingOut(false);
    setLogoutOpen(false);

    if (result.success) {
      navigate("/");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {/* Ensure user is defined before trying to access its properties */}
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage
                    src={user?.avatar || "default-avatar.png"} // Use fallback image or default avatar
                    alt={user?.name || "User"} // Use fallback name
                  />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user?.name)}{" "}
                    {/* Display initials only if name exists */}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.name || "Unknown User"}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email || "No email"}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.avatar || "default-avatar.png"} // Use fallback image or default avatar
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user?.name || "Unknown User"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user?.email || "No email"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
                  <IconUserCircle className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setLogoutOpen(true)}>
                <IconLogout className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <LogoutConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
        loading={loggingOut}
      />

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          open={isProfileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        >
          <SettingsProfile1
            defaultValues={{
              name: user?.name,
              email: user?.email,
              username: user?.username,
              avatar: user?.avatar,
              bio: user?.bio,
            }}
            onSave={(data) => {
              setUser({ ...user, ...data });
              setProfileModalOpen(false);
            }}
          />
        </ProfileModal>
      )}
    </>
  );
}
