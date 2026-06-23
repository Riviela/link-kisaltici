alter table public.profiles
  add column appearance jsonb not null default '{
    "version": 1,
    "themePreset": "custom",
    "tokens": {
      "background": "#ECEEF1",
      "surface": "#FFFFFF",
      "pageText": "#000000",
      "title": "#000000",
      "buttonBackground": "#FFFFFF",
      "buttonText": "#000000"
    },
    "header": {
      "layout": "classic",
      "alignment": "center",
      "titleStyle": "text",
      "alternativeTitleFont": false
    },
    "wallpaper": {
      "style": "fill",
      "pattern": "none"
    },
    "text": {
      "font": "schibsted-grotesk"
    },
    "buttons": {
      "style": "solid",
      "radius": "rounder",
      "shadow": "none",
      "alignment": "center"
    },
    "stickers": {
      "preset": "none"
    },
    "footer": {
      "style": "default",
      "visible": true
    }
  }'::jsonb;

alter table public.profiles
  add constraint profiles_appearance_is_object
  check (jsonb_typeof(appearance) = 'object');
