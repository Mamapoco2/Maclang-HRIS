import { ProfileInformationCard } from "./components/ProfileInformationCard";
import { SignatureUploadCard } from "./components/SignatureUploadCard";
import { AccountActionsCard } from "./components/AccountActionsCard";
import { useAccountUser } from "@/hooks/useAccountUser";
import { useAccountSignatures } from "@/hooks/useAccountSignatures";
import { AccountApi } from "@/services/accountApiService";
import { PenLine, Loader2, AlertTriangle } from "lucide-react";

export default function AccountPage() {
  const accountUser = useAccountUser();
  const {
    signatures,
    previewUrls,
    activityLog,
    loading: signaturesLoading,
    error: signaturesError,
    actionState,
    uploadSignature,
    deleteSignature,
  } = useAccountSignatures();

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
          user={accountUser}
          onSave={({ contactNumber }) =>
            AccountApi.updateProfile({ contactNumber })
          }
        />

        <section aria-labelledby="esignature-heading">
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="w-5 h-5 text-primary" />
            <h2 id="esignature-heading" className="text-lg font-semibold">
              E-Signature Management
            </h2>
          </div>

          {signaturesLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading your signatures…
            </div>
          ) : signaturesError ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4" />
              {signaturesError}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SignatureUploadCard
                title="Primary E-Signature"
                description="Your main signature used on official documents and forms."
                label="Primary Signature"
                signature={signatures.primary}
                previewUrl={previewUrls.primary}
                busy={actionState.primary}
                onUpload={(file) => uploadSignature("primary", file)}
                onDelete={() => deleteSignature("primary")}
              />
              <SignatureUploadCard
                title="Countersign E-Signature"
                description="Secondary signature for countersigning or delegated approvals."
                label="Countersign Signature"
                signature={signatures.countersign}
                previewUrl={previewUrls.countersign}
                busy={actionState.countersign}
                onUpload={(file) => uploadSignature("countersign", file)}
                onDelete={() => deleteSignature("countersign")}
              />
            </div>
          )}
        </section>

        <AccountActionsCard auditLog={activityLog} />
      </div>
    </div>
  );
}
