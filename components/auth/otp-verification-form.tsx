"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

import {
  resendSignupOtpAction,
  useDifferentEmailAction,
  verifySignupOtpAction,
} from "@/app/actions/auth";
import { initialOtpActionState } from "@/lib/auth/types";
import { copy } from "@/lib/copy";

const OTP_LENGTH = 6;
const twoDigitFormatter = new Intl.NumberFormat("en", {
  minimumIntegerDigits: 2,
  useGrouping: false,
});

interface OtpVerificationFormProps {
  initialResendSeconds: number;
}

export function OtpVerificationForm({
  initialResendSeconds,
}: OtpVerificationFormProps) {
  const [state, formAction, isVerifying] = useActionState(
    verifySignupOtpAction,
    initialOtpActionState,
  );
  const [digits, setDigits] = useState(() => Array(OTP_LENGTH).fill(""));
  const [resendSeconds, setResendSeconds] = useState(initialResendSeconds);
  const [resendMessage, setResendMessage] = useState("");
  const [resendStatus, setResendStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [isResending, startResendTransition] = useTransition();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resendSeconds]);

  function distributeDigits(value: string, requestedStartIndex: number) {
    const numericValue = value.replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (numericValue.length === 0) {
      return;
    }

    const startIndex =
      numericValue.length === OTP_LENGTH ? 0 : requestedStartIndex;

    setDigits((current) => {
      const next = [...current];

      for (let offset = 0; offset < numericValue.length; offset += 1) {
        const targetIndex = startIndex + offset;

        if (targetIndex >= OTP_LENGTH) {
          break;
        }

        next[targetIndex] = numericValue[offset];
      }

      return next;
    });

    const nextIndex = Math.min(startIndex + numericValue.length, OTP_LENGTH - 1);
    window.requestAnimationFrame(() => inputRefs.current[nextIndex]?.focus());
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Backspace" && digits[index] === "" && index > 0) {
      event.preventDefault();
      setDigits((current) => {
        const next = [...current];
        next[index - 1] = "";
        return next;
      });
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>, index: number) {
    const pastedValue = event.clipboardData.getData("text");

    if (/\d/.test(pastedValue)) {
      event.preventDefault();
      distributeDigits(pastedValue, index);
    }
  }

  function handleResend() {
    setResendMessage("");
    setResendStatus(null);

    startResendTransition(async () => {
      const result = await resendSignupOtpAction();

      setResendSeconds(result.cooldownSeconds);
      setResendMessage(result.message);
      setResendStatus(result.status);

      if (result.status === "success") {
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    });
  }

  const token = digits.join("");
  const interactionsDisabled = isVerifying || isResending;
  const countdown = `00:${twoDigitFormatter.format(resendSeconds)}`;

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        <input name="token" type="hidden" value={token} />

        <fieldset disabled={interactionsDisabled}>
          <legend className="sr-only">{copy.auth.otp.description}</legend>
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                aria-label={`${copy.auth.otp.digitLabel} ${index + 1} of ${OTP_LENGTH}`}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                autoFocus={index === 0}
                className="h-14 min-w-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-center text-xl font-bold text-[var(--color-text)] outline-none transition focus:border-[var(--color-accent)] focus:bg-white focus:shadow-[0_0_0_4px_var(--color-accent-soft)] sm:h-16 sm:text-2xl"
                inputMode="numeric"
                key={index}
                maxLength={1}
                onChange={(event) => {
                  const value = event.target.value;

                  if (value === "") {
                    setDigits((current) => {
                      const next = [...current];
                      next[index] = "";
                      return next;
                    });
                    return;
                  }

                  distributeDigits(value, index);
                }}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onPaste={(event) => handlePaste(event, index)}
                pattern="[0-9]"
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                value={digit}
              />
            ))}
          </div>
        </fieldset>

        {state.message ? (
          <p aria-live="polite" className="status-error" role="status">
            {state.message}
          </p>
        ) : null}

        <button
          className="button-primary w-full px-5 py-3"
          disabled={interactionsDisabled || token.length !== OTP_LENGTH}
          type="submit"
        >
          {isVerifying ? copy.auth.processing : copy.auth.otp.submit}
        </button>
      </form>

      <div className="space-y-3 text-center">
        <button
          className="button-quiet w-full px-4 py-2 text-sm"
          disabled={interactionsDisabled || resendSeconds > 0}
          onClick={handleResend}
          type="button"
        >
          {isResending
            ? copy.auth.processing
            : resendSeconds > 0
              ? `${copy.auth.otp.resendIn} ${countdown}`
              : copy.auth.otp.resend}
        </button>

        {resendMessage ? (
          <p
            aria-live="polite"
            className={
              resendStatus === "success" ? "status-success" : "status-error"
            }
            role="status"
          >
            {resendMessage}
          </p>
        ) : null}

        <form action={useDifferentEmailAction}>
          <button
            className="button-quiet w-full px-4 py-2 text-sm"
            disabled={interactionsDisabled}
            type="submit"
          >
            {copy.auth.otp.useDifferentEmail}
          </button>
        </form>

        <p className="text-sm text-[var(--color-muted)]">
          {copy.auth.otp.signInPrompt}{" "}
          <Link
            className="font-bold text-[var(--color-accent-strong)] hover:underline"
            href="/login"
          >
            {copy.auth.otp.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
