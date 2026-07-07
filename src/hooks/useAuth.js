import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null || context === undefined) {
    throw new Error(
      "useAuth must be used within an <AuthProvider>. " +
        "Check that your component tree is wrapped in main.jsx.",
    );
  }

  return context;
}
