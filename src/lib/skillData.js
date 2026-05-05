export const SKILLS = [
  // Clinical/Medical Skills (for Doctors)
  {
    id: "diagnostic-skills",
    name: "Diagnostic & Clinical Assessment",
    description: "Ability to accurately diagnose and assess patient conditions",
    category: "clinical",
    weight: 3,
  },
  {
    id: "treatment-planning",
    name: "Treatment Planning & Prescription",
    description: "Formulating appropriate treatment plans and prescriptions",
    category: "clinical",
    weight: 3,
  },
  {
    id: "patient-consultation",
    name: "Patient Consultation & Communication",
    description:
      "Effective communication with patients about diagnosis and treatment",
    category: "clinical",
    weight: 3,
  },
  {
    id: "medical-research",
    name: "Medical Research & Evidence-Based Practice",
    description:
      "Staying current with medical literature and evidence-based guidelines",
    category: "clinical",
    weight: 2,
  },
  {
    id: "specialist-knowledge",
    name: "Specialist Knowledge & Expertise",
    description: "Depth of knowledge in your specialty area",
    category: "clinical",
    weight: 3,
  },

  // Administrative Management Skills
  {
    id: "budget-management",
    name: "Budget & Financial Management",
    description:
      "Managing departmental budgets, cost control, and financial reporting",
    category: "administrative",
    weight: 3,
  },
  {
    id: "staff-management",
    name: "Staff Management & Leadership",
    description: "Supervising, scheduling, and developing staff members",
    category: "administrative",
    weight: 3,
  },
  {
    id: "quality-assurance",
    name: "Quality Assurance & Performance Monitoring",
    description:
      "Implementing quality standards and monitoring departmental performance",
    category: "administrative",
    weight: 3,
  },
  {
    id: "workflow-optimization",
    name: "Workflow Optimization & Process Improvement",
    description: "Streamlining processes and improving operational efficiency",
    category: "administrative",
    weight: 2,
  },
  {
    id: "strategic-planning",
    name: "Strategic Planning & Goal Setting",
    description: "Developing departmental strategies and long-term goals",
    category: "administrative",
    weight: 3,
  },
  {
    id: "vendor-management",
    name: "Vendor & Supply Chain Management",
    description: "Managing equipment, supplies, and vendor relationships",
    category: "administrative",
    weight: 2,
  },

  // Technical/Digital Skills
  {
    id: "his-system",
    name: "Hospital Information System (HIS/EMR)",
    description:
      "Proficiency in the hospital's HIS/EMR and clinical documentation",
    category: "technical",
    weight: 3,
  },
  {
    id: "pacs-lis",
    name: "PACS & Laboratory Information System",
    description: "Using Picture Archiving Systems and lab management software",
    category: "technical",
    weight: 2,
  },
  {
    id: "data-analytics",
    name: "Data Analytics & Reporting",
    description: "Analyzing healthcare data and generating performance reports",
    category: "technical",
    weight: 2,
  },
  {
    id: "ms-office",
    name: "MS Office & Advanced Excel",
    description:
      "Advanced use of spreadsheets for data management and analysis",
    category: "technical",
    weight: 2,
  },

  // Soft Skills
  {
    id: "communication",
    name: "Professional Communication",
    description:
      "Clear communication with patients, staff, and other healthcare professionals",
    category: "soft",
    weight: 3,
  },
  {
    id: "leadership",
    name: "Leadership & Decision Making",
    description:
      "Leading teams effectively and making sound clinical/administrative decisions",
    category: "soft",
    weight: 3,
  },
  {
    id: "teamwork",
    name: "Multidisciplinary Teamwork",
    description:
      "Collaborating effectively with other departments and specialties",
    category: "soft",
    weight: 3,
  },
  {
    id: "conflict-resolution",
    name: "Conflict Resolution & Negotiation",
    description:
      "Managing disagreements and negotiating solutions diplomatically",
    category: "soft",
    weight: 2,
  },
  {
    id: "time-management",
    name: "Time Management & Prioritization",
    description: "Managing multiple tasks and prioritizing urgent matters",
    category: "soft",
    weight: 3,
  },
  {
    id: "critical-thinking",
    name: "Critical Thinking & Problem Solving",
    description:
      "Analyzing complex situations and implementing effective solutions",
    category: "soft",
    weight: 3,
  },
  {
    id: "stress-management",
    name: "Stress & Resilience Management",
    description: "Coping effectively under pressure in high-stress situations",
    category: "soft",
    weight: 2,
  },

  // Compliance & Regulatory
  {
    id: "philhealth-doh",
    name: "PhilHealth & DOH Compliance",
    description:
      "Understanding and adhering to PhilHealth accreditation and DOH requirements",
    category: "compliance",
    weight: 3,
  },
  {
    id: "patient-safety",
    name: "Patient Safety & Risk Management",
    description:
      "Implementing patient safety protocols and managing clinical risks",
    category: "compliance",
    weight: 3,
  },
  {
    id: "data-privacy",
    name: "Data Privacy & HIPAA Compliance",
    description:
      "Adherence to RA 10173 (Data Privacy Act) and patient confidentiality",
    category: "compliance",
    weight: 3,
  },
  {
    id: "medical-records",
    name: "Medical Records Management & Documentation",
    description:
      "Proper documentation, filing, and retention of medical records",
    category: "compliance",
    weight: 3,
  },
  {
    id: "professional-ethics",
    name: "Professional Ethics & Medical Practice Standards",
    description: "Upholding ethical standards and PMA/PSI code of ethics",
    category: "compliance",
    weight: 3,
  },
];

export const RECOMMENDATIONS = [
  {
    skillId: "diagnostic-skills",
    threshold: 3,
    actions: [
      "Attend diagnostic skills refresher workshops",
      "Participate in case study reviews with colleagues",
      "Enroll in specialized diagnostic training programs",
    ],
    resources: [
      "Clinical Guidelines (PMA, WHO)",
      "Diagnostic Imaging Atlas",
      "CME Courses on Clinical Diagnosis",
    ],
    managerSupport: [
      "Schedule regular case reviews",
      "Encourage peer consultation for challenging cases",
      "Provide access to latest diagnostic tools",
    ],
    timeline: "2–4 months",
  },
  {
    skillId: "his-system",
    threshold: 3,
    actions: [
      "Complete in-house HIS/EMR training modules",
      "Practice with test environment",
      "One-on-one mentoring from IT specialists",
    ],
    resources: [
      "HIS User Manual & Training Videos",
      "IT Department helpdesk support",
      "Online EMR certification courses",
    ],
    managerSupport: [
      "Allow time during clinic for HIS practice",
      "Pair with HIS power users",
      "Monitor system usage and provide feedback",
    ],
    timeline: "2–4 weeks",
  },
  {
    skillId: "staff-management",
    threshold: 3,
    actions: [
      "Enroll in healthcare management/leadership courses",
      "Attend staff development workshops",
      "Participate in mentoring and coaching programs",
    ],
    resources: [
      "Healthcare Leadership Courses",
      "PMA Management Training Programs",
      "Articles on Effective Team Management",
    ],
    managerSupport: [
      "Assign a leadership mentor",
      "Include in management meetings",
      "Provide regular feedback and coaching",
    ],
    timeline: "3–6 months",
  },
  {
    skillId: "budget-management",
    threshold: 3,
    actions: [
      "Complete financial management training",
      "Review departmental budget processes",
      "Attend cost-control and efficiency workshops",
    ],
    resources: [
      "Healthcare Financial Management Guide",
      "Budget Planning Templates",
      "Finance Department Training Sessions",
    ],
    managerSupport: [
      "Assign finance mentor",
      "Include in budget planning meetings",
      "Provide monthly financial reports for review",
    ],
    timeline: "2–3 months",
  },
  {
    skillId: "communication",
    threshold: 3,
    actions: [
      "Attend professional communication workshops",
      "Practice SBAR technique for patient/team communication",
      "Participate in presentation skills training",
    ],
    resources: [
      "SBAR Communication Framework",
      "Healthcare Communication Best Practices",
      "Presentation Skills Workshops",
    ],
    managerSupport: [
      "Conduct regular 1-on-1 check-ins",
      "Model effective communication",
      "Provide feedback on patient interactions",
    ],
    timeline: "Ongoing",
  },
  {
    skillId: "philhealth-doh",
    threshold: 3,
    actions: [
      "Attend PhilHealth accreditation briefings",
      "Review updated DOH Administrative Orders",
      "Complete compliance certification programs",
    ],
    resources: [
      "PhilHealth Circular Updates",
      "DOH Department Orders & Guidelines",
      "Compliance Training Modules",
    ],
    managerSupport: [
      "Share compliance updates proactively",
      "Include compliance in department meetings",
      "Conduct quarterly compliance audits",
    ],
    timeline: "1–2 months",
  },
  {
    skillId: "quality-assurance",
    threshold: 3,
    actions: [
      "Enroll in quality improvement methodologies (Six Sigma, Lean)",
      "Lead quality improvement projects",
      "Participate in accreditation preparation",
    ],
    resources: [
      "Quality Improvement Frameworks",
      "JCI/PhilHealth Accreditation Standards",
      "Performance Metrics & KPI Training",
    ],
    managerSupport: [
      "Support quality improvement initiatives",
      "Provide access to quality tools and data",
      "Celebrate improvements and successes",
    ],
    timeline: "3–6 months",
  },
  {
    skillId: "data-analytics",
    threshold: 3,
    actions: [
      "Complete data analytics training",
      "Learn advanced Excel functions",
      "Practice with hospital reporting tools",
    ],
    resources: [
      "Excel for Healthcare Data Analysis",
      "Hospital Dashboard Training",
      "Analytics Software Tutorials",
    ],
    managerSupport: [
      "Provide access to data sources",
      "Assign analytics projects",
      "Share insights from data analysis",
    ],
    timeline: "2–3 months",
  },
];

export const CATEGORY_LABELS = {
  clinical: "Clinical & Medical Skills",
  administrative: "Administrative & Management",
  technical: "Technical & Digital Skills",
  soft: "Soft Skills & Leadership",
  compliance: "Compliance & Regulatory",
};

export const CATEGORY_COLORS = {
  clinical: "bg-rose-50 border-rose-200 text-rose-700",
  administrative: "bg-violet-50 border-violet-200 text-violet-700",
  technical: "bg-sky-50 border-sky-200 text-sky-700",
  soft: "bg-amber-50 border-amber-200 text-amber-700",
  compliance: "bg-emerald-50 border-emerald-200 text-emerald-700",
};
