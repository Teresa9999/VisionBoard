# Vision Journey Feature

This feature owns the pre-generation vision collection flow:

- awakening emotion options
- discovery swipe cards
- reflection summary rules
- goal option rules
- timeframe options

Routes stay in `src/app/*/page.tsx`. Those route files should focus on page state, navigation, and rendering. Stable product content and pure mapping rules belong in this feature so the AI/image-generation layer can consume the same structured inputs later without coupling to UI components.

Image generation and result rendering are intentionally outside this feature for now.
