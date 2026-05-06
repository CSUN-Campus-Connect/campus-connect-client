export type MajorHit = { id: string; name: string; type: string | null; category: string | null };

export type SkillTreeNode = {
  key: string;
  title?: string | null;
  units?: number | null;
  subject: string;
  catalog: string;
  levelBand: number;
  department: string;
  deptColor: string;
  tierIndex: number;
  semesterLabel: string;
};

export type ElectiveOptionChoice = {
  courseId: string;
  courseName: string;
  courseUnits?: number;
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
  options?: ElectiveOptionChoice[];
};

export type ManualElectiveCourse = {
  id: string;
  courseId: string;
  courseName: string;
  units: number;
  semesterLabel: string;
  color: string;
  slotLabel: string;
  category?: string;
};

export type CustomCourse = {
  id: string;
  courseId: string;
  courseName: string;
  units: number;
  semesterLabel: string;
  color: string;
};

export type SkillTreeResponse = {
  majorName: string;
  catalogYear: string;
  matchedRoadmap: { title: string; url: string };
  semesters: Array<{ tierIndex: number; label: string; totalUnits: number; courseKeys: string[] }>;
  nodes: SkillTreeNode[];
  edges: Array<{ from: string; to: string }>;
  electiveOptions?: ElectiveOption[];
};
