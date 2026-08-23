export type Profile = { id: string; name: string; email: string; role?: "user" | "admin"; premium_status: boolean };
export type MCQ = {
  id: string; question: string; options: { A: string; B: string; C: string; D: string };
  correct_answer: "A" | "B" | "C" | "D"; category: "Math" | "English" | "GK" | "Psychology";
  difficulty: "easy" | "medium" | "hard"; created_by: string; created_at: string; updated_at: string;
};
export type Payment = {
  id: string; user_id: string; transaction_id: string; screenshot_url: string;
  amount: number; status: "pending" | "verified" | "rejected"; created_at: string;
  users?: Pick<Profile, "name" | "email"> | null;
};
