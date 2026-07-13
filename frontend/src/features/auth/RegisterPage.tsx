import { useState, type FormEvent } from "react";
import type { StoredAuthSession } from "../../shared/types/api.types";
import { useAuth } from "./AuthContext";
import { AuthForm, type AuthFormValues } from "./components/AuthForm";

export type RegisterPageProps = {
  onAuthenticated?: (session: StoredAuthSession) => void;
  onShowLogin?: () => void;
};

const initialValues: AuthFormValues = {
  name: "",
  email: "",
  password: "",
};

export function RegisterPage({ onAuthenticated, onShowLogin }: RegisterPageProps) {
  const auth = useAuth();
  const [values, setValues] = useState<AuthFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: keyof AuthFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      const session = await auth.register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });

      onAuthenticated?.(session);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell min-h-screen px-6 py-10 lg:px-10 lg:py-14">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1240px] items-center justify-center">
        <AuthForm
          error={error}
          isSubmitting={isSubmitting}
          mode="register"
          onChange={handleChange}
          onSubmit={handleSubmit}
          onToggleMode={onShowLogin}
          values={values}
        />
      </div>
    </main>
  );
}
