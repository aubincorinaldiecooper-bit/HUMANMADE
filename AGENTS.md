# AGENTS.md

## BEAUTIFUL_UI_HARD_RULE_V1

This repository uses **Beautiful UI as the frontend source of truth**.

Upstream source:
- Repository: https://github.com/slev12397/beautiful-ui
- Pinned commit: `44a274e598395ab61e7c96c26fda2758780253b7`
- Local provenance: `beautiful-ui.manifest.json`

This is a non-negotiable implementation rule for every coding agent and every frontend change.

### Required order of work

1. **Inspect Beautiful UI first.** Before creating or changing generic UI, inspect the relevant Beautiful UI atom, primitive, screen, motion pattern, or layout at the pinned commit.
2. **Reuse or adapt Beautiful UI.** Generic application UI must originate from Beautiful UI. Copy the upstream component/pattern first and adapt it to Smartwear rather than rebuilding an equivalent from scratch.
3. **Only then add Smartwear-specific UI.** Custom UI is allowed only where the behavior is unique to this product.
4. **Verify before claiming completion.** Run `npm run verify:ui` and `npm run build`. A frontend task is not complete if either command fails.

### Generic UI that must NOT be invented from scratch

Do not create a custom replacement for a Beautiful UI pattern such as:
- navigation or sidebar shells
- buttons or icon buttons
- switches, segmented controls, status pills, menus, chips, loading states
- generic cards, toolbars, action rows, tables, search/list patterns
- generic overlays, dialogs, sheets, selection/action surfaces
- generic spacing, radius, color, shadow, typography, and motion systems

If Beautiful UI contains a relevant pattern, that pattern is the starting point.

### What may remain custom

Smartwear-specific domain UI may be custom:
- garment rendering
- artwork placement and product canvas behavior
- NFC encoding/tap state and visual-scan product logic
- media-to-merch mapping
- the customer phone/media experience
- physical-product-specific previews

Even inside those custom surfaces, generic controls must still use Beautiful UI atoms/primitives when an equivalent exists.

### Icons

Beautiful UI's paid Central Icons dependency is not used. **Lucide is the approved icon substitution.** Replace iconography only; do not use the icon substitution as permission to reimplement the surrounding Beautiful UI component.

### No "inspired by" shortcut

"Beautiful UI-inspired", "same visual language", or manually copying colors/radii/shadows is not compliance. The implementation must use actual Beautiful UI source components/patterns and foundation code where applicable.

### Hard stop

If an agent cannot find an appropriate Beautiful UI pattern:
- do not silently invent a generic replacement;
- inspect the upstream repo more deeply;
- if a true exception is required, stop and obtain explicit user approval before implementing it.

Any approved exception must be recorded in `UI_EXCEPTIONS.md` with scope and reason.

### Completion language

Do not say the frontend is "fully using Beautiful UI", "finished", or "complete" unless:
- the generic UI is built from Beautiful UI patterns,
- no unapproved generic custom replacements remain,
- `npm run verify:ui` passes,
- `npm run build` passes.

The user's instruction outranks convenience, speed, or an existing custom implementation.
