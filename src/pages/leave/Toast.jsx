import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "./utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext({ toast: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 4000 }) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        duration,
      );
    },
    [],
  );

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    default: <Info className="w-4 h-4 text-[var(--primary)]" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-600" />,
    destructive: <AlertCircle className="w-4 h-4 text-red-600" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg p-4 flex items-start gap-3 animate-fade-in",
              t.variant === "destructive" &&
                "border-red-200 dark:border-red-900/50",
              t.variant === "success" &&
                "border-emerald-200 dark:border-emerald-900/50",
            )}
          >
            <div className="mt-0.5">{icons[t.variant] || icons.default}</div>
            <div className="flex-1 min-w-0">
              {t.title && (
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {t.title}
                </p>
              )}
              {t.description && (
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
