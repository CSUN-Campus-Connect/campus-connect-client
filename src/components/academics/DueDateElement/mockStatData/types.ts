export interface CourseRef {
  id: string;
  subject: string;
  number: string;
  title?: string;
  cardColor?: string;
  colorAccent?: string;
}

export type AssignmentWeight = "exam" | "quiz" | "project" | "homework" | "lab" | "discussion";
export type AssignmentPriority = "low" | "medium" | "high" | "critical";

export interface SubTask {
  id: string;
  assignmentId: string;
  title: string;
  dueDay?: string;
  completed: boolean;
  estimatedMinutes?: number;
  notes?: string;
  createdAt: string;
}

export interface TrackerAssignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseColor: string;
  title: string;
  description?: string;
  dueDate: string;
  weight: AssignmentWeight;
  points: number;
  priority: AssignmentPriority;
  completed: boolean;
  starred: boolean;
  subtasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = "link" | "pdf" | "image" | "note";

export interface ConceptResource {
  id: string;
  conceptId: string;
  type: ResourceType;
  label: string;
  url?: string;
  fileData?: string;
  fileName?: string;
  createdAt: string;
}

export interface ExamConcept {
  id: string;
  examId: string;
  title: string;
  category?: string;
  masteryLevel: 0 | 1 | 2 | 3;
  notes?: string;
  resources: ConceptResource[];
  completed: boolean;
  createdAt: string;
}

export type ExamType = "midterm" | "final" | "quiz" | "practical" | "presentation";

export interface TrackerExam {
  id: string;
  courseId: string;
  courseCode: string;
  courseColor: string;
  title: string;
  date: string;
  type: ExamType;
  location?: string;
  duration?: number;
  concepts: ExamConcept[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PlannerBlockType = "class" | "study" | "work" | "leisure" | "assignment" | "break" | "other";

export interface DayPlannerBlock {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: PlannerBlockType;
  title: string;
  courseId?: string;
  courseColor?: string;
  assignmentId?: string;
  description?: string;
  color?: string;
  createdAt: string;
}

export type FilterOption =
  | "all"
  | "due-today"
  | "due-soon"
  | "upcoming"
  | "overdue"
  | "completed"
  | "starred";

export type SortOption =
  | "due-date"
  | "priority"
  | "most-points"
  | "course"
  | "weight";

export interface DailyProgress {
  date: string;
  completed: number;
  total: number;
}

export interface ReminderPayload {
  targetId: string;
  targetType: "assignment" | "exam";
  email: string;
  reminderDate: string;
}
