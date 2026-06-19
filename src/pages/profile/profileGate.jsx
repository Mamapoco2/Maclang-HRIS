// src/pages/profile/ProfileGate.jsx
import { useState } from "react";
import { useProfileStatus } from "@/hooks/useProfileStatus";
import { ProfileCompletionModal } from "./components/profileCompletionModal";
import { SplashScreen } from "./components/splashScreen";

export function ProfileGate({ children }) {
  const { isComplete, missingFields, isLoading, error, refetch } =
    useProfileStatus();

  // Splash only shows on initial load — never again on refetch
  const [splashDismissed, setSplashDismissed] = useState(false);
  // Once profile is confirmed complete, lock it so refetch flicker can't re-show modal
  const [forceComplete, setForceComplete] = useState(false);

  const showSplash = !splashDismissed && isLoading;

  const handleSplashDone = () => {
    if (!isLoading) setSplashDismissed(true);
  };

  const handleCompleted = async () => {
    setForceComplete(true); // immediately hide modal
    await refetch(); // sync latest status in background
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}

      {!showSplash && (
        <>
          {children}

          {!error && !forceComplete && isComplete === false && (
            <ProfileCompletionModal
              isOpen={true}
              missingFields={missingFields}
              onCompleted={handleCompleted}
            />
          )}
        </>
      )}
    </>
  );
}
