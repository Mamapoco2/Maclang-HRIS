// ============================================================
// Constants & Mock Data
// ============================================================

export const DEPARTMENTS = ["All", "Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"];
export const STATUS_OPTIONS = ["All", "On Track", "At Risk", "Completed", "Not Started"];
export const ITEMS_PER_PAGE = 8;

export const KPI_DATA = [
  { label: "Total Trainings", value: 248, change: +12, icon: "BookOpen", color: "indigo" },
  { label: "Completion Rate", value: "84%", change: +6, icon: "CheckCircle", color: "emerald" },
  { label: "Avg Effectiveness", value: "7.8/10", change: +0.4, icon: "Award", color: "amber" },
  { label: "Skill Improvement", value: "31%", change: +5, icon: "TrendingUp", color: "sky" },
  { label: "Participation", value: 1420, change: +87, icon: "Users", color: "violet" },
];

export const PRE_POST_DATA = [
  { dept: "Engineering", pre: 62, post: 81 },
  { dept: "Sales", pre: 55, post: 76 },
  { dept: "Marketing", pre: 58, post: 79 },
  { dept: "HR", pre: 70, post: 88 },
  { dept: "Finance", pre: 65, post: 83 },
  { dept: "Operations", pre: 60, post: 78 },
];

export const MONTHLY_TREND = [
  { month: "Jan", completions: 38, enrolled: 52, effectiveness: 7.1 },
  { month: "Feb", completions: 42, enrolled: 55, effectiveness: 7.3 },
  { month: "Mar", completions: 51, enrolled: 63, effectiveness: 7.5 },
  { month: "Apr", completions: 48, enrolled: 59, effectiveness: 7.4 },
  { month: "May", completions: 60, enrolled: 71, effectiveness: 7.8 },
  { month: "Jun", completions: 55, enrolled: 68, effectiveness: 7.6 },
  { month: "Jul", completions: 67, enrolled: 78, effectiveness: 8.0 },
  { month: "Aug", completions: 72, enrolled: 84, effectiveness: 8.2 },
  { month: "Sep", completions: 65, enrolled: 76, effectiveness: 7.9 },
  { month: "Oct", completions: 78, enrolled: 90, effectiveness: 8.4 },
  { month: "Nov", completions: 82, enrolled: 96, effectiveness: 8.5 },
  { month: "Dec", completions: 88, enrolled: 102, effectiveness: 8.7 },
];

export const GAP_REDUCTION = [
  { month: "Q1", gap: 38 },
  { month: "Q2", gap: 32 },
  { month: "Q3", gap: 26 },
  { month: "Q4", gap: 19 },
];

export const EMPLOYEES = [
  { id: 1, name: "Alexandra Chen", dept: "Engineering", current: 6, required: 9, gap: 3, training: "Advanced React & System Design", status: "At Risk" },
  { id: 2, name: "Marcus Williams", dept: "Sales", current: 7, required: 9, gap: 2, training: "Strategic Selling Masterclass", status: "On Track" },
  { id: 3, name: "Priya Sharma", dept: "Marketing", current: 8, required: 9, gap: 1, training: "Digital Analytics Pro", status: "Completed" },
  { id: 4, name: "James O'Brien", dept: "HR", current: 5, required: 8, gap: 3, training: "People Analytics & HRIS", status: "At Risk" },
  { id: 5, name: "Sofia Reyes", dept: "Finance", current: 7, required: 8, gap: 1, training: "FP&A Advanced Modeling", status: "On Track" },
  { id: 6, name: "Tyler Brooks", dept: "Engineering", current: 4, required: 9, gap: 5, training: "Cloud Architecture & DevOps", status: "At Risk" },
  { id: 7, name: "Amara Diallo", dept: "Operations", current: 6, required: 7, gap: 1, training: "Lean Six Sigma Green Belt", status: "Completed" },
  { id: 8, name: "Nathan Kim", dept: "Sales", current: 5, required: 8, gap: 3, training: "Enterprise Sales Leadership", status: "Not Started" },
  { id: 9, name: "Isabella Turner", dept: "Marketing", current: 7, required: 8, gap: 1, training: "Content Strategy & SEO", status: "On Track" },
  { id: 10, name: "David Okafor", dept: "Engineering", current: 8, required: 9, gap: 1, training: "ML Engineering Fundamentals", status: "On Track" },
  { id: 11, name: "Lily Zhang", dept: "Finance", current: 6, required: 9, gap: 3, training: "Risk Management & Compliance", status: "At Risk" },
  { id: 12, name: "Ethan Murphy", dept: "HR", current: 7, required: 8, gap: 1, training: "Organizational Development", status: "Completed" },
  { id: 13, name: "Nadia Petrov", dept: "Operations", current: 5, required: 8, gap: 3, training: "Supply Chain Optimization", status: "Not Started" },
  { id: 14, name: "Carlos Mendez", dept: "Sales", current: 8, required: 9, gap: 1, training: "Key Account Management", status: "On Track" },
  { id: 15, name: "Aisha Johnson", dept: "Engineering", current: 6, required: 8, gap: 2, training: "Security & Compliance Engineering", status: "On Track" },
  { id: 16, name: "Felix Wagner", dept: "Marketing", current: 4, required: 8, gap: 4, training: "Brand Strategy & Positioning", status: "At Risk" },
];

export const FEEDBACK = [
  { id: 1, name: "Alexandra Chen", dept: "Engineering", training: "Advanced React & System Design", rating: 9, sentiment: "positive", comment: "Incredibly well structured. The hands-on labs made complex concepts click. The instructor's real-world examples were invaluable.", trainerScore: 9.2, date: "Nov 28, 2024" },
  { id: 2, name: "Marcus Williams", dept: "Sales", training: "Strategic Selling Masterclass", rating: 8, sentiment: "positive", comment: "Very practical approach. Role-play scenarios were realistic and the SPIN methodology section was a game-changer for our team.", trainerScore: 8.7, date: "Nov 25, 2024" },
  { id: 3, name: "James O'Brien", dept: "HR", training: "People Analytics & HRIS", rating: 6, sentiment: "neutral", comment: "Content was solid but the pacing felt rushed. Would benefit from more time on the data visualization module.", trainerScore: 7.1, date: "Nov 20, 2024" },
  { id: 4, name: "Tyler Brooks", dept: "Engineering", training: "Cloud Architecture & DevOps", rating: 4, sentiment: "negative", comment: "Expected deeper coverage of Kubernetes orchestration. The foundational content was too basic for our senior engineers.", trainerScore: 5.8, date: "Nov 18, 2024" },
  { id: 5, name: "Sofia Reyes", dept: "Finance", training: "FP&A Advanced Modeling", rating: 10, sentiment: "positive", comment: "Best training I've attended in years. The financial modeling templates are immediately applicable. Trainer was exceptional.", trainerScore: 9.8, date: "Nov 15, 2024" },
];

export const EMPLOYEE_PROFILES = [
  {
    id: 1, name: "Alexandra Chen", dept: "Engineering", role: "Senior Engineer", completion: 72,
    timeline: [
      { date: "Jan 2024", event: "Onboarding Complete", done: true },
      { date: "Mar 2024", event: "React Fundamentals", done: true },
      { date: "Jun 2024", event: "System Design Course", done: true },
      { date: "Sep 2024", event: "Advanced React", done: false },
      { date: "Dec 2024", event: "Architecture Certification", done: false },
    ],
    skills: [
      { skill: "React/TS", score: 82 },
      { skill: "System Design", score: 68 },
      { skill: "Cloud/AWS", score: 55 },
      { skill: "Leadership", score: 71 },
      { skill: "Data Structures", score: 78 },
      { skill: "DevOps", score: 60 },
    ],
    radar: [
      { subject: "Technical", A: 82, fullMark: 100 },
      { subject: "Problem Solving", A: 78, fullMark: 100 },
      { subject: "Communication", A: 71, fullMark: 100 },
      { subject: "Leadership", A: 65, fullMark: 100 },
      { subject: "Collaboration", A: 88, fullMark: 100 },
      { subject: "Innovation", A: 75, fullMark: 100 },
    ],
  },
];

export const AI_INSIGHTS = [
  { id: 1, type: "urgent", iconName: "AlertTriangle", color: "rose", title: "3 Engineers need urgent upskilling", detail: "Tyler Brooks, Nadia Petrov, and Felix Wagner show skill gaps of 4–5 points. Without intervention, project delivery risk increases 40% in Q1 2025.", action: "Schedule intensive workshops" },
  { id: 2, type: "top", iconName: "Award", color: "emerald", title: "FP&A Modeling is most effective program", detail: "Finance's FP&A Advanced Modeling shows a 96% satisfaction rate and 28-point average skill improvement — highest ROI across all 2024 programs.", action: "Expand to adjacent teams" },
  { id: 3, type: "gap", iconName: "Target", color: "amber", title: "Engineering & Operations highest gap departments", detail: "Average skill gap of 2.8 in Engineering and 2.5 in Operations vs company average of 1.9. Budget reallocation recommended for Q1.", action: "Review training budget" },
  { id: 4, type: "suggest", iconName: "Lightbulb", color: "sky", title: "AI/ML literacy training recommended company-wide", detail: "Skill gap analysis indicates 68% of non-technical roles lack foundational AI literacy. A structured 4-week program could close this gap significantly.", action: "Create learning path" },
];
