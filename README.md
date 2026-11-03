# HUMANMADE

A one-screen record catalogue: photo-printed discs in a row on an off-white stage, the
centre disc in front. Drag, use ← →, or click a side disc. It loops and autoplays.

The music itself is made with [YuE](https://github.com/multimodal-art-projection/YuE), kept in
`music/YuE`. See [`music/README.md`](music/README.md) for making funk and soul instrumentals.

```bash
git clone --recurse-submodules https://github.com/aubincorinaldiecooper-bit/HUMANMADE
cd HUMANMADE
npm install
npm run dev        # http://localhost:3000
```

Already cloned without YuE? Run `git submodule update --init`.

- `components/ui/disc-cascade-carousel.tsx`: the component. It has no dependencies beyond React and ships its own CSS.
- `app/page.tsx`: the landing page (records, fonts, colours).
- `music/`: YuE and notes for generating the instrumentals.

## Disc photos

The page uses Unsplash photos. To swap in generated ones, run
`scripts/generate-labels.sh` (POCKET-Zimage-CPU via stable-diffusion.cpp, prompts in
`scripts/label-prompts.tsv`). It writes `public/records/<slug>.png`. Then point each record's
`src` at `/records/<slug>.png`.

## Props

| Prop | Default | |
| --- | --- | --- |
| `items` | | `{ title, src, credits?, reviews?, labelStyle?: "arc" \| "block", labelColor?, year? }[]` |
| `brand` | | Wordmark in the nav, printed on every disc |
| `showNav` | `true` | `false` hides the top bar; the wordmark stays on the discs |
| `nav` | `[]` | `{ label, href?, current? }[]` |
| `indexLabel` | `"Index"` | Catalogue dropdown label, `false` hides it |
| `defaultIndex` / `index` / `onIndexChange` | `0` | Uncontrolled or controlled position |
| `onSelect` | | Called when the front disc is clicked |
| `loop` | `false` | |
| `autoplay` | `false` | ms per item, or `true` for 4000. Pauses on disc hover, drag, keyboard focus, hidden tab, reduced motion |
| `background`, `color` | | Stage background and text colour |
| `surface` | white | Solid colour behind the catalogue menu |
| `fontHref` | | Stylesheet added to `<head>` once |
| `displayFont`, `labelFont`, `bodyFont` | Instrument Serif, Oswald, Inter stacks | |
| `hint` | | Bottom-left instruction |
| `height` | `"100svh"` | |
| `discSize` | `clamp(170px, min(50vmin, 38vw), 420px)` | |
| `sheen` | `0.6` | Rainbow reflection strength |
| `spin` | `24` | Seconds per turn of the front disc, `0` stops it |
| `itemName` | `"record"` | Used in button labels and announcements |
