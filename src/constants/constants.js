// CS Form No. 212 (Revised 2025) — shared constants

export const CITIZENSHIPS = [
  "FILIPINO",
  "AMERICAN",
  "AUSTRALIAN",
  "BRITISH",
  "CANADIAN",
  "CHINESE",
  "GERMAN",
  "INDIAN",
  "INDONESIAN",
  "JAPANESE",
  "KOREAN",
  "MALAYSIAN",
  "NEW ZEALANDER",
  "SINGAPOREAN",
  "SPANISH",
  "TAIWANESE",
  "THAI",
  "VIETNAMESE",
  "DUAL CITIZEN (FILIPINO-AMERICAN)",
  "DUAL CITIZEN (FILIPINO-AUSTRALIAN)",
  "DUAL CITIZEN (FILIPINO-CANADIAN)",
  "DUAL CITIZEN (FILIPINO-JAPANESE)",
  "OTHER",
];

export const STEPS = [
  { id: "personal", label: "Personal Information", short: "Personal" },
  { id: "family", label: "Family Background", short: "Family" },
  { id: "education", label: "Educational Background", short: "Education" },
  {
    id: "eligibility",
    label: "Civil Service Eligibility",
    short: "Eligibility",
  },
  { id: "work", label: "Work Experience", short: "Work" },
  { id: "voluntary", label: "Voluntary Work & L&D", short: "Voluntary" },
  { id: "other", label: "Other Information", short: "Other" },
  { id: "questions", label: "Questions", short: "Questions" },
  { id: "references", label: "References & Gov't ID", short: "References" },
];

export const EDU_COLS = [
  { key: "school", label: "Name of School", placeholder: "SCHOOL NAME" },
  { key: "degree", label: "Degree/Course", placeholder: "DEGREE" },
  { key: "period_from", label: "From", type: "date" },
  { key: "period_to", label: "To", type: "date" },
  {
    key: "highest_level",
    label: "Highest Level/Units Earned",
    placeholder: "UNITS",
  },
  { key: "year_graduated", label: "Year Graduated", placeholder: "YYYY" },
  { key: "honors", label: "Scholarship/Honors", placeholder: "HONORS" },
];
