import {
  IconCircleCheck,
  IconInfoCircle,
  IconLoader2,
  IconAlertTriangle,
  IconCircleX,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <IconCircleCheck size={16} stroke={1.5} />,
        info: <IconInfoCircle size={16} stroke={1.5} />,
        warning: <IconAlertTriangle size={16} stroke={1.5} />,
        error: <IconCircleX size={16} stroke={1.5} />,
        loading: (
          <IconLoader2 size={16} stroke={1.5} className="animate-spin" />
        ),
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
      }}
      {...props}
    />
  );
};

export { Toaster };
