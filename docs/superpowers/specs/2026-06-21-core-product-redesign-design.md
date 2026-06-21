# Core Product Redesign Design

## Intent

Refresh the existing product without changing its data model, authorization, Server Actions, routing behavior, or feature set. The reference images inform the spacious editor proportions, rounded surfaces, split authentication layout, and phone-like profile presentation, but no external brand assets, names, logos, paid-feature controls, or inactive affordances are copied.

## Design System

Central CSS tokens in `app/globals.css` define the system:

- Page gray: `#F4F5F7`
- Surface: `#FFFFFF`
- Raised surface: `#FAFAFC`
- Primary text: `#17171C`
- Muted text: `#6F7280`
- Border: `#E4E5EA`
- Accent: `#6D5DFB`
- Accent strong: `#5947EE`
- Accent soft: `#EEECFF`
- Error and success remain semantic status colors, not competing brand accents.

Spacing follows a 4px base scale. Container radii use 28-36px, cards 20-24px, controls 14-18px, and pills only for compact status/actions. Shadows use a cool violet-gray tint and a consistent top-left light source.

Typography uses a deliberate system stack led by `Avenir Next`, `Segoe UI`, and sans-serif fallbacks. Display copy uses heavier weight and tight tracking; utility labels use medium weight and restrained tracking.

## Signature

The recurring product signature is the framed live profile: a quiet phone-like canvas with a violet halo and compact profile/link composition. It appears as the dashboard preview and is echoed by the public profile card. Auth screens use abstract CSS blocks and miniature profile cards derived from the same geometry.

## Dashboard

Desktop uses three functional areas:

```text
+------+-------------------------------+--------------------+
| rail | profile header                | sticky preview     |
|      | add-link editor               |                    |
|      | sortable link cards           |                    |
+------+-------------------------------+--------------------+
```

The rail contains only the existing `Content` destination and marks it current. The center preserves every create, edit, toggle, delete, drag-sort, saving, rollback, and error flow. The create submit becomes the wide violet primary action. Link cards expose only the working handle, title, URL, active state, edit, and delete actions.

`LinkManager` remains the owner of the current and safe link arrays. It passes its current local array to a presentation-only preview, so successful mutations and optimistic ordering appear there without changing persistence behavior. The dnd-kit `useId()` hydration fix remains untouched.

The preview is sticky on wide screens and hidden below the desktop breakpoint. The profile header retains display name, username, publish/private control, product title, and logout.

## Public Profile

On mobile, the profile occupies the full viewport. On larger screens, it becomes a narrow centered card on the gray environment. It shows the avatar placeholder, display name, username, optional bio, active links, and the existing empty state. No product footer, external CTA, QR code, or brand mark is added.

All existing `is_published`, `is_active`, ordering, 404, and anonymous-read behavior stays unchanged.

## Authentication And Onboarding

Login and registration use a two-column desktop composition. The left panel holds the unchanged form and navigation. The right panel is a CSS-only abstract composition of violet blocks, soft gradients, and miniature profile/link cards. It is decorative, hidden on small screens, and contains no controls.

Onboarding reuses the same shell and visual language. The username placeholder becomes `yourname`, and the helper displays `yourdomain.com/yourname`. Validation and submission remain unchanged.

## Other Screens

The home, auth error, and 404 screens adopt the same tokens, typography, controls, and surfaces so navigation does not fall back to the previous cream/orange language.

## Accessibility And Motion

- Visible violet focus rings remain on every interactive element.
- Touch targets remain at least 44px where practical.
- Decorative auth artwork is hidden from assistive technology.
- Motion uses opacity and transform only and respects reduced-motion preferences.
- Text contrast remains suitable on all light surfaces.

## Scope Guard

No migration, RLS policy, Server Action, package, analytics, avatar upload, theme system, QR code, fake button, or nonfunctional icon is introduced. User-facing text remains English. Only presentation components, styles, copy used by presentation, and the current-profile read needed by preview may change.

## Verification

Run only:

- `npm run lint`
- `npm run build`

Stage only redesign-related files and commit with:

`feat: redesign core product experience`
