// Mirrors supabase/migrations/*.sql — snake_case to match Postgres columns
// and what the Supabase client returns from queries.

export type UUID = string;

export type GradeLevel = "grade_11" | "grade_12" | "graduated_upgrading";
export type CourseGradeLevel = "10" | "11" | "12";
export type CourseStatus = "completed" | "in_progress" | "planned";
export type RequirementType =
  | "required_course"
  | "course_minimum"
  | "overall_average_minimum"
  | "choose_n_from_group"
  | "graduation_requirement"
  | "supplemental"
  | "language"
  | "notes";
export type RequirementTrustStatus = "verified" | "needs_review" | "stale";
export type SupplementalType =
  | "personal_profile"
  | "supplementary_application"
  | "interview"
  | "portfolio"
  | "audition";
export type SubjectArea =
  | "Health Sciences"
  | "Business"
  | "Engineering"
  | "Computer Science"
  | "Arts"
  | "Sciences"
  | "Education"
  | "Undecided";
export type ProfileRole = "student" | "admin" | "reviewer";
export type FeedbackType =
  | "incorrect_requirement"
  | "stale_source"
  | "confusing"
  | "feature_request"
  | "other";
export type FeedbackStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type EvaluationResult = "eligible" | "missing" | "needs_review";
export type AuditAction = "create" | "update" | "delete";

export interface Profile {
  id: UUID;
  role: ProfileRole;
  created_at: string;
}

export interface StudentProfile {
  id: UUID;
  user_id: UUID;
  province: string;
  curriculum: string;
  grade_level: GradeLevel;
  graduation_year: number;
  interests: string[];
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: UUID;
  province: string;
  curriculum: string;
  code: string;
  name: string;
  grade_level: CourseGradeLevel;
  subject_group: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentCourse {
  id: UUID;
  student_profile_id: UUID;
  course_id: UUID;
  status: CourseStatus;
  grade_percent: number | null;
  predicted_grade_percent: number | null;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: UUID;
  name: string;
  province: string;
  city: string | null;
  country: string;
  official_url: string;
  logo_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: UUID;
  institution_id: UUID;
  name: string;
  credential: string;
  faculty: string | null;
  campus: string | null;
  subject_area: SubjectArea;
  intake_year: number;
  application_url: string | null;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SourceSnapshot {
  id: UUID;
  source_url: string;
  official_domain: string;
  page_title: string;
  captured_text_excerpt: string | null;
  verified_by: string | null;
  verified_at: string;
  expires_at: string | null;
  source_hash: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProgramRequirement {
  id: UUID;
  program_id: UUID;
  requirement_type: RequirementType;
  rule_json: unknown;
  display_text: string;
  source_snapshot_id: UUID | null;
  effective_cycle: string;
  status: RequirementTrustStatus;
  created_at: string;
  updated_at: string;
}

export interface SupplementalRequirement {
  id: UUID;
  program_id: UUID;
  type: SupplementalType;
  required: boolean;
  title: string;
  description: string | null;
  deadline: string | null;
  source_snapshot_id: UUID | null;
  created_at: string;
}

export interface SavedProgram {
  id: UUID;
  student_profile_id: UUID;
  program_id: UUID;
  created_at: string;
}

export interface Evaluation {
  id: UUID;
  student_profile_id: UUID;
  program_id: UUID;
  result: EvaluationResult;
  result_json: unknown;
  evaluated_at: string;
  rules_version: string;
}

export interface Scenario {
  id: UUID;
  student_profile_id: UUID;
  name: string;
  scenario_json: unknown;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: UUID;
  user_id: UUID | null;
  program_id: UUID | null;
  feedback_type: FeedbackType;
  body: string | null;
  status: FeedbackStatus;
  created_at: string;
}

export type BillingPlan = "free" | "application_plan" | "premium";

export interface BillingEntitlement {
  id: UUID;
  student_profile_id: UUID;
  plan: BillingPlan;
  stripe_customer_id: string | null;
  stripe_checkout_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: UUID;
  admin_user_id: UUID;
  entity_type: string;
  entity_id: UUID;
  action: AuditAction;
  before_json: unknown;
  after_json: unknown;
  created_at: string;
}
