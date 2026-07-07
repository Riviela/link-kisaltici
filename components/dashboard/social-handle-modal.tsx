"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  updateSocialIconsAction,
  updateSocialIconsPositionAction,
} from "@/app/actions/profile";
import { SocialIcon } from "@/components/profile/social-icon";
import { copy } from "@/lib/copy";
import {
  getSocialLink,
  SOCIAL_PLATFORM_CONFIG,
  SOCIAL_PLATFORMS,
  type SocialHandleActionState,
  type SocialLink,
  type SocialLinksPosition,
  type SocialPlatform,
  validateSocialHandle,
} from "@/lib/profile/social";

import styles from "./dashboard-interactions.module.css";

interface SocialHandleModalProps {
  initialPlatform?: SocialPlatform;
  onClose: () => void;
  onPositionSaved: (position: SocialLinksPosition) => void;
  onSaved: (state: {
    socialLinks: SocialLink[];
    socialLinksPosition: SocialLinksPosition;
  }) => void;
  socialLinks: SocialLink[];
  socialLinksPosition: SocialLinksPosition;
}

type ModalStep = "overview" | "picker" | "input";

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path d="M5 19v-6M12 19V5M19 19v-9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export function SocialHandleModal({
  initialPlatform,
  onClose,
  onPositionSaved,
  onSaved,
  socialLinks,
  socialLinksPosition,
}: SocialHandleModalProps) {
  const initialState: SocialHandleActionState = {
    status: "idle",
    message: "",
    socialLinks,
    socialLinksPosition,
  };
  const [state, formAction, isPending] = useActionState(
    updateSocialIconsAction,
    initialState,
  );
  const activeLinks = state.socialLinks;
  const [activePosition, setActivePosition] = useState(state.socialLinksPosition);
  const [phase, setPhase] = useState<"open" | "closing">("open");
  const [step, setStep] = useState<ModalStep>(initialPlatform ? "input" : "overview");
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(
    initialPlatform ?? "instagram",
  );
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState(
    getSocialLink(activeLinks, initialPlatform ?? "instagram")?.value ?? "",
  );
  const hasClosedRef = useRef(false);
  const inputConfig = SOCIAL_PLATFORM_CONFIG[selectedPlatform];
  const inputIsValid = validateSocialHandle(selectedPlatform, inputValue).success;
  const filteredPlatforms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return SOCIAL_PLATFORMS;
    return SOCIAL_PLATFORMS.filter((platform) =>
      SOCIAL_PLATFORM_CONFIG[platform].label.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);
  const completeClose = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    onClose();
  }, [onClose]);
  const requestClose = useCallback(() => {
    if (!isPending) setPhase("closing");
  }, [isPending]);

  useEffect(() => {
    if (phase !== "closing") return;
    const timeoutId = window.setTimeout(completeClose, 220);
    return () => window.clearTimeout(timeoutId);
  }, [completeClose, phase]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") requestClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  useEffect(() => {
    if (state.status !== "success" || phase === "closing") return;
    const frameId = requestAnimationFrame(() => {
      onSaved({
        socialLinks: state.socialLinks,
        socialLinksPosition: state.socialLinksPosition,
      });
      requestClose();
    });
    return () => cancelAnimationFrame(frameId);
  }, [
    onSaved,
    phase,
    requestClose,
    state.socialLinks,
    state.socialLinksPosition,
    state.status,
  ]);

  function selectPlatform(platform: SocialPlatform) {
    setSelectedPlatform(platform);
    setInputValue(getSocialLink(activeLinks, platform)?.value ?? "");
    setStep("input");
  }

  async function handlePositionChange(position: SocialLinksPosition) {
    setActivePosition(position);
    onPositionSaved(position);
    const result = await updateSocialIconsPositionAction(position);
    if (result.status === "success") {
      setActivePosition(result.socialLinksPosition);
      onPositionSaved(result.socialLinksPosition);
    }
  }

  return (
    <div
      aria-hidden={phase === "closing" ? true : undefined}
      className={`${styles.socialModalOverlay} ${phase === "closing" ? styles.modalOverlayClosing : ""}`}
      onAnimationEnd={(event) => {
        if (phase === "closing" && event.target === event.currentTarget) {
          completeClose();
        }
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <section
        aria-labelledby="socialModalTitle"
        aria-modal="true"
        className={`${styles.socialModalSurface} ${phase === "closing" ? styles.modalSurfaceClosing : ""}`}
        role="dialog"
      >
        <header className={styles.socialModalHeader}>
          {step === "overview" ? (
            <span aria-hidden="true" />
          ) : (
            <button
              aria-label={copy.socialProfiles.back}
              className={styles.socialModalIconButton}
              disabled={isPending}
              onClick={() => setStep(step === "input" && initialPlatform ? "overview" : step === "input" ? "picker" : "overview")}
              type="button"
            >
              <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
                <path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          )}
          <h2 id="socialModalTitle">
            {step === "overview"
              ? copy.socialProfiles.title
              : step === "picker"
                ? copy.socialProfiles.addIconTitle
                : copy.socialProfiles.addProviderIcon(inputConfig.label)}
          </h2>
          <button
            aria-label={copy.socialProfiles.close}
            className={styles.socialModalIconButton}
            disabled={isPending}
            onClick={requestClose}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </button>
        </header>

        {step === "overview" ? (
          <div className={styles.socialModalBody}>
            <div className={styles.socialModalIntro}>
              <h3>{copy.socialProfiles.description}</h3>
              <p>{copy.socialProfiles.body}</p>
            </div>

            <fieldset className={styles.socialPositionFieldset}>
              <legend>{copy.socialProfiles.positionTitle}</legend>
              <p>{copy.socialProfiles.positionDescription}</p>
              {(["top", "bottom"] as const).map((position) => (
                <label className={styles.socialRadioRow} key={position}>
                  <input
                    checked={activePosition === position}
                    name="social-position"
                    onChange={() => void handlePositionChange(position)}
                    type="radio"
                  />
                  <span>{position === "top" ? copy.socialProfiles.top : copy.socialProfiles.bottom}</span>
                </label>
              ))}
            </fieldset>

            <div className={styles.socialModalActions}>
              <button className={styles.socialInsightsButton} type="button">
                <InsightsIcon />
                {copy.socialProfiles.insights}
              </button>
              <button
                className={styles.socialPrimaryButton}
                onClick={() => setStep("picker")}
                type="button"
              >
                <PlusIcon />
                {copy.socialProfiles.addSocialIcon}
              </button>
            </div>
          </div>
        ) : null}

        {step === "picker" ? (
          <div className={styles.socialPickerBody}>
            <label className={styles.socialSearchField}>
              <SearchIcon />
              <span className="sr-only">{copy.socialProfiles.search}</span>
              <input
                autoFocus
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder={copy.socialProfiles.search}
                type="search"
                value={query}
              />
            </label>
            <div className={styles.socialProviderList}>
              {filteredPlatforms.map((platform) => (
                <button
                  className={styles.socialProviderRow}
                  key={platform}
                  onClick={() => selectPlatform(platform)}
                  type="button"
                >
                  <SocialIcon className={styles.socialProviderIcon} platform={platform} />
                  <span>{SOCIAL_PLATFORM_CONFIG[platform].label}</span>
                  <ArrowRightIcon />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "input" ? (
          <form action={formAction} className={styles.socialInputBody}>
            <input name="platform" type="hidden" value={selectedPlatform} />
            <input
              autoFocus
              className={styles.socialProviderInput}
              disabled={isPending}
              maxLength={inputConfig.maxLength}
              name="handle"
              onChange={(event) => setInputValue(event.currentTarget.value)}
              pattern={inputConfig.inputPattern}
              placeholder={inputConfig.placeholder}
              type={selectedPlatform === "email" ? "email" : "text"}
              value={inputValue}
            />
            <p>{copy.socialProfiles.example(inputConfig.example)}</p>
            {state.message && state.status === "error" ? (
              <p className={styles.socialError} role="status">
                {state.message}
              </p>
            ) : null}
            <button
              className={styles.socialInputSubmit}
              disabled={isPending || !inputIsValid}
              type="submit"
            >
              {isPending ? copy.socialProfiles.saving : copy.socialProfiles.add}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
