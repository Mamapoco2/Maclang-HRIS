// ─────────────────────────────────────────────────────────────────────────────
// Personnel Schedule (Plantilla Schedule) — Level 2 hospital, 200 beds
//
// FRONT-END SAMPLE DATA ONLY. Structure follows the DOH model for Level 1/2
// hospitals: Office of the Chief of Hospital, Medical Service, Nursing Service,
// and Hospital Operations and Patient Support Service (HOPSS, which subsumes
// finance). Position titles, salary grades and slot counts are illustrative —
// replace this file (or the API that supersedes it) with the hospital's
// approved Personnel Schedule.
//
// Each department entry: [name, type, [[position title, SG, authorized slots], ...]]
// A `null` name = positions attached directly to the Directorate/Division.
// ─────────────────────────────────────────────────────────────────────────────

export const PSCHED_DIVISIONS = [
  {
    id: 1,
    name: "Office of the Chief of Hospital",
    type: "OFFICE",
    departments: [
      [null, null, [["Chief of Hospital II", 25, 1], ["Administrative Assistant II", 8, 1], ["Administrative Aide IV", 4, 1]]],
      ["Quality Management Unit", "UNIT", [["Nurse III", 17, 1], ["Administrative Officer II", 11, 1]]],
      ["Patient Safety Unit", "UNIT", [["Nurse II", 16, 1], ["Administrative Assistant I", 7, 1]]],
      ["Infection Prevention and Control Unit", "UNIT", [["Nurse III", 17, 1], ["Medical Technologist II", 15, 1]]],
      ["Hospital Planning and Development Unit", "UNIT", [["Administrative Officer IV", 15, 1], ["Administrative Assistant II", 8, 1]]],
    ],
  },
  {
    id: 2,
    name: "Medical Service",
    type: "DIVISION",
    departments: [
      [null, null, [["Chief Medical Professional Staff II", 25, 1], ["Administrative Assistant II", 8, 1]]],
      ["Department of Internal Medicine", "DEPARTMENT", [["Medical Specialist III", 24, 1], ["Medical Specialist II", 23, 3], ["Medical Officer III", 21, 4]]],
      ["Department of Surgery", "DEPARTMENT", [["Medical Specialist III", 24, 1], ["Medical Specialist II", 23, 3], ["Medical Officer III", 21, 3]]],
      ["Department of Obstetrics and Gynecology", "DEPARTMENT", [["Medical Specialist III", 24, 1], ["Medical Specialist II", 23, 3], ["Medical Officer III", 21, 3]]],
      ["Department of Pediatrics", "DEPARTMENT", [["Medical Specialist III", 24, 1], ["Medical Specialist II", 23, 3], ["Medical Officer III", 21, 3]]],
      ["Department of Anesthesiology", "DEPARTMENT", [["Medical Specialist II", 23, 3], ["Medical Officer III", 21, 1]]],
      ["Emergency Department", "DEPARTMENT", [["Medical Specialist II", 23, 1], ["Medical Officer III", 21, 6]]],
      ["Outpatient Department", "DEPARTMENT", [["Medical Specialist II", 23, 1], ["Medical Officer III", 21, 3]]],
      ["Department of Radiology", "DEPARTMENT", [["Medical Specialist II", 23, 1], ["Radiologic Technologist II", 15, 2], ["Radiologic Technologist I", 11, 4], ["Administrative Aide III", 3, 1]]],
      ["Department of Pathology and Laboratory", "DEPARTMENT", [["Medical Specialist II", 23, 1], ["Medical Technologist II", 15, 3], ["Medical Technologist I", 11, 8], ["Administrative Aide III", 3, 2]]],
      ["Blood Station", "UNIT", [["Medical Technologist II", 15, 1], ["Medical Technologist I", 11, 2]]],
      ["Pharmacy Department", "DEPARTMENT", [["Pharmacist II", 15, 3], ["Pharmacist I", 11, 4], ["Administrative Aide III", 3, 1]]],
      ["Rehabilitation Medicine Unit", "UNIT", [["Physical Therapist II", 15, 1], ["Physical Therapist I", 11, 2]]],
      ["Nutrition and Dietetics Section", "SECTION", [["Nutritionist-Dietitian II", 15, 1], ["Nutritionist-Dietitian I", 11, 3], ["Cook I", 3, 4]]],
      ["Dental Unit", "UNIT", [["Dentist I", 16, 1], ["Administrative Aide III", 3, 1]]],
    ],
  },
  {
    id: 3,
    name: "Nursing Service",
    type: "DIVISION",
    departments: [
      [null, null, [["Nurse VI", 22, 1], ["Nurse V", 20, 2], ["Administrative Assistant I", 7, 1]]],
      ["Medical Ward", "SECTION", [["Nurse IV", 19, 1], ["Nurse II", 16, 4], ["Nurse I", 15, 8], ["Nursing Attendant I", 4, 3]]],
      ["Surgical Ward", "SECTION", [["Nurse IV", 19, 1], ["Nurse II", 16, 3], ["Nurse I", 15, 7], ["Nursing Attendant I", 4, 3]]],
      ["Pediatric Ward", "SECTION", [["Nurse IV", 19, 1], ["Nurse II", 16, 3], ["Nurse I", 15, 6], ["Nursing Attendant I", 4, 2]]],
      ["Obstetrics and Gynecology Ward", "SECTION", [["Nurse IV", 19, 1], ["Nurse II", 16, 3], ["Nurse I", 15, 7], ["Midwife III", 13, 1], ["Midwife I", 9, 3], ["Nursing Attendant I", 4, 2]]],
      ["Intensive Care Unit", "UNIT", [["Nurse IV", 19, 1], ["Nurse II", 16, 3], ["Nurse I", 15, 8]]],
      ["Neonatal Intensive Care Unit", "UNIT", [["Nurse IV", 19, 1], ["Nurse II", 16, 2], ["Nurse I", 15, 6]]],
      ["Emergency Room Nursing", "SECTION", [["Nurse IV", 19, 1], ["Nurse II", 16, 3], ["Nurse I", 15, 8], ["Nursing Attendant I", 4, 3]]],
      ["Operating Room Complex", "SECTION", [["Nurse IV", 19, 1], ["Nurse II", 16, 3], ["Nurse I", 15, 5], ["Nursing Attendant I", 4, 2]]],
      ["Delivery Room Complex", "SECTION", [["Nurse IV", 19, 1], ["Nurse II", 16, 2], ["Nurse I", 15, 4], ["Midwife I", 9, 3]]],
      ["Outpatient Nursing", "SECTION", [["Nurse III", 17, 1], ["Nurse I", 15, 4], ["Nursing Attendant I", 4, 1]]],
      ["Central Sterile Supply Unit", "UNIT", [["Nurse II", 16, 1], ["Nursing Attendant I", 4, 3]]],
      ["Nursing Education and Training Unit", "UNIT", [["Nurse IV", 19, 1], ["Nurse III", 17, 1]]],
    ],
  },
  {
    id: 4,
    name: "Hospital Operations and Patient Support Service",
    type: "DIVISION",
    departments: [
      [null, null, [["Chief Administrative Officer", 24, 1], ["Administrative Assistant II", 8, 1]]],
      ["Human Resource Management Section", "SECTION", [["Administrative Officer IV", 15, 1], ["Administrative Officer II", 11, 1], ["Administrative Assistant II", 8, 1]]],
      ["Administrative Support Section", "SECTION", [["Administrative Officer III", 14, 1], ["Administrative Assistant III", 9, 1], ["Administrative Aide III", 3, 2]]],
      ["Supply and Property Management Section", "SECTION", [["Administrative Officer IV", 15, 1], ["Administrative Officer II", 11, 1], ["Administrative Assistant II", 8, 2], ["Administrative Aide III", 3, 2]]],
      ["Budget Section", "SECTION", [["Administrative Officer IV", 15, 1], ["Administrative Assistant III", 9, 1]]],
      ["Accounting Section", "SECTION", [["Accountant III", 18, 1], ["Accountant II", 16, 1], ["Administrative Assistant III", 9, 1]]],
      ["Cashier Section", "SECTION", [["Administrative Officer III", 14, 1], ["Administrative Assistant II", 8, 2]]],
      ["Billing and Claims Section", "SECTION", [["Administrative Officer II", 11, 1], ["Administrative Assistant II", 8, 3]]],
      ["Health Information Management Section", "SECTION", [["Administrative Officer II", 11, 1], ["Administrative Assistant II", 8, 2], ["Administrative Aide III", 3, 3]]],
      ["Information and Communications Technology Unit", "UNIT", [["Information Technology Officer I", 19, 1], ["Computer Maintenance Technologist I", 11, 1]]],
      ["Engineering and Maintenance Section", "SECTION", [["Engineer III", 19, 1], ["Administrative Aide VI", 6, 2], ["Administrative Aide IV", 4, 2]]],
      ["Housekeeping, Laundry and Linen Unit", "UNIT", [["Administrative Aide III", 3, 3], ["Administrative Aide I", 1, 10]]],
      ["Security Unit", "UNIT", [["Administrative Aide IV", 4, 3]]],
      ["Transport and Motorpool Unit", "UNIT", [["Administrative Aide IV", 4, 1], ["Administrative Aide III", 3, 3]]],
      ["Medical Social Work Section", "SECTION", [["Medical Social Worker II", 15, 1], ["Medical Social Worker I", 11, 2]]],
    ],
  },
];

// ─── Derived: flat Personnel Schedule rows (with item-number ranges) ─────────
export function buildScheduleRows() {
  const rows = [];
  let counter = 1;
  for (const div of PSCHED_DIVISIONS) {
    for (const [deptName, deptType, positions] of div.departments) {
      for (const [title, sg, slots] of positions) {
        const start = counter;
        const end = counter + slots - 1;
        counter = end + 1;
        const pad = (n) => String(n).padStart(4, "0");
        rows.push({
          key: `${div.id}-${deptName ?? "direct"}-${title}`,
          division: div.name,
          divisionType: div.type,
          department: deptName,
          departmentType: deptType,
          title,
          sg,
          slots,
          itemNos: slots === 1 ? pad(start) : `${pad(start)}–${pad(end)}`,
        });
      }
    }
  }
  return rows;
}

// ─── Derived: seed for the Department Database ──────────────────────────────
// Names/types/hierarchy come straight from the schedule above. `linked` is the
// number of plantilla slots already attached to each unit.
export function buildDepartmentSeed() {
  const divisions = [];
  const departments = [];
  let deptId = 1;
  for (const div of PSCHED_DIVISIONS) {
    let divLinked = 0;
    for (const [deptName, deptType, positions] of div.departments) {
      const slots = positions.reduce((s, p) => s + p[2], 0);
      if (deptName === null) {
        divLinked += slots;
        continue;
      }
      departments.push({
        id: deptId++,
        name: deptName,
        type: deptType,
        kind: "department",
        division_id: div.id,
        status: "ACTIVE",
        linked_count: slots,
      });
    }
    divisions.push({
      id: div.id,
      name: div.name,
      type: div.type,
      kind: "division",
      status: "ACTIVE",
      linked_count: divLinked,
    });
  }
  return { divisions, departments };
}
