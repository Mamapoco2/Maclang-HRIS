// src/layout/roleBasedLayout.jsx
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { ChatbotProvider } from "@/components/chatbot-context";
import MainLayout from "./layout";
import UserLayout from "./userLayout";

const ADMIN_SHELL_ROLES = ["superadmin", "hr"];

export default function RoleBasedLayout() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  const userRoles = (user?.roles ?? []).map((r) => String(r).toLowerCase());
  const isAdminShell = userRoles.some((r) => ADMIN_SHELL_ROLES.includes(r));

  return (
    <ChatbotProvider>
      {isAdminShell ? <MainLayout /> : <UserLayout />}
    </ChatbotProvider>
  );
}
