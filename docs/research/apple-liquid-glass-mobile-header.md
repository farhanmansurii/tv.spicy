# Apple Liquid Glass for the Spicy TV mobile header

Research date: 2026-07-14  
Scope: first-party Apple and WebKit sources only. This is design guidance for a web implementation, not a claim that CSS can reproduce Apple's private real-time renderer exactly.

## Executive recommendation

Rebuild the phone header as **one coherent navigation layer with two spatially related groups**, not as decorative glass objects. Use a regular, adaptive glass treatment by default. Let artwork remain visible beneath it, but locally control brightness so the icons are always legible. The material should be nearly colorless at rest, with restrained edge lensing and a soft adaptive shadow; it should gain light and slightly change scale only during direct interaction. This follows Apple's framing of Liquid Glass as a functional layer for controls and navigation that keeps content central, rather than a visual effect to apply everywhere. [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials) · [Meet Liquid Glass, 10:31](https://developer.apple.com/videos/play/wwdc2025/219/?time=631)

For this header, prefer **Regular** behavior. Apple's regular variant adjusts blur and luminosity to preserve foreground legibility over changing content. Clear is intended for media-rich backgrounds but is permanently more transparent and requires dimming; Apple recommends a dark 35% dimming layer when the underlying content is bright. A streaming hero technically qualifies for Clear, but a header that must survive arbitrary posters and several icons needs Regular's adaptivity unless a localized dimming scrim is guaranteed. [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials) · [Meet Liquid Glass, 13:48](https://developer.apple.com/videos/play/wwdc2025/219/?time=828)

## What makes the material convincing

### 1. It is lensing, not merely frosted blur

Apple defines the material through lensing: light is bent, shaped, and concentrated to communicate the surface's presence, form, and separation while content remains visible below. Elements materialize by modulating lensing rather than simply fading. For the web header, prioritize a clean refractive rim and localized highlight over heavy uniform blur, milky opacity, noise, or a strong border. [Meet Liquid Glass, 1:29](https://developer.apple.com/videos/play/wwdc2025/219/?time=89)

Practical web translation:

- Keep the center relatively clear; concentrate optical definition near the perimeter.
- Use one soft highlight whose falloff follows the capsule or circle geometry, plus a quiet opposing shadow.
- Avoid a continuous bright 1px outline. It reads as a CSS border, not light responding to a curved surface.
- If displacement is used, make it deterministic and edge-weighted. Random full-surface turbulence resembles textured plastic and distorts icons/content without communicating a coherent lens.

The final four bullets are implementation inferences from Apple's stated lensing and geometry behavior, not Apple-prescribed CSS recipes. [Meet Liquid Glass, 1:29](https://developer.apple.com/videos/play/wwdc2025/219/?time=89) · [Meet Liquid Glass, 10:31](https://developer.apple.com/videos/play/wwdc2025/219/?time=631)

### 2. Every optical layer responds to context

Apple describes highlights, shadows, tint, and dynamic range as a coordinated system. Shadow opacity rises over busy text and falls over a plain light background; the tint and dynamic range shift to preserve legibility. Small bars, glyphs, and symbols can switch between light and dark according to the content underneath. A fixed white tint plus permanently white icons is therefore only a glassmorphism approximation, not Liquid Glass behavior. [Meet Liquid Glass, 6:00](https://developer.apple.com/videos/play/wwdc2025/219/?time=360) · [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)

Practical web translation:

- Provide at least two semantic states, `glass-on-dark` and `glass-on-light`, selected from known hero metadata, a sampled/luminance signal, or a conservative route-level choice.
- In the dark state, use light glyphs and a restrained light-catching rim. In the light state, use dark glyphs and a darker separating shadow.
- For unpredictable artwork, add a localized scrim behind the header group instead of increasing the whole surface's white opacity.
- Treat scroll state as a material-context change: increase frost/luminosity control over busy scrolled content, rather than abruptly replacing the glass with a flat panel.

These are web implementation recommendations derived from Apple's adaptive behavior and its scroll-edge treatment. [Meet Liquid Glass, 6:00](https://developer.apple.com/videos/play/wwdc2025/219/?time=360) · [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)

### 3. Glass is a distinct navigation layer

Apple reserves Liquid Glass for the navigation layer above content, warns against putting glass in the content layer, and explicitly warns against glass-on-glass. Foreground items on glass should use fills, transparency, and vibrancy so they feel integrated into the parent material. For Spicy TV, the logo/back control and action group may be separate surfaces, but each icon inside the action capsule must remain a plain foreground control — no nested mini-glass circles, bevels, or individual borders. [Meet Liquid Glass, 10:31](https://developer.apple.com/videos/play/wwdc2025/219/?time=631)

Apple also advises removing extra toolbar backgrounds and borders and expressing hierarchy through layout and grouping. Group actions by function and frequency; do not use equal visual decoration as a substitute for hierarchy. [Get to know the new design system, 6:16](https://developer.apple.com/videos/play/wwdc2025/356/?time=376)

### 4. Geometry is concentric and touch-oriented

Apple's new design system uses concentricity: radii and margins share a center; a capsule radius is half its height; an inset concentric shape derives its radius by subtracting padding from the parent's. Rounded floating forms should nest with the rounded device geometry and feel natural to a fingertip. [Get to know the new design system, 2:06](https://developer.apple.com/videos/play/wwdc2025/356/?time=126) · [Meet Liquid Glass, 1:29](https://developer.apple.com/videos/play/wwdc2025/219/?time=89)

For the phone header:

- Keep circles mathematically circular and capsules at `radius = height / 2`.
- Use a shared control height and shared optical center for every glyph.
- Preserve a consistent inset between glyph bounds and glass bounds; do not compensate for mismatched icon art by changing the container.
- Apply tiny optical offsets only to visibly asymmetric symbols such as a back chevron or play shape.
- Respect the top safe area and use symmetric outer screen margins so the two groups feel anchored to the device, not arbitrarily floated.

Apple recommends a 44×44 pt default iOS control size. It also says spacing is as important as target size, suggesting about 12 pt around elements with a bezel. Web CSS pixels are not guaranteed to equal points, but a minimum 44×44 CSS-pixel hit region is the appropriate conservative target for this mobile web UI. [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/) · [Apple HIG — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) · [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)

### 5. Color comes from content; tint is emphasis

Liquid Glass has no inherent color by default; it takes color from the content immediately behind it. Apple recommends tint sparingly, for controls that truly need emphasis, and says a prominent action should tint the material's background rather than merely coloring its glyph. For a neutral navigation header, remove the permanent cool-blue wash. Keep the glass neutral and reserve Spicy's brand color for a genuine selected or primary state. [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)

Avoid tinting every surface or action. Apple warns that when everything is tinted, nothing stands out and the interface becomes confusing. [Meet Liquid Glass, 10:31](https://developer.apple.com/videos/play/wwdc2025/219/?time=631)

### 6. Icons are bold, monochromatic, and adaptive

Apple says small symbols and labels on Liquid Glass usually follow a monochromatic scheme and switch dark/light with the underlying content. It recommends standard iconography and predictable action placement across platforms. For this header, use one coherent icon family, consistent stroke/weight, and a strong enough foreground value to survive moving artwork. Do not use low-opacity gray icons on a translucent surface. [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color) · [Liquid Glass overview](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass)

The logo is content, not an SF Symbol. Give it a restrained clear zone and avoid combining a busy full-color mark, noise, cool tint, and a hard rim in the same 48 px orb; that overload is a synthesis judgment based on Apple's direction to keep content central and use glass sparingly. [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)

### 7. Motion reveals material properties

Apple designed visuals and motion together. During touch, Liquid Glass illuminates from within starting near the fingertip; nearby glass can receive reflected light. The material flexes and morphs with fluid continuity, and larger/thicker states gain deeper shadow and more pronounced refraction. It materializes by changing lensing rather than opacity alone. [Meet Liquid Glass, 1:29](https://developer.apple.com/videos/play/wwdc2025/219/?time=89) · [Meet Liquid Glass, 6:00](https://developer.apple.com/videos/play/wwdc2025/219/?time=360)

Web motion brief:

- Rest: stable and quiet; no looping shimmer, drifting grain, or fake gyroscope motion.
- Press: a fast, subtle scale compression plus a localized internal glow at the pointer/touch position.
- Release: spring back without overshoot large enough to wobble the header layout.
- Group changes: morph or crossfade optical strength and geometry together; avoid fading the glass while its border remains static.
- Scroll: allow the navigation group to become slightly more compact or more protective of contrast, but avoid continuous exaggerated scaling.

These timings and CSS mechanics require prototyping; Apple describes the physical behavior but does not publish web timing tokens in the cited material. [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)

## Accessibility requirements

- Maintain WCAG AA contrast guidance Apple cites: 4.5:1 for text up to 17 pt and 3:1 for larger or bold text. Test against the worst frames/artwork, not a single hero screenshot. [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/)
- Keep each interactive target at least 44×44 and provide sufficient separation to reduce accidental taps. [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/)
- Reduced Transparency should make the material frostier and obscure more content. Increased Contrast should move elements toward black/white and add a contrasting border. Reduced Motion should reduce effect intensity and disable elastic behavior. These are three different adaptations; do not disable transparency merely because `prefers-reduced-motion` is set. [Meet Liquid Glass, accessibility section](https://developer.apple.com/videos/play/wwdc2025/219/?time=1030)
- On the web, honor `prefers-reduced-motion` by removing elastic scale/morphing, animated blur, and depth/parallax effects. Apple explicitly identifies parallax, animated blur, and depth-of-field animation as effects to disable or change for Reduced Motion. [Apple Reduced Motion evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria)
- Provide a higher-opacity fallback for missing `backdrop-filter`, and test Reduce Transparency and Increase Contrast together with dark appearance; Apple notes combinations can expose new legibility failures. [Apple HIG — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) · [WebKit — Backdrop Filters](https://webkit.org/blog/3632/introducing-backdrop-filters/)
- Do not rely on the proposed `prefers-reduced-transparency` media query as the only path: WebKit's public tracker still describes the feature as unresolved. A product setting or conservative fallback may be necessary on the web. [WebKit bug 175497](https://bugs.webkit.org/show_bug.cgi?id=175497)

## Why the current replica can look cheap

This section is a code-informed diagnosis of the current `LiquidGlass` implementation, using Apple's principles as the comparison standard.

1. **It simulates material complexity with decorative layers.** The component stacks fixed blur, saturation, white tint, procedural displacement, four inset rims, two gradients, a blue screen tint, and full-surface grain. Apple describes a holistic but context-responsive optical system; more static layers do not create adaptivity. The result can read as glossy plastic or a game HUD. [Meet Liquid Glass, 10:31](https://developer.apple.com/videos/play/wwdc2025/219/?time=631)
2. **The random refraction has no physical relationship to the shape.** Full-surface fractal noise bends the backdrop irregularly, while Apple's lensing communicates the rounded form and is coordinated with geometry, highlight, and shadow. Edge-weighted, shape-derived distortion is the better approximation. [Meet Liquid Glass, 1:29](https://developer.apple.com/videos/play/wwdc2025/219/?time=89)
3. **The fixed cool-blue tint contradicts the neutral default.** Apple says Liquid Glass has no inherent color and inherits its environment; tint is reserved for emphasis. [Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color)
4. **Fixed white icons and fixed shadow cannot adapt to arbitrary posters.** Apple switches small glass and glyphs between light and dark and changes shadows according to the content underneath. [Meet Liquid Glass, 6:00](https://developer.apple.com/videos/play/wwdc2025/219/?time=360)
5. **Grain makes the surface feel dirty rather than optically clear.** Apple emphasizes bending, shaping, and concentrating light; its first-party description does not identify film grain as a defining layer. Removing it is an inference, but a high-value one for a small header control. [Meet Liquid Glass, 1:29](https://developer.apple.com/videos/play/wwdc2025/219/?time=89)
6. **Reduced Motion currently doubles as Reduced Transparency.** The stylesheet disables backdrop blur under `prefers-reduced-motion`; Apple treats Reduced Motion and Reduced Transparency as separate modifiers with different outcomes. [Meet Liquid Glass, accessibility section](https://developer.apple.com/videos/play/wwdc2025/219/?time=1030)
7. **An isolated brand orb and action pill can look like unrelated stickers.** Apple stresses grouping, spatial relationships, concentric rhythm, and predictable anatomy. The two surfaces need a shared height, margin system, optical treatment, and interaction language even if they stay detached. [Get to know the new design system, 2:06 and 6:16](https://developer.apple.com/videos/play/wwdc2025/356/?time=126)

## Proposed mobile-header design brief

### Structure

- Keep two groups only: leading home/back control and trailing action capsule.
- Use one shared 48 px visual height with at least 44×44 hit targets; validate that internal separators do not shrink targets.
- Use capsule and circle geometry derived from the same radius/inset system.
- Align both groups to the same top and screen-margin grid, including `env(safe-area-inset-top)`.
- Do not put glass inside either surface.

This structure applies Apple's navigation-layer, concentricity, grouping, safe-area, and minimum-target guidance. [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials) · [Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/) · [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/)

### Resting material

- Default to neutral Regular-like glass: moderate backdrop blur/luminosity control, almost no authored hue.
- Replace full-surface noise and blue wash with a clean center.
- Use a soft top/incident-light highlight and a subtle lower/ambient shadow, both clipped to geometry.
- Avoid a uniform bright border; define only the portions where the implied light would catch.
- Use localized dimming under bright hero regions; Apple's Clear guidance gives 35% dark dimming as the reference ceiling, not a mandatory constant.

These are web approximations of Apple's adaptive lensing and regular/clear guidance. [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials) · [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)

### Content and states

- Use white foreground on reliably dark media and near-black foreground on reliably light media; switch the material and glyphs together.
- Use full-strength monochrome for primary glyphs; use opacity differences only where hierarchy remains contrast-safe.
- Reserve brand/accent tint for a selected or primary state, never the whole header by default.
- On scroll into dense content, increase frost/contrast protection smoothly and use a scroll-edge gradient/blur instead of a hard divider.
- Press feedback should originate inside the touched control; keep the rest state motionless.

[Apple HIG — Color](https://developer.apple.com/design/human-interface-guidelines/color) · [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials) · [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)

### Acceptance tests

1. Test on at least six hero crops: near-black, near-white, high-frequency textural, warm saturated, cool saturated, and a face beneath the header.
2. Verify glyph contrast in both adaptive foreground modes and during scroll transition.
3. Check iPhone-width layouts at safe-area and non-safe-area heights; confirm 44×44 minimum targets and no accidental overlap.
4. Verify Safari with `-webkit-backdrop-filter`, a browser without backdrop filtering, reduced motion, dark appearance, increased contrast, and a manual high-opacity/reduced-transparency mode.
5. Record slow-motion press and scroll interactions; reject visible border popping, texture crawling, icon distortion, or unrelated movement between the two groups.
6. Confirm the header recedes behind the content hierarchy: if viewers notice the glass before the current title/artwork, reduce optical decoration.

The context matrix follows Apple's requirement to test across appearances, accessibility settings, and backgrounds, plus WebKit's dynamic backdrop-filter behavior. [Apple HIG — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/) · [Apple HIG — Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) · [WebKit — Backdrop Filters](https://webkit.org/blog/3632/introducing-backdrop-filters/)

## Primary sources

- [Apple Human Interface Guidelines — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple Human Interface Guidelines — Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Apple Human Interface Guidelines — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility/)
- [Apple Human Interface Guidelines — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple Developer: Meet Liquid Glass (WWDC25)](https://developer.apple.com/videos/play/wwdc2025/219/)
- [Apple Developer: Get to know the new design system (WWDC25)](https://developer.apple.com/videos/play/wwdc2025/356/)
- [Apple Developer: Liquid Glass overview](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass)
- [Apple Developer: Reduced Motion evaluation criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria)
- [WebKit: Introducing Backdrop Filters](https://webkit.org/blog/3632/introducing-backdrop-filters/)
- [WebKit bug 175497: `prefers-reduced-transparency`](https://bugs.webkit.org/show_bug.cgi?id=175497)
