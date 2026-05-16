import type {
  TrackerAssignment,
  TrackerExam,
  DayPlannerBlock,
  CourseRef,
  DailyProgress,
} from "./types";

const now = Date.now();
const d = (daysOffset: number) => new Date(now + daysOffset * 86400000).toISOString();
const ts = () => new Date().toISOString();

// Course color palette — each course gets a distinct, vibrant accent
export const MOCK_COURSES: CourseRef[] = [
  { id: "cs101",   subject: "CS",   number: "101", title: "Intro to Computer Science", cardColor: "sky",    colorAccent: "#2563eb" },
  { id: "math201", subject: "MATH", number: "201", title: "Calculus II",               cardColor: "amber",  colorAccent: "#d97706" },
  { id: "eng102",  subject: "ENG",  number: "102", title: "English Composition",       cardColor: "teal",   colorAccent: "#0d9488" },
  { id: "phys301", subject: "PHYS", number: "301", title: "Physics III",               cardColor: "violet", colorAccent: "#7c3aed" },
  { id: "hist150", subject: "HIST", number: "150", title: "World History",             cardColor: "rose",   colorAccent: "#e11d48" },
];

export const MOCK_ASSIGNMENTS: TrackerAssignment[] = [
  {
    id: "a1", courseId: "cs101", courseCode: "CS 101", courseColor: "#2563eb",
    title: "Lab 1: Variables & Data Types",
    description: "Complete all exercises in the lab manual covering primitive types, type casting, and basic operations.",
    dueDate: d(1), weight: "homework", points: 10, priority: "medium",
    completed: false, starred: false, createdAt: ts(), updatedAt: ts(),
    subtasks: [
      { id: "s1a", assignmentId: "a1", title: "Read Chapter 3 (Variables)",  dueDay: d(0), completed: true,  estimatedMinutes: 30, notes: "", createdAt: ts() },
      { id: "s1b", assignmentId: "a1", title: "Complete Exercise 3.1–3.5",   dueDay: d(0), completed: true,  estimatedMinutes: 45, notes: "", createdAt: ts() },
      { id: "s1c", assignmentId: "a1", title: "Write reflection paragraph",  dueDay: d(1), completed: false, estimatedMinutes: 20, notes: "Min 150 words", createdAt: ts() },
      { id: "s1d", assignmentId: "a1", title: "Submit on Canvas",            dueDay: d(1), completed: false, estimatedMinutes: 5,  notes: "", createdAt: ts() },
    ],
  },
  {
    id: "a2", courseId: "cs101", courseCode: "CS 101", courseColor: "#2563eb",
    title: "Project 1: Hangman Game",
    description: "Build a fully functional Hangman game in Python using loops, conditionals, and string manipulation.",
    dueDate: d(6), weight: "project", points: 50, priority: "high",
    completed: false, starred: true, createdAt: ts(), updatedAt: ts(),
    subtasks: [
      { id: "s2a", assignmentId: "a2", title: "Plan game logic & flowchart",    dueDay: d(1), completed: true,  estimatedMinutes: 60,  notes: "", createdAt: ts() },
      { id: "s2b", assignmentId: "a2", title: "Implement word selection",       dueDay: d(2), completed: true,  estimatedMinutes: 90,  notes: "", createdAt: ts() },
      { id: "s2c", assignmentId: "a2", title: "Build guess input & validation", dueDay: d(3), completed: false, estimatedMinutes: 120, notes: "", createdAt: ts() },
      { id: "s2d", assignmentId: "a2", title: "Add ASCII art display",          dueDay: d(4), completed: false, estimatedMinutes: 60,  notes: "", createdAt: ts() },
      { id: "s2e", assignmentId: "a2", title: "Test edge cases",                dueDay: d(5), completed: false, estimatedMinutes: 45,  notes: "", createdAt: ts() },
      { id: "s2f", assignmentId: "a2", title: "Write README & submit",          dueDay: d(6), completed: false, estimatedMinutes: 30,  notes: "", createdAt: ts() },
    ],
  },
  {
    id: "a3", courseId: "math201", courseCode: "MATH 201", courseColor: "#d97706",
    title: "HW 3: Integration by Parts",
    description: "Solve problems 5.1–5.18 from the textbook. Show all work and verify answers.",
    dueDate: d(0), weight: "homework", points: 15, priority: "critical",
    completed: false, starred: true, createdAt: ts(), updatedAt: ts(),
    subtasks: [
      { id: "s3a", assignmentId: "a3", title: "Problems 5.1–5.6",   dueDay: d(-1), completed: true,  estimatedMinutes: 40, notes: "", createdAt: ts() },
      { id: "s3b", assignmentId: "a3", title: "Problems 5.7–5.12",  dueDay: d(0),  completed: false, estimatedMinutes: 40, notes: "Check table of integrals", createdAt: ts() },
      { id: "s3c", assignmentId: "a3", title: "Problems 5.13–5.18", dueDay: d(0),  completed: false, estimatedMinutes: 45, notes: "", createdAt: ts() },
    ],
  },
  {
    id: "a4", courseId: "eng102", courseCode: "ENG 102", courseColor: "#0d9488",
    title: "Essay 1: Rhetorical Analysis",
    description: "4–6 page analysis of a persuasive text. Must include ethos, pathos, and logos analysis.",
    dueDate: d(3), weight: "project", points: 100, priority: "high",
    completed: false, starred: false, createdAt: ts(), updatedAt: ts(),
    subtasks: [
      { id: "s4a", assignmentId: "a4", title: "Choose & annotate source text",  dueDay: d(0), completed: true,  estimatedMinutes: 45, notes: "", createdAt: ts() },
      { id: "s4b", assignmentId: "a4", title: "Create outline",                  dueDay: d(1), completed: true,  estimatedMinutes: 30, notes: "", createdAt: ts() },
      { id: "s4c", assignmentId: "a4", title: "Draft intro + ethos paragraph",   dueDay: d(1), completed: false, estimatedMinutes: 60, notes: "", createdAt: ts() },
      { id: "s4d", assignmentId: "a4", title: "Draft pathos & logos paragraphs", dueDay: d(2), completed: false, estimatedMinutes: 90, notes: "", createdAt: ts() },
      { id: "s4e", assignmentId: "a4", title: "Conclusion & revision",           dueDay: d(2), completed: false, estimatedMinutes: 60, notes: "", createdAt: ts() },
      { id: "s4f", assignmentId: "a4", title: "Final proofread & submit",        dueDay: d(3), completed: false, estimatedMinutes: 30, notes: "", createdAt: ts() },
    ],
  },
  {
    id: "a5", courseId: "phys301", courseCode: "PHYS 301", courseColor: "#7c3aed",
    title: "Problem Set 5: Wave Mechanics",
    description: "Problems from Chapter 12. Focus on superposition principle and standing waves.",
    dueDate: d(2), weight: "homework", points: 30, priority: "medium",
    completed: false, starred: false, createdAt: ts(), updatedAt: ts(),
    subtasks: [
      { id: "s5a", assignmentId: "a5", title: "Re-read Ch. 12 notes",        dueDay: d(1), completed: false, estimatedMinutes: 30, notes: "", createdAt: ts() },
      { id: "s5b", assignmentId: "a5", title: "Complete problems 12.1–12.8", dueDay: d(1), completed: false, estimatedMinutes: 75, notes: "", createdAt: ts() },
      { id: "s5c", assignmentId: "a5", title: "Check with answer key",        dueDay: d(2), completed: false, estimatedMinutes: 20, notes: "", createdAt: ts() },
    ],
  },
  {
    id: "a6", courseId: "hist150", courseCode: "HIST 150", courseColor: "#e11d48",
    title: "Document Analysis: Treaty of Versailles",
    description: "500-word analysis examining the political and economic consequences documented in primary sources.",
    dueDate: d(7), weight: "project", points: 50, priority: "low",
    completed: false, starred: false, createdAt: ts(), updatedAt: ts(),
    subtasks: [
      { id: "s6a", assignmentId: "a6", title: "Read primary source docs",    dueDay: d(3), completed: false, estimatedMinutes: 60, notes: "", createdAt: ts() },
      { id: "s6b", assignmentId: "a6", title: "Research secondary sources",  dueDay: d(4), completed: false, estimatedMinutes: 45, notes: "", createdAt: ts() },
      { id: "s6c", assignmentId: "a6", title: "Write draft analysis",        dueDay: d(5), completed: false, estimatedMinutes: 90, notes: "", createdAt: ts() },
      { id: "s6d", assignmentId: "a6", title: "Revise & submit",             dueDay: d(7), completed: false, estimatedMinutes: 30, notes: "", createdAt: ts() },
    ],
  },
  {
    id: "a7", courseId: "cs101", courseCode: "CS 101", courseColor: "#2563eb",
    title: "Quiz 2: Loops & Control Flow",
    description: "20-question online quiz on for loops, while loops, break/continue, and nested loops.",
    dueDate: d(-2), weight: "quiz", points: 20, priority: "low",
    completed: true, starred: false, createdAt: ts(), updatedAt: ts(),
    subtasks: [
      { id: "s7a", assignmentId: "a7", title: "Review loop examples",      completed: true, estimatedMinutes: 30, notes: "", createdAt: ts() },
      { id: "s7b", assignmentId: "a7", title: "Complete practice problems", completed: true, estimatedMinutes: 45, notes: "", createdAt: ts() },
      { id: "s7c", assignmentId: "a7", title: "Take quiz on Canvas",        completed: true, estimatedMinutes: 20, notes: "", createdAt: ts() },
    ],
  },
];

export const MOCK_EXAMS: TrackerExam[] = [
  {
    id: "e1", courseId: "cs101", courseCode: "CS 101", courseColor: "#2563eb",
    title: "CS 101 Midterm", date: d(12), type: "midterm",
    location: "Lusk 101", duration: 90,
    notes: "Closed book. Bring pencil and student ID. No phones.",
    createdAt: ts(), updatedAt: ts(),
    concepts: [
      {
        id: "c1a", examId: "e1", title: "Variables & Data Types", category: "Fundamentals",
        masteryLevel: 3, notes: "Strong here — review type casting edge cases",
        completed: true, createdAt: ts(),
        resources: [{ id: "r1", conceptId: "c1a", type: "link", label: "Python Docs: Built-in Types", url: "https://docs.python.org/3/library/stdtypes.html", createdAt: ts() }],
      },
      {
        id: "c1b", examId: "e1", title: "Loops & Control Flow", category: "Fundamentals",
        masteryLevel: 2, notes: "Practice nested loops more",
        completed: false, createdAt: ts(),
        resources: [{ id: "r2", conceptId: "c1b", type: "link", label: "W3Schools: Python Loops", url: "https://www.w3schools.com/python/python_for_loops.asp", createdAt: ts() }],
      },
      { id: "c1c", examId: "e1", title: "Functions & Scope",     category: "Functions",       masteryLevel: 1, notes: "Struggle with scope — need more practice", completed: false, createdAt: ts(), resources: [] },
      { id: "c1d", examId: "e1", title: "Lists & Dictionaries",  category: "Data Structures", masteryLevel: 2, notes: "Review dictionary methods",               completed: false, createdAt: ts(), resources: [] },
      { id: "c1e", examId: "e1", title: "File I/O",              category: "Advanced",        masteryLevel: 0, notes: "Haven't studied this yet",                completed: false, createdAt: ts(), resources: [] },
    ],
  },
  {
    id: "e2", courseId: "math201", courseCode: "MATH 201", courseColor: "#d97706",
    title: "Calculus II — Exam 2", date: d(18), type: "midterm",
    location: "Tyler 201", duration: 75,
    notes: "Formula sheet provided. Scientific calculator allowed.",
    createdAt: ts(), updatedAt: ts(),
    concepts: [
      {
        id: "c2a", examId: "e2", title: "Integration by Parts", category: "Integration Techniques",
        masteryLevel: 2, notes: "Good but need to practice the tabular method",
        completed: false, createdAt: ts(),
        resources: [{ id: "r3", conceptId: "c2a", type: "link", label: "Khan Academy: Integration by Parts", url: "https://www.khanacademy.org/math/ap-calculus-bc/bc-integration-new/bc-6-11/v/integration-by-parts", createdAt: ts() }],
      },
      { id: "c2b", examId: "e2", title: "Trig Substitution",           category: "Integration Techniques", masteryLevel: 1, notes: "Confusing — when to use which substitution", completed: false, createdAt: ts(), resources: [] },
      { id: "c2c", examId: "e2", title: "Series Convergence Tests",    category: "Infinite Series",         masteryLevel: 0, notes: "Start studying this week",                  completed: false, createdAt: ts(), resources: [] },
      { id: "c2d", examId: "e2", title: "Power Series & Taylor Series",category: "Infinite Series",         masteryLevel: 0, notes: "",                                           completed: false, createdAt: ts(), resources: [] },
    ],
  },
  {
    id: "e3", courseId: "phys301", courseCode: "PHYS 301", courseColor: "#7c3aed",
    title: "Physics Lab Practical", date: d(4), type: "practical",
    location: "SCI 310", duration: 120,
    notes: "Lab coat required. Experiment on wave interference patterns.",
    createdAt: ts(), updatedAt: ts(),
    concepts: [
      { id: "c3a", examId: "e3", title: "Wave Superposition",      category: "Wave Theory", masteryLevel: 2, notes: "Understand constructive vs destructive interference", completed: false, createdAt: ts(), resources: [] },
      { id: "c3b", examId: "e3", title: "Double Slit Experiment",  category: "Optics",      masteryLevel: 1, notes: "Review setup procedure",                             completed: false, createdAt: ts(), resources: [] },
      { id: "c3c", examId: "e3", title: "Lab Safety Procedures",   category: "Lab Skills",  masteryLevel: 3, notes: "Already know this well",                             completed: true,  createdAt: ts(), resources: [] },
    ],
  },
];

function dateStr(offset: number) {
  return new Date(now + offset * 86400000).toISOString().split("T")[0];
}

export const MOCK_PLANNER_BLOCKS: DayPlannerBlock[] = [
  { id: "p1",  date: dateStr(0), startTime: "08:00", endTime: "09:15", type: "class",      title: "CS 101 Lecture",       courseId: "cs101",   courseColor: "#2563eb", createdAt: ts() },
  { id: "p2",  date: dateStr(0), startTime: "09:30", endTime: "10:00", type: "break",      title: "Morning Coffee",                                                       createdAt: ts() },
  { id: "p3",  date: dateStr(0), startTime: "10:00", endTime: "11:30", type: "study",      title: "Study: Calc II HW",    courseId: "math201", courseColor: "#d97706", createdAt: ts() },
  { id: "p4",  date: dateStr(0), startTime: "11:30", endTime: "12:30", type: "class",      title: "MATH 201 Lecture",     courseId: "math201", courseColor: "#d97706", createdAt: ts() },
  { id: "p5",  date: dateStr(0), startTime: "12:30", endTime: "13:30", type: "leisure",    title: "Lunch + Walk",                                                         createdAt: ts() },
  { id: "p6",  date: dateStr(0), startTime: "13:30", endTime: "15:00", type: "assignment", title: "Work: Hangman Project", courseId: "cs101",   courseColor: "#2563eb", assignmentId: "a2", createdAt: ts() },
  { id: "p7",  date: dateStr(0), startTime: "15:00", endTime: "17:00", type: "work",       title: "Campus Job — Library",                                                 createdAt: ts() },
  { id: "p8",  date: dateStr(0), startTime: "19:00", endTime: "20:30", type: "study",      title: "Study: Physics PS5",   courseId: "phys301", courseColor: "#7c3aed", createdAt: ts() },
  { id: "p9",  date: dateStr(0), startTime: "20:30", endTime: "22:00", type: "leisure",    title: "Free time / Gaming",                                                   createdAt: ts() },
  { id: "p10", date: dateStr(1), startTime: "09:00", endTime: "10:00", type: "class",      title: "ENG 102 Lecture",      courseId: "eng102",  courseColor: "#0d9488", createdAt: ts() },
  { id: "p11", date: dateStr(1), startTime: "10:15", endTime: "12:00", type: "assignment", title: "Draft Essay Intro",    courseId: "eng102",  courseColor: "#0d9488", assignmentId: "a4", createdAt: ts() },
  { id: "p12", date: dateStr(1), startTime: "14:00", endTime: "16:00", type: "study",      title: "Study: CS Midterm Prep",courseId: "cs101",  courseColor: "#2563eb", createdAt: ts() },
];

export const MOCK_PROGRESS: DailyProgress[] = Array.from({ length: 14 }, (_, i) => {
  const offset = i - 13;
  const total = Math.floor(Math.random() * 4) + 2;
  const completed = offset < -2 ? total : Math.floor(Math.random() * (total + 1));
  return { date: dateStr(offset), total, completed };
});

// Course color lookups for convenience
export const COURSE_COLOR_MAP: Record<string, string> = {
  cs101:   "#2563eb",
  math201: "#d97706",
  eng102:  "#0d9488",
  phys301: "#7c3aed",
  hist150: "#e11d48",
};

export const COURSE_CODE_COLOR_MAP: Record<string, string> = {
  "CS 101":   "#2563eb",
  "MATH 201": "#d97706",
  "ENG 102":  "#0d9488",
  "PHYS 301": "#7c3aed",
  "HIST 150": "#e11d48",
};
