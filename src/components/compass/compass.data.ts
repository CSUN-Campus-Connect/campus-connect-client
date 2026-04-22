// ============================================================================
// MATADOR COMPASS — Student Success Hub
// Types, milestone definitions, and resource data
//
// Every milestone is grounded in real documented student pain points:
//   - Less than 60% of seniors ever got proper academic advising
//   - 35% of first-gen students never visited the career center
//   - 70% struggle with mental health, 63% never seek help
//   - Each wrong-major semester costs ~6 months of delay + thousands of dollars
// ============================================================================

export type StudentYear = 'freshman' | 'transfer' | 'sophomore' | 'junior' | 'senior';
export type MilestoneCategory = 'academic' | 'career' | 'financial' | 'wellbeing' | 'social' | 'graduation';
export type MilestonePriority = 'critical' | 'high' | 'medium';
export type MilestoneStatus = 'locked' | 'todo' | 'in-progress' | 'done' | 'skipped';

export interface CampusResource {
  name: string;
  url: string;
  phone?: string;
  location?: string;
  hours?: string;
  note?: string;
}

export interface CompassMilestone {
  id: string;
  title: string;
  shortTitle: string;            // For the timeline node label
  category: MilestoneCategory;
  priority: MilestonePriority;
  years: StudentYear[];          // Which year groups this applies to
  semester: 1 | 2 | 'any';      // Which semester (1=fall/spring start, 2=later, any=ongoing)
  description: string;           // The "why this matters" story
  whyItMatters: string;          // The headline stat / research backing
  actions: string[];             // Concrete next steps
  resources: CampusResource[];
  deadline?: string;             // e.g. "Before Week 3 of first semester"
  linkedFeature?: string;        // CampusConnect feature that helps with this
}

// ── Category metadata ──────────────────────────────────────────────────────

export const CATEGORY_META: Record<MilestoneCategory, { label: string; color: string; bg: string; icon: string }> = {
  academic:   { label: 'Academic',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  career:     { label: 'Career',     color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
  financial:  { label: 'Financial',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  wellbeing:  { label: 'Wellbeing',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' },
  social:     { label: 'Social',     color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0h6m-3-3v6' },
  graduation: { label: 'Graduation', color: '#D22030', bg: 'rgba(210,32,48,0.12)',   icon: 'M22 10v6M2 10l10-5 10 5-10 5z' },
};

// ── All milestones ─────────────────────────────────────────────────────────

export const ALL_MILESTONES: CompassMilestone[] = [
  // ── CRITICAL FIRST-WEEK ACTIONS ──────────────────────────────────────────
  {
    id: 'meet-advisor-week1',
    title: 'Meet Your Academic Advisor in Week 1',
    shortTitle: 'Advisor Meeting',
    category: 'academic',
    priority: 'critical',
    years: ['freshman', 'transfer'],
    semester: 1,
    deadline: 'First 2 weeks of semester',
    description: 'The single most impactful thing a new student can do. An advisor maps your exact path to graduation, catches prerequisite issues before they waste a semester, and can flag holds that block enrollment. Most students who "wasted semesters" skipped this step.',
    whyItMatters: 'Only 60% of graduating seniors ever received proper guidance on required courses. Students who meet advisors early graduate an average of one semester sooner.',
    actions: [
      'Schedule on SOLAR or email your department advisor directly',
      'Bring your unofficial transcript and any AP/IB/transfer credit summary',
      'Ask them to print your degree progress report (DPR)',
      'Ask: "What is the most common mistake students in my major make with scheduling?"',
    ],
    resources: [
      { name: 'CSUN Academic Advising', url: 'https://www.csun.edu/students/advising', location: 'University Hall 100', phone: '(818) 677-2467', hours: 'Mon-Fri 8am-5pm' },
      { name: 'SOLAR Student Portal', url: 'https://solar.csun.edu', note: 'Schedule appointments and view your DPR online' },
      { name: 'Smart Planner (Student Tool)', url: '#', note: 'Created by CSUN students - Plan your courses and see prerequisite chains' },
      { name: 'CSUN Course Catalog', url: 'https://catalog.csun.edu', note: 'Official course descriptions, prerequisites, and requirements' },
    ],
    linkedFeature: 'Academics Hub',
  },
  {
    id: 'financial-aid-deadlines',
    title: 'Understand Every Financial Aid Deadline',
    shortTitle: 'Financial Aid',
    category: 'financial',
    priority: 'critical',
    years: ['freshman', 'transfer', 'sophomore'],
    semester: 1,
    deadline: 'First 3 weeks of semester',
    description: 'Missing one financial aid deadline can cost thousands of dollars or cause you to lose grants permanently. FAFSA priority deadlines, scholarship applications, and SAP appeals all have hard cutoffs most students discover too late.',
    whyItMatters: '59% of students have considered dropping out due to financial stress. Missing financial aid deadlines is the #1 preventable cause of financial hardship in college.',
    actions: [
      'Log into SOLAR and check your current financial aid package',
      'Confirm your FAFSA is filed for the current academic year',
      'Ask: "Am I on track for Satisfactory Academic Progress (SAP)?"',
      'Search the CSUN scholarship portal — many go unclaimed every year',
      'Set calendar reminders 3 weeks before each FAFSA deadline',
    ],
    resources: [
      { name: 'CSUN Financial Aid Office', url: 'https://www.csun.edu/financialaid', location: 'Bayramian Hall 200', phone: '(818) 677-4085' },
      { name: 'CSUN Scholarship Portal', url: 'https://www.csun.edu/financialaid/scholarships', note: 'Hundreds of scholarships - many go unclaimed' },
      { name: 'Emergency Assistance Fund', url: 'https://www.csun.edu/students/emergency-assistance', note: 'Emergency grants for unexpected financial hardship' },
      { name: 'FAFSA Filing Guide', url: 'https://fafsa.gov', note: 'Official federal student aid - required for grants and loans' },
    ],
    linkedFeature: 'Dashboard',
  },

  // ── IDENTITY / BELONGING ─────────────────────────────────────────────────
  {
    id: 'join-one-club',
    title: 'Join At Least One Club or Org by Week 4',
    shortTitle: 'Find Your People',
    category: 'social',
    priority: 'high',
    years: ['freshman', 'transfer'],
    semester: 1,
    deadline: 'First 4 weeks of semester',
    description: 'The loneliness of being new on campus — especially for transfers who arrive while everyone else has already formed groups — is one of the most cited reasons students consider dropping out. Joining one organization is the fastest cure. It does not need to be major-related.',
    whyItMatters: '64.7% of college students report feeling lonely. Students who join at least one org are 4x more likely to persist to graduation and report dramatically higher satisfaction.',
    actions: [
      'Browse the CSUN Club Connect page (500+ clubs on campus)',
      'Attend Involvement Fair — no commitment, just show up and talk to people',
      'Look specifically for clubs tied to your major AND one for fun',
      'Transfer students: look for Transfer Student Union specifically',
    ],
    resources: [
      { name: 'CSUN Club Hub (CampusConnect)', url: '/clubs', note: '500+ student organizations - built into your CampusConnect app' },
      { name: 'Matador Involvement Center', url: 'https://www.csun.edu/usu', location: 'University Student Union - Lower Level', phone: '(818) 677-5111' },
      { name: 'Student Life Events', url: 'https://www.csun.edu/students/events', note: 'Weekly involvement fairs and networking events' },
      { name: 'Transfer Student Programs', url: 'https://www.csun.edu/students/transfer-student-programs', note: 'Special communities for transfer students' },
    ],
    linkedFeature: 'Club Connect',
  },

  // ── CAREER MILESTONES ────────────────────────────────────────────────────
  {
    id: 'career-center-year1',
    title: 'Visit the Career Center Before Sophomore Year',
    shortTitle: 'Career Center',
    category: 'career',
    priority: 'critical',
    years: ['freshman', 'transfer', 'sophomore'],
    semester: 'any',
    description: 'The #1 regret of CSUN seniors: "I wish I went to the Career Center freshman year, not senior year." They offer free resume reviews, LinkedIn photo sessions, mock interviews, and — most critically — connections to internship recruiters who come specifically for CSUN students.',
    whyItMatters: '35% of first-gen students never visit the career center at all. Students who visit the career center 3+ times are significantly more likely to receive job offers before graduation.',
    actions: [
      'Walk in for a drop-in appointment — no prior experience needed',
      'Ask specifically: "What internships are available for my major and year?"',
      'Get your resume reviewed, even if it is only one page',
      'Sign up for Handshake (free, CSUN-integrated job board)',
      'Ask about on-campus jobs — they are designed around your class schedule',
    ],
    resources: [
      { name: 'CSUN Career Center', url: 'https://www.csun.edu/careercenter', location: 'University Hall 100', phone: '(818) 677-2878', hours: 'Mon-Fri 8am-5pm' },
      { name: 'Handshake (CSUN Jobs)', url: 'https://csun.joinhandshake.com', note: 'Free internship and job board - CSUN-exclusive recruiting' },
      { name: 'CSUN Alumni Network', url: 'https://www.csun.edu/alumni/networking', note: 'Connect with 280,000+ Matadors in your field' },
      { name: 'LinkedIn Learning (Free)', url: 'https://www.linkedin.com/learning', note: 'Free with CSUN email - professional skills courses' },
    ],
    linkedFeature: 'Social Feed / Profiles',
  },
  {
    id: 'first-internship',
    title: 'Land Your First Internship or Research Position',
    shortTitle: 'First Internship',
    category: 'career',
    priority: 'critical',
    years: ['sophomore', 'junior', 'transfer'],
    semester: 'any',
    description: 'Students who complete at least one internship or undergraduate research position are 63% more likely to receive a job offer before graduation. Many students wait until senior year — this is too late. Even an unpaid, part-time, or virtual internship counts.',
    whyItMatters: 'Students who complete experiential learning are 63% more likely to receive job offers before graduation. First-gen students with internships see starting salaries 14% higher than peers without.',
    actions: [
      'Search Handshake filtered to "CSUN students only" — these are curated for you',
      'Check CSUN department bulletin boards for faculty research opportunities',
      'Ask professors directly — many have funded research positions',
      'Apply to CSUN\'s own on-campus programs (URCA, Summer Research Institute)',
      'Consider a micro-internship through Parker Dewey (2-5 week projects)',
    ],
    resources: [
      { name: 'CSUN URCA Program (Paid Research)', url: 'https://www.csun.edu/urca', note: 'Paid undergraduate research opportunities with CSUN faculty' },
      { name: 'Handshake (Internship Board)', url: 'https://csun.joinhandshake.com', note: 'Filter by internships and experience level' },
      { name: 'CSUN Internship Programs', url: 'https://www.csun.edu/internships', note: 'Structured internship pathways by college' },
      { name: 'Parker Dewey Micro-Internships', url: 'https://parkerdewey.com', note: 'Short 2-5 week projects for resume building' },
    ],
    linkedFeature: 'Social Feed / Alumni Network',
  },

  // ── MENTAL HEALTH ────────────────────────────────────────────────────────
  {
    id: 'know-counseling-resources',
    title: 'Know Where to Get Mental Health Support Before You Need It',
    shortTitle: 'Know Your Support',
    category: 'wellbeing',
    priority: 'critical',
    years: ['freshman', 'transfer', 'sophomore', 'junior', 'senior'],
    semester: 1,
    description: 'Most students who suffer in silence say they did not know what was available or thought it would cost money. CSUN\'s counseling is free. Knowing how to access it before a crisis hits is the difference between getting help and not. This is not about being in crisis — it is about being prepared.',
    whyItMatters: '70% of students struggle with mental health in college. 68% say it impacts their academic performance. Yet 63% never seek support — most say they did not know what was available or free.',
    actions: [
      'Locate CSUN Counseling Services now — do not wait for a crisis',
      'Know that the first appointment is always free and confidential',
      'Check out the Wellness Center\'s drop-in hours (no appointment needed)',
      'Download the WellTrack Boost app — free with CSUN email',
      'Add the Crisis Text Line number to your contacts: Text HOME to 741741',
    ],
    resources: [
      { name: 'CSUN Counseling Services', url: 'https://www.csun.edu/health/counseling-services', location: 'Klotz Student Health Center, Building 200', phone: '(818) 677-2366', hours: 'Mon-Fri 8am-5pm', note: 'FREE and confidential for enrolled students' },
      { name: 'CSUN Wellness Center', url: 'https://www.csun.edu/health', phone: '(818) 677-5899', note: 'Mental wellness workshops and resources' },
      { name: 'Crisis Text Line', url: 'https://www.crisistextline.org', note: 'Text HOME to 741741 — available 24/7, free and confidential' },
      { name: 'NAMI CSUN Student Chapter', url: 'https://www.nami.org', note: 'Student-led mental health support and awareness' },
    ],
    linkedFeature: 'Safety / Help',
  },

  // ── GRADUATION PLANNING ──────────────────────────────────────────────────
  {
    id: 'run-degree-audit',
    title: 'Run Your Degree Progress Report Every Semester',
    shortTitle: 'Degree Audit',
    category: 'graduation',
    priority: 'critical',
    years: ['freshman', 'transfer', 'sophomore', 'junior', 'senior'],
    semester: 'any',
    description: 'The DPR (Degree Progress Report) on SOLAR shows exactly what you need, what you have, and what is missing. Students who never check it discover missing requirements the semester before graduation — which can delay graduation by a full year and cost thousands more.',
    whyItMatters: '22.3% of college graduates took longer than 4 years to finish. The most common cause is discovering an unfulfilled requirement too late. A 5-minute DPR check each semester prevents this.',
    actions: [
      'Log into SOLAR > Student Records > Degree Progress Report',
      'Look for any "unsatisfied" requirements — flag them with your advisor',
      'Verify your GE (General Education) requirements are on track separately',
      'If you changed your major, run a new DPR immediately',
      'Use the CSUN Graduation Planner tool in SOLAR',
    ],
    resources: [
      { name: 'CSUN SOLAR Portal', url: 'https://solar.csun.edu', note: 'DPR is under Student Records > Degree Progress Report' },
      { name: 'CSUN Degree Progress Report Tool', url: 'https://solar.csun.edu', note: 'Check your progress toward graduation requirements' },
      { name: 'Course Catalog & Requirements', url: 'https://catalog.csun.edu', note: 'Official source for all degree and GE requirements' },
      { name: 'GE Requirements Guide', url: 'https://www.csun.edu/general-education', note: 'Understand lower and upper division GE requirements' },
    ],
    linkedFeature: 'Academics Hub',
  },
  {
    id: 'apply-to-graduate',
    title: 'File Your Application to Graduate',
    shortTitle: 'Apply to Graduate',
    category: 'graduation',
    priority: 'critical',
    years: ['junior', 'senior'],
    semester: 'any',
    deadline: 'Apply 1-2 semesters before your intended graduation',
    description: 'You must formally apply to graduate through SOLAR — it does not happen automatically. Missing this deadline can mean you walk at the wrong ceremony or your diploma is delayed by an entire semester. File this early, not when you think you are almost done.',
    whyItMatters: 'Every year, students who complete all their coursework still delay graduation because they forgot to file the application. The deadline is typically 1 full semester before your last semester.',
    actions: [
      'Log into SOLAR > Apply for Graduation',
      'Verify all your information is correct',
      'After filing, schedule a graduation check with your advisor to confirm',
      'Order regalia through the CSUN Bookstore early — it sells out',
      'Apply for a graduation fee waiver if eligible',
    ],
    resources: [
      { name: 'SOLAR Graduation Application', url: 'https://solar.csun.edu', note: 'Apply to graduate - do NOT skip this step' },
      { name: 'Graduation Dates & Deadlines', url: 'https://www.csun.edu/graduation', note: 'Official semester deadlines for filing' },
      { name: 'Commencement Information', url: 'https://www.csun.edu/graduation', note: 'Cap and gown, ceremony details, and pricing' },
      { name: 'Diplomat Alumni Toolkit', url: 'https://www.csun.edu/alumni', note: 'Resources for graduating students and new alumni' },
    ],
    linkedFeature: 'Academics Hub',
  },

  // ── SOPHOMORE PIVOT ──────────────────────────────────────────────────────
  {
    id: 'major-confirmation',
    title: 'Confirm Your Major Is the Right Fit by Sophomore Year',
    shortTitle: 'Major Check-In',
    category: 'academic',
    priority: 'high',
    years: ['freshman', 'sophomore', 'transfer'],
    semester: 2,
    description: 'Changing your major is completely normal and often the right call — but the timing matters enormously. Switching after junior year typically adds a semester. Switching sophomore year? Often costs nothing extra. The key is doing it intentionally, not by accident.',
    whyItMatters: 'Each major switch adds an average of 6 months to degree completion. 44% of students change their major at least once. The best time to evaluate and pivot is between freshman and sophomore year.',
    actions: [
      'Shadow or informational interview someone in your intended career field',
      'Ask upper-classmen in your major: "What do you wish you had known?"',
      'Use CSUN\'s Career Exploration resources to research job outcomes by major',
      'If uncertain: try one upper-division class before fully committing',
      'Check CSUN\'s Exploratory Studies program if you need time to decide',
    ],
    resources: [
      { name: 'CSUN Exploratory Studies', url: 'https://www.csun.edu/exploratory', note: 'For undecided students - take time to explore, not a setback' },
      { name: 'Career Exploration Tool', url: 'https://www.csun.edu/careercenter', note: 'Assess majors based on job outlook and salary' },
      { name: 'Meet Your Department Advisor', url: 'https://www.csun.edu/students/advising', note: 'Talk before committing to avoid costly mistakes' },
      { name: 'Course Planning Tools', url: '#', note: 'Use Smart Planner to visualize different major paths' },
    ],
    linkedFeature: 'Social Feed / Alumni Network',
  },

  // ── LINKEDIN & PROFESSIONAL IDENTITY ────────────────────────────────────
  {
    id: 'build-linkedin',
    title: 'Build Your LinkedIn Profile by Sophomore Year',
    shortTitle: 'LinkedIn Profile',
    category: 'career',
    priority: 'high',
    years: ['freshman', 'transfer', 'sophomore'],
    semester: 2,
    description: 'Recruiters and alumni search for students by university and major on LinkedIn constantly. A complete profile with a professional headshot is the single best networking move with the lowest barrier. CSUN Career Center offers free LinkedIn photo sessions.',
    whyItMatters: 'Students with complete LinkedIn profiles receive 40x more recruiter contact. First-gen students who build LinkedIn early report significantly higher internship access because they can find alumni in their exact field.',
    actions: [
      'Create or complete your LinkedIn profile with a professional photo',
      'Add CSUN as your education (connects you to 250,000+ CSUN alumni)',
      'Connect with professors, classmates, and any professionals you have met',
      'Follow companies you want to work for — their recruiters will see you',
      'Book a free LinkedIn photo at the CSUN Career Center',
    ],
    resources: [
      { name: 'CSUN Career Center LinkedIn Help', url: 'https://www.csun.edu/careercenter', note: 'Free professional headshots and LinkedIn profile reviews' },
      { name: 'LinkedIn for Students', url: 'https://www.linkedin.com/students', note: 'Free LinkedIn Premium is available for students' },
    ],
    linkedFeature: 'Social Feed / Profiles',
  },

  // ── FINANCIAL LITERACY ───────────────────────────────────────────────────
  {
    id: 'understand-student-loans',
    title: 'Understand Exactly What You Owe and Your Repayment Plan',
    shortTitle: 'Loan Literacy',
    category: 'financial',
    priority: 'high',
    years: ['sophomore', 'junior', 'senior', 'transfer'],
    semester: 'any',
    description: 'Most students with loans do not know the exact amount they owe, what their monthly payment will be after graduation, or that income-driven repayment plans exist. This information gap is responsible for enormous post-graduation financial anxiety that could have been prevented.',
    whyItMatters: 'Average student debt is $30,000+. Students who understand their loan situation before graduation are significantly more likely to make on-time payments and access forgiveness programs they qualify for.',
    actions: [
      'Log into studentaid.gov to see your exact federal loan balance',
      'Use the NSLDS (National Student Loan Data System) for a full picture',
      'Ask Financial Aid about income-driven repayment — payments can be $0 if income qualifies',
      'Check if you qualify for Public Service Loan Forgiveness (PSLF)',
      'Attend CSUN\'s free Financial Wellness workshops',
    ],
    resources: [
      { name: 'Federal Student Aid', url: 'https://studentaid.gov', note: 'Your official loan servicer information and repayment plans' },
      { name: 'CSUN Financial Aid', url: 'https://www.csun.edu/financialaid', phone: '(818) 677-4085' },
      { name: 'CSUN Financial Wellness', url: 'https://www.csun.edu/studentaffairs/financial-wellness', note: 'Free workshops on budgeting, loans, and credit' },
    ],
    linkedFeature: 'Dashboard',
  },
];

// ── Year label helper ──────────────────────────────────────────────────────

export const YEAR_LABELS: Record<StudentYear, string> = {
  freshman:  'Freshman (Year 1)',
  transfer:  'Transfer Student',
  sophomore: 'Sophomore (Year 2)',
  junior:    'Junior (Year 3)',
  senior:    'Senior (Year 4)',
};

export const YEAR_OPTIONS: StudentYear[] = ['freshman', 'transfer', 'sophomore', 'junior', 'senior'];

// ── Get milestones for a given year ────────────────────────────────────────

export function getMilestonesForYear(year: StudentYear): CompassMilestone[] {
  return ALL_MILESTONES
    .filter((m) => m.years.includes(year))
    .sort((a, b) => {
      const prio = { critical: 0, high: 1, medium: 2 };
      return prio[a.priority] - prio[b.priority];
    });
}
