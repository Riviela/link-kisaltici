# Dashboard Profile Interactions Polish Design

## Scope

Polish the existing dashboard identity, live-preview sharing panel, shared avatar fallback, and profile-details modal without changing data flow, Server Actions, authentication, link management, publication, or public profile routing.

## Avatar Chain

Copy the reviewed source SVG to `public/default-profile-avatar.svg`. The source contains one embedded PNG data URL and no script, event handler, or external resource.

`ProfileAvatar` keeps one fixed circular frame and resolves sources in this order:

1. Existing public Storage avatar URL.
2. `/default-profile-avatar.svg`.
3. Existing inline anonymous SVG.

Each failed image source is remembered. The next fallback replaces it through the existing image error path. The frame remains identical through every state, preventing layout shift. Dashboard, live preview, and public profile continue using the same component.

## Dashboard Identity

The clickable `@username` uses a scoped reset style instead of the shared button classes. It has no background, border, pill shape, or color change. Pointer hover adds only a thin underline. Keyboard focus uses a dark ink outline, not the global purple focus color. Clicking still opens the profile-details modal.

## Preview URL and Share Panel

The URL trigger keeps dark text in normal, hover, active, and focus states. Hover may use the existing quiet neutral surface color. Selection remains disabled and the trigger continues exposing `aria-expanded`.

The share panel remains constrained to the preview column and contains:

- A `Share` heading and close button.
- One compact public-URL row with an original Canvas Links glyph, truncated URL, and dark Copy button.
- A divider.
- Five equal-width disabled options: Canvas Links, Cards, QR code, Instagram, TikTok.

Disabled options are native disabled buttons inside list items and carry `aria-disabled="true"`. They cannot receive pointer or keyboard activation. Clipboard API and the existing text-selection fallback remain unchanged.

## Presence and Closing

Share and modal use scoped CSS Module keyframes lasting 200ms.

Opening uses opacity plus `translateY(4px)` to zero. Closing reverses the same small movement. Modal overlay animates opacity only. No scale, blur, bounce, glow, or new shadow is introduced.

Both components retain DOM during closing. A closing flag applies the exit class and disables pointer interaction. Unmount happens only after the relevant animation ends.

Share Escape, outside pointer interaction, toggle, and close icon all call one `requestCloseShare()` path. Modal Escape, backdrop, Cancel, successful save, and close behavior all call one `requestCloseModal()` path. Pending bio submission still blocks dismissal.

Reduced-motion removes translation and reduces opacity animation to 1ms.

## Verification

Use the user's existing development server. Do not start, stop, or restart Node/Next processes. Verify desktop and narrow preview layouts, avatar source fallback, username hover/focus, URL hover color, share/modal entry and exit retention, Escape/outside close, disabled actions, and clipboard behavior where browser permissions allow.

Run only `npm run lint`. Stage only this design note, the supplied SVG asset, and directly affected dashboard/profile components. Commit once with:

`style: refine dashboard profile interactions`
