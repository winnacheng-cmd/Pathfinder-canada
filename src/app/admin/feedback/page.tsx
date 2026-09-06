import { getAllFeedback } from "@/lib/queries/admin-catalog";
import { FeedbackManager } from "@/features/admin/FeedbackManager";

export const metadata = { title: "Feedback" };

export default async function AdminFeedbackPage() {
  const feedback = await getAllFeedback();
  return <FeedbackManager initial={feedback} />;
}
