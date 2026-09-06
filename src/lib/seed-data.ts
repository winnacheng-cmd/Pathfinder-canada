/**
 * Single source of truth for fixture data — pushed into Postgres by
 * `supabase/seed/seed.ts` and read directly (no DB) by the `/demo` route.
 *
 * This is fictional development data, not real official requirements. See
 * docs/DATA_VERIFICATION.md for why, and never remove the "Sample data"
 * labeling this feeds in the UI without replacing it with real
 * admin-verified data first.
 */
import { deterministicId } from "./deterministic-id";
import type {
  Course,
  Institution,
  Program,
  ProgramRequirement,
  SourceSnapshot,
  StudentCourse,
  StudentProfile,
  SupplementalRequirement,
} from "@/types/database";

const iid = (slug: string) => deterministicId(`institution:${slug}`);
const pid = (slug: string) => deterministicId(`program:${slug}`);
const cid = (code: string) => deterministicId(`course:${code}`);
const sid = (slug: string) => deterministicId(`source:${slug}`);
const rid = (slug: string) => deterministicId(`requirement:${slug}`);
const supid = (slug: string) => deterministicId(`supplemental:${slug}`);

const PROVINCE = "BC";
const CURRICULUM = "BC Graduation Program";
const CYCLE = "2027-2028";
const INTAKE_YEAR = 2027;
const now = "2026-08-01T00:00:00.000Z";

// ============================================================
// Courses — BC Graduation Program, grades 11-12
// ============================================================
type CourseSeed = Pick<Course, "code" | "name" | "grade_level" | "subject_group">;

const courseSeeds: CourseSeed[] = [
  { code: "ENG11", name: "English Studies 11", grade_level: "11", subject_group: "english" },
  { code: "ENG12", name: "English Studies 12", grade_level: "12", subject_group: "english" },
  { code: "PREC11", name: "Pre-Calculus 11", grade_level: "11", subject_group: "math" },
  { code: "PREC12", name: "Pre-Calculus 12", grade_level: "12", subject_group: "math" },
  { code: "CALC12", name: "Calculus 12", grade_level: "12", subject_group: "math" },
  { code: "FOM12", name: "Foundations of Mathematics 12", grade_level: "12", subject_group: "math" },
  { code: "CHEM11", name: "Chemistry 11", grade_level: "11", subject_group: "science" },
  { code: "CHEM12", name: "Chemistry 12", grade_level: "12", subject_group: "science" },
  { code: "PHYS11", name: "Physics 11", grade_level: "11", subject_group: "science" },
  { code: "PHYS12", name: "Physics 12", grade_level: "12", subject_group: "science" },
  { code: "BIOL11", name: "Biology 11", grade_level: "11", subject_group: "science" },
  { code: "BIOL12", name: "Biology 12", grade_level: "12", subject_group: "science" },
  { code: "ANPH12", name: "Anatomy and Physiology 12", grade_level: "12", subject_group: "science" },
  { code: "GEOG12", name: "Geography 12", grade_level: "12", subject_group: "social_studies" },
  { code: "LAW12", name: "Law Studies 12", grade_level: "12", subject_group: "social_studies" },
  { code: "ECON12", name: "Economics 12", grade_level: "12", subject_group: "social_studies" },
  { code: "SOST11", name: "Social Studies 11", grade_level: "11", subject_group: "social_studies" },
  { code: "PSYC12", name: "Psychology 12", grade_level: "12", subject_group: "social_studies" },
  { code: "CPRO12", name: "Computer Programming 12", grade_level: "12", subject_group: "technology" },
  { code: "CSTU11", name: "Computer Studies 11", grade_level: "11", subject_group: "technology" },
  { code: "FREN12", name: "French 12", grade_level: "12", subject_group: "languages" },
  { code: "SPAN12", name: "Spanish 12", grade_level: "12", subject_group: "languages" },
  { code: "VART12", name: "Visual Arts 12", grade_level: "12", subject_group: "arts" },
  { code: "DRAM12", name: "Drama 12", grade_level: "12", subject_group: "arts" },
  { code: "PE12", name: "Physical Education 12", grade_level: "12", subject_group: "health_and_career" },
];

export const courses: Course[] = courseSeeds.map((c) => ({
  id: cid(c.code),
  province: PROVINCE,
  curriculum: CURRICULUM,
  code: c.code,
  name: c.name,
  grade_level: c.grade_level,
  subject_group: c.subject_group,
  active: true,
  created_at: now,
  updated_at: now,
}));

export const courseIdByCode: Record<string, string> = Object.fromEntries(
  courses.map((c) => [c.code, c.id])
);

// ============================================================
// Institutions — clearly fictional, see docs/DATA_VERIFICATION.md
// ============================================================
export const institutions: Institution[] = [
  {
    id: iid("cascade"),
    name: "Cascade University",
    province: "BC",
    city: "Vancouver",
    country: "Canada",
    official_url: "https://www.cascadeu.example/admissions",
    logo_url: null,
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: iid("harborview"),
    name: "Harborview University",
    province: "BC",
    city: "Victoria",
    country: "Canada",
    official_url: "https://www.harborviewu.example/admissions",
    logo_url: null,
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: iid("northern-ridge"),
    name: "Northern Ridge University",
    province: "BC",
    city: "Prince George",
    country: "Canada",
    official_url: "https://www.northernridgeu.example/admissions",
    logo_url: null,
    active: true,
    created_at: now,
    updated_at: now,
  },
];

// ============================================================
// Source snapshots — provenance. One per program admissions page, plus a
// deliberately stale one and one requirement with no source at all, so the
// trust-badge UI and the admin verification queue are both exercisable.
// ============================================================
function freshSource(slug: string, institutionSlug: string, pageTitle: string): SourceSnapshot {
  return {
    id: sid(slug),
    source_url: `https://www.${institutionSlug}u.example/admissions/${slug}`,
    official_domain: `${institutionSlug}u.example`,
    page_title: pageTitle,
    captured_text_excerpt: "Sample development excerpt — not a real official admissions page.",
    verified_by: "Pathfinder Dev Seed",
    verified_at: "2026-07-15",
    expires_at: "2027-07-15",
    source_hash: null,
    notes: "SAMPLE DATA — fictional institution, not a real source.",
    created_at: now,
  };
}

export const sourceSnapshots: SourceSnapshot[] = [
  freshSource("biomedical-sciences", "cascade", "Cascade University — Biomedical Sciences Admissions (Sample)"),
  freshSource("mechanical-engineering", "cascade", "Cascade University — Mechanical Engineering Admissions (Sample)"),
  freshSource("commerce", "cascade", "Cascade University — Bachelor of Commerce Admissions (Sample)"),
  {
    id: sid("computer-science-stale"),
    source_url: "https://www.cascadeu.example/admissions/computer-science",
    official_domain: "cascadeu.example",
    page_title: "Cascade University — Computer Science Admissions (Sample)",
    captured_text_excerpt: "Sample development excerpt — not a real official admissions page.",
    verified_by: "Pathfinder Dev Seed",
    verified_at: "2024-05-01",
    expires_at: "2025-05-01",
    source_hash: null,
    notes: "SAMPLE DATA — deliberately expired so the stale-requirement UI is exercisable.",
    created_at: now,
  },
  freshSource("psychology", "cascade", "Cascade University — Psychology Admissions (Sample)"),
  freshSource("biology", "harborview", "Harborview University — Biology Admissions (Sample)"),
  freshSource("elementary-education", "harborview", "Harborview University — Elementary Education Admissions (Sample)"),
  freshSource("economics", "harborview", "Harborview University — Economics Admissions (Sample)"),
  freshSource("nursing", "harborview", "Harborview University — Nursing Admissions (Sample)"),
  freshSource("visual-arts", "harborview", "Harborview University — Visual Arts Admissions (Sample)"),
  freshSource("chemistry", "northern-ridge", "Northern Ridge University — Chemistry Admissions (Sample)"),
  freshSource("civil-engineering", "northern-ridge", "Northern Ridge University — Civil Engineering Admissions (Sample)"),
  freshSource("computer-science-nru", "northern-ridge", "Northern Ridge University — Computer Science Admissions (Sample)"),
  freshSource("accounting", "northern-ridge", "Northern Ridge University — Accounting Admissions (Sample)"),
  freshSource("kinesiology", "northern-ridge", "Northern Ridge University — Kinesiology Admissions (Sample)"),
];

// ============================================================
// Programs
// ============================================================
export const programs: Program[] = [
  {
    id: pid("cascade-biomedical-sciences"),
    institution_id: iid("cascade"),
    name: "Biomedical Sciences",
    credential: "Bachelor of Science",
    faculty: "Faculty of Science",
    campus: "Main Campus",
    subject_area: "Health Sciences",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.cascadeu.example/apply",
    description: "An interdisciplinary science degree preparing students for health-related graduate programs.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("cascade-mechanical-engineering"),
    institution_id: iid("cascade"),
    name: "Mechanical Engineering",
    credential: "Bachelor of Applied Science",
    faculty: "Faculty of Applied Science",
    campus: "Main Campus",
    subject_area: "Engineering",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.cascadeu.example/apply",
    description: "A CEAB-style engineering program with a common first year.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("cascade-commerce"),
    institution_id: iid("cascade"),
    name: "Commerce",
    credential: "Bachelor of Commerce",
    faculty: "Faculty of Business",
    campus: "Main Campus",
    subject_area: "Business",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.cascadeu.example/apply",
    description: "A broad business degree with specializations available from second year.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("cascade-computer-science"),
    institution_id: iid("cascade"),
    name: "Computer Science",
    credential: "Bachelor of Science",
    faculty: "Faculty of Science",
    campus: "Main Campus",
    subject_area: "Computer Science",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.cascadeu.example/apply",
    description: "A direct-entry computer science degree.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("cascade-psychology"),
    institution_id: iid("cascade"),
    name: "Psychology",
    credential: "Bachelor of Arts",
    faculty: "Faculty of Arts",
    campus: "Main Campus",
    subject_area: "Arts",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.cascadeu.example/apply",
    description: "A social-science-focused psychology degree.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("harborview-biology"),
    institution_id: iid("harborview"),
    name: "Biology",
    credential: "Bachelor of Science",
    faculty: "Faculty of Science",
    campus: "Main Campus",
    subject_area: "Sciences",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.harborviewu.example/apply",
    description: "A general biology degree with field-study opportunities.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("harborview-elementary-education"),
    institution_id: iid("harborview"),
    name: "Elementary Education",
    credential: "Bachelor of Education",
    faculty: "Faculty of Education",
    campus: "Main Campus",
    subject_area: "Education",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.harborviewu.example/apply",
    description: "A direct-entry teacher-education program for elementary schooling.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("harborview-economics"),
    institution_id: iid("harborview"),
    name: "Economics",
    credential: "Bachelor of Arts",
    faculty: "Faculty of Arts",
    campus: "Main Campus",
    subject_area: "Business",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.harborviewu.example/apply",
    description: "A quantitative economics degree.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("harborview-nursing"),
    institution_id: iid("harborview"),
    name: "Nursing",
    credential: "Bachelor of Science in Nursing",
    faculty: "Faculty of Health Sciences",
    campus: "Main Campus",
    subject_area: "Health Sciences",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.harborviewu.example/apply",
    description: "A direct-entry nursing degree with clinical placements from year two.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("harborview-visual-arts"),
    institution_id: iid("harborview"),
    name: "Visual Arts",
    credential: "Bachelor of Fine Arts",
    faculty: "Faculty of Fine Arts",
    campus: "Main Campus",
    subject_area: "Arts",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.harborviewu.example/apply",
    description: "A studio-based fine arts degree.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("nru-chemistry"),
    institution_id: iid("northern-ridge"),
    name: "Chemistry",
    credential: "Bachelor of Science",
    faculty: "Faculty of Science",
    campus: "Main Campus",
    subject_area: "Sciences",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.northernridgeu.example/apply",
    description: "A research-focused chemistry degree.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("nru-civil-engineering"),
    institution_id: iid("northern-ridge"),
    name: "Civil Engineering",
    credential: "Bachelor of Applied Science",
    faculty: "Faculty of Applied Science",
    campus: "Main Campus",
    subject_area: "Engineering",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.northernridgeu.example/apply",
    description: "A CEAB-style civil engineering program.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("nru-computer-science"),
    institution_id: iid("northern-ridge"),
    name: "Computer Science",
    credential: "Bachelor of Science",
    faculty: "Faculty of Science",
    campus: "Main Campus",
    subject_area: "Computer Science",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.northernridgeu.example/apply",
    description: "A flexible computer science degree with a co-op option.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("nru-accounting"),
    institution_id: iid("northern-ridge"),
    name: "Accounting",
    credential: "Bachelor of Commerce",
    faculty: "Faculty of Business",
    campus: "Main Campus",
    subject_area: "Business",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.northernridgeu.example/apply",
    description: "An accounting-focused commerce degree.",
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: pid("nru-kinesiology"),
    institution_id: iid("northern-ridge"),
    name: "Kinesiology",
    credential: "Bachelor of Science",
    faculty: "Faculty of Health Sciences",
    campus: "Main Campus",
    subject_area: "Health Sciences",
    intake_year: INTAKE_YEAR,
    application_url: "https://www.northernridgeu.example/apply",
    description: "A human kinetics degree with clinical and research streams.",
    active: true,
    created_at: now,
    updated_at: now,
  },
];

// ============================================================
// Program requirements — every rule pattern is represented at least once.
// ============================================================
function req(
  slug: string,
  programSlug: string,
  requirementType: ProgramRequirement["requirement_type"],
  ruleJson: object,
  displayText: string,
  sourceSlug: string | null,
  status: ProgramRequirement["status"] = "verified"
): ProgramRequirement {
  return {
    id: rid(slug),
    program_id: pid(programSlug),
    requirement_type: requirementType,
    rule_json: ruleJson,
    display_text: displayText,
    source_snapshot_id: sourceSlug ? sid(sourceSlug) : null,
    effective_cycle: CYCLE,
    status,
    created_at: now,
    updated_at: now,
  };
}

export const programRequirements: ProgramRequirement[] = [
  // --- Cascade — Biomedical Sciences (mirrors the landing-page demo example) ---
  req(
    "cascade-biomed-eng12",
    "cascade-biomedical-sciences",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 80 },
    "English Studies 12, minimum 80%",
    "biomedical-sciences"
  ),
  req(
    "cascade-biomed-chem12",
    "cascade-biomedical-sciences",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 85 },
    "Chemistry 12, minimum 85%",
    "biomedical-sciences"
  ),
  req(
    "cascade-biomed-precalc12",
    "cascade-biomedical-sciences",
    "course_minimum",
    { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 90 },
    "Pre-Calculus 12, minimum 90%",
    "biomedical-sciences"
  ),
  req(
    "cascade-biomed-choose1",
    "cascade-biomedical-sciences",
    "choose_n_from_group",
    { operator: "AT_LEAST_N", n: 1, courseCodes: ["BIOL12", "PHYS12"] },
    "At least one of Biology 12 or Physics 12",
    "biomedical-sciences"
  ),
  req(
    "cascade-biomed-supp",
    "cascade-biomedical-sciences",
    "supplemental",
    { operator: "SUPPLEMENTAL_REQUIRED", type: "personal_profile" },
    "Personal profile required",
    "biomedical-sciences"
  ),

  // --- Cascade — Mechanical Engineering ---
  req(
    "cascade-mech-precalc12",
    "cascade-mechanical-engineering",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 80 },
    "Pre-Calculus 12, minimum 80%",
    "mechanical-engineering"
  ),
  req(
    "cascade-mech-phys12",
    "cascade-mechanical-engineering",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["PHYS12"], minimumGrade: 80 },
    "Physics 12, minimum 80%",
    "mechanical-engineering"
  ),
  req(
    "cascade-mech-chem12",
    "cascade-mechanical-engineering",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 70 },
    "Chemistry 12, minimum 70%",
    "mechanical-engineering"
  ),
  req(
    "cascade-mech-average",
    "cascade-mechanical-engineering",
    "overall_average_minimum",
    {
      operator: "AVERAGE_OF_SELECTED",
      courseCodes: ["ENG12", "PREC12", "PHYS12", "CHEM12"],
      minimum: 80,
    },
    "Average of English Studies 12, Pre-Calculus 12, Physics 12, Chemistry 12 at least 80%",
    "mechanical-engineering"
  ),

  // --- Cascade — Commerce ---
  req(
    "cascade-commerce-eng12",
    "cascade-commerce",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 70 },
    "English Studies 12, minimum 70%",
    "commerce"
  ),
  req(
    "cascade-commerce-math",
    "cascade-commerce",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["PREC12", "FOM12"], minimumGrade: 70 },
    "Pre-Calculus 12 or Foundations of Mathematics 12, minimum 70%",
    "commerce"
  ),
  req(
    "cascade-commerce-grad",
    "cascade-commerce",
    "graduation_requirement",
    { operator: "GRADUATION_REQUIREMENT" },
    "BC Graduation Program completion",
    "commerce"
  ),
  req(
    "cascade-commerce-supp",
    "cascade-commerce",
    "supplemental",
    { operator: "SUPPLEMENTAL_REQUIRED", type: "supplementary_application" },
    "Supplementary application required",
    "commerce"
  ),

  // --- Cascade — Computer Science (deliberately stale Pre-Calc requirement) ---
  req(
    "cascade-cs-precalc12",
    "cascade-computer-science",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 86 },
    "Pre-Calculus 12, minimum 86%",
    "computer-science-stale",
    "stale"
  ),
  req(
    "cascade-cs-eng12",
    "cascade-computer-science",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 70 },
    "English Studies 12, minimum 70%",
    "computer-science-stale"
  ),
  req(
    "cascade-cs-choose1",
    "cascade-computer-science",
    "choose_n_from_group",
    { operator: "AT_LEAST_N", n: 1, courseCodes: ["CPRO12", "PHYS12"] },
    "At least one of Computer Programming 12 or Physics 12",
    "computer-science-stale"
  ),

  // --- Cascade — Psychology ---
  req(
    "cascade-psych-eng12",
    "cascade-psychology",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 70 },
    "English Studies 12, minimum 70%",
    "psychology"
  ),
  req(
    "cascade-psych-average",
    "cascade-psychology",
    "overall_average_minimum",
    { operator: "AVERAGE_OF_SELECTED", courseCodes: ["ENG12", "SOST11", "PSYC12"], minimum: 75 },
    "Average of English Studies 12, Social Studies 11, Psychology 12 at least 75%",
    "psychology"
  ),

  // --- Harborview — Biology ---
  req(
    "harborview-bio-biol12",
    "harborview-biology",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["BIOL12"], minimumGrade: 80 },
    "Biology 12, minimum 80%",
    "biology"
  ),
  req(
    "harborview-bio-chem12",
    "harborview-biology",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 75 },
    "Chemistry 12, minimum 75%",
    "biology"
  ),
  req(
    "harborview-bio-eng12",
    "harborview-biology",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 70 },
    "English Studies 12, minimum 70%",
    "biology"
  ),

  // --- Harborview — Elementary Education ---
  req(
    "harborview-edu-eng12",
    "harborview-elementary-education",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 70 },
    "English Studies 12, minimum 70%",
    "elementary-education"
  ),
  req(
    "harborview-edu-grad",
    "harborview-elementary-education",
    "graduation_requirement",
    { operator: "GRADUATION_REQUIREMENT" },
    "BC Graduation Program completion",
    "elementary-education"
  ),
  req(
    "harborview-edu-supp-profile",
    "harborview-elementary-education",
    "supplemental",
    { operator: "SUPPLEMENTAL_REQUIRED", type: "personal_profile" },
    "Personal profile required",
    "elementary-education"
  ),
  req(
    "harborview-edu-supp-interview",
    "harborview-elementary-education",
    "supplemental",
    { operator: "SUPPLEMENTAL_REQUIRED", type: "interview" },
    "Interview required",
    "elementary-education"
  ),

  // --- Harborview — Economics (one needs_review requirement with no source yet) ---
  req(
    "harborview-econ-math",
    "harborview-economics",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["PREC12", "FOM12"], minimumGrade: 67 },
    "Pre-Calculus 12 or Foundations of Mathematics 12, minimum 67%",
    "economics"
  ),
  req(
    "harborview-econ-eng12",
    "harborview-economics",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 70 },
    "English Studies 12, minimum 70% (recently changed — awaiting re-verification)",
    null,
    "needs_review"
  ),

  // --- Harborview — Nursing ---
  req(
    "harborview-nursing-eng12",
    "harborview-nursing",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 75 },
    "English Studies 12, minimum 75%",
    "nursing"
  ),
  req(
    "harborview-nursing-biol12",
    "harborview-nursing",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["BIOL12"], minimumGrade: 75 },
    "Biology 12, minimum 75%",
    "nursing"
  ),
  req(
    "harborview-nursing-choose2",
    "harborview-nursing",
    "choose_n_from_group",
    {
      operator: "AT_LEAST_N",
      n: 2,
      courseCodes: ["CHEM12", "PHYS12", "ANPH12"],
      minimumGrade: 70,
    },
    "At least two of Chemistry 12, Physics 12, Anatomy and Physiology 12, each at least 70%",
    "nursing"
  ),
  req(
    "harborview-nursing-supp",
    "harborview-nursing",
    "supplemental",
    { operator: "SUPPLEMENTAL_REQUIRED", type: "personal_profile" },
    "Personal profile required",
    "nursing"
  ),

  // --- Harborview — Visual Arts ---
  req(
    "harborview-arts-eng12",
    "harborview-visual-arts",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 60 },
    "English Studies 12, minimum 60%",
    "visual-arts"
  ),
  req(
    "harborview-arts-supp",
    "harborview-visual-arts",
    "supplemental",
    { operator: "SUPPLEMENTAL_REQUIRED", type: "portfolio" },
    "Portfolio submission required",
    "visual-arts"
  ),

  // --- Northern Ridge — Chemistry ---
  req(
    "nru-chem-chem12",
    "nru-chemistry",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 80 },
    "Chemistry 12, minimum 80%",
    "chemistry"
  ),
  req(
    "nru-chem-precalc12",
    "nru-chemistry",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 75 },
    "Pre-Calculus 12, minimum 75%",
    "chemistry"
  ),
  req(
    "nru-chem-eng12",
    "nru-chemistry",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 70 },
    "English Studies 12, minimum 70%",
    "chemistry"
  ),

  // --- Northern Ridge — Civil Engineering ---
  req(
    "nru-civil-precalc12",
    "nru-civil-engineering",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 75 },
    "Pre-Calculus 12, minimum 75%",
    "civil-engineering"
  ),
  req(
    "nru-civil-phys12",
    "nru-civil-engineering",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["PHYS12"], minimumGrade: 70 },
    "Physics 12, minimum 70%",
    "civil-engineering"
  ),
  req(
    "nru-civil-chem12",
    "nru-civil-engineering",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["CHEM12"], minimumGrade: 65 },
    "Chemistry 12, minimum 65%",
    "civil-engineering"
  ),
  req(
    "nru-civil-average",
    "nru-civil-engineering",
    "overall_average_minimum",
    {
      operator: "AVERAGE_OF_SELECTED",
      courseCodes: ["ENG12", "PREC12", "PHYS12", "CHEM12"],
      minimum: 75,
    },
    "Average of English Studies 12, Pre-Calculus 12, Physics 12, Chemistry 12 at least 75%",
    "civil-engineering"
  ),

  // --- Northern Ridge — Computer Science ---
  req(
    "nru-cs-precalc12",
    "nru-computer-science",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["PREC12"], minimumGrade: 70 },
    "Pre-Calculus 12, minimum 70%",
    "computer-science-nru"
  ),
  req(
    "nru-cs-choose1",
    "nru-computer-science",
    "choose_n_from_group",
    { operator: "AT_LEAST_N", n: 1, courseCodes: ["CPRO12", "PHYS12"] },
    "At least one of Computer Programming 12 or Physics 12",
    "computer-science-nru"
  ),
  req(
    "nru-cs-eng12",
    "nru-computer-science",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 60 },
    "English Studies 12, minimum 60%",
    "computer-science-nru"
  ),

  // --- Northern Ridge — Accounting ---
  req(
    "nru-acct-eng12",
    "nru-accounting",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 65 },
    "English Studies 12, minimum 65%",
    "accounting"
  ),
  req(
    "nru-acct-math",
    "nru-accounting",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["PREC12", "FOM12"], minimumGrade: 65 },
    "Pre-Calculus 12 or Foundations of Mathematics 12, minimum 65%",
    "accounting"
  ),
  req(
    "nru-acct-supp",
    "nru-accounting",
    "supplemental",
    { operator: "SUPPLEMENTAL_REQUIRED", type: "supplementary_application" },
    "Supplementary application required",
    "accounting"
  ),

  // --- Northern Ridge — Kinesiology ---
  req(
    "nru-kin-biol12",
    "nru-kinesiology",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["BIOL12"], minimumGrade: 70 },
    "Biology 12, minimum 70%",
    "kinesiology"
  ),
  req(
    "nru-kin-eng12",
    "nru-kinesiology",
    "required_course",
    { operator: "ANY_OF", courseCodes: ["ENG12"], minimumGrade: 65 },
    "English Studies 12, minimum 65%",
    "kinesiology"
  ),
  req(
    "nru-kin-choose1",
    "nru-kinesiology",
    "choose_n_from_group",
    { operator: "AT_LEAST_N", n: 1, courseCodes: ["PHYS12", "CHEM12"] },
    "At least one of Physics 12 or Chemistry 12",
    "kinesiology"
  ),
];

// ============================================================
// Supplemental requirements (deadlines shown in the action plan/checklist)
// ============================================================
export const supplementalRequirements: SupplementalRequirement[] = [
  {
    id: supid("cascade-biomed-profile"),
    program_id: pid("cascade-biomedical-sciences"),
    type: "personal_profile",
    required: true,
    title: "Personal profile",
    description: "A short written profile submitted alongside the application.",
    deadline: "2027-01-15",
    source_snapshot_id: sid("biomedical-sciences"),
    created_at: now,
  },
  {
    id: supid("cascade-commerce-application"),
    program_id: pid("cascade-commerce"),
    type: "supplementary_application",
    required: true,
    title: "Supplementary application",
    description: "An additional application covering leadership and extracurricular activities.",
    deadline: "2026-11-30",
    source_snapshot_id: sid("commerce"),
    created_at: now,
  },
  {
    id: supid("harborview-edu-profile"),
    program_id: pid("harborview-elementary-education"),
    type: "personal_profile",
    required: true,
    title: "Personal profile",
    description: "A written statement of interest in teaching.",
    deadline: "2027-02-01",
    source_snapshot_id: sid("elementary-education"),
    created_at: now,
  },
  {
    id: supid("harborview-edu-interview"),
    program_id: pid("harborview-elementary-education"),
    type: "interview",
    required: true,
    title: "Admissions interview",
    description: "A short interview for shortlisted applicants.",
    deadline: "2027-03-01",
    source_snapshot_id: sid("elementary-education"),
    created_at: now,
  },
  {
    id: supid("harborview-nursing-profile"),
    program_id: pid("harborview-nursing"),
    type: "personal_profile",
    required: true,
    title: "Personal profile",
    description: "A written profile describing relevant experience.",
    deadline: "2027-01-15",
    source_snapshot_id: sid("nursing"),
    created_at: now,
  },
  {
    id: supid("harborview-arts-portfolio"),
    program_id: pid("harborview-visual-arts"),
    type: "portfolio",
    required: true,
    title: "Portfolio submission",
    description: "10-15 pieces demonstrating range and technical skill.",
    deadline: "2027-02-15",
    source_snapshot_id: sid("visual-arts"),
    created_at: now,
  },
  {
    id: supid("nru-acct-application"),
    program_id: pid("nru-accounting"),
    type: "supplementary_application",
    required: true,
    title: "Supplementary application",
    description: "A short-answer supplementary application.",
    deadline: "2026-12-01",
    source_snapshot_id: sid("accounting"),
    created_at: now,
  },
];

// ============================================================
// Demo student — used by /demo, matches the profile described throughout
// the product spec (English 92 / Pre-Calc 84 / Chem 91 / Anatomy 94 / Physics planned)
// ============================================================
export const demoStudentProfile: Omit<StudentProfile, "id" | "user_id"> = {
  province: PROVINCE,
  curriculum: CURRICULUM,
  grade_level: "grade_12",
  graduation_year: 2027,
  interests: ["Health Sciences", "Sciences"],
  created_at: now,
  updated_at: now,
};

export const demoStudentCourses: Omit<StudentCourse, "id" | "student_profile_id">[] = [
  { course_id: courseIdByCode.ENG12, status: "completed", grade_percent: 92, predicted_grade_percent: null, created_at: now, updated_at: now },
  { course_id: courseIdByCode.PREC12, status: "completed", grade_percent: 84, predicted_grade_percent: null, created_at: now, updated_at: now },
  { course_id: courseIdByCode.CHEM12, status: "completed", grade_percent: 91, predicted_grade_percent: null, created_at: now, updated_at: now },
  { course_id: courseIdByCode.ANPH12, status: "completed", grade_percent: 94, predicted_grade_percent: null, created_at: now, updated_at: now },
  { course_id: courseIdByCode.BIOL12, status: "completed", grade_percent: 90, predicted_grade_percent: null, created_at: now, updated_at: now },
  { course_id: courseIdByCode.PHYS12, status: "planned", grade_percent: null, predicted_grade_percent: null, created_at: now, updated_at: now },
  { course_id: courseIdByCode.BIOL11, status: "completed", grade_percent: 88, predicted_grade_percent: null, created_at: now, updated_at: now },
  { course_id: courseIdByCode.SOST11, status: "completed", grade_percent: 85, predicted_grade_percent: null, created_at: now, updated_at: now },
];

export const demoSavedProgramSlugs = [
  "cascade-biomedical-sciences",
  "cascade-mechanical-engineering",
  "cascade-computer-science",
  "harborview-nursing",
  "nru-kinesiology",
  "harborview-biology",
] as const;

export const demoSavedProgramIds = demoSavedProgramSlugs.map((slug) => pid(slug));

export { pid as programIdBySlug, iid as institutionIdBySlug, sid as sourceIdBySlug };
