export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  return Boolean(email && adminEmails().includes(email.toLowerCase()));
}

export function normalizeRole(role?: string | null, email?: string | null) {
  return role === "admin" || isAdminEmail(email) ? "admin" : "candidate";
}
