/**
 * mockData.ts — UniCart Dev Test Mode
 *
 * Realistic mock sections that match the UniCartClass shape exactly.
 * Used exclusively by DevTestMode — never imported in production.
 *
 * Covers: COMP, MATH, ENGL, ART, BUS, PHYS, BIOL, KINE
 * Includes: conflicts, online, TBA, labs, prereqs, material costs,
 *           full / almost-full / open seats, waitlists
 */

import type { UniCartClass } from "../shared/constants";

export const MOCK_SEMESTER = "Spring 2026";

export const MOCK_SECTIONS: UniCartClass[] = [
  // ── COMP ──────────────────────────────────────────────────────────────────
  {
    id: "mock-10001",
    subject: "COMP", number: "322", title: "Internet & WWW",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Rose", sectionId: "10001",
    days: ["Mon", "Wed"], startTime: "14:00", endTime: "15:15",
    location: "JD 1600", isOnline: false,
    seats: 35, seatsAvailable: 8, enrolled: 27, waitlistCount: 0,
    prerequisites: ["COMP 282"],
    tags: ["Upper Division", "CS Core", "Web"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Design and development of web-based applications. Topics include HTML, CSS, JavaScript, server-side scripting, and web security.",
  },
  {
    id: "mock-10002",
    subject: "COMP", number: "380", title: "Software Engineering",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Kazerouni", sectionId: "10002",
    days: ["Tue", "Thu"], startTime: "09:30", endTime: "10:45",
    location: "JD 2208", isOnline: false,
    seats: 40, seatsAvailable: 2, enrolled: 38, waitlistCount: 5,
    prerequisites: ["COMP 282", "COMP 256"],
    tags: ["Upper Division", "CS Core", "GE: Lifelong Learning"],
    courseType: "Lecture", linkedLab: null, materialCost: 45,
    description: "Software development lifecycle, agile methodologies, testing, version control, and team project.",
  },
  {
    id: "mock-10003",
    subject: "COMP", number: "420", title: "Operating Systems",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Prof. Lee", sectionId: "10003",
    days: ["Mon", "Wed", "Fri"], startTime: "11:00", endTime: "11:50",
    location: "JD 1610", isOnline: false,
    seats: 30, seatsAvailable: 15, enrolled: 15, waitlistCount: 0,
    prerequisites: ["COMP 282", "COMP 310"],
    tags: ["Upper Division", "CS Core"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Process management, memory management, file systems, and I/O. Lab component includes kernel programming.",
  },
  {
    id: "mock-10004",
    subject: "COMP", number: "440", title: "Artificial Intelligence",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Mohan", sectionId: "10004",
    days: ["Tue", "Thu"], startTime: "14:00", endTime: "15:15",
    location: "JD 2201", isOnline: false,
    seats: 35, seatsAvailable: 0, enrolled: 35, waitlistCount: 12,
    prerequisites: ["COMP 282", "MATH 340"],
    tags: ["Upper Division", "CS Elective"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Search, knowledge representation, machine learning, and neural networks.",
  },
  {
    id: "mock-10005",
    subject: "COMP", number: "490", title: "Senior Project I",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Wiegand", sectionId: "10005",
    days: ["Wed"], startTime: "17:30", endTime: "20:15",
    location: "JD 1612", isOnline: false,
    seats: 25, seatsAvailable: 6, enrolled: 19, waitlistCount: 0,
    prerequisites: ["COMP 380", "COMP 420"],
    tags: ["Upper Division", "CS Required"],
    courseType: "Seminar", linkedLab: null, materialCost: 0,
    description: "Capstone project planning, requirements engineering, and initial design.",
  },
  {
    id: "mock-10006",
    subject: "COMP", number: "150", title: "Intro to Computing",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Fitzgerald", sectionId: "10006",
    days: [], startTime: null, endTime: null,
    location: null, isOnline: true,
    seats: 50, seatsAvailable: 22, enrolled: 28, waitlistCount: 0,
    prerequisites: [],
    tags: ["Lower Division", "GE: Quantitative Reasoning"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Survey of computing concepts for non-majors. No programming background required.",
  },
  {
    id: "mock-10007",
    subject: "COMP", number: "282", title: "Data Structures",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Prof. Ngo", sectionId: "10007",
    // ⚠ CONFLICTS with mock-10001 (Mon/Wed 14:00–15:15)
    days: ["Mon", "Wed"], startTime: "14:00", endTime: "15:15",
    location: "JD 1605", isOnline: false,
    seats: 40, seatsAvailable: 11, enrolled: 29, waitlistCount: 0,
    prerequisites: ["COMP 182"],
    tags: ["Lower Division", "CS Core"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Stacks, queues, linked lists, trees, graphs, sorting and searching algorithms.",
  },
  {
    id: "mock-10008",
    subject: "COMP", number: "524", title: "Machine Learning",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Zhao", sectionId: "10008",
    days: ["Mon", "Wed"], startTime: "19:00", endTime: "20:15",
    location: "JD 2202", isOnline: false,
    seats: 30, seatsAvailable: 18, enrolled: 12, waitlistCount: 0,
    prerequisites: ["COMP 440", "MATH 340"],
    tags: ["Graduate", "CS Elective"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Supervised and unsupervised learning, deep learning, and practical ML pipelines.",
  },

  // ── MATH ─────────────────────────────────────────────────────────────────
  {
    id: "mock-20001",
    subject: "MATH", number: "150A", title: "Calculus I",
    units: 5, semester: MOCK_SEMESTER,
    professor: "Dr. Kim", sectionId: "20001",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"], startTime: "08:00", endTime: "08:50",
    location: "SN 112", isOnline: false,
    seats: 40, seatsAvailable: 3, enrolled: 37, waitlistCount: 8,
    prerequisites: ["MATH 092 or placement"],
    tags: ["Lower Division", "GE: Quantitative Reasoning", "Engineering Core"],
    courseType: "Lecture", linkedLab: null, materialCost: 120,
    description: "Limits, derivatives, applications of differentiation, and introduction to integration.",
  },
  {
    id: "mock-20002",
    subject: "MATH", number: "250", title: "Calculus III",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Patel", sectionId: "20002",
    days: ["Tue", "Thu"], startTime: "11:00", endTime: "12:15",
    location: "SN 117", isOnline: false,
    seats: 35, seatsAvailable: 20, enrolled: 15, waitlistCount: 0,
    prerequisites: ["MATH 150B"],
    tags: ["Upper Division", "GE: Quantitative Reasoning", "Engineering Core"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Vectors, partial derivatives, multiple integrals, and vector calculus.",
  },
  {
    id: "mock-20003",
    subject: "MATH", number: "340", title: "Linear Algebra",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Prof. Torres", sectionId: "20003",
    days: ["Mon", "Wed", "Fri"], startTime: "13:00", endTime: "13:50",
    location: "SN 108", isOnline: false,
    seats: 35, seatsAvailable: 14, enrolled: 21, waitlistCount: 0,
    prerequisites: ["MATH 150A"],
    tags: ["Upper Division", "GE: Quantitative Reasoning"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Systems of equations, matrix algebra, eigenvalues and eigenvectors, vector spaces.",
  },
  {
    id: "mock-20004",
    subject: "MATH", number: "482", title: "Probability & Statistics",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Singh", sectionId: "20004",
    days: [], startTime: null, endTime: null,
    location: null, isOnline: true,
    seats: 40, seatsAvailable: 30, enrolled: 10, waitlistCount: 0,
    prerequisites: ["MATH 250"],
    tags: ["Upper Division", "GE: Quantitative Reasoning"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Probability theory, discrete and continuous distributions, hypothesis testing, regression.",
  },

  // ── ENGL ─────────────────────────────────────────────────────────────────
  {
    id: "mock-30001",
    subject: "ENGL", number: "115", title: "Freshman Composition",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Walsh", sectionId: "30001",
    days: ["Mon", "Wed", "Fri"], startTime: "10:00", endTime: "10:50",
    location: "SH 325", isOnline: false,
    seats: 25, seatsAvailable: 9, enrolled: 16, waitlistCount: 0,
    prerequisites: [],
    tags: ["Lower Division", "GE: Basic Skills"],
    courseType: "Lecture", linkedLab: null, materialCost: 35,
    description: "Expository writing, research methods, and critical thinking for academic contexts.",
  },
  {
    id: "mock-30002",
    subject: "ENGL", number: "305", title: "Technical Writing",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Prof. Alvarez", sectionId: "30002",
    days: [], startTime: null, endTime: null,
    location: null, isOnline: true,
    seats: 30, seatsAvailable: 7, enrolled: 23, waitlistCount: 2,
    prerequisites: ["ENGL 115"],
    tags: ["Upper Division", "GE: Humanities"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Professional writing for technical audiences: reports, proposals, documentation, and presentations.",
  },

  // ── PHYS ─────────────────────────────────────────────────────────────────
  {
    id: "mock-40001",
    subject: "PHYS", number: "220A", title: "Mechanics & Thermodynamics",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Okonkwo", sectionId: "40001",
    days: ["Tue", "Thu"], startTime: "12:30", endTime: "13:45",
    location: "Chaparral Hall 5125", isOnline: false,
    seats: 50, seatsAvailable: 18, enrolled: 32, waitlistCount: 0,
    prerequisites: ["MATH 150A"],
    tags: ["Lower Division", "GE: Science", "Engineering Core"],
    courseType: "Lecture", linkedLab: "40001L", materialCost: 25,
    description: "Newton's laws, energy, momentum, rotational motion, and thermodynamics.",
  },
  {
    id: "mock-40001L",
    subject: "PHYS", number: "220AL", title: "Mechanics Lab",
    units: 1, semester: MOCK_SEMESTER,
    professor: "Dr. Okonkwo", sectionId: "40001L",
    days: ["Fri"], startTime: "13:00", endTime: "15:45",
    location: "Chaparral Hall 5132", isOnline: false,
    seats: 25, seatsAvailable: 12, enrolled: 13, waitlistCount: 0,
    prerequisites: ["PHYS 220A (co-req)"],
    tags: ["Lower Division", "Lab", "Engineering Core"],
    courseType: "Lab", linkedLab: null, materialCost: 15,
    description: "Laboratory experiments corresponding to PHYS 220A lecture topics.",
  },

  // ── BIOL ─────────────────────────────────────────────────────────────────
  {
    id: "mock-50001",
    subject: "BIOL", number: "100", title: "Biology Today",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Rivera", sectionId: "50001",
    days: ["Mon", "Wed"], startTime: "09:30", endTime: "10:45",
    location: "Chaparral Hall 4108", isOnline: false,
    seats: 60, seatsAvailable: 24, enrolled: 36, waitlistCount: 0,
    prerequisites: [],
    tags: ["Lower Division", "GE: Science"],
    courseType: "Lecture", linkedLab: "50001L", materialCost: 0,
    description: "Survey of modern biology for non-majors. Evolution, genetics, ecology, and biotechnology.",
  },
  {
    id: "mock-50001L",
    subject: "BIOL", number: "100L", title: "Biology Today Lab",
    units: 1, semester: MOCK_SEMESTER,
    professor: "TBA", sectionId: "50001L",
    days: ["Wed"], startTime: "13:00", endTime: "15:45",
    location: "Chaparral Hall 4202", isOnline: false,
    seats: 24, seatsAvailable: 10, enrolled: 14, waitlistCount: 0,
    prerequisites: ["BIOL 100 (co-req)"],
    tags: ["Lower Division", "Lab", "GE: Science"],
    courseType: "Lab", linkedLab: null, materialCost: 30,
    description: "Laboratory investigations in basic biology principles.",
  },

  // ── ART ──────────────────────────────────────────────────────────────────
  {
    id: "mock-60001",
    subject: "ART", number: "101", title: "Introduction to Art",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Prof. Nguyen", sectionId: "60001",
    days: ["Tue", "Thu"], startTime: "09:30", endTime: "10:45",
    location: "Art & Design Center 102", isOnline: false,
    seats: 30, seatsAvailable: 11, enrolled: 19, waitlistCount: 0,
    prerequisites: [],
    tags: ["Lower Division", "GE: Arts"],
    courseType: "Studio", linkedLab: null, materialCost: 75,
    description: "Fundamental concepts and vocabulary of visual art with studio projects.",
  },
  {
    id: "mock-60002",
    subject: "ART", number: "302", title: "Digital Media Arts",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Chen", sectionId: "60002",
    days: ["Mon", "Wed"], startTime: "16:00", endTime: "17:15",
    location: "Art & Design Center 205", isOnline: false,
    seats: 20, seatsAvailable: 4, enrolled: 16, waitlistCount: 3,
    prerequisites: ["ART 101"],
    tags: ["Upper Division", "GE: Arts"],
    courseType: "Studio", linkedLab: null, materialCost: 120,
    description: "Image manipulation, motion graphics, and interactive media using industry software.",
  },
  {
    id: "mock-60003",
    subject: "ART", number: "200", title: "Art History Survey",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Rosario", sectionId: "60003",
    days: [], startTime: null, endTime: null,
    location: null, isOnline: true,
    seats: 45, seatsAvailable: 33, enrolled: 12, waitlistCount: 0,
    prerequisites: [],
    tags: ["Lower Division", "GE: Arts", "GE: Humanities"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Survey of art from prehistoric to contemporary with emphasis on cultural context.",
  },

  // ── BUS ──────────────────────────────────────────────────────────────────
  {
    id: "mock-70001",
    subject: "BUS", number: "302", title: "Business Law",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Prof. Jackson", sectionId: "70001",
    days: ["Mon", "Wed", "Fri"], startTime: "12:00", endTime: "12:50",
    location: "Juniper Hall 2204", isOnline: false,
    seats: 45, seatsAvailable: 16, enrolled: 29, waitlistCount: 0,
    prerequisites: [],
    tags: ["Upper Division", "GE: Social Sciences"],
    courseType: "Lecture", linkedLab: null, materialCost: 80,
    description: "Legal environment of business, contracts, torts, commercial law, and ethics.",
  },
  {
    id: "mock-70002",
    subject: "BUS", number: "440", title: "Strategic Management",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Mehta", sectionId: "70002",
    days: ["Tue", "Thu"], startTime: "16:00", endTime: "17:15",
    location: "Juniper Hall 1105", isOnline: false,
    seats: 40, seatsAvailable: 0, enrolled: 40, waitlistCount: 9,
    prerequisites: ["BUS 302"],
    tags: ["Upper Division"],
    courseType: "Lecture", linkedLab: null, materialCost: 0,
    description: "Integrative capstone course applying all business disciplines to strategic planning.",
  },

  // ── KINE ─────────────────────────────────────────────────────────────────
  {
    id: "mock-80001",
    subject: "KINE", number: "100", title: "Health and Fitness",
    units: 2, semester: MOCK_SEMESTER,
    professor: "Coach Davis", sectionId: "80001",
    days: ["Mon", "Wed", "Fri"], startTime: "07:30", endTime: "08:20",
    location: "Student Recreation Center", isOnline: false,
    seats: 30, seatsAvailable: 8, enrolled: 22, waitlistCount: 0,
    prerequisites: [],
    tags: ["Lower Division", "GE: Lifelong Learning"],
    courseType: "Activity", linkedLab: null, materialCost: 20,
    description: "Principles of physical fitness and wellness. Activity-based course.",
  },
  {
    id: "mock-80002",
    subject: "KINE", number: "310", title: "Exercise Physiology",
    units: 3, semester: MOCK_SEMESTER,
    professor: "Dr. Yamamoto", sectionId: "80002",
    days: ["Tue", "Thu"], startTime: "08:00", endTime: "09:15",
    location: "Redwood Hall 265", isOnline: false,
    seats: 35, seatsAvailable: 19, enrolled: 16, waitlistCount: 0,
    prerequisites: ["BIOL 100", "KINE 200"],
    tags: ["Upper Division"],
    courseType: "Lecture", linkedLab: null, materialCost: 40,
    description: "Physiological responses and adaptations to exercise. Lab methods included.",
  },
];

/** Filter mock sections to match search params — mirrors the backend logic */
export function filterMockSections(opts: {
  subject?: string;
  search?: string;
  activeTag?: string;
  semester?: string;
}): UniCartClass[] {
  const { subject = "", search = "", activeTag = "All", semester = MOCK_SEMESTER } = opts;

  let list = MOCK_SECTIONS.filter((s) => s.semester === semester);

  if (subject && subject !== "ALL") {
    list = list.filter((s) => s.subject === subject.toUpperCase());
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter((s) =>
      `${s.subject} ${s.number} ${s.title} ${s.professor} ${(s.tags ?? []).join(" ")}`
        .toLowerCase()
        .includes(q)
    );
  }

  if (activeTag && activeTag !== "All") {
    if (activeTag === "Online")               list = list.filter((s) => s.isOnline);
    else if (activeTag === "In-Person")       list = list.filter((s) => !s.isOnline);
    else if (activeTag === "Open Seats")      list = list.filter((s) => (s.seatsAvailable ?? 0) > 0);
    else if (activeTag === "Waitlist Available") list = list.filter((s) => (s.waitlistCount ?? 0) > 0);
    else
      list = list.filter((s) => {
        const tag = activeTag.toUpperCase();
        return (
          s.subject.toUpperCase() === tag ||
          (s.tags ?? []).some((t) => t.toUpperCase() === tag) ||
          s.courseType?.toUpperCase() === tag
        );
      });
  }

  return list;
}
