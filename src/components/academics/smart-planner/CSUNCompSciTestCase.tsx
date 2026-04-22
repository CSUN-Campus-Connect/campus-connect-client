/**
 * CSUNCompSciTestCase.tsx
 *
 * Accurate static fixture + live-fetch loader for the CSUN Computer Science
 * 2021/2022 B.S. roadmap (120 units, 8 semesters).
 *
 * Source: https://catalog.csun.edu/resource/road-map/2021/computer-science-2021/
 */

export type TestSkillTreeNode = {
  key: string;
  title: string | null;
  units: number | null;
  subject: string;
  catalog: string;
  levelBand: number;
  department: string;
  deptColor: string;
  tierIndex: number;
  semesterLabel: string;
};

export type ElectiveOption = {
  id: string;
  label: string;
  category?: string;
  semesterLabel: string;
  selected: string | null;
  courseId?: string;
  courseName?: string;
  courseUnits?: number;
};

export type TestSkillTreeResponse = {
  majorName: string;
  catalogYear: string;
  matchedRoadmap: { title: string; url: string };
  semesters: Array<{ tierIndex: number; label: string; totalUnits: number; courseKeys: string[] }>;
  nodes: TestSkillTreeNode[];
  edges: Array<{ from: string; to: string }>;
  electiveOptions?: ElectiveOption[];
};

export const CSUN_CS_2022_TEST_CASE = {
  majorName: "Computer Science",
  year: "2022",
  level: "undergraduate" as const,
  roadmapUrl: "https://catalog.csun.edu/resource/road-map/2021/computer-science-2021/",
  pace: "full-time" as const,
  startTerm: "Fall" as const,
  startYear: new Date().getFullYear(),
  includeSummer: false,
  includeWinter: false,
  maxTiers: 16,
  completedCourses: [] as string[],
  selectedElectives: {} as Record<string, string>,
};

// ─── Fixture – hand-transcribed from catalog.csun.edu ────────────────────────
// Year 1 Sem 1 (15u): COMP 110/L(4), MATH 150A(5), GE A2 Written Comm(3), GE C3(3)
// Year 1 Sem 2 (14u): COMP 122/L(2), COMP 182/L(4), MATH 150B(5), PHIL 230(3)
// Year 2 Sem 1 (16u): COMP 222(3), COMP 282(3), COMP 256/L(4), GE A1(3), GE D3/D4(3)
// Year 2 Sem 2 (14u): COMP 322/L(4), COMP 333(3), MATH 262(3), Sci Elec A(4)
// Year 3 Sem 1 (16u): COMP 310(3), COMP 380/L(3), Sci Elec A cont.(4), GE C1(3), GE F(3)
// Year 3 Sem 2 (17u): MATH 340(3), CS UD Elec x2(6), Sci Elec B(5), GE D1(3)
// Year 4 Sem 1 (16u): COMP 482(3), COMP 490/L(4), CS UD Elec x2(6), GE UD D1(3)
// Year 4 Sem 2 (13u): COMP 491L(1), CS UD Elec(3), GE C2(3), GE UD F(3), Elective(3)

export const CSUN_CS_2022_FIXTURE: TestSkillTreeResponse = {
  majorName: "Computer Science",
  catalogYear: "2022",
  matchedRoadmap: {
    title: "Computer Science B.S. — 2021/2022 Catalog",
    url: "https://catalog.csun.edu/resource/road-map/2021/computer-science-2021/",
  },
  semesters: [
    { tierIndex: 0, label: "Year 1 · Sem 1", totalUnits: 15, courseKeys: ["COMP-110L","MATH-150A","GE-A2","GE-C3"] },
    { tierIndex: 1, label: "Year 1 · Sem 2", totalUnits: 14, courseKeys: ["COMP-122L","COMP-182L","MATH-150B","PHIL-230"] },
    { tierIndex: 2, label: "Year 2 · Sem 1", totalUnits: 16, courseKeys: ["COMP-222","COMP-282","COMP-256L","GE-A1","GE-D3D4"] },
    { tierIndex: 3, label: "Year 2 · Sem 2", totalUnits: 14, courseKeys: ["COMP-322L","COMP-333","MATH-262","SCI-ELEC-A1"] },
    { tierIndex: 4, label: "Year 3 · Sem 1", totalUnits: 16, courseKeys: ["COMP-310","COMP-380L","SCI-ELEC-A2","GE-C1","GE-F"] },
    { tierIndex: 5, label: "Year 3 · Sem 2", totalUnits: 17, courseKeys: ["MATH-340","CS-UD-ELEC-1","CS-UD-ELEC-2","SCI-ELEC-B","GE-D1"] },
    { tierIndex: 6, label: "Year 4 · Sem 1", totalUnits: 16, courseKeys: ["COMP-482","COMP-490L","CS-UD-ELEC-3","CS-UD-ELEC-4","GE-UD-D1"] },
    { tierIndex: 7, label: "Year 4 · Sem 2", totalUnits: 13, courseKeys: ["COMP-491L","CS-UD-ELEC-5","GE-C2","GE-UD-F","FREE-ELEC"] },
  ],
  nodes: [
    // Year 1 Sem 1
    { key:"COMP-110L",   title:"Intro to Algorithms & Programming (w/ Lab)",  units:4, subject:"COMP",catalog:"110/L",  levelBand:100,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:0,semesterLabel:"Year 1 · Sem 1" },
    { key:"MATH-150A",   title:"Calculus I  (GE B4)",                          units:5, subject:"MATH",catalog:"150A",   levelBand:100,department:"MATH",deptColor:"hsl(142,68%,36%)",tierIndex:0,semesterLabel:"Year 1 · Sem 1" },
    { key:"GE-A2",       title:"GE A2 – Written Communication",                units:3, subject:"GE",  catalog:"A2",     levelBand:100,department:"GE",  deptColor:"hsl(280,50%,44%)",tierIndex:0,semesterLabel:"Year 1 · Sem 1" },
    { key:"GE-C3",       title:"GE C3 – American History, Inst. & Ideals",     units:3, subject:"GE",  catalog:"C3",     levelBand:100,department:"GE",  deptColor:"hsl(280,50%,44%)",tierIndex:0,semesterLabel:"Year 1 · Sem 1" },
    // Year 1 Sem 2
    { key:"COMP-122L",   title:"Python for Engineers (w/ Lab)",                units:2, subject:"COMP",catalog:"122/L",  levelBand:100,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:1,semesterLabel:"Year 1 · Sem 2" },
    { key:"COMP-182L",   title:"Data Structures Using C++ (w/ Lab)",           units:4, subject:"COMP",catalog:"182/L",  levelBand:100,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:1,semesterLabel:"Year 1 · Sem 2" },
    { key:"MATH-150B",   title:"Calculus II",                                  units:5, subject:"MATH",catalog:"150B",   levelBand:100,department:"MATH",deptColor:"hsl(142,68%,36%)",tierIndex:1,semesterLabel:"Year 1 · Sem 2" },
    { key:"PHIL-230",    title:"Introduction to Logic  (GE A3 Critical Thinking)",units:3,subject:"PHIL",catalog:"230",  levelBand:100,department:"GE",  deptColor:"hsl(38,72%,42%)", tierIndex:1,semesterLabel:"Year 1 · Sem 2" },
    // Year 2 Sem 1
    { key:"COMP-222",    title:"Assembly Language Programming",                 units:3, subject:"COMP",catalog:"222",    levelBand:200,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:2,semesterLabel:"Year 2 · Sem 1" },
    { key:"COMP-282",    title:"Advanced Algorithms & Data Structures",         units:3, subject:"COMP",catalog:"282",    levelBand:200,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:2,semesterLabel:"Year 2 · Sem 1" },
    { key:"COMP-256L",   title:"Introduction to Logic Design (w/ Lab)",         units:4, subject:"COMP",catalog:"256/L",  levelBand:200,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:2,semesterLabel:"Year 2 · Sem 1" },
    { key:"GE-A1",       title:"GE A1 – Oral Communication",                   units:3, subject:"GE",  catalog:"A1",     levelBand:100,department:"GE",  deptColor:"hsl(280,50%,44%)",tierIndex:2,semesterLabel:"Year 2 · Sem 1" },
    { key:"GE-D3D4",     title:"GE D3/D4 – U.S. & State/Local Government",     units:3, subject:"GE",  catalog:"D3/D4",  levelBand:100,department:"GE",  deptColor:"hsl(280,50%,44%)",tierIndex:2,semesterLabel:"Year 2 · Sem 1" },
    // Year 2 Sem 2
    { key:"COMP-322L",   title:"Computer Organization (w/ Lab)",                units:4, subject:"COMP",catalog:"322/L",  levelBand:300,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:3,semesterLabel:"Year 2 · Sem 2" },
    { key:"COMP-333",    title:"Formal Languages & Automata",                   units:3, subject:"COMP",catalog:"333",    levelBand:300,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:3,semesterLabel:"Year 2 · Sem 2" },
    { key:"MATH-262",    title:"Introduction to Probability & Statistics",      units:3, subject:"MATH",catalog:"262",    levelBand:200,department:"MATH",deptColor:"hsl(142,68%,36%)",tierIndex:3,semesterLabel:"Year 2 · Sem 2" },
    { key:"SCI-ELEC-A1", title:"LD Science Elective A  (GE B1/B2 + GE B3 Lab)",units:4, subject:"SCI", catalog:"ELEC-A", levelBand:100,department:"GE",  deptColor:"hsl(190,65%,36%)",tierIndex:3,semesterLabel:"Year 2 · Sem 2" },
    // Year 3 Sem 1
    { key:"COMP-310",    title:"Computer Architecture  (GE B5)",                units:3, subject:"COMP",catalog:"310",    levelBand:300,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:4,semesterLabel:"Year 3 · Sem 1" },
    { key:"COMP-380L",   title:"Operating Systems (w/ Lab)",                    units:3, subject:"COMP",catalog:"380/L",  levelBand:300,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:4,semesterLabel:"Year 3 · Sem 1" },
    { key:"SCI-ELEC-A2", title:"LD Science Elective A cont.  (GE B1/B2)",       units:4, subject:"SCI", catalog:"ELEC-A2",levelBand:100,department:"GE",  deptColor:"hsl(190,65%,36%)",tierIndex:4,semesterLabel:"Year 3 · Sem 1" },
    { key:"GE-C1",       title:"GE C1 – Arts",                                  units:3, subject:"GE",  catalog:"C1",     levelBand:100,department:"GE",  deptColor:"hsl(280,50%,44%)",tierIndex:4,semesterLabel:"Year 3 · Sem 1" },
    { key:"GE-F",        title:"GE F – Comparative Cultural Studies",           units:3, subject:"GE",  catalog:"F",      levelBand:100,department:"GE",  deptColor:"hsl(280,50%,44%)",tierIndex:4,semesterLabel:"Year 3 · Sem 1" },
    // Year 3 Sem 2
    { key:"MATH-340",    title:"Linear Algebra  (or MATH 341)",                  units:3, subject:"MATH",catalog:"340",    levelBand:300,department:"MATH",deptColor:"hsl(142,68%,36%)",tierIndex:5,semesterLabel:"Year 3 · Sem 2" },
    { key:"CS-UD-ELEC-1",title:"CS Upper-Division Elective 1  (400/500 lvl)",    units:3, subject:"COMP",catalog:"UD-1",   levelBand:400,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:5,semesterLabel:"Year 3 · Sem 2" },
    { key:"CS-UD-ELEC-2",title:"CS Upper-Division Elective 2  (400/500 lvl)",    units:3, subject:"COMP",catalog:"UD-2",   levelBand:400,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:5,semesterLabel:"Year 3 · Sem 2" },
    { key:"SCI-ELEC-B",  title:"LD Science Elective B  (GE B1/B2)",              units:5, subject:"SCI", catalog:"ELEC-B", levelBand:100,department:"GE",  deptColor:"hsl(190,65%,36%)",tierIndex:5,semesterLabel:"Year 3 · Sem 2" },
    { key:"GE-D1",       title:"GE D1 – Social Sciences",                        units:3, subject:"GE",  catalog:"D1",     levelBand:100,department:"GE",  deptColor:"hsl(280,50%,44%)",tierIndex:5,semesterLabel:"Year 3 · Sem 2" },
    // Year 4 Sem 1
    { key:"COMP-482",    title:"Algorithm Analysis  (or MATH 482)",              units:3, subject:"COMP",catalog:"482",    levelBand:400,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:6,semesterLabel:"Year 4 · Sem 1" },
    { key:"COMP-490L",   title:"Senior Design Project (w/ Lab)",                 units:4, subject:"COMP",catalog:"490/L",  levelBand:400,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:6,semesterLabel:"Year 4 · Sem 1" },
    { key:"CS-UD-ELEC-3",title:"CS Upper-Division Elective 3  (400/500 lvl)",    units:3, subject:"COMP",catalog:"UD-3",   levelBand:400,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:6,semesterLabel:"Year 4 · Sem 1" },
    { key:"CS-UD-ELEC-4",title:"CS Upper-Division Elective 4  (400/500 lvl)",    units:3, subject:"COMP",catalog:"UD-4",   levelBand:400,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:6,semesterLabel:"Year 4 · Sem 1" },
    { key:"GE-UD-D1",    title:"GE Upper-Division D1 – Social Sciences",         units:3, subject:"GE",  catalog:"UD-D1",  levelBand:300,department:"GE",  deptColor:"hsl(280,50%,44%)",tierIndex:6,semesterLabel:"Year 4 · Sem 1" },
    // Year 4 Sem 2
    { key:"COMP-491L",   title:"Senior Project Lab",                             units:1, subject:"COMP",catalog:"491L",   levelBand:400,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:7,semesterLabel:"Year 4 · Sem 2" },
    { key:"CS-UD-ELEC-5",title:"CS Upper-Division Elective 5  (400/500 lvl)",    units:3, subject:"COMP",catalog:"UD-5",   levelBand:400,department:"COMP",deptColor:"hsl(262,72%,55%)",tierIndex:7,semesterLabel:"Year 4 · Sem 2" },
    { key:"GE-C2",       title:"GE C2 – Humanities",                             units:3, subject:"GE",  catalog:"C2",     levelBand:100,department:"GE",  deptColor:"hsl(280,50%,44%)",tierIndex:7,semesterLabel:"Year 4 · Sem 2" },
    { key:"GE-UD-F",     title:"GE Upper-Division F – Comparative Cultural Studies",units:3,subject:"GE",catalog:"UD-F",   levelBand:300,department:"GE",  deptColor:"hsl(280,50%,44%)",tierIndex:7,semesterLabel:"Year 4 · Sem 2" },
    { key:"FREE-ELEC",   title:"Free Elective",                                  units:3, subject:"ELEC",catalog:"FREE",   levelBand:100,department:"GE",  deptColor:"hsl(220,30%,46%)",tierIndex:7,semesterLabel:"Year 4 · Sem 2" },
  ],
  edges: [
    { from:"COMP-110L",   to:"COMP-122L"   },
    { from:"COMP-110L",   to:"COMP-182L"   },
    { from:"COMP-122L",   to:"COMP-182L"   },
    { from:"COMP-182L",   to:"COMP-222"    },
    { from:"COMP-182L",   to:"COMP-282"    },
    { from:"COMP-182L",   to:"COMP-256L"   },
    { from:"COMP-222",    to:"COMP-322L"   },
    { from:"COMP-282",    to:"COMP-322L"   },
    { from:"COMP-282",    to:"COMP-333"    },
    { from:"COMP-256L",   to:"COMP-322L"   },
    { from:"COMP-322L",   to:"COMP-310"    },
    { from:"COMP-322L",   to:"COMP-380L"   },
    { from:"COMP-333",    to:"COMP-380L"   },
    { from:"COMP-310",    to:"COMP-482"    },
    { from:"COMP-380L",   to:"COMP-482"    },
    { from:"COMP-380L",   to:"COMP-490L"   },
    { from:"COMP-282",    to:"CS-UD-ELEC-1"},
    { from:"COMP-282",    to:"CS-UD-ELEC-2"},
    { from:"COMP-482",    to:"COMP-490L"   },
    { from:"COMP-490L",   to:"COMP-491L"   },
    { from:"CS-UD-ELEC-1",to:"CS-UD-ELEC-3"},
    { from:"CS-UD-ELEC-2",to:"CS-UD-ELEC-4"},
    { from:"MATH-150A",   to:"MATH-150B"   },
    { from:"MATH-150B",   to:"MATH-262"    },
    { from:"MATH-262",    to:"MATH-340"    },
    { from:"MATH-150A",   to:"COMP-256L"   },
    { from:"MATH-150B",   to:"COMP-282"    },
    { from:"MATH-262",    to:"COMP-482"    },
    { from:"MATH-340",    to:"COMP-482"    },
  ],
  electiveOptions: [
    { id:"cs-ud-elec-1", label:"CS Upper-Division Elective 1", category:"COMP 400/500 level", semesterLabel:"Year 3 · Sem 2", selected:null },
    { id:"cs-ud-elec-2", label:"CS Upper-Division Elective 2", category:"COMP 400/500 level", semesterLabel:"Year 3 · Sem 2", selected:null },
    { id:"cs-ud-elec-3", label:"CS Upper-Division Elective 3", category:"COMP 400/500 level", semesterLabel:"Year 4 · Sem 1", selected:null },
    { id:"cs-ud-elec-4", label:"CS Upper-Division Elective 4", category:"COMP 400/500 level", semesterLabel:"Year 4 · Sem 1", selected:null },
    { id:"cs-ud-elec-5", label:"CS Upper-Division Elective 5", category:"COMP 400/500 level", semesterLabel:"Year 4 · Sem 2", selected:null },
  ],
};

export async function loadCSUNTestCase(): Promise<TestSkillTreeResponse> {
  const {
    majorName, year, level, pace, startTerm, startYear,
    includeSummer, includeWinter, maxTiers, completedCourses, selectedElectives,
  } = CSUN_CS_2022_TEST_CASE;
  try {
    const res = await fetch("/api/academics/smartplanner/planner/skill-tree", {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ majorName, year, level, completedCourses, selectedElectives, pace, startYear, startTerm, includeSummer, includeWinter, maxTiers }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.nodes?.length && data?.semesters?.length) return data as TestSkillTreeResponse;
    }
  } catch { /* fall through */ }
  return CSUN_CS_2022_FIXTURE;
}

export const CSUN_CS_2022_META = {
  label: "CSUN Computer Science B.S. (2021/2022)",
  description: "4-year full-time roadmap — 120 units",
  sourceUrl: "https://catalog.csun.edu/resource/road-map/2021/computer-science-2021/",
  totalUnits: 120,
  semesters: 8,
} as const;
