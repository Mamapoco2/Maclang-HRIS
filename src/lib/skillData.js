// e-TNA All Employee Self-Assessment Tool (36 statements)
// Scale: 1 Very Poor | 2 Poor | 3 Fair | 4 Good | 5 Excellent

const s = (no, category, name, description) => ({
  id: `q${no}`,
  no,
  name,
  description,
  category,
});

export const SKILLS = [
  // Communication
  s(
    1,
    "communication",
    "Dialogue & Feedback",
    "I encourage dialogue and use appropriate techniques to gather opinions and feedback.",
  ),
  s(
    8,
    "communication",
    "Written Communication",
    "I compose clear, direct, concise, complete messages (correct vocabulary, spelling, grammar).",
  ),
  s(
    12,
    "communication",
    "Oral Communication",
    "I display good oral communication skills.",
  ),
  s(16, "communication", "Active Listening", "I listen carefully."),
  s(
    36,
    "communication",
    "Presentation Skills",
    "I am able to deliver influential presentation.",
  ),

  // Service & Integrity
  s(
    3,
    "service",
    "Integrity",
    "I consistently operate with integrity in my daily activities and stand for the truth without compromise.",
  ),
  s(
    6,
    "service",
    "Loyalty & Dedication",
    "I express loyalty and dedication to QCG in interaction with others.",
  ),
  s(
    7,
    "service",
    "Customer Satisfaction",
    "I seek ways to meet and increase customer's satisfaction.",
  ),
  s(
    9,
    "service",
    "Customer-Focused Service",
    "I pursue the best customer-focused responses that add value to the QCG service delivery system.",
  ),
  s(
    13,
    "service",
    "Public Service Ethics",
    "I uphold public service ethics and accountability.",
  ),
  s(30, "service", "Confidentiality", "I secure confidential information."),

  // Leadership & Collaboration
  s(
    4,
    "leadership",
    "Recognition",
    "I recognize and reward people for doing their best.",
  ),
  s(
    11,
    "leadership",
    "Teamwork",
    "I work well with others and encourage collaboration among fellow employees to achieve common objectives & organizational goals.",
  ),
  s(
    14,
    "leadership",
    "Vision",
    "I am able to envision possibilities and help shape the future of the institution and its mission.",
  ),
  s(
    15,
    "leadership",
    "Networking",
    "I collaborate and network with others across organizational boundaries.",
  ),
  s(
    18,
    "leadership",
    "Confidence in Others",
    "I display confidence in others' abilities and talents.",
  ),
  s(
    19,
    "leadership",
    "Articulating Mission",
    "I articulate the vision and mission of the institution to all.",
  ),
  s(
    23,
    "leadership",
    "Performance Feedback",
    "I regularly meet with staff to discuss job performance & give direct, constructive, and actionable feedback.",
  ),
  s(
    24,
    "leadership",
    "Influence",
    "I influence others in a way that results in acceptance, agreement, or behavior change.",
  ),
  s(
    25,
    "leadership",
    "Empowerment",
    "I empower others to achieve results and hold them accountable for actions.",
  ),
  s(
    28,
    "leadership",
    "Motivation",
    "I motivate people in order to reach organizational goals and hold them accountable for actions.",
  ),
  s(
    31,
    "leadership",
    "Work Allocation",
    "I am able to align manpower, design work, and allocate tasks to achieve goals.",
  ),
  s(
    34,
    "leadership",
    "Developing Team Talent",
    "I accurately attend to ideas and talents of my staff and team members.",
  ),

  // Adaptability & Growth
  s(
    10,
    "growth",
    "Responding to Change",
    "I respond and adapt effectively to the changing organization, programs, new direction, & responsibilities to meet the needs of the situation.",
  ),
  s(
    20,
    "growth",
    "Continuous Learning",
    "I seek and utilize opportunities for continuous learning and self-development.",
  ),
  s(
    21,
    "growth",
    "Supporting Innovation",
    "I support the development of new products, services, methods, or procedures.",
  ),
  s(
    22,
    "growth",
    "Personal Accountability",
    "I take personal responsibility for the quality and timeliness of work, and achieves results with little oversight. I get the job done.",
  ),
  s(
    26,
    "growth",
    "Adaptability",
    "I adapt and support changing business needs, conditions, and work responsibilities.",
  ),
  s(
    32,
    "growth",
    "Receiving Feedback",
    "I receive constructive criticism and suggestion from others.",
  ),
  s(
    33,
    "growth",
    "Creativity",
    "I come up with creative ideas, processes and resources that can lead to new and improved programs and systems.",
  ),

  // Planning & Problem Solving
  s(
    2,
    "planning",
    "Decision Making",
    "I address concerns in an appropriate, timely, and professional manner after adequately contemplating available courses of action.",
  ),
  s(
    5,
    "planning",
    "Analysis",
    "I select and use appropriate techniques for analysis.",
  ),
  s(
    17,
    "planning",
    "Information Management",
    "I ensure information is complete, accurate, and managed in a systematic and orderly manner.",
  ),
  s(
    27,
    "planning",
    "Planning & Monitoring",
    "I set up and monitor time frames and plans.",
  ),
  s(
    29,
    "planning",
    "Anticipating Obstacles",
    "I anticipate unexpected hurdles or obstacles to a plan or project.",
  ),
  s(
    35,
    "planning",
    "Problem Solving",
    "I identify problems early on and generate alternate solutions to problems and challenges.",
  ),
];

export const CATEGORY_LABELS = {
  communication: "Communication",
  service: "Service & Integrity",
  leadership: "Leadership & Collaboration",
  growth: "Adaptability & Growth",
  planning: "Planning & Problem Solving",
};

export const CATEGORY_COLORS = {
  communication: "bg-sky-50 border-sky-200 text-sky-700",
  service: "bg-emerald-50 border-emerald-200 text-emerald-700",
  leadership: "bg-violet-50 border-violet-200 text-violet-700",
  growth: "bg-amber-50 border-amber-200 text-amber-700",
  planning: "bg-rose-50 border-rose-200 text-rose-700",
};

export const RATING_LABELS = {
  1: "Very Poor",
  2: "Poor",
  3: "Fair",
  4: "Good",
  5: "Excellent",
};

// Recommendations are per category (a gap in any item shows its category's plan)
export const RECOMMENDATIONS = {
  communication: {
    actions: [
      "Attend business writing and public speaking workshops",
      "Practice active listening and feedback techniques",
      "Volunteer to present in team meetings",
    ],
    resources: [
      "Online communication courses (sync + async)",
      "Office writing style guide",
      "Presentation skills training",
    ],
    managerSupport: [
      "Give regular one-on-one feedback",
      "Provide chances to present or draft memos",
      "Model clear communication",
    ],
    timeline: "2–3 months",
  },
  service: {
    actions: [
      "Attend RA 6713 (Code of Conduct) orientation",
      "Take customer service excellence training",
      "Review confidentiality and data handling rules",
    ],
    resources: [
      "RA 6713 and Civil Service guidelines",
      "Citizen's Charter",
      "Client feedback results",
    ],
    managerSupport: [
      "Discuss real service scenarios",
      "Recognize good service behavior",
      "Clarify confidentiality expectations",
    ],
    timeline: "1–2 months",
  },
  leadership: {
    actions: [
      "Join coaching, mentoring or leadership programs",
      "Practice giving constructive feedback",
      "Lead a small team task or project",
    ],
    resources: [
      "Leadership and supervisory courses",
      "Mentoring programs",
      "Team management readings",
    ],
    managerSupport: [
      "Assign a mentor",
      "Delegate progressively larger responsibilities",
      "Review progress in regular check-ins",
    ],
    timeline: "3–6 months",
  },
  growth: {
    actions: [
      "Set a personal learning goal each quarter",
      "Ask for feedback and act on it",
      "Take part in job rotation or new assignments",
    ],
    resources: [
      "Learning and development calendar",
      "Change management primers",
      "Peer learning sessions",
    ],
    managerSupport: [
      "Agree on an Individual Development Plan",
      "Give stretch assignments",
      "Encourage idea sharing",
    ],
    timeline: "3–6 months",
  },
  planning: {
    actions: [
      "Take basic project planning and time management training",
      "Practice problem-solving frameworks (e.g., root cause analysis)",
      "Improve records and filing/data management habits",
    ],
    resources: [
      "Excel and data management training",
      "Planning templates and checklists",
      "Problem-solving workshops",
    ],
    managerSupport: [
      "Help set timelines and milestones",
      "Review plans before execution",
      "Debrief problems and solutions together",
    ],
    timeline: "2–4 months",
  },
};
