import { Input } from "@/components/ui/input";

export function RatingInputGroup({ q, e, t, onQChange, onEChange, onTChange }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Input
        placeholder="Quality"
        type="number"
        value={q}
        onChange={(e) => onQChange(e.target.value)}
      />
      <Input
        placeholder="Efficiency"
        type="number"
        value={e}
        onChange={(e) => onEChange(e.target.value)}
      />
      <Input
        placeholder="Timeliness"
        type="number"
        value={t}
        onChange={(e) => onTChange(e.target.value)}
      />
    </div>
  );
}
