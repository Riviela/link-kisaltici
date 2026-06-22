"use client";

import { useActionState, useState, type FormEvent } from "react";

import { registerAction } from "@/app/actions/auth";
import {
  initialAuthActionState,
  type AuthActionState,
} from "@/lib/auth/types";
import {
  isValidRegistrationUsername,
  normalizeUsernameInput,
  suggestUsernameFromEmail,
} from "@/lib/auth/register-validation";
import {
  isValidEmailAddress,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth/validation";
import { copy } from "@/lib/copy";
import { PUBLIC_PROFILE_HOST } from "@/lib/config/site";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/lib/profile/validation";

type RegisterStep = "email" | "username" | "password";

const stepNumbers: Record<RegisterStep, number> = {
  email: 1,
  username: 2,
  password: 3,
};

interface RegisterWizardProps {
  initialUsername?: string;
}

export function RegisterWizard({ initialUsername = "" }: RegisterWizardProps) {
  const [state, formAction, isPending] = useActionState<
    AuthActionState,
    FormData
  >(registerAction, initialAuthActionState);
  const [step, setStep] = useState<RegisterStep>("email");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailIsValid = isValidEmailAddress(email);
  const usernameIsValid = isValidRegistrationUsername(username);
  const passwordIsValid =
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH;
  const passwordsMatch = password === confirmPassword;
  const registrationComplete = state.status === "success";

  function continueFromEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!emailIsValid) {
      return;
    }

    if (username.length === 0) {
      setUsername(suggestUsernameFromEmail(email));
    }

    setStep("username");
  }

  function continueFromUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (usernameIsValid) {
      setStep("password");
    }
  }

  const currentStep = stepNumbers[step];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
        {copy.auth.register.stepLabel} {currentStep} / 3
      </p>

      {step === "email" ? (
        <form
          className="motion-step-enter mt-6 space-y-5"
          onSubmit={continueFromEmail}
        >
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-[var(--color-text)]">
              {copy.auth.register.emailStep.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              {copy.auth.register.emailStep.description}
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-[var(--color-text)]"
              htmlFor="registerEmail"
            >
              {copy.auth.emailLabel}
            </label>
            <input
              autoComplete="email"
              autoFocus
              className="field-control"
              id="registerEmail"
              onChange={(event) => setEmail(event.target.value)}
              placeholder={copy.auth.emailPlaceholder}
              required
              type="email"
              value={email}
            />
          </div>

          <button
            className="auth-submit-button button-primary w-full px-5 py-3"
            disabled={!emailIsValid}
            type="submit"
          >
            {copy.auth.register.continue}
          </button>
        </form>
      ) : null}

      {step === "username" ? (
        <form
          className="motion-step-enter mt-6 space-y-5"
          onSubmit={continueFromUsername}
        >
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-[var(--color-text)]">
              {copy.auth.register.usernameStep.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              {copy.auth.register.usernameStep.description}
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-[var(--color-text)]"
              htmlFor="registerUsername"
            >
              {copy.auth.register.usernameStep.label}
            </label>
            <div className="field-shell flex min-h-[3.25rem] items-center rounded-[var(--radius-control)] border border-transparent bg-[var(--color-surface-raised)] pl-4 focus-within:border-[var(--color-accent)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)]">
              <span className="shrink-0 text-sm font-semibold text-[var(--color-muted)]">
                {PUBLIC_PROFILE_HOST}/
              </span>
              <input
                aria-describedby="registerUsernameHint registerUsernamePreview"
                autoCapitalize="none"
                autoComplete="username"
                autoFocus
                className="min-w-0 flex-1 bg-transparent px-1 py-3 pr-4 text-sm font-semibold text-[var(--color-text)] outline-none"
                id="registerUsername"
                maxLength={USERNAME_MAX_LENGTH}
                minLength={USERNAME_MIN_LENGTH}
                onChange={(event) =>
                  setUsername(normalizeUsernameInput(event.target.value))
                }
                pattern="[a-z0-9][a-z0-9_]{2,29}"
                required
                spellCheck={false}
                type="text"
                value={username}
              />
            </div>
            <p
              className="text-xs text-[var(--color-muted)]"
              id="registerUsernameHint"
            >
              {copy.onboarding.usernameHint}
            </p>
            <p
              className="text-sm font-bold text-[var(--color-accent-strong)]"
              id="registerUsernamePreview"
            >
              {PUBLIC_PROFILE_HOST}/{username || copy.onboarding.usernamePlaceholder}
            </p>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-3">
            <button
              className="button-secondary px-5 py-3"
              onClick={() => setStep("email")}
              type="button"
            >
              {copy.auth.register.back}
            </button>
            <button
              className="auth-submit-button button-primary px-5 py-3"
              disabled={!usernameIsValid}
              type="submit"
            >
              {copy.auth.register.continue}
            </button>
          </div>
        </form>
      ) : null}

      {step === "password" ? (
        <form
          action={formAction}
          className="motion-step-enter mt-6 space-y-5"
        >
          <input name="email" type="hidden" value={email} />
          <input name="username" type="hidden" value={username} />

          <div>
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-[var(--color-text)]">
              {copy.auth.register.passwordStep.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              {copy.auth.register.passwordStep.description}
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-[var(--color-text)]"
              htmlFor="registerPassword"
            >
              {copy.auth.passwordLabel}
            </label>
            <input
              autoComplete="new-password"
              autoFocus
              className="field-control"
              disabled={isPending || registrationComplete}
              id="registerPassword"
              maxLength={PASSWORD_MAX_LENGTH}
              minLength={PASSWORD_MIN_LENGTH}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={copy.auth.passwordPlaceholder}
              required
              type="password"
              value={password}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-[var(--color-text)]"
              htmlFor="confirmPassword"
            >
              {copy.auth.register.passwordStep.confirmLabel}
            </label>
            <input
              autoComplete="new-password"
              className="field-control"
              disabled={isPending || registrationComplete}
              id="confirmPassword"
              maxLength={PASSWORD_MAX_LENGTH}
              minLength={PASSWORD_MIN_LENGTH}
              name="confirmPassword"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={copy.auth.register.passwordStep.confirmPlaceholder}
              required
              type="password"
              value={confirmPassword}
            />
            {confirmPassword.length > 0 && !passwordsMatch ? (
              <p className="text-xs font-semibold text-[var(--color-danger)]">
                {copy.auth.validation.passwordMismatch}
              </p>
            ) : null}
          </div>

          {state.message ? (
            <p
              aria-live="polite"
              className={
                state.status === "success" ? "status-success" : "status-error"
              }
              role="status"
            >
              {state.message}
            </p>
          ) : null}

          <div className="grid grid-cols-[auto_1fr] gap-3">
            <button
              className="button-secondary px-5 py-3"
              disabled={isPending || registrationComplete}
              onClick={() => setStep("username")}
              type="button"
            >
              {copy.auth.register.back}
            </button>
            <button
              className="auth-submit-button button-primary px-5 py-3"
              disabled={
                isPending ||
                registrationComplete ||
                !passwordIsValid ||
                !passwordsMatch
              }
              type="submit"
            >
              {isPending ? copy.auth.processing : copy.auth.register.submit}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
