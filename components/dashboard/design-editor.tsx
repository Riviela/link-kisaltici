"use client";

import { useState, type ReactNode } from "react";

import {
  ALIGNMENTS,
  applyThemePreset,
  BUTTON_RADII,
  BUTTON_SHADOWS,
  BUTTON_STYLES,
  FONT_PRESETS,
  HEADER_SHAPES,
  HEADER_LAYOUTS,
  normalizeHexColor,
  THEME_PRESETS,
  WALLPAPER_STYLES,
  type AppearanceAlignment,
  type ButtonRadius,
  type ButtonShadow,
  type ButtonStyle,
  type FontPreset,
  type HeaderLayout,
  type HeaderShape,
  type ProfileAppearance,
  type ThemePreset,
  type WallpaperStyle,
} from "@/lib/profile/appearance";
import { copy } from "@/lib/copy";

import styles from "./design-editor.module.css";

type DesignTab =
  | "theme"
  | "header"
  | "wallpaper"
  | "text"
  | "buttons"
  | "colors"
  | "stickers"
  | "footer";

interface DesignEditorProps {
  appearance: ProfileAppearance;
  isDirty: boolean;
  isSaving: boolean;
  onChange: (appearance: ProfileAppearance) => void;
  onSave: () => void;
  status: { tone: "success" | "error" | "neutral"; text: string } | null;
  avatarUrl: string | null;
  username: string;
}

type AppearancePatch = Omit<
  Partial<ProfileAppearance>,
  "tokens" | "header" | "wallpaper" | "text" | "buttons" | "stickers" | "footer"
> & {
  tokens?: Partial<ProfileAppearance["tokens"]>;
  header?: Partial<ProfileAppearance["header"]>;
  wallpaper?: Partial<ProfileAppearance["wallpaper"]>;
  text?: Partial<ProfileAppearance["text"]>;
  buttons?: Partial<ProfileAppearance["buttons"]>;
  stickers?: Partial<ProfileAppearance["stickers"]>;
  footer?: Partial<ProfileAppearance["footer"]>;
};

const DESIGN_TABS: Array<{ id: DesignTab; label: string; icon: string }> = [
  { id: "theme", label: "Theme", icon: "▣" },
  { id: "header", label: "Header", icon: "◠" },
  { id: "wallpaper", label: "Wallpaper", icon: "◇" },
  { id: "text", label: "Text", icon: "T" },
  { id: "buttons", label: "Buttons", icon: "▰" },
  { id: "colors", label: "Colors", icon: "◉" },
  { id: "stickers", label: "Stickers", icon: "◒" },
  { id: "footer", label: "Footer", icon: "✶" },
];

const THEME_LABELS: Record<ThemePreset, string> = {
  custom: "Custom",
  air: "Air",
  agate: "Agate",
  astrid: "Astrid",
  aura: "Aura",
  bliss: "Bliss",
  blocks: "Blocks",
  bloom: "Bloom",
  breeze: "Breeze",
  encore: "Encore",
  grid: "Grid",
  groove: "Groove",
  haven: "Haven",
  lake: "Lake",
  mineral: "Mineral",
  nourish: "Nourish",
  rise: "Rise",
  sweat: "Sweat",
  tress: "Tress",
  twilight: "Twilight",
  vox: "Vox",
};

const HEADER_LABELS: Record<HeaderLayout, string> = {
  classic: "Classic",
  hero: "Hero",
  banner: "Banner",
  cutout: "Cutout",
  shape: "Shape",
};

const SHAPE_LABELS: Record<HeaderShape, string> = {
  flower: "Flower",
  oval: "Oval",
  rounded: "Rounded",
  burst: "Burst",
};

const WALLPAPER_LABELS: Record<WallpaperStyle, string> = {
  fill: "Fill",
  gradient: "Gradient",
  "soft-blur": "Blur",
  "pattern-grid": "Pattern",
};

const FONT_LABELS: Record<FontPreset, string> = {
  "schibsted-grotesk": "Schibsted Grotesk",
  "system-sans": "System Sans",
  "serif-soft": "Serif Soft",
  "mono-quiet": "Mono Quiet",
};

const BUTTON_STYLE_LABELS: Record<ButtonStyle, string> = {
  solid: "Solid",
  outline: "Outline",
  soft: "Soft",
};

const RADIUS_LABELS: Record<ButtonRadius, string> = {
  square: "Square",
  round: "Round",
  rounder: "Rounder",
  full: "Full",
};

const SHADOW_LABELS: Record<ButtonShadow, string> = {
  none: "None",
  soft: "Soft",
  strong: "Strong",
  hard: "Hard",
};

const ALIGNMENT_LABELS: Record<AppearanceAlignment, string> = {
  left: "Left",
  center: "Center",
};

function patchAppearance(
  appearance: ProfileAppearance,
  patch: AppearancePatch,
): ProfileAppearance {
  return {
    ...appearance,
    ...patch,
    themePreset: "custom",
    tokens: { ...appearance.tokens, ...(patch.tokens ?? {}) },
    header: { ...appearance.header, ...(patch.header ?? {}) },
    wallpaper: { ...appearance.wallpaper, ...(patch.wallpaper ?? {}) },
    text: { ...appearance.text, ...(patch.text ?? {}) },
    buttons: { ...appearance.buttons, ...(patch.buttons ?? {}) },
    stickers: { ...appearance.stickers, ...(patch.stickers ?? {}) },
    footer: { ...appearance.footer, ...(patch.footer ?? {}) },
  };
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className={styles.fieldLabel}>{children}</label>;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.colorField}>
      <FieldLabel>{label}</FieldLabel>
      <div className={styles.colorInputShell}>
        <input
          aria-label={label}
          className={styles.textInput}
          maxLength={7}
          onChange={(event) => {
            const color = normalizeHexColor(event.target.value);
            if (color) onChange(color);
          }}
          pattern="#[0-9A-Fa-f]{6}"
          value={value}
        />
        <span
          aria-hidden="true"
          className={styles.colorSwatch}
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}

function SelectControl<T extends string>({
  label,
  value,
  values,
  getLabel,
  onChange,
}: {
  label: string;
  value: T;
  values: readonly T[];
  getLabel: (value: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.controlGroup}>
      <FieldLabel>{label}</FieldLabel>
      <select
        className={styles.selectControl}
        onChange={(event) => onChange(event.target.value as T)}
        value={value}
      >
        {values.map((item) => (
          <option key={item} value={item}>
            {getLabel(item)}
          </option>
        ))}
      </select>
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  values,
  getLabel,
  onChange,
}: {
  label: string;
  value: T;
  values: readonly T[];
  getLabel: (value: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <section className={styles.controlGroup}>
      <h3 className={styles.groupTitle}>{label}</h3>
      <div className={styles.segmentedGrid}>
        {values.map((item) => (
          <button
            className={styles.segmentButton}
            data-selected={item === value}
            key={item}
            onClick={() => onChange(item)}
            type="button"
          >
            {getLabel(item)}
          </button>
        ))}
      </div>
    </section>
  );
}

function ButtonStyleControl({
  appearance,
  onChange,
}: {
  appearance: ProfileAppearance;
  onChange: (appearance: ProfileAppearance) => void;
}) {
  return (
    <section className={styles.controlGroup}>
      <h3 className={styles.groupTitle}>Button style</h3>
      <div className={`${styles.visualChoiceGrid} ${styles.buttonStyleGrid}`}>
        {BUTTON_STYLES.map((style) => (
          <button
            aria-pressed={appearance.buttons.style === style}
            className={styles.visualChoiceButton}
            data-selected={appearance.buttons.style === style}
            key={style}
            onClick={() =>
              onChange(patchAppearance(appearance, { buttons: { style } }))
            }
            type="button"
          >
            <span className={styles.visualChoiceSurface}>
              <span
                className={`${styles.buttonStylePreview} ${
                  styles[`buttonStylePreview${style}`]
                }`}
              />
            </span>
            <span className={styles.cardLabel}>{BUTTON_STYLE_LABELS[style]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CornerRoundnessControl({
  appearance,
  onChange,
}: {
  appearance: ProfileAppearance;
  onChange: (appearance: ProfileAppearance) => void;
}) {
  return (
    <section className={styles.controlGroup}>
      <h3 className={styles.groupTitle}>Corner roundness</h3>
      <div className={`${styles.visualChoiceGrid} ${styles.radiusGrid}`}>
        {BUTTON_RADII.map((radius) => (
          <button
            aria-pressed={appearance.buttons.radius === radius}
            className={styles.visualChoiceButton}
            data-selected={appearance.buttons.radius === radius}
            key={radius}
            onClick={() =>
              onChange(patchAppearance(appearance, { buttons: { radius } }))
            }
            type="button"
          >
            <span className={`${styles.visualChoiceSurface} ${styles.radiusSurface}`}>
              <span
                className={`${styles.radiusPreview} ${
                  styles[`radiusPreview${radius}`]
                }`}
              />
            </span>
            <span className={styles.cardLabel}>{RADIUS_LABELS[radius]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function HeaderPreviewAvatar({
  avatarUrl,
  className = "",
}: {
  avatarUrl: string | null;
  className?: string;
}) {
  return (
    <span className={`${styles.headerPreviewAvatar} ${className}`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" src={avatarUrl} />
      ) : null}
    </span>
  );
}

function ThemePanel({
  appearance,
  onChange,
}: {
  appearance: ProfileAppearance;
  onChange: (appearance: ProfileAppearance) => void;
}) {
  return (
    <>
      <div className={styles.tabRow}>
        <button className={styles.tabActive} type="button">
          Customizable
        </button>
        <button className={styles.tabMuted} type="button">
          Curated
        </button>
      </div>

      <div className={styles.themeGrid}>
        {THEME_PRESETS.map((theme) => (
          <button
            aria-pressed={appearance.themePreset === theme}
            className={styles.themeCardButton}
            data-selected={appearance.themePreset === theme}
            key={theme}
            onClick={() => onChange(applyThemePreset(appearance, theme))}
            type="button"
          >
            <span className={`${styles.themePreview} ${styles[`themePreview${theme}`]}`}>
              <span>Aa</span>
              <span />
            </span>
            <span className={styles.cardLabel}>{THEME_LABELS[theme]}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function HeaderPanel({
  appearance,
  avatarUrl,
  onChange,
  username,
}: {
  appearance: ProfileAppearance;
  avatarUrl: string | null;
  onChange: (appearance: ProfileAppearance) => void;
  username: string;
}) {
  return (
    <>
      <section className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Layout</h3>
        <div className={styles.presetGrid}>
          {HEADER_LAYOUTS.map((layout) => (
            <button
              className={styles.layoutCardButton}
              data-selected={appearance.header.layout === layout}
              key={layout}
              onClick={() =>
                onChange(patchAppearance(appearance, { header: { layout } }))
              }
              type="button"
            >
              <span className={`${styles.headerPreview} ${styles[`headerPreview${layout}`]}`}>
                {layout === "classic" ? (
                  <HeaderPreviewAvatar avatarUrl={avatarUrl} />
                ) : layout === "hero" ? (
                  <HeaderPreviewAvatar
                    avatarUrl={avatarUrl}
                    className={styles.headerPreviewAvatarHero}
                  />
                ) : layout === "shape" ? (
                  <HeaderPreviewAvatar
                    avatarUrl={avatarUrl}
                    className={`${styles.headerPreviewAvatarShape} ${
                      styles[`shapePreview${appearance.header.shape}`]
                    }`}
                  />
                ) : (
                  <span />
                )}
              </span>
              <span className={styles.cardLabel}>{HEADER_LABELS[layout]}</span>
            </button>
          ))}
        </div>
      </section>

      {appearance.header.layout === "shape" ? (
        <section className={styles.controlGroup}>
          <h3 className={styles.groupTitle}>Shape</h3>
          <div className={`${styles.visualChoiceGrid} ${styles.shapeChoiceGrid}`}>
            {HEADER_SHAPES.map((shape) => (
              <button
                aria-pressed={appearance.header.shape === shape}
                className={styles.visualChoiceButton}
                data-selected={appearance.header.shape === shape}
                key={shape}
                onClick={() =>
                  onChange(patchAppearance(appearance, { header: { shape } }))
                }
                type="button"
              >
                <span className={styles.shapeChoiceSurface}>
                  <span
                    className={`${styles.shapeChoicePreview} ${
                      styles[`shapePreview${shape}`]
                    }`}
                  />
                </span>
                <span className={styles.cardLabel}>{SHAPE_LABELS[shape]}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.profileImageRow}>
        <h3 className={styles.groupTitle}>Profile image</h3>
        <div className={styles.avatarPlaceholder} aria-hidden="true" />
        <button
          aria-disabled="true"
          className={styles.inertDarkButton}
          disabled
          type="button"
        >
          + Add
        </button>
      </section>

      <div className={styles.controlGroup}>
        <FieldLabel>Title</FieldLabel>
        <input
          aria-label="Title"
          className={styles.textInput}
          disabled
          value={`@${username}`}
        />
      </div>

      <SegmentedControl
        getLabel={(value) => (value === "true" ? "Alternative" : "Default")}
        label="Alternative title font"
        onChange={(value) =>
          onChange(
            patchAppearance(appearance, {
              header: { alternativeTitleFont: value === "true" },
            }),
          )
        }
        value={String(appearance.header.alternativeTitleFont) as "true" | "false"}
        values={["false", "true"] as const}
      />

      <ColorField
        label="Title color"
        onChange={(title) =>
          onChange(patchAppearance(appearance, { tokens: { title } }))
        }
        value={appearance.tokens.title}
      />
    </>
  );
}

function WallpaperPanel({
  appearance,
  onChange,
}: {
  appearance: ProfileAppearance;
  onChange: (appearance: ProfileAppearance) => void;
}) {
  return (
    <>
      <section className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Wallpaper style</h3>
        <div className={styles.presetGrid}>
          {WALLPAPER_STYLES.map((wallpaperStyle) => (
            <button
              className={styles.layoutCardButton}
              data-selected={appearance.wallpaper.style === wallpaperStyle}
              key={wallpaperStyle}
              onClick={() =>
                onChange(
                  patchAppearance(appearance, {
                    wallpaper: { style: wallpaperStyle },
                  }),
                )
              }
              type="button"
            >
              <span
                className={`${styles.wallpaperPreview} ${
                  styles[`wallpaperPreview${wallpaperStyle.replace("-", "")}`]
                }`}
              />
              <span className={styles.cardLabel}>
                {WALLPAPER_LABELS[wallpaperStyle]}
              </span>
            </button>
          ))}
          <button className={styles.layoutCardButton} disabled type="button">
            <span className={styles.mediaPreview}>▧</span>
            <span className={styles.cardLabel}>Image</span>
          </button>
          <button className={styles.layoutCardButton} disabled type="button">
            <span className={styles.mediaPreview}>▻</span>
            <span className={styles.cardLabel}>Video</span>
          </button>
        </div>
      </section>

      <ColorField
        label="Background color"
        onChange={(background) =>
          onChange(patchAppearance(appearance, { tokens: { background } }))
        }
        value={appearance.tokens.background}
      />
    </>
  );
}

function TextPanel({
  appearance,
  onChange,
}: {
  appearance: ProfileAppearance;
  onChange: (appearance: ProfileAppearance) => void;
}) {
  return (
    <>
      <SelectControl
        getLabel={(font) => FONT_LABELS[font]}
        label="Page font"
        onChange={(font) =>
          onChange(patchAppearance(appearance, { text: { font } }))
        }
        value={appearance.text.font}
        values={FONT_PRESETS}
      />
      <ColorField
        label="Page text color"
        onChange={(pageText) =>
          onChange(patchAppearance(appearance, { tokens: { pageText } }))
        }
        value={appearance.tokens.pageText}
      />
      <SegmentedControl
        getLabel={(value) => (value === "true" ? "Alternative" : "Default")}
        label="Alternative title font"
        onChange={(value) =>
          onChange(
            patchAppearance(appearance, {
              header: { alternativeTitleFont: value === "true" },
            }),
          )
        }
        value={String(appearance.header.alternativeTitleFont) as "true" | "false"}
        values={["false", "true"] as const}
      />
      <ColorField
        label="Title color"
        onChange={(title) =>
          onChange(patchAppearance(appearance, { tokens: { title } }))
        }
        value={appearance.tokens.title}
      />
    </>
  );
}

function ButtonsPanel({
  appearance,
  onChange,
}: {
  appearance: ProfileAppearance;
  onChange: (appearance: ProfileAppearance) => void;
}) {
  return (
    <>
      <ButtonStyleControl appearance={appearance} onChange={onChange} />
      <CornerRoundnessControl appearance={appearance} onChange={onChange} />
      <SegmentedControl
        getLabel={(shadow) => SHADOW_LABELS[shadow]}
        label="Button shadow"
        onChange={(shadow) =>
          onChange(patchAppearance(appearance, { buttons: { shadow } }))
        }
        value={appearance.buttons.shadow}
        values={BUTTON_SHADOWS}
      />
      <ColorField
        label="Button color"
        onChange={(buttonBackground) =>
          onChange(
            patchAppearance(appearance, { tokens: { buttonBackground } }),
          )
        }
        value={appearance.tokens.buttonBackground}
      />
      <ColorField
        label="Button text color"
        onChange={(buttonText) =>
          onChange(patchAppearance(appearance, { tokens: { buttonText } }))
        }
        value={appearance.tokens.buttonText}
      />
      <SegmentedControl
        getLabel={(alignment) => ALIGNMENT_LABELS[alignment]}
        label="Button text alignment"
        onChange={(alignment) =>
          onChange(patchAppearance(appearance, { buttons: { alignment } }))
        }
        value={appearance.buttons.alignment}
        values={ALIGNMENTS}
      />
    </>
  );
}

function ColorsPanel({
  appearance,
  onChange,
}: {
  appearance: ProfileAppearance;
  onChange: (appearance: ProfileAppearance) => void;
}) {
  return (
    <>
      <ColorField
        label="Background"
        onChange={(background) =>
          onChange(patchAppearance(appearance, { tokens: { background } }))
        }
        value={appearance.tokens.background}
      />
      <ColorField
        label="Buttons"
        onChange={(buttonBackground) =>
          onChange(
            patchAppearance(appearance, { tokens: { buttonBackground } }),
          )
        }
        value={appearance.tokens.buttonBackground}
      />
      <ColorField
        label="Button text"
        onChange={(buttonText) =>
          onChange(patchAppearance(appearance, { tokens: { buttonText } }))
        }
        value={appearance.tokens.buttonText}
      />
      <ColorField
        label="Page text"
        onChange={(pageText) =>
          onChange(patchAppearance(appearance, { tokens: { pageText } }))
        }
        value={appearance.tokens.pageText}
      />
      <ColorField
        label="Title"
        onChange={(title) =>
          onChange(patchAppearance(appearance, { tokens: { title } }))
        }
        value={appearance.tokens.title}
      />
    </>
  );
}

function PlaceholderPanel({ type }: { type: "stickers" | "footer" }) {
  return (
    <div className={styles.placeholderPanel}>
      <h3>{type === "stickers" ? "Stickers" : "Footer"}</h3>
      <p>
        {type === "stickers"
          ? "Sticker upload and placement are reserved for a later version."
          : "Footer stays on the default Canvas Links footer for V1."}
      </p>
      <button aria-disabled="true" disabled type="button">
        {type === "stickers" ? "No stickers" : "Default footer"}
      </button>
    </div>
  );
}

export function DesignEditor({
  appearance,
  avatarUrl,
  isDirty,
  isSaving,
  onChange,
  onSave,
  status,
  username,
}: DesignEditorProps) {
  const [activeTab, setActiveTab] = useState<DesignTab>("theme");
  const activeTabLabel =
    DESIGN_TABS.find((tab) => tab.id === activeTab)?.label ?? "Theme";

  return (
    <div className={styles.designShell}>
      <div className={styles.designTop}>
        <button aria-disabled="true" className={styles.enhanceButton} disabled type="button">
          ✧ Enhance
        </button>
      </div>

      <div className={styles.designBody}>
        <nav aria-label="Design sections" className={styles.designNav}>
          {DESIGN_TABS.map((tab) => (
            <button
              className={styles.designNavItem}
              data-active={tab.id === activeTab}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <section className={styles.designPanel}>
          <div className={styles.designPanelHeader}>
            <h2>{activeTabLabel}</h2>
            <div className={styles.saveCluster}>
              {status ? (
                <p
                  className={styles.statusMessage}
                  data-tone={status.tone}
                  role="status"
                >
                  {status.text}
                </p>
              ) : isDirty ? (
                <p className={styles.statusMessage} data-tone="neutral">
                  {copy.appearance.unsaved}
                </p>
              ) : null}
              <button
                className={styles.saveButton}
                disabled={!isDirty || isSaving}
                onClick={onSave}
                type="button"
              >
                {isSaving ? copy.appearance.saving : copy.appearance.save}
              </button>
            </div>
          </div>

          <div className={styles.panelContent}>
            {activeTab === "theme" ? (
              <ThemePanel appearance={appearance} onChange={onChange} />
            ) : null}
            {activeTab === "header" ? (
              <HeaderPanel
                appearance={appearance}
                avatarUrl={avatarUrl}
                onChange={onChange}
                username={username}
              />
            ) : null}
            {activeTab === "wallpaper" ? (
              <WallpaperPanel appearance={appearance} onChange={onChange} />
            ) : null}
            {activeTab === "text" ? (
              <TextPanel appearance={appearance} onChange={onChange} />
            ) : null}
            {activeTab === "buttons" ? (
              <ButtonsPanel appearance={appearance} onChange={onChange} />
            ) : null}
            {activeTab === "colors" ? (
              <ColorsPanel appearance={appearance} onChange={onChange} />
            ) : null}
            {activeTab === "stickers" ? <PlaceholderPanel type="stickers" /> : null}
            {activeTab === "footer" ? <PlaceholderPanel type="footer" /> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
