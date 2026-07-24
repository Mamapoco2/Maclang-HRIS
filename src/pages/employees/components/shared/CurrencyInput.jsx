import { useRef } from "react";

export function CurrencyInput({
  value,
  onChange,
  readOnly = false,
  className = "field-input",
}) {
  const inputRef = useRef(null);

  const formatDisplay = (raw) => {
    if (raw === "" || raw === null || raw === undefined) return "";
    const parts = String(raw).split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
  };

  const handleChange = (e) => {
    const input = e.target;
    const prevValue = input.value;
    const cursorPos = input.selectionStart;

    const digitsBeforeCursor = prevValue
      .slice(0, cursorPos)
      .replace(/[^0-9]/g, "").length;

    let raw = prevValue.replace(/[^0-9.]/g, "");
    const firstDot = raw.indexOf(".");
    if (firstDot !== -1) {
      raw =
        raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, "");
    }

    onChange(raw);

    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      const newFormatted = formatDisplay(raw);
      let count = 0;
      let pos = newFormatted.length;
      for (let i = 0; i < newFormatted.length; i++) {
        if (/[0-9]/.test(newFormatted[i])) count++;
        if (count === digitsBeforeCursor) {
          pos = i + 1;
          break;
        }
      }
      inputRef.current.setSelectionRange(pos, pos);
    });
  };

  const handleBlur = () => {
    if (value === "" || value === null || value === undefined) return;
    const num = Number(value);
    if (!isNaN(num)) {
      onChange(num.toFixed(2));
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={formatDisplay(value)}
      onChange={handleChange}
      onBlur={handleBlur}
      readOnly={readOnly}
      className={className}
    />
  );
}
