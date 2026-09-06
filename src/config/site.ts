export const siteConfig = {
  name: "Pathfinder Canada",
  tagline: "Enter your courses once. See what is open, what is missing, and what to do next.",
  description:
    "Compare your Canadian high-school courses and grades with university admission requirements, find what's missing, and see what actions change your options.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  disclaimer:
    "Pathfinder helps organize published admission requirements. Universities make final admission decisions. Always verify high-stakes decisions with the official institution.",
} as const;

export const subjectAreas = [
  "Health Sciences",
  "Business",
  "Engineering",
  "Computer Science",
  "Arts",
  "Sciences",
  "Education",
  "Undecided",
] as const;

export type SubjectArea = (typeof subjectAreas)[number];
