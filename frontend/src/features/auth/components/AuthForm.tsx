import type { FormEvent } from "react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { GoogleLogin } from "@react-oauth/google";

export type AuthFormValues = {
  name: string;
  email: string;
  password: string;
};

//update props
export type AuthFormProps = {
  mode: "login" | "register";
  values: AuthFormValues;
  error: string | null;
  isSubmitting: boolean;
  onChange: (field: keyof AuthFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogleCredential: (credential: string) => Promise<void>;
  onGoogleError: () => void;
  onToggleMode?: () => void;
};

// update function parameters
export function AuthForm({ mode, values, error, isSubmitting, onChange, onSubmit, onGoogleCredential, onGoogleError, onToggleMode }: AuthFormProps) {
  const isRegisterMode = mode === "register";
  const title = isRegisterMode ? "Create your habit studio" : "Welcome back";
  const subtitle = isRegisterMode
    ? "Start tracking habits with your own account and keep your reminders private."
    : "Sign in to continue with your saved habits, logs, and reminders.";
  const submitLabel = isRegisterMode ? "Create account" : "Sign in";
  const togglePrompt = isRegisterMode ? "Already have an account?" : "Need an account?";
  const googleSignInConfigured = Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim(),
  );
  const toggleLabel = isRegisterMode ? "Sign in instead" : "Create one";

  return (
    <section className="w-full max-w-[1080px] overflow-hidden rounded-[32px] border border-[#e8e4d8] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
      <div className="grid min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden bg-[linear-gradient(145deg,#20aaa7_0%,#4598b4_48%,#786fc0_100%)] px-8 py-10 text-white sm:px-12 lg:px-14 lg:py-14">
          <div className="grid h-full content-between gap-12">
            <div className="grid gap-8">
              <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/25 bg-white/15 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-white shadow-[0_10px_28px_rgba(38,52,79,0.12)] backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#ff9a79] shadow-[0_0_0_4px_rgba(255,255,255,0.12)]" />
                Habit Tracker
              </div>
              <div className="grid gap-5">
                <h1 className="max-w-md text-4xl font-semibold leading-[1.08] tracking-[0.01em] text-white sm:text-5xl">
                  {isRegisterMode ? "Build routines that stay yours." : "Your habits are ready when you are."}
                </h1>
                <p className="max-w-lg text-base leading-7 text-white/82 sm:text-lg">
                  Multi-user habits, progress logs, and reminders all live in one private workspace.
                </p>
              </div>
            </div>

            <div className="grid gap-4 text-sm">
              <div className="rounded-[24px] border border-white/20 bg-[linear-gradient(135deg,#fe8b70_0%,#e9798c_100%)] p-5 text-white shadow-[0_18px_42px_rgba(38,52,79,0.2)] sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/18 text-white">
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <path d="M15 17H9m9-2V11a6 6 0 0 0-12 0v4l-2 2h16l-2-2Zm-4 5h-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-base font-semibold text-white">Private reminders</p>
                    <p className="mt-2 leading-6 text-white/88">
                      Each user keeps separate reminder email settings, schedules, and habit progress.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/45 bg-[linear-gradient(135deg,rgba(235,253,255,0.96)_0%,rgba(226,226,255,0.94)_100%)] p-5 text-[#26344f] shadow-[0_18px_42px_rgba(38,52,79,0.16)] sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/65 text-[#5d66a0] shadow-sm">
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <path d="M12 3 5 6v5c0 4.7 2.8 8.2 7 10 4.2-1.8 7-5.3 7-10V6l-7-3Zm-3 9 2 2 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-base font-semibold text-[#26344f]">Secure access</p>
                    <p className="mt-2 leading-6 text-[#52617a]">
                     Sign in securely using Google or your email and password.
                    </p>
                  </div>
                </div>
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

            {googleSignInConfigured ? (
              <>
                <div className="mt-8 flex justify-center">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      // if credential missing
                      if (!credentialResponse.credential) {
                        onGoogleError();
                        return;
                      }

                      // if crediantial exists passes it to the page using function onGoogleCredential
                      void onGoogleCredential(credentialResponse.credential);
                    }}
                    onError={onGoogleError}
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="360"
                  />
                </div>

                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Or use email
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              </>
            ) : null}

            <form className={googleSignInConfigured ? "grid gap-5" : "mt-8 grid gap-5"} onSubmit={onSubmit}>
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
