import type { FormEvent } from "react";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";

export type AuthFormValues = {
  name: string;
  email: string;
  password: string;
};

export type AuthFormProps = {
  mode: "login" | "register";
  values: AuthFormValues;
  error: string | null;
  isSubmitting: boolean;
  onChange: (field: keyof AuthFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleMode?: () => void;
};

export function AuthForm({ mode, values, error, isSubmitting, onChange, onSubmit, onToggleMode }: AuthFormProps) {
  const isRegisterMode = mode === "register";
  const title = isRegisterMode ? "Create your habit studio" : "Welcome back";
  const subtitle = isRegisterMode
    ? "Start tracking habits with your own account and keep your reminders private."
    : "Sign in to continue with your saved habits, logs, and reminders.";
  const submitLabel = isRegisterMode ? "Create account" : "Sign in";
  const togglePrompt = isRegisterMode ? "Already have an account?" : "Need an account?";
  const toggleLabel = isRegisterMode ? "Sign in instead" : "Create one";

  return (
    <section className="w-full max-w-[1080px] overflow-hidden rounded-[32px] border border-[#e8e4d8] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
      <div className="grid min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.4),_transparent_38%),linear-gradient(135deg,_#0f766e_0%,_#115e59_45%,_#134e4a_100%)] px-8 py-10 text-white sm:px-12 lg:px-14 lg:py-14">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_42%,rgba(255,255,255,0.03)_75%,transparent)]" />
          <div className="relative grid h-full content-between gap-12">
            <div className="grid gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100/90">Habit Tracker</p>
              <div className="grid gap-4">
                <h1 className="max-w-md text-4xl font-semibold leading-tight sm:text-5xl">
                  {isRegisterMode ? "Build routines that stay yours." : "Your habits are ready when you are."}
                </h1>
                <p className="max-w-lg text-base leading-7 text-emerald-50/85 sm:text-lg">
                  Multi-user habits, progress logs, and reminders all live in one private workspace.
                </p>
              </div>
            </div>

            <div className="grid gap-4 text-sm text-emerald-50/90">
              <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-5 backdrop-blur">
                <p className="font-semibold text-white">Private reminders</p>
                <p className="mt-2 leading-6">
                  Each user keeps separate reminder email settings, schedules, and habit progress.
                </p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-5 backdrop-blur">
                <p className="font-semibold text-white">Secure access</p>
                <p className="mt-2 leading-6">
                  Your account is protected with an email address and password.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[#fcfbf6] px-8 py-10 sm:px-12 lg:px-14 lg:py-14">
          <div className="mx-auto w-full max-w-md">
            <div className="grid gap-3">
              <h2 className="text-3xl font-semibold text-slate-950">{title}</h2>
              <p className="text-sm leading-6 text-slate-500">{subtitle}</p>
            </div>

            <form className="mt-8 grid gap-5" onSubmit={onSubmit}>
              {isRegisterMode ? (
                <Input
                  autoComplete="name"
                  label="Full name"
                  name="name"
                  onChange={(event) => onChange("name", event.target.value)}
                  placeholder="Alicia Tan"
                  value={values.name}
                />
              ) : null}

              <Input
                autoComplete="email"
                label="Email"
                name="email"
                onChange={(event) => onChange("email", event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={values.email}
              />

              <Input
                autoComplete={isRegisterMode ? "new-password" : "current-password"}
                label="Password"
                name="password"
                onChange={(event) => onChange("password", event.target.value)}
                placeholder={isRegisterMode ? "At least 6 characters" : "Your password"}
                type="password"
                value={values.password}
              />

              {error ? <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

              <Button className="mt-2 h-12 rounded-xl text-base" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Please wait..." : submitLabel}
              </Button>
            </form>

            {onToggleMode ? (
              <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>{togglePrompt}</span>
                <button
                  className="font-semibold text-emerald-700 transition hover:text-emerald-800"
                  onClick={onToggleMode}
                  type="button"
                >
                  {toggleLabel}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
