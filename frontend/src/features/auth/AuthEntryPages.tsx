import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { AuthForm, type AuthFormValues } from "./AuthForm";

const initialValues: AuthFormValues = { name: "", email: "", password: "" };

function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="app-shell min-h-screen px-6 py-10 lg:px-10 lg:py-14">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1240px] items-center justify-center">{children}</div>
    </main>
  );
}

export function LoginPage({ onShowRegister }: { onShowRegister?: () => void }) {
  const auth = useAuth();
  const [values, setValues] = useState<AuthFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await auth.login({ email: values.email.trim(), password: values.password });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageShell>
      <AuthForm error={error} isSubmitting={isSubmitting} mode="login" onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))} onSubmit={submit} onToggleMode={onShowRegister} values={values} />
    </AuthPageShell>
  );
}

export function RegisterPage({ onShowLogin }: { onShowLogin?: () => void }) {
  const auth = useAuth();
  const [values, setValues] = useState<AuthFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await auth.register({ name: values.name.trim(), email: values.email.trim(), password: values.password });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageShell>
      <AuthForm error={error} isSubmitting={isSubmitting} mode="register" onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))} onSubmit={submit} onToggleMode={onShowLogin} values={values} />
    </AuthPageShell>
  );
}
