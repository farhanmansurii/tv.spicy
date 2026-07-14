# Adaptive Liquid Glass Mobile Header

## Direction

Replace the current decorative glass stack with a neutral, Regular-like adaptive navigation material informed by Apple's Liquid Glass guidance. Keep the leading orb and trailing action capsule, but make them feel like one optical system.

## Material

- Keep the center optically clean and nearly colorless.
- Remove full-surface grain, permanent blue tint, random turbulence, hard outline, and broad soft shadow.
- Define shape with localized incident-light highlights near the upper edge and a quiet opposing lower edge.
- Use a conservative dimming layer beneath the material so white glyphs survive unpredictable hero artwork.
- Increase frost and separation after scrolling without switching to an unrelated flat surface.
- Provide explicit dark and light tone capabilities even though the current header uses the conservative dark-media mode.

## Geometry and Interaction

- Leading surface: 48px circle.
- Trailing surface: 48px capsule with three 44px targets.
- Shared safe-area-aware top and 12px screen margins.
- Press feedback compresses the touched action subtly and creates a localized internal light response at the pointer position.
- Resting material remains motionless.

## Accessibility and Fallbacks

- Preserve the exact project focus ring and accessible names.
- Reduced motion disables elastic transforms and animated optical changes without disabling transparency.
- Browsers without backdrop filtering receive a high-opacity neutral surface.
- A reduced-transparency class/API can increase opacity independently of motion preferences.

## Acceptance

- Inspect at 390px and 430px widths over dark, bright, warm, cool, and high-frequency hero areas.
- Inspect resting and scrolled states.
- Confirm clean edge clipping, 44px targets, safe-area positioning, focus visibility, and no horizontal overflow.
- Reject the result if the glass becomes more visually prominent than the hero content.
