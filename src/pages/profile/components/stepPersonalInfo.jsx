// src/pages/profile/components/StepPersonalInfo.jsx
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, Section, Grid2 } from "./primitives";
import { DatePickerField } from "./datePickerField";
import {
  AddressFields,
  PlaceOfBirthField,
  HeightField,
  WeightField,
} from "./addressFields";
import { CITIZENSHIPS } from "../../../constants/constants";

// Only IDs that appear on CS Form No. 212 (Revised 2025)
const GOV_IDS = [
  ["umid_id", "UMID ID No.", "0000-0000000-0"],
  ["pagibig_id", "Pag-IBIG ID No.", "0000-0000-0000"],
  ["philhealth_no", "PhilHealth No.", "00-000000000-0"],
  ["sss_no", "SSS No.", "00-0000000-0"],
  ["philsys_number", "PhilSys Number (PSN)", "0000-0000-0000-0000"],
  ["tin_no", "TIN No.", "000-000-000-000"],
  ["agency_employee_no", "Agency Employee No.", ""],
];

export function StepPersonalInfo({ v, set, fe }) {
  const up = (key) => (e) =>
    set(key, (typeof e === "string" ? e : e.target.value).toUpperCase());
  const raw = (key) => (e) =>
    set(key, typeof e === "string" ? e : e.target.value);

  return (
    <div className="space-y-5">
      <Section title="I. Personal Information">
        <Grid2>
          <Field id="surname" label="Surname" required error={fe?.surname}>
            <Input
              id="surname"
              placeholder="DELA CRUZ"
              value={v.surname ?? ""}
              onChange={up("surname")}
              className="uppercase"
            />
          </Field>
          <Field
            id="first_name"
            label="First Name"
            required
            error={fe?.first_name}
          >
            <Input
              id="first_name"
              placeholder="JUAN"
              value={v.first_name ?? ""}
              onChange={up("first_name")}
              className="uppercase"
            />
          </Field>
          <Field id="middle_name" label="Middle Name" error={fe?.middle_name}>
            <Input
              id="middle_name"
              placeholder="SANTOS"
              value={v.middle_name ?? ""}
              onChange={up("middle_name")}
              className="uppercase"
            />
          </Field>
          <Field
            id="name_extension"
            label="Name Extension (Jr., Sr.)"
            error={fe?.name_extension}
          >
            <Input
              id="name_extension"
              placeholder="JR."
              value={v.name_extension ?? ""}
              onChange={up("name_extension")}
              className="uppercase"
            />
          </Field>
        </Grid2>

        <Grid2>
          <Field
            id="date_of_birth"
            label="Date of Birth"
            required
            error={fe?.date_of_birth}
          >
            <DatePickerField
              id="date_of_birth"
              value={v.date_of_birth ?? ""}
              onChange={(val) => set("date_of_birth", val)}
              error={fe?.date_of_birth}
            />
          </Field>
          <Field
            id="place_of_birth"
            label="Place of Birth"
            required
            error={fe?.place_of_birth}
          >
            <PlaceOfBirthField
              value={v.place_of_birth ?? ""}
              onChange={(val) => set("place_of_birth", val)}
              error={fe?.place_of_birth}
            />
          </Field>
          <Field
            id="sex_at_birth"
            label="Sex at Birth"
            required
            error={fe?.sex_at_birth}
          >
            <Select
              value={v.sex_at_birth ?? ""}
              onValueChange={(val) => set("sex_at_birth", val)}
            >
              <SelectTrigger id="sex_at_birth">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">MALE</SelectItem>
                <SelectItem value="FEMALE">FEMALE</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field
            id="civil_status"
            label="Civil Status"
            required
            error={fe?.civil_status}
          >
            <Select
              value={v.civil_status ?? ""}
              onValueChange={(val) => set("civil_status", val)}
            >
              <SelectTrigger id="civil_status">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "SINGLE",
                  "MARRIED",
                  "WIDOW/ER",
                  "SEPARATED",
                  "SOLO PARENT",
                  "OTHERS",
                ].map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Grid2>

        <Grid2>
          <Field id="height" label="Height" error={fe?.height}>
            <HeightField
              value={v.height ?? ""}
              onChange={(val) => set("height", val)}
              error={fe?.height}
            />
          </Field>
          <Field id="weight" label="Weight" error={fe?.weight}>
            <WeightField
              value={v.weight ?? ""}
              onChange={(val) => set("weight", val)}
              error={fe?.weight}
            />
          </Field>
          <Field id="blood_type" label="Blood Type" error={fe?.blood_type}>
            <Select
              value={v.blood_type ?? ""}
              onValueChange={(val) => set("blood_type", val)}
            >
              <SelectTrigger id="blood_type">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            id="citizenship"
            label="Citizenship"
            required
            error={fe?.citizenship}
          >
            <Select
              value={v.citizenship ?? ""}
              onValueChange={(val) => set("citizenship", val)}
            >
              <SelectTrigger id="citizenship">
                <SelectValue placeholder="Select citizenship" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {CITIZENSHIPS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Grid2>
      </Section>

      <Section title="Government IDs">
        <Grid2>
          {GOV_IDS.map(([key, label, placeholder]) => (
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
        </Grid2>
      </Section>

      <Section title="Residential Address (No. 17)">
        <AddressFields prefix="residential" v={v} set={set} fe={fe} />
      </Section>

      <Section title="Permanent Address (No. 18)">
        <AddressFields prefix="permanent" v={v} set={set} fe={fe} />
      </Section>

      <Section title="Contact Information">
        <Grid2>
          <Field
            id="telephone_no"
            label="Telephone No. (No. 19)"
            error={fe?.telephone_no}
          >
            <Input
              id="telephone_no"
              placeholder="(02) 123-4567"
              value={v.telephone_no ?? ""}
              onChange={raw("telephone_no")}
            />
          </Field>
          <Field
            id="mobile_no"
            label="Mobile No. (No. 20)"
            required
            error={fe?.mobile_no}
          >
            <Input
              id="mobile_no"
              placeholder="+63 912 345 6789"
              value={v.mobile_no ?? ""}
              onChange={raw("mobile_no")}
            />
          </Field>
        </Grid2>
        <Field
          id="email_address"
          label="E-mail Address (No. 21)"
          error={fe?.email_address}
        >
          <Input
            id="email_address"
            type="email"
            placeholder="juan@example.com"
            value={v.email_address ?? ""}
            onChange={(e) => set("email_address", e.target.value)}
          />
        </Field>
      </Section>
    </div>
  );
}
