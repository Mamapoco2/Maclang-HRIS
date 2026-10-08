import { useEffect, useState } from "react";
import api from "@/api/api";

export default function AuthImage({ attendanceId, type, alt, style }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let url = null;
    let cancelled = false;

    setSrc(null);
    setFailed(false);

    api
      .get(`/dtr/attendances/${attendanceId}/image/${type}`, {
        responseType: "blob",
      })
      .then(({ data }) => {
        if (cancelled) return;
        url = URL.createObjectURL(data);
        setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [attendanceId, type]);

  if (failed) return <span style={{ color: "#94a3b8" }}>Unavailable</span>;
  if (!src) return <span style={{ color: "#94a3b8" }}>…</span>;
  return <img src={src} alt={alt} style={style} />;
}
