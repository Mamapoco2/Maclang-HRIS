import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { lookupDtrEmployee } from "@/services/attendanceService";
import { useDebounce } from "@/hooks/useDebounce";

const normalize = (value) => value.trim().toUpperCase();

export default function EmployeePicker({
  id,
  value,
  onChange,
  invalid = false,
  disabled = false,
}) {
  const [number, setNumber] = useState(value?.employee_number ?? "");
  const [status, setStatus] = useState("idle");
  const debouncedNumber = useDebounce(normalize(number), 400);

  useEffect(() => {
    if (!debouncedNumber) {
      setStatus("idle");
      return undefined;
    }

    if (value && normalize(value.employee_number ?? "") === debouncedNumber) {
      setStatus("found");
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");

    lookupDtrEmployee(debouncedNumber)
      .then((employee) => {
        if (cancelled) return;
        setStatus(employee ? "found" : "notFound");
        onChange(employee);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        onChange(null);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNumber]);

  const handleChange = (e) => {
    const next = e.target.value;
    setNumber(next);
    if (value && normalize(next) !== normalize(value.employee_number ?? "")) {
      onChange(null);
    }
    if (!next.trim()) setStatus("idle");
  };

  return (
    <div className="space-y-3">
      <div>
        <Input
          id={id}
          value={number}
          onChange={handleChange}
          placeholder="Enter employee number"
          autoComplete="off"
          aria-invalid={invalid || status === "notFound"}
          disabled={disabled}
        />
        {status === "loading" && (
          <p className="mt-1 text-xs text-muted-foreground">
            Looking up employee...
          </p>
        )}
        {status === "notFound" && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            No employee found with that employee number.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            Could not look up the employee. Please try again.
          </p>
        )}
      </div>

      <div>
        <label
          className="text-sm font-medium leading-none"
          htmlFor={`${id}-name`}
        >
          Employee name
        </label>
        <Input
          id={`${id}-name`}
          className="mt-1.5 bg-muted/50 uppercase"
          value={value?.name ?? ""}
          placeholder="Name will appear automatically"
          readOnly
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
