// RMBGH Orientation — Pre & Post-Test question bank
// Transcribed from: QCG.RMBGH.HRD.F.17
// The same 35-item test is used for both the Pre-Test and Post-Test.

let _id = 0;
const q = (part, text, options, answer) => ({
  id: ++_id,
  part,
  text,
  options,
  answer, // index into options
});

export const ORIENTATION_QUESTIONS = [
  // ── Part I: RMBGH Vision / Mission / Core Values ──────────────────────
  q(
    "Part I: RMBGH Vision/Mission/Core Values",
    "What is the primary mission of the hospital?",
    [
      "To become the largest hospital in the country",
      "To provide accessible, compassionate, and quality healthcare guided by integrity, innovation, and excellence in public service",
      "To focus only on specialized healthcare services",
    ],
    1,
  ),
  q(
    "Part I: RMBGH Vision/Mission/Core Values",
    "Which principle is included in the hospital's mission?",
    ["Innovation", "Competition", "Profitability"],
    0,
  ),
  q(
    "Part I: RMBGH Vision/Mission/Core Values",
    "The hospital's vision describes it as a:",
    [
      "Private medical center",
      "Research institution",
      "Responsive, resilient, and recognized government tertiary hospital",
    ],
    2,
  ),
  q(
    "Part I: RMBGH Vision/Mission/Core Values",
    "Which of the following is emphasized in the hospital's vision?",
    ["Health equity", "Financial growth", "International expansion"],
    0,
  ),
  q(
    "Part I: RMBGH Vision/Mission/Core Values",
    'What does the letter "C" in RMBGH CARES stand for?',
    ["Cooperation", "Compassion", "Commitment"],
    1,
  ),
  q(
    "Part I: RMBGH Vision/Mission/Core Values",
    "Which core value means taking ownership of outcomes?",
    ["Accountability", "Resilience", "Service"],
    0,
  ),
  q(
    "Part I: RMBGH Vision/Mission/Core Values",
    "Which core value is described as rising above challenges with strength?",
    ["Excellence", "Accountability", "Resilience"],
    2,
  ),
  q(
    "Part I: RMBGH Vision/Mission/Core Values",
    "Which core value focuses on commitment to the highest standards?",
    ["Service", "Excellence", "Compassion"],
    1,
  ),
  q(
    "Part I: RMBGH Vision/Mission/Core Values",
    '"We exist to serve with dignity" refers to:',
    ["Service", "Accountability", "Resilience"],
    0,
  ),
  q(
    "Part I: RMBGH Vision/Mission/Core Values",
    "Employees contribute to the hospital's mission and vision by:",
    [
      "Demonstrating the RMBGH CARES values in their daily work",
      "Focusing only on their assigned tasks",
      "Prioritizing personal interests over patient needs",
    ],
    0,
  ),

  // ── Part II: Quality Policy & Service Pledge ──────────────────────────
  q(
    "Part II: Quality Policy & Service Pledge",
    "In the quality policy it is important that it should be anchored on the principles of ___ and administration.",
    ["Integrity", "Good governance", "Transparency"],
    1,
  ),
  q(
    "Part II: Quality Policy & Service Pledge",
    'It indicates in the Quality Policy: "Matatag, ___, at Maaasahang Pamunuan."',
    ["Masipag", "Magalang", "Mapagkakatiwalaan"],
    2,
  ),
  q(
    "Part II: Quality Policy & Service Pledge",
    "In the service pledge of RMBGH it is said that it should be commit to deliver ___.",
    ["High Quality Service", "Exceptional Work", "High Quality of Care"],
    0,
  ),
  q(
    "Part II: Quality Policy & Service Pledge",
    'Does "Treat everyone equally" included in the Service Pledge?',
    ["TRUE", "FALSE"],
    0,
  ),

  // ── Part III: RMBGH Offenses ───────────────────────────────────────────
  q(
    "Part III: RMBGH-Offenses",
    "What kind of Offense is (Dishonesty)?",
    ["Less Grave Offense", "Light Offense", "Grave Offense"],
    2,
  ),
  q(
    "Part III: RMBGH-Offenses",
    "What kind of Offense is (Violation of reasonable office rules and regulations which include habitual tardiness)?",
    ["Less Grave Offense", "Light Offense", "Grave Offense"],
    1,
  ),
  q(
    "Part III: RMBGH-Offenses",
    "What kind of offense is (Falsification of official document)?",
    ["Less Grave Offense", "Light Offense", "Grave Offense"],
    2,
  ),
  q(
    "Part III: RMBGH-Offenses",
    "Do the Categories of Offenses include Grave, Less Grave and Light Offenses?",
    ["True", "False", "None of the Above"],
    0,
  ),
  q(
    "Part III: RMBGH-Offenses",
    "What kind of Offense is (Habitual Drunkenness)?",
    ["Less Grave Offense", "Light Offense", "Grave Offense"],
    0,
  ),
  q(
    "Part III: RMBGH-Offenses",
    "What kind of Offense is (Refusal to render overtime service)?",
    ["Less Grave Offense", "Light Offense", "Grave Offense"],
    1,
  ),
  q(
    "Part III: RMBGH-Offenses",
    "What kind of Offense is (Simple Misconduct)?",
    ["Less Grave Offense", "Light Offense", "Grave Offense"],
    0,
  ),
  q(
    "Part III: RMBGH-Offenses",
    "What kind of Offense is (Refusal to perform official duty)?",
    ["Less Grave Offense", "Light Offense", "Grave Offense"],
    2,
  ),

  // ── Part IV: Republic Act No. 6713, Section 4 ─────────────────────────
  q(
    "Part IV: Republic Act No. 6713, Section 4",
    'What Official Duty states that "Public officials and Employees shall at all times respect the rights of others, and shall refrain from doing acts contrary to law, good morals, good customs, public policy, public order, public safety and public interest"?',
    ["Justness and Sincerity", "Responsiveness to the Public", "Commitment to Public Interest"],
    0,
  ),
  q(
    "Part IV: Republic Act No. 6713, Section 4",
    'What Official Duty states that "All government resources and powers of their respective offices must be employed and used efficiently, effectively, honestly and economically, particularly to avoid wastage in public funds and revenues"?',
    ["Professionalism", "Simple Living", "Commitment to Public Interest"],
    2,
  ),
  q(
    "Part IV: Republic Act No. 6713, Section 4",
    'What Official Duty states that "Public officials and employees shall provide service to everyone without unfair discrimination and regardless of party affiliation or preference"?',
    ["Political Neutrality", "Commitment to Democracy", "Nationalism and Patriotism"],
    0,
  ),

  // ── Part V: RMBGH Organizational Structure ────────────────────────────
  q(
    "Part V: RMBGH Organizational Structure",
    "Who is the Medical Center Chief of RMBGH?",
    [
      "Raymond Rae R. Castañeda, MD",
      "Mario Victor M. Villardo, MD",
      "Dave Anthony A. Vergara, MD, MBAH",
    ],
    2,
  ),
  q(
    "Part V: RMBGH Organizational Structure",
    "Who is the Hospital Director of RMBGH?",
    [
      "Raymond Rae R. Castañeda, MD",
      "Mario Victor M. Villardo, MD",
      "Dave Anthony A. Vergara, MD, MBAH",
    ],
    0,
  ),
  q(
    "Part V: RMBGH Organizational Structure",
    "Who is the Medical Director of RMBGH?",
    [
      "Mario Victor M. Villardo, MD",
      "Raymond Rae R. Castañeda, MD",
      "Dave Anthony A. Vergara, MD, MBAH",
    ],
    0,
  ),
  q(
    "Part V: RMBGH Organizational Structure",
    "Who is the Finance Directorate of RMBGH?",
    ["Ronilo M. Jose, CPA", "Pia Angelina C. Tan, CPA", "Marion May M. Cervera, CHRA, MIR"],
    1,
  ),
  q(
    "Part V: RMBGH Organizational Structure",
    "Who is the Chief of the Hospital Administration Division?",
    [
      "Bradford Antonio C. Martinez, DBA",
      "Raymond Rae R. Castañeda, MD",
      "Dave Anthony A. Vergara, MD, MBAH",
    ],
    0,
  ),

  // ── Part VI: HR Policy ─────────────────────────────────────────────────
  q(
    "Part VI: HR Policy",
    "How many days in advance must a Leave Notification Form be filed?",
    ["At least 3 days in advance", "At least 5 days in advance", "At least 7 days in advance"],
    1,
  ),
  q(
    "Part VI: HR Policy",
    "How many working days of Wellness Leave may be filed at one time, and what restriction applies to these leave days?",
    [
      "A maximum of 3 working days, but these days must not be consecutive or immediately before or after a declared holiday and/or day off.",
      "A maximum of 5 working days, provided that the leave is filed in advance.",
      "A maximum of 2 working days, which may be filed before or after a holiday.",
    ],
    0,
  ),
  q(
    "Part VI: HR Policy",
    "What document do you need if you will leave the hospital premises for official business?",
    ["Travel Authority", "Leave Form", "Locator's Slip"],
    2,
  ),
  q(
    "Part VI: HR Policy",
    "What period does the Regular DTR Payroll cover?",
    [
      "From the 1st to the 30th day of the current month",
      "From the 15th to the 30th day of the current month",
      "From the 26th day of the previous month to the 25th day of the current month",
    ],
    2,
  ),
  q(
    "Part VI: HR Policy",
    "What is the coverage period of the First Salary (Special Payroll) DTR?",
    [
      "From the 26th day of the previous month to the 25th day of the current month",
      "From the employee's start date until the end of the said month",
      "From the 15th day until the end of the month",
    ],
    1,
  ),
];

// Same bank is used for both assessments, per the official form
// ("RMBGH ORIENTATION (Pre & Post-test)").
export const PRE_QUESTIONS = ORIENTATION_QUESTIONS;
export const POST_QUESTIONS = ORIENTATION_QUESTIONS;

export const PASS_SCORE = 80;
