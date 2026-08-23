import { AuthForm } from "@/components/auth-form";
import { login } from "../auth/actions";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) { const p = await searchParams; return <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-5 py-12"><AuthForm mode="login" action={login} error={p.error} message={p.message} next={p.next} /></main>; }
