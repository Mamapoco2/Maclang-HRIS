// src/pages/profile/components/StepMiscellaneous.jsx
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, Section, Grid2 } from "./primitives";
import { RepeatableTable } from "./repeatableTable";
import { YesNoField } from "./repeatableTable";

// ─── Voluntary Work & L&D ─────────────────────────────────────────────────────
export function StepVoluntaryAndLnd({ v, set }) {
  return (
    <div className="space-y-6">
      <Section title="VI. Voluntary Work (No. 29)">
        <RepeatableTable
          rows={v.voluntary_works ?? []}
          onChange={(r) => set("voluntary_works", r)}
          addLabel="Add Voluntary Work"
          columns={[
            {
              key: "org_name_address",
              label: "Name & Address of Organization",
              placeholder: "ORG NAME & ADDRESS",
            },
            { key: "from", label: "From", type: "date" },
            { key: "to", label: "To", type: "date" },
            { key: "hours", label: "No. of Hours", placeholder: "HOURS" },
            {
              key: "position",
              label: "Position/Nature of Work",
              placeholder: "POSITION",
            },
          ]}
        />
      </Section>
      <Section title="VII. L&D Interventions / Training Programs (No. 30)">
        <RepeatableTable
          rows={v.trainings ?? []}
          onChange={(r) => set("trainings", r)}
          addLabel="Add Training"
          columns={[
            {
              key: "title",
              label: "Title of Training",
              placeholder: "TRAINING TITLE",
            },
            { key: "from", label: "From", type: "date" },
            { key: "to", label: "To", type: "date" },
            { key: "hours", label: "No. of Hours", placeholder: "HOURS" },
            { key: "type", label: "Type of L&D", placeholder: "TECHNICAL" },
            {
              key: "sponsored_by",
              label: "Conducted/Sponsored By",
              placeholder: "ORGANIZATION",
            },
          ]}
        />
      </Section>
    </div>
  );
}

// ─── Other Information ────────────────────────────────────────────────────────
export function StepOtherInfo({ v, set }) {
  return (
    <div className="space-y-5">
      <Section title="VIII. Other Information">
        <RepeatableTable
          label="31. Special Skills and Hobbies"
          rows={v.special_skills ?? []}
          onChange={(r) => set("special_skills", r)}
          addLabel="Add Skill/Hobby"
          columns={[
            {
              key: "skill",
              label: "Skill / Hobby",
              placeholder: "e.g., GUITAR",
            },
          ]}
        />
        <RepeatableTable
          label="32. Non-Academic Distinctions / Recognition"
          rows={v.non_academic_distinctions ?? []}
          onChange={(r) => set("non_academic_distinctions", r)}
          addLabel="Add Distinction"
          columns={[
            {
              key: "distinction",
              label: "Distinction / Recognition",
              placeholder: "e.g., EMPLOYEE OF THE YEAR",
            },
          ]}
        />
        <RepeatableTable
          label="33. Membership in Association/Organization"
          rows={v.organization_memberships ?? []}
          onChange={(r) => set("organization_memberships", r)}
          addLabel="Add Membership"
          columns={[
            {
              key: "organization",
              label: "Association / Organization",
              placeholder: "ORG NAME",
            },
          ]}
        />
      </Section>
    </div>
  );
}

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  [
    "related_3rd_degree",
    "34a. Are you related by consanguinity or affinity to the appointing/recommending authority within the 3rd degree?",
    "related_3rd_degree_details",
  ],
  [
    "related_4th_degree",
    "34b. Within the 4th degree (for LGU – Career Employees)?",
    "related_4th_degree_details",
  ],
  [
    "found_guilty_admin",
    "35a. Have you ever been found guilty of any administrative offense?",
    "found_guilty_admin_details",
  ],
  [
    "criminally_charged",
    "35b. Have you been criminally charged before any court?",
    "criminally_charged_details",
    "If YES, give details (date filed / status of case):",
  ],
  [
    "convicted_crime",
    "36. Have you ever been convicted of any crime or violation of any law, decree, ordinance or regulation?",
    "convicted_crime_details",
  ],
  [
    "separated_from_service",
    "37. Have you ever been separated from service (resignation, retirement, dismissal, dropped from rolls, etc.)?",
    "separated_from_service_details",
  ],
  [
    "candidate_in_election",
    "38a. Have you ever been a candidate in a national or local election held within the last year (except Barangay election)?",
    "candidate_in_election_details",
  ],
  [
    "resigned_to_campaign",
    "38b. Have you resigned from government service during the 3-month period before the last election to actively campaign?",
    "resigned_to_campaign_details",
  ],
  [
    "immigrant_status",
    "39. Have you acquired the status of an immigrant or permanent resident of another country?",
    "immigrant_country",
    "If YES, give details (country):",
  ],
  [
    "is_indigenous",
    "40a. Are you a member of any indigenous group?",
    "indigenous_specify",
    "If YES, please specify:",
  ],
  [
    "is_pwd",
    "40b. Are you a person with disability?",
    "pwd_id_no",
    "If YES, please specify ID No.:",
  ],
  [
    "is_solo_parent",
    "40c. Are you a solo parent?",
    "solo_parent_id_no",
    "If YES, please specify ID No.:",
  ],
];

export function StepQuestions({ v, set }) {
  return (
    <div className="space-y-5">
      <Section title="IX. Questions (No. 34–40)">
        <div className="space-y-4">
          {QUESTIONS.map(([key, label, detailKey, detailLabel]) => (
            <YesNoField
              key={key}
              id={key}
              label={label}
              value={v[key]}
              detail={v[detailKey]}
              onChange={(val) => set(key, val)}
              onDetailChange={
                detailKey ? (val) => set(detailKey, val) : undefined
              }
              detailLabel={detailLabel}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── References & Gov't ID ────────────────────────────────────────────────────

/**
 * Government-issued IDs accepted by the CSC on CS Form No. 212 (Revised 2025).
 * Reference: CSC guidelines on valid government IDs for PDS submission.
 */
const GOVT_ID_TYPES = [
  "DRIVER'S LICENSE",
  "GSIS ID",
  "PASSPORT",
  "PAG-IBIG ID",
  "PHILHEALTH ID",
  "PHILSYS ID",
  "POSTAL ID",
  "PRC ID",
  "NBI CLEARANCE",
  "PWD ID",
  "SENIOR CITIZEN ID",
  "SSS ID",
  "UMID",
  "VOTER'S ID",
  "TIN ID",
  "OTHER",
];

export function StepReferencesAndId({ v, set, fe }) {
  const up = (key) => (e) =>
    set(key, (typeof e === "string" ? e : e.target.value).toUpperCase());

  return (
    <div className="space-y-5">
      <Section title="41. References (not related to applicant/appointee)">
        <RepeatableTable
          rows={v.references ?? []}
          onChange={(r) => set("references", r)}
          addLabel="Add Reference"
          columns={[
            { key: "name", label: "Name", placeholder: "FULL NAME" },
            {
              key: "address",
              label: "Office/Residential Address",
              placeholder: "ADDRESS",
            },
            {
              key: "contact",
              label: "Contact No. / Email",
              placeholder: "CONTACT",
            },
          ]}
        />
      </Section>

      <Section title="Government Issued ID">
        <Field
          id="govt_id_type"
          label="ID Type"
          required
          error={fe?.govt_id_type}
        >
          <Select
            value={v.govt_id_type ?? ""}
            onValueChange={(val) => {
              set("govt_id_type", val);
              if (val !== "OTHER") set("govt_id_type_other", "");
            }}
          >
            <SelectTrigger id="govt_id_type">
              <SelectValue placeholder="Select ID Type" />
            </SelectTrigger>
            <SelectContent>
              {GOVT_ID_TYPES.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Free-text field shown when OTHER is selected.
            Auto-filled by PDS import when the extracted ID type
            is not in the known dropdown list. */}
        {v.govt_id_type === "OTHER" && (
          <Field
            id="govt_id_type_other"
            label="Please specify ID type"
            required
            error={fe?.govt_id_type_other}
          >
            <Input
              id="govt_id_type_other"
              placeholder="E.G. BARANGAY ID"
              value={v.govt_id_type_other ?? ""}
              onChange={up("govt_id_type_other")}
              className="uppercase"
            />
          </Field>
        )}

        <Grid2>
          <Field
            id="govt_id_no"
            label="ID / License / Passport No."
            required
            error={fe?.govt_id_no}
          >
            <Input
              id="govt_id_no"
              value={v.govt_id_no ?? ""}
              onChange={up("govt_id_no")}
              className="uppercase"
            />
          </Field>
          <Field
            id="govt_id_date_place"
            label="Date & Place of Issuance"
            required
            error={fe?.govt_id_date_place}
          >
            <Input
              id="govt_id_date_place"
              placeholder="MM/DD/YYYY, PLACE"
              value={v.govt_id_date_place ?? ""}
              onChange={up("govt_id_date_place")}
              className="uppercase"
            />
          </Field>
        </Grid2>
      </Section>
    </div>
  );
}
