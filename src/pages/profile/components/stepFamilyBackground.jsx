// src/pages/profile/components/StepFamilyBackground.jsx
import { Input } from "@/components/ui/input";
import { Field, Section, Grid2 } from "./primitives";
import { RepeatableTable } from "./repeatableTable";

const SPOUSE_FIELDS = [
  ["spouse_surname", "Spouse's Surname"],
  ["spouse_first_name", "First Name"],
  ["spouse_middle_name", "Middle Name"],
  ["spouse_extension", "Name Extension"],
  ["spouse_occupation", "Occupation"],
  ["spouse_employer", "Employer/Business Name"],
];

export function StepFamilyBackground({ v, set, fe }) {
  const up = (key) => (e) =>
    set(key, (typeof e === "string" ? e : e.target.value).toUpperCase());

  return (
    <div className="space-y-5">
      <Section title="II. Family Background — Spouse (No. 22)">
        <Grid2>
          {SPOUSE_FIELDS.map(([key, label]) => (
            <Field key={key} id={key} label={label} error={fe?.[key]}>
              <Input
                id={key}
                value={v[key] ?? ""}
                onChange={up(key)}
                className="uppercase"
              />
            </Field>
          ))}
        </Grid2>
        <Field
          id="spouse_business_address"
          label="Business Address"
          error={fe?.spouse_business_address}
        >
          <Input
            id="spouse_business_address"
            value={v.spouse_business_address ?? ""}
            onChange={up("spouse_business_address")}
            className="uppercase"
          />
        </Field>
        <Field
          id="spouse_telephone"
          label="Telephone No."
          error={fe?.spouse_telephone}
        >
          <Input
            id="spouse_telephone"
            value={v.spouse_telephone ?? ""}
            onChange={(e) => set("spouse_telephone", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Name of Children (No. 23)">
        <RepeatableTable
          rows={v.children ?? []}
          onChange={(r) => set("children", r)}
          addLabel="Add Child"
          columns={[
            { key: "name", label: "Full Name", placeholder: "FULL NAME" },
            { key: "date_of_birth", label: "Date of Birth", type: "date" },
          ]}
        />
      </Section>

      <Section title="Father's Name (No. 24)">
        <Grid2>
          {[
            ["father_surname", "Surname"],
            ["father_first_name", "First Name"],
            ["father_middle_name", "Middle Name"],
            ["father_extension", "Name Extension"],
          ].map(([key, label]) => (
            <Field key={key} id={key} label={label} error={fe?.[key]}>
              <Input
                id={key}
                value={v[key] ?? ""}
                onChange={up(key)}
                className="uppercase"
              />
            </Field>
          ))}
        </Grid2>
      </Section>

      <Section title="Mother's Maiden Name (No. 25)">
        <Grid2>
          {[
            ["mother_maiden_surname", "Surname"],
            ["mother_first_name", "First Name"],
            ["mother_middle_name", "Middle Name"],
          ].map(([key, label]) => (
            <Field key={key} id={key} label={label} error={fe?.[key]}>
              <Input
                id={key}
                value={v[key] ?? ""}
                onChange={up(key)}
                className="uppercase"
              />
            </Field>
          ))}
        </Grid2>
      </Section>
    </div>
  );
}
