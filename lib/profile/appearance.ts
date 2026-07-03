export const THEME_PRESETS = [
  "custom",
  "air",
  "agate",
  "astrid",
  "aura",
  "bliss",
  "blocks",
  "bloom",
  "breeze",
  "encore",
  "grid",
  "groove",
  "haven",
  "lake",
  "mineral",
  "nourish",
  "rise",
  "sweat",
  "tress",
  "twilight",
  "vox",
] as const;

export const HEADER_LAYOUTS = [
  "classic",
  "hero",
  "banner",
  "cutout",
  "shape",
] as const;

export const HEADER_SHAPES = [
  "flower",
  "oval",
  "rounded",
  "burst",
] as const;

export const WALLPAPER_STYLES = [
  "fill",
  "gradient",
  "soft-blur",
  "pattern-grid",
] as const;

export const FONT_PRESETS = [
  "schibsted-grotesk",
  "system-sans",
  "serif-soft",
  "mono-quiet",
] as const;

export const BUTTON_STYLES = ["solid", "outline", "soft"] as const;
export const BUTTON_RADII = ["square", "round", "rounder", "full"] as const;
export const BUTTON_SHADOWS = ["none", "soft", "strong", "hard"] as const;
export const ALIGNMENTS = ["left", "center"] as const;

export type ThemePreset = (typeof THEME_PRESETS)[number];
export type HeaderLayout = (typeof HEADER_LAYOUTS)[number];
export type HeaderShape = (typeof HEADER_SHAPES)[number];
export type WallpaperStyle = (typeof WALLPAPER_STYLES)[number];
export type FontPreset = (typeof FONT_PRESETS)[number];
export type ButtonStyle = (typeof BUTTON_STYLES)[number];
export type ButtonRadius = (typeof BUTTON_RADII)[number];
export type ButtonShadow = (typeof BUTTON_SHADOWS)[number];
export type AppearanceAlignment = (typeof ALIGNMENTS)[number];

export interface AppearanceTokens {
  background: string;
  surface: string;
  pageText: string;
  title: string;
  buttonBackground: string;
  buttonText: string;
}

export interface ProfileAppearance {
  version: 1;
  themePreset: ThemePreset;
  tokens: AppearanceTokens;
  header: {
    layout: HeaderLayout;
    shape: HeaderShape;
    alignment: AppearanceAlignment;
    titleStyle: "text";
    alternativeTitleFont: boolean;
  };
  wallpaper: {
    style: WallpaperStyle;
    pattern: "none";
  };
  text: {
    font: FontPreset;
  };
  buttons: {
    style: ButtonStyle;
    radius: ButtonRadius;
    shadow: ButtonShadow;
    alignment: AppearanceAlignment;
  };
  stickers: {
    preset: "none";
  };
  footer: {
    style: "default";
    visible: true;
  };
}

export interface AppearanceValidationResult {
  success: boolean;
  appearance?: ProfileAppearance;
  message?: string;
}

export const DEFAULT_APPEARANCE: ProfileAppearance = {
  version: 1,
  themePreset: "air",
  tokens: {
    background: "#ECEEF1",
    surface: "#FFFFFF",
    pageText: "#000000",
    title: "#000000",
    buttonBackground: "#FFFFFF",
    buttonText: "#000000",
  },
  header: {
    layout: "classic",
    shape: "flower",
    alignment: "center",
    titleStyle: "text",
    alternativeTitleFont: false,
  },
  wallpaper: {
    style: "fill",
    pattern: "none",
  },
  text: {
    font: "schibsted-grotesk",
  },
  buttons: {
    style: "solid",
    radius: "rounder",
    shadow: "none",
    alignment: "center",
  },
  stickers: {
    preset: "none",
  },
  footer: {
    style: "default",
    visible: true,
  },
};

export const THEME_PRESET_MAP: Record<
  ThemePreset,
  Partial<ProfileAppearance>
> = {
  custom: {},
  air: {
    tokens: { ...DEFAULT_APPEARANCE.tokens },
    text: { ...DEFAULT_APPEARANCE.text },
    buttons: { ...DEFAULT_APPEARANCE.buttons },
  },
  agate: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#D7F1D4",
      buttonBackground: "#A7FF00",
      buttonText: "#10130F",
      title: "#1D3319",
    },
    wallpaper: { style: "gradient", pattern: "none" },
  },
  astrid: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#141512",
      pageText: "#F5F2EC",
      title: "#FFFFFF",
      buttonBackground: "#2F312B",
      buttonText: "#FFFFFF",
    },
    buttons: { ...DEFAULT_APPEARANCE.buttons, style: "soft", shadow: "soft" },
    wallpaper: { style: "soft-blur", pattern: "none" },
  },
  aura: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#D8D4C9",
      buttonBackground: "#E9E3D6",
      title: "#27251F",
    },
  },
  bliss: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#DCE2DF",
      buttonBackground: "#F4F6F2",
    },
    wallpaper: { style: "soft-blur", pattern: "none" },
  },
  blocks: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#8A2BEA",
      pageText: "#FFFFFF",
      title: "#FFFFFF",
      buttonBackground: "#D84ED8",
      buttonText: "#11131A",
    },
    buttons: { ...DEFAULT_APPEARANCE.buttons, style: "solid", radius: "square" },
  },
  bloom: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#CF4057",
      pageText: "#FFFFFF",
      title: "#FFFFFF",
      buttonBackground: "#3C266F",
      buttonText: "#FFFFFF",
    },
    wallpaper: { style: "gradient", pattern: "none" },
  },
  breeze: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#F2B6D3",
      buttonBackground: "#F6D5EB",
    },
    wallpaper: { style: "gradient", pattern: "none" },
  },
  encore: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#071014",
      pageText: "#E3F0EF",
      title: "#FFFFFF",
      buttonBackground: "#101C21",
      buttonText: "#DFA48C",
    },
    buttons: { ...DEFAULT_APPEARANCE.buttons, style: "outline", radius: "round" },
  },
  grid: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#DDEB94",
      buttonBackground: "#F8FFF3",
    },
    wallpaper: { style: "pattern-grid", pattern: "none" },
  },
  groove: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#4451C9",
      pageText: "#FFFFFF",
      title: "#FFFFFF",
      buttonBackground: "#8D6D69",
      buttonText: "#FFFFFF",
    },
    wallpaper: { style: "gradient", pattern: "none" },
  },
  haven: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#8B785D",
      pageText: "#15130E",
      buttonBackground: "#EAE5D8",
    },
  },
  lake: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#151925",
      pageText: "#E8ECF2",
      title: "#FFFFFF",
      buttonBackground: "#0B1019",
      buttonText: "#FFFFFF",
    },
    buttons: { ...DEFAULT_APPEARANCE.buttons, style: "soft", shadow: "soft" },
  },
  mineral: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#F3E6DB",
      buttonBackground: "#FFF7EF",
      buttonText: "#1C1917",
    },
    buttons: { ...DEFAULT_APPEARANCE.buttons, style: "outline" },
  },
  nourish: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#687C38",
      pageText: "#F1FFD1",
      title: "#E9FF79",
      buttonBackground: "#D6ED6D",
      buttonText: "#17200C",
    },
  },
  rise: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#F06445",
      pageText: "#FFFFFF",
      title: "#FFFFFF",
      buttonBackground: "#F5A974",
    },
    wallpaper: { style: "gradient", pattern: "none" },
  },
  sweat: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#1483E6",
      pageText: "#FFFFFF",
      title: "#FFFFFF",
      buttonBackground: "#5D9BFF",
      buttonText: "#FFFFFF",
    },
  },
  tress: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#7A6A45",
      pageText: "#F7E7B8",
      title: "#F6D38B",
      buttonBackground: "#CBB77D",
    },
  },
  twilight: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#524783",
      pageText: "#FFE5FF",
      title: "#F5C0FF",
      buttonBackground: "#F1B6F2",
    },
    wallpaper: { style: "gradient", pattern: "none" },
  },
  vox: {
    tokens: {
      ...DEFAULT_APPEARANCE.tokens,
      background: "#8D160F",
      pageText: "#FFE7D6",
      title: "#FFFFFF",
      buttonBackground: "#B83228",
      buttonText: "#FFFFFF",
    },
    buttons: { ...DEFAULT_APPEARANCE.buttons, radius: "round", shadow: "hard" },
  },
};

const EXACT_KEYS = {
  root: [
    "version",
    "themePreset",
    "tokens",
    "header",
    "wallpaper",
    "text",
    "buttons",
    "stickers",
    "footer",
  ],
  tokens: [
    "background",
    "surface",
    "pageText",
    "title",
    "buttonBackground",
    "buttonText",
  ],
  header: ["layout", "shape", "alignment", "titleStyle", "alternativeTitleFont"],
  legacyHeader: ["layout", "alignment", "titleStyle", "alternativeTitleFont"],
  wallpaper: ["style", "pattern"],
  text: ["font"],
  buttons: ["style", "radius", "shadow", "alignment"],
  stickers: ["preset"],
  footer: ["style", "visible"],
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
) {
  const actualKeys = Object.keys(value);
  return (
    actualKeys.length === keys.length &&
    actualKeys.every((key) => keys.includes(key))
  );
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  values: T,
): value is T[number] {
  return typeof value === "string" && values.includes(value);
}

export function normalizeHexColor(value: unknown) {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : null;
}

function validateTokens(value: unknown) {
  if (!isRecord(value) || !hasExactKeys(value, EXACT_KEYS.tokens)) {
    return null;
  }

  const tokens = {
    background: normalizeHexColor(value.background),
    surface: normalizeHexColor(value.surface),
    pageText: normalizeHexColor(value.pageText),
    title: normalizeHexColor(value.title),
    buttonBackground: normalizeHexColor(value.buttonBackground),
    buttonText: normalizeHexColor(value.buttonText),
  };

  if (Object.values(tokens).some((token) => token === null)) {
    return null;
  }

  return tokens as AppearanceTokens;
}

export function applyThemePreset(
  appearance: ProfileAppearance,
  themePreset: ThemePreset,
): ProfileAppearance {
  const preset = THEME_PRESET_MAP[themePreset];

  return {
    ...appearance,
    ...preset,
    themePreset,
    tokens: {
      ...appearance.tokens,
      ...(preset.tokens ?? {}),
    },
    header: {
      ...appearance.header,
      ...(preset.header ?? {}),
    },
    wallpaper: {
      ...appearance.wallpaper,
      ...(preset.wallpaper ?? {}),
    },
    text: {
      ...appearance.text,
      ...(preset.text ?? {}),
    },
    buttons: {
      ...appearance.buttons,
      ...(preset.buttons ?? {}),
    },
  };
}

export function normalizeAppearance(value: unknown): ProfileAppearance {
  const result = validateAppearanceUpdate(value);
  return result.success && result.appearance
    ? result.appearance
    : DEFAULT_APPEARANCE;
}

export function validateAppearanceUpdate(
  value: unknown,
): AppearanceValidationResult {
  if (!isRecord(value) || !hasExactKeys(value, EXACT_KEYS.root)) {
    return { success: false, message: "Appearance settings are invalid." };
  }

  const tokens = validateTokens(value.tokens);
  const header = value.header;
  const wallpaper = value.wallpaper;
  const text = value.text;
  const buttons = value.buttons;
  const stickers = value.stickers;
  const footer = value.footer;

  if (
    value.version !== 1 ||
    !isOneOf(value.themePreset, THEME_PRESETS) ||
    !tokens ||
    !isRecord(header) ||
    !(
      hasExactKeys(header, EXACT_KEYS.header) ||
      hasExactKeys(header, EXACT_KEYS.legacyHeader)
    ) ||
    !isOneOf(header.layout, HEADER_LAYOUTS) ||
    !(
      header.shape === undefined ||
      isOneOf(header.shape, HEADER_SHAPES)
    ) ||
    !isOneOf(header.alignment, ALIGNMENTS) ||
    header.titleStyle !== "text" ||
    typeof header.alternativeTitleFont !== "boolean" ||
    !isRecord(wallpaper) ||
    !hasExactKeys(wallpaper, EXACT_KEYS.wallpaper) ||
    !isOneOf(wallpaper.style, WALLPAPER_STYLES) ||
    wallpaper.pattern !== "none" ||
    !isRecord(text) ||
    !hasExactKeys(text, EXACT_KEYS.text) ||
    !isOneOf(text.font, FONT_PRESETS) ||
    !isRecord(buttons) ||
    !hasExactKeys(buttons, EXACT_KEYS.buttons) ||
    !isOneOf(buttons.style, BUTTON_STYLES) ||
    !isOneOf(buttons.radius, BUTTON_RADII) ||
    !isOneOf(buttons.shadow, BUTTON_SHADOWS) ||
    !isOneOf(buttons.alignment, ALIGNMENTS) ||
    !isRecord(stickers) ||
    !hasExactKeys(stickers, EXACT_KEYS.stickers) ||
    stickers.preset !== "none" ||
    !isRecord(footer) ||
    !hasExactKeys(footer, EXACT_KEYS.footer) ||
    footer.style !== "default" ||
    footer.visible !== true
  ) {
    return { success: false, message: "Appearance settings are invalid." };
  }

  return {
    success: true,
    appearance: {
      version: 1,
      themePreset: value.themePreset,
      tokens,
      header: {
        layout: header.layout,
        shape: header.shape ?? "flower",
        alignment: header.alignment,
        titleStyle: "text",
        alternativeTitleFont: header.alternativeTitleFont,
      },
      wallpaper: {
        style: wallpaper.style,
        pattern: "none",
      },
      text: {
        font: text.font,
      },
      buttons: {
        style: buttons.style,
        radius: buttons.radius,
        shadow: buttons.shadow,
        alignment: buttons.alignment,
      },
      stickers: {
        preset: "none",
      },
      footer: {
        style: "default",
        visible: true,
      },
    },
  };
}
