import { useEffect, useState } from "react";
import api from "@/api/api";

export function useAuthenticatedImage(url) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setBlobUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    let objectUrl = null;

    setLoading(true);
    setError(null);

    api
      .get(url, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setBlobUrl(objectUrl);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setBlobUrl(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return { url: blobUrl, loading, error };
}
