// src/layout/roleBasedLayout.jsx
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { ChatbotProvider } from "@/components/chatbot-context";
import MainLayout from "./layout"; // your existing admin layout
import UserLayout from "./userLayout";

// roles that should see the "admin" shell
const ADMIN_ROLES = ["superadmin", "super-admin", "admin", "hr", "HR"];

export default function RoleBasedLayout() {
  const { hasRole, loading } = useContext(AuthContext);

  // Auth state hasn't resolved yet (e.g. session restore in progress on refresh).
  // Bail out instead of guessing, to avoid a flash of the wrong layout.
  if (loading) {
    return null; // swap for a spinner/skeleton if you have one
  }

  const isAdmin = ADMIN_ROLES.some((role) => hasRole(role));

  // ChatbotProvider wraps BOTH branches so any shared component
  // (e.g. SiteHeader calling useChatbot()) works no matter which
  // layout is chosen.
  return (
    <ChatbotProvider>
      {isAdmin ? <MainLayout /> : <UserLayout />}
    </ChatbotProvider>
  );
}
