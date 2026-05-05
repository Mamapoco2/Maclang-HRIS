import { Badge } from "@/components/ui/badge";

export function RatingBadge({ status }) {
  const getVariant = (status) => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "Submitted":
        return "default";
      case "Rated":
        return "outline";
      case "Approved":
        return "default";
      default:
        return "secondary";
    }
  };

  return <Badge variant={getVariant(status)}>{status}</Badge>;
}
