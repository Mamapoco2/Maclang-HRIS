// src/pages/profile/components/AddressFields.jsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Field } from "./primitives.jsx";
import PH_CITIES_BY_PROVINCE from "../../../lib/ph-geo.js";
import PH_BARANGAYS_BY_CITY from "../../../lib/ph-barangays.js";

const PH_PROVINCES = Object.keys(PH_CITIES_BY_PROVINCE).sort();

// ─── Cascading Address Block ──────────────────────────────────────────────────
export function AddressFields({ prefix, v, set, fe }) {
  const k = (s) => `${prefix}_${s}`;
  const selectedProvince = v[k("province")] ?? "";
  const selectedCity = v[k("city")] ?? "";
  const cities = selectedProvince
    ? (PH_CITIES_BY_PROVINCE[selectedProvince] ?? [])
    : [];
  const barangays = selectedCity
    ? (PH_BARANGAYS_BY_CITY[selectedCity] ?? [])
    : [];
  const up = (key) => (e) =>
    set(key, (typeof e === "string" ? e : e.target.value).toUpperCase());

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field id={k("province")} label="Province" error={fe?.[k("province")]}>
          <Select
            value={selectedProvince}
            onValueChange={(val) => {
              set(k("province"), val);
              set(k("city"), "");
              set(k("barangay"), "");
            }}
          >
            <SelectTrigger id={k("province")}>
              <SelectValue placeholder="Select Province" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {PH_PROVINCES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          id={k("city")}
          label="City / Municipality"
          error={fe?.[k("city")]}
        >
          <Select
            value={selectedCity}
            onValueChange={(val) => {
              set(k("city"), val);
              set(k("barangay"), "");
            }}
            disabled={!selectedProvince}
          >
            <SelectTrigger id={k("city")}>
              <SelectValue
                placeholder={
                  selectedProvince
                    ? "Select City/Municipality"
                    : "Select province first"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field id={k("barangay")} label="Barangay" error={fe?.[k("barangay")]}>
        {barangays.length > 0 ? (
          <Select
            value={v[k("barangay")] ?? ""}
            onValueChange={(val) => set(k("barangay"), val)}
            disabled={!selectedCity}
          >
            <SelectTrigger id={k("barangay")}>
              <SelectValue placeholder="Select Barangay" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {barangays.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={k("barangay")}
            placeholder={
              selectedCity ? "e.g., BGY. POBLACION" : "Select city first"
            }
            value={v[k("barangay")] ?? ""}
            onChange={up(k("barangay"))}
            className="uppercase"
            disabled={!selectedCity}
          />
        )}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          [k("house_no"), "House/Block/Lot No.", ""],
          [k("street"), "Street", "RIZAL ST."],
          [k("subdivision"), "Subdivision / Village", ""],
          [k("zip"), "ZIP Code", "4106"],
        ].map(([key, label, placeholder]) => (
          <Field key={key} id={key} label={label} error={fe?.[key]}>
            <Input
              id={key}
              placeholder={placeholder}
              value={v[key] ?? ""}
              onChange={up(key)}
              className="uppercase"
            />
          </Field>
        ))}
      </div>
    </div>
  );
}

// ─── Place of Birth ───────────────────────────────────────────────────────────
export function PlaceOfBirthField({ value, onChange, error }) {
  const parts = value ? value.split(", ") : [];
  const [province, setProvince] = useState(
    parts.length >= 2 ? parts.slice(1).join(", ") : "",
  );
  const [city, setCity] = useState(parts.length >= 2 ? parts[0] : "");
  const cities = province ? (PH_CITIES_BY_PROVINCE[province] ?? []) : [];

  return (
    <div className="space-y-2">
      <Select
        value={province}
        onValueChange={(val) => {
          setProvince(val);
          setCity("");
          onChange("");
        }}
      >
        <SelectTrigger className={cn(error && "border-destructive")}>
          <SelectValue placeholder="Province of Birth" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {PH_PROVINCES.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={city}
        onValueChange={(val) => {
          setCity(val);
          onChange(`${val}, ${province}`);
        }}
        disabled={!province}
      >
        <SelectTrigger className={cn(error && "border-destructive")}>
          <SelectValue
            placeholder={
              province ? "City/Municipality of Birth" : "Select province first"
            }
          />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Height Field ─────────────────────────────────────────────────────────────
// The CS Form No. 212 standard expects height in METERS (e.g. "1.65"), but
// people naturally think of their height in centimeters (e.g. "165"). To
// bridge that gap without surprising the user mid-keystroke:
//   1. We show an explicit "in meters" hint + a realistic placeholder up
//      front, so the expected format is clear before they even start typing.
//   2. On blur (not on every keystroke — that would fight the user while
//      they're still typing), if the value looks like a centimeter entry
//      (i.e. >= 10, since no human is >= 10 meters tall), we silently
//      convert it to meters by dividing by 100. "165" -> "1.65",
//      "163.5" -> "1.635". This covers the most common real-world mistake
//      (typing cm out of habit) without requiring the user to do mental
//      math or experience a confusing rejection from backend validation.
//   3. Anything already in a plausible meters range (< 10) passes through
//      unchanged, so "1.65" or "1.5" are never double-converted.
const CM_LOOKS_LIKE_THRESHOLD = 10; // no adult is >= 10 meters tall

export function HeightField({ value, onChange, error }) {
  const handleBlur = () => {
    if (!value) return;
    const num = Number.parseFloat(value);
    if (Number.isNaN(num)) return;
    if (num >= CM_LOOKS_LIKE_THRESHOLD) {
      const converted = num / 100;
      // Trim to a sane number of decimal places (avoids float noise like
      // 1.6300000000000001) while preserving real precision e.g. 1.635.
      const rounded = Math.round(converted * 1000) / 1000;
      onChange(String(rounded));
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="1.65"
          value={value ?? ""}
          onChange={(e) => {
            // Allow only digits and a single decimal point
            const raw = e.target.value.replace(/[^\d.]/g, "");
            onChange(raw);
          }}
          onBlur={handleBlur}
          className={cn("flex-1", error && "border-destructive")}
        />
        <span className="text-sm text-muted-foreground font-medium shrink-0">
          m
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Enter in meters (e.g. 1.65 for 165 cm) — typing cm is fine too, we'll
        convert it automatically.
      </p>
    </div>
  );
}

// ─── Weight Field ─────────────────────────────────────────────────────────────
// Same rationale — type="text" so "85KG" or any extracted value never causes
// a browser validation error. usePdsExtract strips units before setting.
export function WeightField({ value, onChange, error }) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        inputMode="decimal"
        placeholder="65"
        value={value ?? ""}
        onChange={(e) => {
          // Allow only digits and a single decimal point
          const raw = e.target.value.replace(/[^\d.]/g, "");
          onChange(raw);
        }}
        className={cn("flex-1", error && "border-destructive")}
      />
      <span className="text-sm text-muted-foreground font-medium shrink-0">
        kg
      </span>
    </div>
  );
}
