import { useCallback, useEffect, useRef, useState } from "react";
import { AccountApi } from "@/services/accountApiService";

const EMPTY_SIGNATURES = { primary: null, countersign: null };

export function useAccountSignatures() {
  const [signatures, setSignatures] = useState(EMPTY_SIGNATURES);
  const [previewUrls, setPreviewUrls] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionState, setActionState] = useState({});

  const objectUrlsRef = useRef({});

  const revokePreview = useCallback((type) => {
    const existing = objectUrlsRef.current[type];
    if (existing) {
      URL.revokeObjectURL(existing);
      delete objectUrlsRef.current[type];
    }
  }, []);

  const loadPreview = useCallback(
    async (type) => {
      try {
        const url = await AccountApi.getSignaturePreviewUrl(type);
        revokePreview(type);
        objectUrlsRef.current[type] = url;
        setPreviewUrls((prev) => ({ ...prev, [type]: url }));
      } catch {
        revokePreview(type);
        setPreviewUrls((prev) => ({ ...prev, [type]: null }));
      }
    },
    [revokePreview],
  );

  const loadAll = useCallback(
    async (ignoreRef) => {
      setLoading(true);
      setError(null);
      try {
        const [sigData, activityData] = await Promise.all([
          AccountApi.getSignatures(),
          AccountApi.getActivityLog(20),
        ]);
        if (ignoreRef?.current) return;

        setSignatures(sigData);
        setActivityLog(activityData);

        await Promise.all(
          ["primary", "countersign"]
            .filter((type) => sigData[type])
            .map((type) => loadPreview(type)),
        );
      } catch (err) {
        if (!ignoreRef?.current) {
          console.error("useAccountSignatures:load", err);
          setError("Unable to load your account data.");
        }
      } finally {
        if (!ignoreRef?.current) setLoading(false);
      }
    },
    [loadPreview],
  );

  useEffect(() => {
    const ignoreRef = { current: false };
    loadAll(ignoreRef);

    return () => {
      ignoreRef.current = true;
      Object.keys(objectUrlsRef.current).forEach(revokePreview);
    };
  }, []);

  const refreshActivity = useCallback(async () => {
    try {
      const data = await AccountApi.getActivityLog(20);
      setActivityLog(data);
    } catch (err) {
      console.error("useAccountSignatures:refreshActivity", err);
    }
  }, []);

  const uploadSignature = useCallback(
    async (type, file) => {
      setActionState((prev) => ({ ...prev, [type]: "uploading" }));
      try {
        const updated = await AccountApi.uploadSignature(type, file);
        setSignatures((prev) => ({ ...prev, [type]: updated }));
        await loadPreview(type);
        await refreshActivity();
        return updated;
      } finally {
        setActionState((prev) => ({ ...prev, [type]: null }));
      }
    },
    [loadPreview, refreshActivity],
  );

  const deleteSignature = useCallback(
    async (type) => {
      setActionState((prev) => ({ ...prev, [type]: "deleting" }));
      try {
        await AccountApi.deleteSignature(type);
        setSignatures((prev) => ({ ...prev, [type]: null }));
        revokePreview(type);
        setPreviewUrls((prev) => ({ ...prev, [type]: null }));
        await refreshActivity();
      } finally {
        setActionState((prev) => ({ ...prev, [type]: null }));
      }
    },
    [revokePreview, refreshActivity],
  );

  return {
    signatures,
    previewUrls,
    activityLog,
    loading,
    error,
    actionState,
    uploadSignature,
    deleteSignature,
  };
}
