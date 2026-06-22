import { useState } from "react";
import { ProfileInformationCard } from "./components/ProfileInformationCard";
import { SignatureUploadCard } from "./components/SignatureUploadCard";
import { AccountActionsCard } from "./components/AccountActionsCard";
import { useAccountUser } from "@/hooks/useAccountUser";
import { PenLine } from "lucide-react";

export default function AccountPage() {
  const accountUser = useAccountUser();
  const [profileData, setProfileData] = useState(null);
  const [primarySignature, setPrimarySignature] = useState(null);
  const [countersignSignature, setCountersignSignature] = useState(null);
  const [auditLog, setAuditLog] = useState([]);

  const user = profileData ? { ...accountUser, ...profileData } : accountUser;

  const addAuditEntry = (entry) => {
    setAuditLog((prev) => [entry, ...prev].slice(0, 20));
  };

  if (!accountUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading account…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-6 md:py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your profile information, electronic signatures, and account
            settings.
          </p>
        </header>

        <ProfileInformationCard
          user={user}
          onSave={(data) => setProfileData((prev) => ({ ...prev, ...data }))}
        />

        <section aria-labelledby="esignature-heading">
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="w-5 h-5 text-primary" />
            <h2 id="esignature-heading" className="text-lg font-semibold">
              E-Signature Management
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SignatureUploadCard
              title="Primary E-Signature"
              description="Your main signature used on official documents and forms."
              label="Primary Signature"
              signature={primarySignature}
              onUpload={setPrimarySignature}
              onDelete={() => setPrimarySignature(null)}
              onAuditLog={addAuditEntry}
            />
            <SignatureUploadCard
              title="Countersign E-Signature"
              description="Secondary signature for countersigning or delegated approvals."
              label="Countersign Signature"
              signature={countersignSignature}
              onUpload={setCountersignSignature}
              onDelete={() => setCountersignSignature(null)}
              onAuditLog={addAuditEntry}
            />
          </div>
        </section>

        <AccountActionsCard auditLog={auditLog} />
      </div>
    </div>
  );
}
