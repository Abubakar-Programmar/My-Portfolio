# Project Guidelines

## Package manager

This project uses `pnpm`. Always install/add/remove packages with `pnpm` (e.g. `pnpm add <pkg>`, `pnpm remove <pkg>`), never `npm` or `yarn`.

## Dev server

Don't start the dev server (`pnpm dev` / `nuxt dev`) unless explicitly asked — the user typically already has it running locally.

## Mobile optimization

Every UI/design change in this project must be mobile-optimized. Before considering any page, layout, or component done, check it at common mobile widths (~375px, ~414px) in addition to desktop. This applies to:

- New pages and components
- Forms (field layout should collapse to single-column on small screens, no fixed widths that overflow)
- Dashboard layout (navbar, sidebar — sidebar should collapse/hide behind a toggle on mobile)
- Tables (should scroll horizontally or reflow on small screens, not break layout)

## Confirmation dialogs

Never use the native `confirm()` browser dialog or a one-off modal for confirmation prompts (delete, destructive actions, etc). Use the global confirmation modal instead:

- `app/composables/useConfirm.ts` exposes `useConfirm().confirm({ title, message, confirmLabel, cancelLabel, danger })`, which returns a `Promise<boolean>`.
- `app/components/ConfirmModal.vue` is mounted once in `app/app.vue` and renders whatever the composable's shared state holds — no need to add another modal instance anywhere else.
- Example: `const ok = await useConfirm().confirm({ title: 'Delete X?', message: '...', confirmLabel: 'Delete', danger: true }); if (!ok) return;`
