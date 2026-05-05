// src/hooks/usePdsExtract.js
// Client-side PDS parser — CSC Form 212 (Revised 2025) ONLY.
// Cell addresses verified against actual SheetJS dump.
//
// CONFIRMED LIMITATIONS (template design, not a bug):
//   - sex_at_birth    → no stored value (checkbox only) — user fills manually
//   - civil_status    → no stored value (checkbox only) — user fills manually
//   - citizenship     → no stored value (dropdown list in Q col, answer not stored) — user fills manually
//   - YES/NO questions → checkboxes don't store values — inferred from details cells only

import { useState } from "react";
import PH_CITIES_BY_PROVINCE from "../lib/ph-geo.js";

// ─────────────────────────────────────────────────────────────────────────────
// PROVINCE / CITY RESOLVER
// ─────────────────────────────────────────────────────────────────────────────
function resolveProvinceCity(rawProvince, rawCity) {
  const allProvinces = Object.keys(PH_CITIES_BY_PROVINCE);

  const normalize = (s) =>
    String(s ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .replace(/\s+/g, " ");

  const normProvince = normalize(rawProvince);
  const normCity = normalize(rawCity);

  const cityIndex = {};
  for (const province of allProvinces) {
    for (const city of PH_CITIES_BY_PROVINCE[province]) {
      cityIndex[normalize(city)] = { province, city };
    }
  }

  const exactProvince = allProvinces.find((p) => normalize(p) === normProvince);
  if (exactProvince) {
    const cities = PH_CITIES_BY_PROVINCE[exactProvince];
    const exactCity = cities.find((c) => normalize(c) === normCity);
    if (exactCity) return { province: exactProvince, city: exactCity };
  }

  if (normCity) {
    const found = cityIndex[normCity];
    if (found) return found;

    for (const [normKey, val] of Object.entries(cityIndex)) {
      if (normKey.startsWith(normCity) || normCity.startsWith(normKey)) {
        return val;
      }
    }
  }

  return {
    province: exactProvince ?? rawProvince ?? "",
    city: rawCity ?? "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE DETECTION — 2025 ONLY
// ─────────────────────────────────────────────────────────────────────────────
const REQUIRED_SHEETS = ["C1", "C2", "C3", "C4"];

function detectTemplateVersion(wb) {
  const missing = REQUIRED_SHEETS.filter((s) => !wb.SheetNames.includes(s));
  if (missing.length > 0) return { valid: false, reason: "wrong_template" };

  for (const sn of wb.SheetNames) {
    const ws = wb.Sheets[sn];
    if (!ws) continue;
    for (const addr of Object.keys(ws)) {
      if (addr.startsWith("!")) continue;
      const val = String(ws[addr]?.v ?? ws[addr]?.w ?? "");
      if (val.includes("2025")) return { valid: true };
    }
  }

  return { valid: false, reason: "wrong_year" };
}

// ─────────────────────────────────────────────────────────────────────────────
// GOVT ID MAP
// Maps raw PDS cell values → exact dropdown option strings in StepMiscellaneous.
// Must stay in sync with GOVT_ID_TYPES in StepMiscellaneous.jsx.
// ─────────────────────────────────────────────────────────────────────────────
const GOVT_ID_MAP = {
  PASSPORT: "PASSPORT",
  "PHILIPPINE PASSPORT": "PASSPORT",
  GSIS: "GSIS ID",
  "GSIS ID": "GSIS ID",
  "GSIS E-CARD": "GSIS ID",
  SSS: "SSS ID",
  "SSS ID": "SSS ID",
  "SSS CARD": "SSS ID",
  "SOCIAL SECURITY SYSTEM": "SSS ID",
  PRC: "PRC ID",
  "PRC ID": "PRC ID",
  "PRC LICENSE": "PRC ID",
  "PROFESSIONAL REGULATION COMMISSION": "PRC ID",
  "DRIVER'S LICENSE": "DRIVER'S LICENSE",
  "DRIVER LICENSE": "DRIVER'S LICENSE",
  "DRIVERS LICENSE": "DRIVER'S LICENSE",
  "DRIVER'S LICENSE (LTO)": "DRIVER'S LICENSE",
  LTO: "DRIVER'S LICENSE",
  UMID: "UMID",
  "UNIFIED MULTI-PURPOSE ID": "UMID",
  "UNIFIED MULTIPURPOSE ID": "UMID",
  "VOTER'S ID": "VOTER'S ID",
  "VOTER ID": "VOTER'S ID",
  "VOTERS ID": "VOTER'S ID",
  "VOTER'S CERTIFICATE": "VOTER'S ID",
  COMELEC: "VOTER'S ID",
  PHILSYS: "PHILSYS ID",
  "PHILSYS ID": "PHILSYS ID",
  "PHILIPPINE IDENTIFICATION SYSTEM": "PHILSYS ID",
  "NATIONAL ID": "PHILSYS ID",
  "PHILIPPINE NATIONAL ID": "PHILSYS ID",
  "PHIL ID": "PHILSYS ID",
  POSTAL: "POSTAL ID",
  "POSTAL ID": "POSTAL ID",
  "PHLPost ID": "POSTAL ID",
  PHLPOST: "POSTAL ID",
  PHILHEALTH: "PHILHEALTH ID",
  "PHILHEALTH ID": "PHILHEALTH ID",
  "PHILHEALTH CARD": "PHILHEALTH ID",
  PAGIBIG: "PAG-IBIG ID",
  "PAG-IBIG": "PAG-IBIG ID",
  "PAG-IBIG ID": "PAG-IBIG ID",
  "PAGIBIG ID": "PAG-IBIG ID",
  "PAG-IBIG CARD": "PAG-IBIG ID",
  "SENIOR CITIZEN ID": "SENIOR CITIZEN ID",
  "SENIOR CITIZEN": "SENIOR CITIZEN ID",
  "SC ID": "SENIOR CITIZEN ID",
  OSCA: "SENIOR CITIZEN ID",
  "PWD ID": "PWD ID",
  "PERSONS WITH DISABILITY ID": "PWD ID",
  PWD: "PWD ID",
  NBI: "NBI CLEARANCE",
  "NBI CLEARANCE": "NBI CLEARANCE",
  // TIN now maps to its own dropdown option
  TIN: "TIN ID",
  "TIN ID": "TIN ID",
  "TAX IDENTIFICATION NUMBER": "TIN ID",
  "TAX ID": "TIN ID",
  OTHER: "OTHER",
};

// ─────────────────────────────────────────────────────────────────────────────
// Known ID types that have their own option in the dropdown.
// Must stay in sync with GOVT_ID_TYPES in StepMiscellaneous.jsx.
// ─────────────────────────────────────────────────────────────────────────────
const KNOWN_ID_TYPES = new Set([
  "PASSPORT",
  "PHILSYS ID",
  "UMID",
  "DRIVER'S LICENSE",
  "GSIS ID",
  "SSS ID",
  "PAG-IBIG ID",
  "PHILHEALTH ID",
  "PRC ID",
  "VOTER'S ID",
  "POSTAL ID",
  "NBI CLEARANCE",
  "SENIOR CITIZEN ID",
  "PWD ID",
  "TIN ID",
  "OTHER",
]);

// ─────────────────────────────────────────────────────────────────────────────
// DATE PARSER
// ─────────────────────────────────────────────────────────────────────────────
function parseDate(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s || s.toUpperCase() === "N/A" || s === "PRESENT")
    return s === "PRESENT" ? "PRESENT" : "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  if (typeof raw === "number") {
    const d = new Date((raw - 25569) * 86400 * 1000);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
  }

  const slashShort = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (slashShort) {
    const yr = parseInt(slashShort[3]) + 2000;
    return `${yr}-${slashShort[1].padStart(2, "0")}-${slashShort[2].padStart(2, "0")}`;
  }

  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy)
    return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;

  const monthName = s.match(/^([A-Za-z]+)\s+(\d{1,2})[,\s]+(\d{4})$/);
  if (monthName) {
    const d = new Date(`${monthName[1]} ${monthName[2]}, ${monthName[3]}`);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
  }

  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);

  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// EDU PERIOD PARSER
// ─────────────────────────────────────────────────────────────────────────────
function parseEduYear(raw, isEnd = false) {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s || s.toUpperCase() === "N/A") return "";

  const full = parseDate(raw);
  if (full && full !== "") return full;

  if (/^\d{4}$/.test(s)) {
    return isEnd ? `${s}-12-31` : `${s}-01-01`;
  }

  const range = s.match(/^(\d{4})\s*[-–]\s*(\d{4})$/);
  if (range) {
    const year = isEnd ? range[2] : range[1];
    return isEnd ? `${year}-12-31` : `${year}-01-01`;
  }

  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// HEIGHT & WEIGHT CONVERTERS
// ─────────────────────────────────────────────────────────────────────────────
function normaliseHeight(raw) {
  const s = String(raw).trim();
  const mMatch = s.match(/^([\d.]+)\s*m$/i);
  if (mMatch) return parseFloat(mMatch[1]).toFixed(2);
  const cmMatch = s.match(/^([\d.]+)\s*cm$/i);
  if (cmMatch) return (parseFloat(cmMatch[1]) / 100).toFixed(2);
  const ftIn = s.match(
    /^(\d+)\s*['''`\u2018\u2019]\s*(\d*)\s*["""``\u201C\u201D]?$/,
  );
  if (ftIn)
    return (
      (parseInt(ftIn[1], 10) * 12 + parseInt(ftIn[2] || "0", 10)) *
      0.0254
    ).toFixed(2);
  const ftOnly = s.match(/^(\d+)\s*ft$/i);
  if (ftOnly) return (parseInt(ftOnly[1], 10) * 0.3048).toFixed(2);
  const plain = parseFloat(s);
  if (!isNaN(plain)) {
    if (plain >= 100) return (plain / 100).toFixed(2);
    return plain.toFixed(2);
  }
  return "";
}

function normaliseWeight(raw) {
  const s = String(raw).trim();
  const num = parseFloat(s.replace(/\s*(kg|kgs|lbs?|pounds?)\s*$/i, "").trim());
  if (isNaN(num)) return "";
  if (/lbs?|pounds?/i.test(s)) return (num * 0.453592).toFixed(1);
  return String(num);
}

// ─────────────────────────────────────────────────────────────────────────────
// SALARY PARSER
// ─────────────────────────────────────────────────────────────────────────────
function parseSalary(raw) {
  const s = String(raw ?? "")
    .replace(/[₱,\s]/g, "")
    .trim();
  const n = parseFloat(s);
  return isNaN(n) ? "" : String(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function cellVal(ws, addr) {
  const cell = ws[addr];
  if (!cell) return "";
  return cell.v ?? cell.w ?? "";
}

function up(v) {
  const s = String(v ?? "").trim();
  return s && s.toUpperCase() !== "N/A" ? s.toUpperCase() : "";
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────
async function extractFromExcel(file) {
  const XLSX =
    await import("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, {
    type: "array",
    cellDates: false,
    dense: false,
  });

  const { valid, reason } = detectTemplateVersion(wb);
  if (!valid) {
    if (reason === "wrong_template") {
      throw new Error(
        "Hindi ito ang opisyal na CSC PDS Excel template. Kailangan ng mga sheet na C1, C2, C3, at C4.\n\n" +
          "This is not the official CSC PDS Excel template. Sheets C1, C2, C3, and C4 are required.",
      );
    }
    throw new Error(
      "Mali ang bersyon ng PDS template. Tanggap lamang ang CSC Form 212 (Revised 2025). " +
        "Ang 2017 at mas lumang bersyon ay hindi na tinatanggap.\n\n" +
        "Wrong PDS template version. Only CSC Form 212 (Revised 2025) is accepted. " +
        "The 2017 and older versions are no longer supported.",
    );
  }

  const result = {};

  // ══════════════════════════════════════════════════════════════════════════
  // C1 — Personal Info, Family, Education
  // ══════════════════════════════════════════════════════════════════════════
  const ws1 = wb.Sheets["C1"];
  if (ws1) {
    result.surname = up(cellVal(ws1, "D10"));
    result.first_name = up(cellVal(ws1, "D11"));
    result.middle_name = up(cellVal(ws1, "D12"));

    const extRaw = String(cellVal(ws1, "L11") ?? "").trim();
    const extMatch = extRaw.match(/\)\s*(.+?)\s*$/);
    if (extMatch) {
      const extVal = extMatch[1].trim().toUpperCase();
      if (extVal && extVal !== "N/A" && extVal.length <= 10) {
        result.name_extension = extVal;
      }
    }

    const dobParsed = parseDate(cellVal(ws1, "D13"));
    if (dobParsed) result.date_of_birth = dobParsed;

    result.place_of_birth = up(cellVal(ws1, "D15"));

    const hVal = normaliseHeight(cellVal(ws1, "D22"));
    if (hVal) result.height = hVal;

    const wVal = normaliseWeight(cellVal(ws1, "D24"));
    if (wVal) result.weight = wVal;

    const btRaw = up(cellVal(ws1, "D25"));
    if (btRaw) result.blood_type = btRaw;

    const govtIds = {
      umid_id: "D27",
      pagibig_id: "D29",
      philhealth_no: "D31",
      sss_no: "D32",
      tin_no: "D33",
      agency_employee_no: "D34",
    };
    for (const [key, addr] of Object.entries(govtIds)) {
      const val = up(cellVal(ws1, addr));
      if (val) result[key] = val;
    }

    // ── Residential Address ───────────────────────────────────────────────────
    const resProvRaw = up(cellVal(ws1, "L22"));
    const resCityRaw = up(cellVal(ws1, "I22"));
    const resResolved = resolveProvinceCity(resProvRaw, resCityRaw);

    result.residential_province = resResolved.province;
    result.residential_city = resResolved.city;
    result.residential_house_no = up(cellVal(ws1, "I17"));
    result.residential_street = up(cellVal(ws1, "L17"));
    result.residential_subdivision = up(cellVal(ws1, "L19"));
    result.residential_barangay = up(cellVal(ws1, "I20"));
    result.residential_zip = up(cellVal(ws1, "I24"));

    // ── Permanent Address ─────────────────────────────────────────────────────
    const perProvRaw = up(cellVal(ws1, "L29"));
    const perCityRaw = up(cellVal(ws1, "I29"));
    const perResolved = resolveProvinceCity(perProvRaw, perCityRaw);

    result.permanent_province = perResolved.province;
    result.permanent_city = perResolved.city;
    result.permanent_house_no = up(cellVal(ws1, "I25"));
    result.permanent_street = up(cellVal(ws1, "L25"));
    result.permanent_subdivision = up(cellVal(ws1, "L27"));
    result.permanent_barangay = up(cellVal(ws1, "I28"));
    result.permanent_zip = up(cellVal(ws1, "I31"));

    // ── Contact ───────────────────────────────────────────────────────────────
    result.telephone_no = up(cellVal(ws1, "I32"));
    result.mobile_no = up(cellVal(ws1, "I33"));
    result.email_address = String(cellVal(ws1, "I34") ?? "")
      .trim()
      .toLowerCase();

    // ── Spouse ────────────────────────────────────────────────────────────────
    result.spouse_surname = up(cellVal(ws1, "D36"));
    result.spouse_first_name = up(cellVal(ws1, "D37"));
    result.spouse_middle_name = up(cellVal(ws1, "D38"));
    result.spouse_occupation = up(cellVal(ws1, "D39"));
    result.spouse_employer = up(cellVal(ws1, "D40"));
    result.spouse_business_address = up(cellVal(ws1, "D41"));
    result.spouse_telephone = up(cellVal(ws1, "D42"));

    const spExtRaw = String(cellVal(ws1, "G37") ?? "").trim();
    const spExtMatch = spExtRaw.match(/\)\s*(.+?)\s*$/);
    if (spExtMatch) {
      const spExtVal = spExtMatch[1].trim().toUpperCase();
      if (spExtVal && spExtVal !== "N/A" && spExtVal.length <= 10) {
        result.spouse_extension = spExtVal;
      }
    }

    // ── Father ────────────────────────────────────────────────────────────────
    result.father_surname = up(cellVal(ws1, "D43"));
    result.father_first_name = up(cellVal(ws1, "D44"));
    result.father_middle_name = up(cellVal(ws1, "D45"));

    const faExtRaw = String(cellVal(ws1, "G44") ?? "").trim();
    const faExtMatch = faExtRaw.match(/\)\s*(.+?)\s*$/);
    if (faExtMatch) {
      const faExtVal = faExtMatch[1].trim().toUpperCase();
      if (faExtVal && faExtVal !== "N/A" && faExtVal.length <= 10) {
        result.father_extension = faExtVal;
      }
    }

    // ── Mother ────────────────────────────────────────────────────────────────
    result.mother_maiden_surname = up(cellVal(ws1, "D47"));
    result.mother_first_name = up(cellVal(ws1, "D48"));
    result.mother_middle_name = up(cellVal(ws1, "D49"));

    // ── Children ──────────────────────────────────────────────────────────────
    const children = [];
    for (let row = 37; row <= 48; row++) {
      const nameVal = up(cellVal(ws1, `I${row}`));
      if (!nameVal || nameVal === "N/A") continue;
      children.push({
        name: nameVal,
        date_of_birth: parseDate(cellVal(ws1, `M${row}`)),
      });
    }
    if (children.length) result.children = children;

    // ── Education ─────────────────────────────────────────────────────────────
    const EDU_MAP = [
      { key: "elementary", rows: [54] },
      { key: "secondary", rows: [55] },
      { key: "vocational", rows: [56] },
      { key: "college", rows: [57, 58] },
      { key: "graduate", rows: [59] },
    ];

    for (const { key, rows } of EDU_MAP) {
      const entries = [];
      for (const row of rows) {
        const school = up(cellVal(ws1, `D${row}`));
        if (!school || school === "N/A") continue;
        entries.push({
          school,
          degree: up(cellVal(ws1, `G${row}`)),
          period_from: parseEduYear(cellVal(ws1, `J${row}`), false),
          period_to: parseEduYear(cellVal(ws1, `K${row}`), true),
          highest_level: up(cellVal(ws1, `L${row}`)),
          year_graduated: up(cellVal(ws1, `M${row}`)),
          honors: up(cellVal(ws1, `N${row}`)),
        });
      }
      if (entries.length) result[`edu_${key}`] = entries;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // C2 — Eligibility + Work Experience
  // ══════════════════════════════════════════════════════════════════════════
  const ws2 = wb.Sheets["C2"];
  if (ws2) {
    const eligibilities = [];
    for (let row = 5; row <= 11; row++) {
      const elig = up(cellVal(ws2, `A${row}`));
      if (!elig || elig === "N/A") continue;
      eligibilities.push({
        eligibility: elig,
        rating: up(cellVal(ws2, `F${row}`)),
        exam_date: parseDate(cellVal(ws2, `G${row}`)),
        place: up(cellVal(ws2, `I${row}`)),
        license_no: up(cellVal(ws2, `L${row}`)),
        valid_until: parseDate(cellVal(ws2, `M${row}`)),
      });
    }
    if (eligibilities.length) result.eligibilities = eligibilities;

    const work = [];
    for (let row = 18; row <= 46; row++) {
      const pos = up(cellVal(ws2, `D${row}`));
      if (!pos || pos === "N/A") continue;

      const toRaw = cellVal(ws2, `C${row}`);
      const toStr = String(toRaw ?? "")
        .trim()
        .toUpperCase();
      const toVal = toStr === "PRESENT" ? "PRESENT" : parseDate(toRaw);

      const govtRaw = String(cellVal(ws2, `M${row}`) ?? "")
        .trim()
        .toUpperCase();
      const govtVal = ["Y", "YES", "TRUE", "1"].includes(govtRaw)
        ? "Y"
        : ["N", "NO", "FALSE", "0"].includes(govtRaw)
          ? "N"
          : "";

      const grade = up(cellVal(ws2, `K${row}`));

      work.push({
        from: parseDate(cellVal(ws2, `A${row}`)),
        to: toVal,
        position: pos,
        department: up(cellVal(ws2, `G${row}`)),
        monthly_salary: parseSalary(cellVal(ws2, `J${row}`)),
        salary_grade: grade === "N/A" ? "" : grade,
        status: up(cellVal(ws2, `L${row}`)),
        govt_service: govtVal,
      });
    }
    if (work.length) result.work_experiences = work;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // C3 — Voluntary Work, Trainings, Other Info
  // ══════════════════════════════════════════════════════════════════════════
  const ws3 = wb.Sheets["C3"];
  if (ws3) {
    const voluntary = [];
    for (let row = 6; row <= 12; row++) {
      const org = up(cellVal(ws3, `A${row}`));
      if (!org || org === "N/A") continue;
      voluntary.push({
        org_name_address: org,
        from: parseDate(cellVal(ws3, `E${row}`)),
        to: parseDate(cellVal(ws3, `F${row}`)),
        hours: up(cellVal(ws3, `G${row}`)),
        position: up(cellVal(ws3, `H${row}`)),
      });
    }
    if (voluntary.length) result.voluntary_works = voluntary;

    const trainings = [];
    for (let row = 19; row <= 38; row++) {
      const title = up(cellVal(ws3, `A${row}`));
      if (!title || title === "N/A") continue;
      trainings.push({
        title,
        from: parseDate(cellVal(ws3, `E${row}`)),
        to: parseDate(cellVal(ws3, `F${row}`)),
        hours: up(cellVal(ws3, `G${row}`)),
        type: up(cellVal(ws3, `H${row}`)),
        sponsored_by: up(cellVal(ws3, `I${row}`)),
      });
    }
    if (trainings.length) result.trainings = trainings;

    const skills = [],
      distinctions = [],
      memberships = [];
    for (let row = 42; row <= 48; row++) {
      const skill = up(cellVal(ws3, `A${row}`));
      const dist = up(cellVal(ws3, `C${row}`));
      const mem = up(cellVal(ws3, `I${row}`));
      if (skill && skill !== "N/A") skills.push({ skill });
      if (dist && dist !== "N/A") distinctions.push({ distinction: dist });
      if (mem && mem !== "N/A") memberships.push({ organization: mem });
    }
    if (skills.length) result.special_skills = skills;
    if (distinctions.length) result.non_academic_distinctions = distinctions;
    if (memberships.length) result.organization_memberships = memberships;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // C4 — Questions, References, Gov't ID
  // ══════════════════════════════════════════════════════════════════════════
  const ws4 = wb.Sheets["C4"];
  if (ws4) {
    const getDetail = (addr) => {
      const raw = String(cellVal(ws4, addr) ?? "").trim();
      if (!raw) return null;
      if (raw.startsWith("If YES")) return null;
      if (raw.startsWith("     If YES")) return null;
      if (/^[_\s]+$/.test(raw)) return null;
      if (raw.includes("___")) return null;
      return raw;
    };

    const setQuestion = (yesNoKey, detailKey, detailAddr, extraAddr = null) => {
      const detail = getDetail(detailAddr);
      const extra = extraAddr ? getDetail(extraAddr) : null;
      const hasContent = !!(detail || extra);
      result[yesNoKey] = hasContent ? "YES" : "NO";
      if (hasContent) {
        result[detailKey] = [detail, extra]
          .filter(Boolean)
          .join(" ")
          .trim()
          .toUpperCase();
      }
    };

    setQuestion("related_3rd_degree", "related_3rd_degree_details", "G10");
    result.related_4th_degree = "NO";
    setQuestion("found_guilty_admin", "found_guilty_admin_details", "G14");
    setQuestion("criminally_charged", "criminally_charged_details", "G19");
    setQuestion("convicted_crime", "convicted_crime_details", "G24");
    setQuestion(
      "separated_from_service",
      "separated_from_service_details",
      "G28",
      "I29",
    );
    setQuestion(
      "candidate_in_election",
      "candidate_in_election_details",
      "G32",
    );
    setQuestion("resigned_to_campaign", "resigned_to_campaign_details", "G35");
    setQuestion("immigrant_status", "immigrant_country", "G38");
    setQuestion("is_indigenous", "indigenous_specify", "G44");
    setQuestion("is_pwd", "pwd_id_no", "G46");
    setQuestion("is_solo_parent", "solo_parent_id_no", "G48");

    const refs = [];
    for (let row = 52; row <= 54; row++) {
      const name = up(cellVal(ws4, `A${row}`));
      if (!name || name === "N/A") continue;
      refs.push({
        name,
        address: up(cellVal(ws4, `F${row}`)),
        contact: String(cellVal(ws4, `G${row}`) ?? "").trim(),
      });
    }
    if (refs.length) result.references = refs;

    // ── Government ID type detection ──────────────────────────────────────────
    const ID_TYPE_ADDRS = ["D61", "C61", "E61", "D60", "C60", "D62", "C62"];
    let rawIdType = "";
    for (const addr of ID_TYPE_ADDRS) {
      const v = String(cellVal(ws4, addr) ?? "").trim();
      if (v && v.length > 1 && !/^\d+$/.test(v)) {
        rawIdType = v.toUpperCase();
        break;
      }
    }

    if (!rawIdType) {
      const ID_KEYWORDS = [
        "PASSPORT",
        "LICENSE",
        "UMID",
        "PHILSYS",
        "VOTER",
        "POSTAL",
        "PHILHEALTH",
        "PAG-IBIG",
        "PAGIBIG",
        "GSIS",
        "SSS",
        "PRC",
        "NBI",
        "SENIOR",
        "PWD",
        "TIN",
      ];
      for (const addr of Object.keys(ws4)) {
        if (addr.startsWith("!")) continue;
        const v = String(ws4[addr]?.v ?? ws4[addr]?.w ?? "")
          .trim()
          .toUpperCase();
        if (ID_KEYWORDS.some((kw) => v.includes(kw)) && v.length < 60) {
          rawIdType = v;
          break;
        }
      }
    }

    console.log("[PDS extract] govt_id_type raw:", rawIdType);
    const mappedType = GOVT_ID_MAP[rawIdType] ?? (rawIdType || null);

    if (mappedType) {
      const mappedUpper = mappedType.toUpperCase();
      if (KNOWN_ID_TYPES.has(mappedUpper)) {
        result.govt_id_type = mappedType;
      } else {
        result.govt_id_type = "OTHER";
        result.govt_id_type_other = mappedType;
      }
    }

    const idNo = up(cellVal(ws4, "D62"));
    if (idNo) result.govt_id_no = idNo;

    const idDate = String(cellVal(ws4, "D64") ?? "").trim();
    if (idDate && idDate.toUpperCase() !== "N/A")
      result.govt_id_date_place = idDate.toUpperCase();
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HOOK
// ─────────────────────────────────────────────────────────────────────────────
export function usePdsExtract() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);

  const extract = async (file) => {
    setIsExtracting(true);
    setExtractError(null);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["xlsx", "xls"].includes(ext)) {
        throw new Error(
          "Tanggap lamang ang Excel file (.xlsx o .xls).\n\n" +
            "Only Excel files are accepted (.xlsx or .xls).",
        );
      }

      const result = await extractFromExcel(file);

      const cleaned = Object.fromEntries(
        Object.entries(result).filter(([, v]) =>
          Array.isArray(v)
            ? v.length > 0
            : v !== "" && v !== null && v !== undefined,
        ),
      );

      if (Object.keys(cleaned).length === 0) {
        throw new Error(
          "Walang nakuhang data sa file. Siguraduhing may nilaman ang iyong PDS Excel file.\n\n" +
            "No data found in the file. Please make sure your PDS Excel file has been filled out.",
        );
      }

      return cleaned;
    } catch (err) {
      const msg = err?.message ?? "Hindi ma-read ang PDS file.";
      setExtractError(msg);
      throw err;
    } finally {
      setIsExtracting(false);
    }
  };

  return { extract, isExtracting, extractError, setExtractError };
}
