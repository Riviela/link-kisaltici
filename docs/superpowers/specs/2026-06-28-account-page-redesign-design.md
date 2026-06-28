# Account Page Redesign

## Goal

Rebuild the authenticated Account page to match the supplied second reference image while preserving current authentication, profile lookup, account data, logout, pricing navigation, and account-deletion behavior.

## Scope

- Keep `/account` as the route and keep its server-side profile/auth checks.
- Replace the current centered page and black-bar account trigger composition with the reference layout.
- Add an Account-specific desktop shell: black announcement bar, light sidebar, Account header strip, and centered settings column.
- Reuse real username, email, avatar/fallback, profile ownership, and plan data already available to the page.
- Keep existing `/dashboard`, `/account`, `/pricing`, logout, and account-deletion flows functional.
- Render reference navigation entries without existing product routes as disabled/inert controls. Do not create fake routes or features.

## Desktop Composition

### Announcement bar

- Full-width near-black bar at the top.
- Small green Canvas Links mark at the far left.
- Centered upgrade message and outlined green Upgrade control linking to `/pricing`.
- No separate right-aligned logout button.

### Sidebar

- Fixed-width, warm-light gray surface below the announcement bar.
- Top profile row contains avatar/fallback, username, chevron, and notification icon.
- The existing account menu remains available from the profile row, but its trigger must visually belong to the light sidebar rather than the old black top bar.
- Functional navigation:
  - `My Linktree` -> `/dashboard`
  - Account/profile trigger -> `/account`
  - Upgrade actions -> `/pricing`
  - Logout -> existing `logoutAction`
- `Earn`, `Audience`, `Insights`, and tool links are visually faithful but inert and exposed as disabled controls.
- Lower region contains the setup checklist card, help control, and logout control matching the reference hierarchy.

### Main content

- Account title sits in a shallow header strip aligned beside the sidebar.
- Page body uses a soft off-white canvas.
- Settings are arranged in a narrow centered column with generous vertical spacing.
- The column remains readable on wide screens and does not stretch to fill available width.

## Settings Sections

### My information

- Section title uses sentence case.
- A white rounded card contains stacked Name and Email fields.
- Fields use muted filled surfaces like the reference.
- Existing values remain read-only in V1.
- `Save details` remains disabled and spans the usable card width.

### Security and privacy

- MFA and trusted devices share one white rounded card.
- MFA includes explanatory copy plus two icon-led rows: SMS and Authenticator App.
- Enable actions remain disabled because no MFA backend is added.
- Trusted devices remains an informative empty state.
- Privacy Settings gets its own card with description, icon-led data-sharing row, enabled status, and disabled Disable control.
- Password gets its own card; existing unavailable behavior remains unchanged.

### Account management

- Section includes `Linktrees you own` label above a white ownership card.
- Ownership card shows avatar/fallback, username, plan, owner email, owner badge, and overflow decoration.
- Upgrade message and full-width purple `/pricing` action match the reference.
- Account deletion moves into a separate white card below and keeps the existing confirmation modal trigger.

## Responsive Behavior

- Desktop uses announcement bar + sidebar + main content grid.
- At tablet/mobile widths, sidebar becomes a compact top navigation treatment; inert product navigation and checklist collapse out of the primary flow.
- Main content becomes one column with safe horizontal padding.
- Cards and controls use `width: 100%`; long username/email values truncate or wrap safely.
- No horizontal overflow.

## Interaction And Accessibility

- Preserve keyboard operation, Escape handling, outside-click close, and focus behavior for the existing account dropdown.
- Disabled/inert entries use native disabled semantics and do not masquerade as links.
- Functional links and buttons retain visible focus styles.
- No hover scale, motion, or heavy shadows; use subtle color and border changes only.
- Decorative icons are hidden from assistive technology; meaningful controls have accessible names.

## Component Boundaries

- `app/account/page.tsx`: data loading, auth redirects, and assembly only.
- New Account shell/sidebar presentation component: announcement bar, sidebar navigation, profile trigger, checklist, help, and logout.
- Existing `AccountDropdown`: retain behavior and add a light-sidebar presentation variant instead of duplicating menu logic.
- `components/account/account.module.css`: Account layout, cards, responsive rules, and mockup-specific visual system.
- `lib/copy.ts`: add only the visible reference labels needed by the new shell and section descriptions.

## Verification

- Compare desktop output against the second supplied reference at a similar viewport.
- Verify `/dashboard`, `/account`, `/pricing`, logout, dropdown keyboard behavior, and deletion modal.
- Confirm inert sidebar entries cannot navigate or submit.
- Confirm real username, email, avatar/fallback, and owner data render.
- Check mobile layout for normal page scrolling and no horizontal overflow.
- Run repository lint; do not rely on visual appearance alone.

## Out Of Scope

- MFA enrollment, trusted-device management, privacy-setting persistence, password creation, notification center, setup checklist persistence, Earn/Audience/Insights/tools product pages, or new account APIs.
- Database migrations, Supabase policy changes, new packages, or changes to dashboard/public-profile behavior.
