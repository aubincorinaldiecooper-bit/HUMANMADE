# Smartwear Studio

Frontend prototype for creating interactive merchandise with NFC and visual scan experiences.

## Product flow
1. Choose a garment.
2. Upload artwork.
3. Enable NFC tap, visual scan, or both.
4. Attach video, audio, or a link.
5. Preview the customer phone experience.

The interface is based on the MIT-licensed design language from Beautiful UI:
https://github.com/slev12397/beautiful-ui

The upstream paid Central Icons dependency is intentionally omitted so this demo can install without a commercial icon license.

## Run locally
```bash
npm install
npm run dev
```

## Prototype boundaries
Artwork and media uploads use browser object URLs. NFC encoding, visual recognition, persistent media storage, analytics, and product records are backend seams for the production version.
