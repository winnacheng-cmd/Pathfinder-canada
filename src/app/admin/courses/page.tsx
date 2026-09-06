import { getAllCoursesForAdmin } from "@/lib/queries/admin-catalog";
import { CoursesManager } from "@/features/admin/CoursesManager";

export const metadata = { title: "Courses" };

export default async function AdminCoursesPage() {
  const courses = await getAllCoursesForAdmin();
  return <CoursesManager initial={courses} />;
}
