# Motion and animation audit

## (1) Should not animate at all

| Before | After | Why |
| --- | --- | --- |
| `components/features/media/details/detail-hero.tsx:240-243` `{ scale: 1.06 }` to `{ scale: 1, duration: 16, ease: 'none' }` | Remove the 16-second artwork zoom tween. | Ambient zoom repeats across ordinary detail-page viewing and has no state or feedback purpose. |
| `components/features/media/seasons/episode-strip.tsx:45-50` `animate={{ x: ['-100%', '100%'] }}` with `duration: 1.5`, `repeat: Infinity` | Remove the shimmer; show static skeletons (or use a brief one-shot opacity state if loading indication is required). | Infinite shimmer on repeatedly viewed loading placeholders is decorative constant motion. |
| `components/features/media/details/more-details-container.tsx:36-50` panel toggle timeline animates outgoing/incoming content | Set panel visibility/state directly, or use a short opacity-only state transition. | Repeated tab selection is a frequent action and should not receive a spatial animation. |
| `components/features/media/details/storyline-section.tsx:159` `active:scale-95` | Remove press movement from this frequently used expand control. | The rubric excludes keyboard-triggered animation and recommends no motion for very frequent actions. |

## (2) Easing and duration

| Before | After | Why |
| --- | --- | --- |
| `components/ui/sheet.tsx:40-41` `transition-all ease-[cubic-bezier(0.32,0.72,0,1)]`; open 500ms, close 300ms | Use exact `transform, opacity` properties, strong ease-out on entry, and a faster exit under 300ms. | The easing is not the required strong curve, `transition-all` is a defect, and entry exceeds 300ms. |
| `components/features/media/details/detail-hero.tsx:264` `duration: 0.9, ease: 'power4.out'` | `duration: 0.28` with strong ease-out. | The reveal is 900ms, above the UI limit (the reported 280ms change has not landed on this title tween). |
| `components/features/media/details/detail-hero.tsx:274-275` `duration: 0.6` | `duration: 0.28` with ease-out. | The tagline reveal lasts 600ms, exceeding the UI limit. |
| `components/features/media/details/detail-hero.tsx:284-285` `duration: 0.6` | `duration: 0.28` with ease-out. | The overview reveal lasts 600ms, exceeding the UI limit. |
| `components/features/media/details/detail-hero.tsx:293` `duration: 0.6` and `ease: 'back.out(1.3)'` | Use a duration below 300ms and strong ease-out without overshoot. | The reveal is overlong and overshoots rather than using the prescribed easing. |
| `components/features/media/details/show-container.tsx:85-86` `duration: 0.7, ease: 'power3.out'` | Keep at most 280ms with strong ease-out. | The entrance runs 700ms, above the UI limit. |
| `components/features/media/details/cast-crew-section.tsx:153` `transition-transform duration-500 ease-spring` | `transition-transform duration-200 ease-out` (inside hover-capable media query). | The hover scale takes 500ms, exceeding the UI limit. |
| `components/features/media/details/video-section.tsx:236` `transition-transform duration-500 ease-spring` | `transition-transform duration-200 ease-out` (inside hover-capable media query). | The hover scale takes 500ms, exceeding the UI limit. |
| `components/features/media/details/video-section.tsx:252` `transition-transform duration-500 ease-spring` | `transition-transform duration-200 ease-out` (inside hover-capable media query). | The hover scale takes 500ms, exceeding the UI limit. |
| `components/features/media/details/media-info-panel.tsx:96` expanded `duration: 0.38` | Keep the transition below 300ms and use `ease: [0.23, 1, 0.32, 1]`. | The state transition lasts 380ms and exceeds the UI limit. |
| `components/features/media/seasons/episode-strip.tsx:47-48` `duration: 1.5, ease: 'easeInOut'` | Remove the infinite animation. | Its 1.5-second duration and repeat are inappropriate for an animated placeholder (also listed above). |
| `components/features/media/seasons/episode-list-row.tsx:167-168` `duration: 0.8, ease: 'easeInOut'` | Reduce to at most 280ms, or remove if this is frequent row feedback. | The row animation takes 800ms. |
| `components/shared/animated/text-glitch.tsx:5-8` `transition-transform ease-in-out duration-500` | Use opacity/color only, or a transform transition under 300ms with the prescribed ease-out. | The hover text effect is 500ms and moves on a commonly encountered label. |
| `app/genres/page.tsx:52` `transition-all duration-700` | Specify only changing properties and keep duration below 300ms. | The genre card transition animates broadly for 700ms. |
| `app/genres/page.tsx:60` `transition-all duration-1000` | Specify `opacity, transform` and keep duration below 300ms (or remove). | The decorative icon moves/fades for one second. |
| `app/genres/page.tsx:76` `group-hover:w-16 ... transition-all duration-700` | Remove width animation or use a brief opacity/transform cue. | Animating width forces layout and lasts 700ms. |

## (3) Entry and exit

| Before | After | Why |
| --- | --- | --- |
| `components/ui/sheet.tsx:40-42` open duration 500ms and closed duration 300ms | Set open to 250ms and closed to 150ms, using ease-out on entry and ease-out/ease-in-out on exit. | The current entry exceeds the UI cap, and although exit is faster, both are too slow. |
| `components/features/media/details/more-details-container.tsx:40-41` outgoing `ease: 'power2.in'` | Use ease-out or ease-in-out for leaving content. | Ease-in is expressly excluded for UI motion. |
| `components/features/media/details/more-details-container.tsx:45-49` incoming `duration: 0.24` versus outgoing 0.2s | Make incoming entry no slower than 160ms and retain faster exit. | This tab switch is frequent and its entry presently lasts longer than its exit. |
| `components/features/media/details/media-info-panel.tsx:91,96` collapsed 320ms and expanded 380ms | Keep state indication within 280ms and make exit shorter than entry. | Both transitions exceed 300ms, and collapse/exit is slower than expansion/entry. |
| `components/ui/command-palette.tsx:973` `initial={{ opacity: 0, scale: 0.95, y: 8 }}` | Keep scale at 0.95 but use `transform: 'translateY(8px) scale(0.95)'` and confirm exit is faster. | This enter state avoids scale zero but Framer shorthand movement is not the accelerated full transform form. |

## (4) Interruptibility and retriggering

| Before | After | Why |
| --- | --- | --- |
| `components/features/media/seasons/episode-strip.tsx:45-50` infinite Framer keyframe sequence | Replace with a static state or an interruptible CSS transition. | Repeating keyframes cannot smoothly reverse/restart when the loading state changes. |
| `components/ui/toast.tsx:28` `data-[state=open]:animate-in data-[state=closed]:animate-out` | Use state-driven CSS transitions for opacity/transform with explicit durations. | Toasts are rapidly retriggerable and keyframe entry/exit restarts rather than interrupting smoothly. |
| `components/features/media/details/more-details-container.tsx:36-50` timeline plus `onComplete` visibility swap | Drive visibility directly from selected state with interruptible transitions. | A rapid tab change can leave the callback sequencing stale and cannot smoothly interrupt the timeline. |

## (5) Reduced motion coverage

| Before | After | Why |
| --- | --- | --- |
| `components/features/media/details/detail-hero.tsx:238-243` guard at 236 then 16s tween | Remove the tween entirely; if retained, honor reduced motion and provide a static image. | Reduced-motion users are guarded here, but others still receive prolonged ambient motion. |
| `components/features/media/details/show-container.tsx:78-87` 700ms ScrollTrigger entrance after matchMedia guard | Use `gsap.matchMedia()` for both reduced and normal modes and remove movement for reduced motion. | The imperative entrance is explicitly skipped for reduced motion rather than retaining only meaningful gentle opacity. |
| `components/features/media/details/detail-hero.tsx:263-264` 900ms reveal | Verify the reduced-motion branch also suppresses translation/scale; keep only brief meaningful opacity. | The hero code contains a reduced-motion early return, but this reveal remains an overlong non-reduced path and the claimed 280ms change is absent here. |
| `components/features/media/carousel/hero-carousel.tsx:89` `motion-reduce:transition-none` | Preserve a short opacity transition under reduced motion while removing movement. | Reduced motion should retain meaningful opacity/color changes rather than removing every transition. |
| `components/shared/animated/fade-in.tsx:32` `opacity-0 transition-all ease-out` | Use `transition-opacity` and provide a reduced-motion rule that removes movement while preserving opacity feedback. | The generic fade utility has no local reduced-motion treatment and animates all properties. |

## (6) Performance - transform and opacity only

| Before | After | Why |
| --- | --- | --- |
| `components/ui/sheet.tsx:40` `transition-all` | `transition-[transform,opacity]` | Broad transitions can animate layout and paint properties unnecessarily. |
| `components/ui/accordion.tsx:31` `transition-all` | `transition-[transform,opacity,color,background-color]` for the properties actually changing. | `transition-all` is prohibited and can include layout-affecting properties. |
| `components/ui/command.tsx:126` `transition-all duration-150` | Specify only the actual state properties, such as `background-color,color,opacity`. | `transition-all` does not limit work to compositor-friendly properties. |
| `components/features/media/details/storyline-section.tsx:170` `transition-all duration-500` | Specify `opacity` only if it is the actual state change. | The transition is broad and exceeds the duration limit. |
| `app/genres/page.tsx:76` `group-hover:w-16 ... transition-all` | Use opacity or transform instead of changing width. | Width animation triggers layout/reflow. |
| `components/features/media/seasons/episode-strip.tsx:45` `animate={{ x: ['-100%', '100%'] }}` | If any movement remains, animate `style={{ transform: ... }}` or CSS transform/opacity rather than Framer x shorthand. | Framer x/y/scale shorthand props are not hardware accelerated under this rubric. |
| `components/features/media/seasons/episode-card.tsx:48` `animate={{ opacity: 1, y: 0 }}` | Use full `transform` string plus opacity, and stay below 300ms. | Framer y shorthand is not hardware accelerated. |
| `components/features/media/seasons/episode-list-row.tsx:64` initial `y: 8` and animate `y: 0` | Use full transform string plus opacity, or opacity alone. | Framer y shorthand is not hardware accelerated. |

## (7) Verdict on already-changed GSAP sections, MotionConfig and grain overlay: landed correctly, or not

| Before | After | Why |
| --- | --- | --- |
| `components/providers/motion-provider.tsx:6` `<MotionConfig reducedMotion="user">` (reachable through `app/layout.tsx:84`) | No change required. | The global Framer Motion reduced-motion configuration is present and mounted at the app root. |
| `app/globals.css:599-601` `.grain-overlay::before { animation: none; }` within reduced-motion media query | No change required for reduced-motion behavior. | The grain animation is explicitly frozen for reduced-motion users. |
| `components/features/media/details/cast-crew-section.tsx:36-37,54-55,74-76,109-111` GSAP matchMedia and `reduce ? 0.2 : ...` | No change required for reduced-motion coverage; keep entrance durations under 300ms. | The section uses matchMedia and gentle opacity-only reduced behavior, but normal entrances at 600-800ms violate duration. |
| `components/features/media/details/video-section.tsx:62-63,79-80,98-100,131-133` GSAP matchMedia and reduce duration branches | No change required for reduced-motion coverage; shorten normal entrances to under 300ms. | The reduced branch is present, but normal 600-800ms entrances exceed the limit. |
| `components/features/media/details/storyline-section.tsx:59-60,76-77,94-95,113-115` GSAP matchMedia | Keep matchMedia, shorten all normal entrance durations, and change reduced motion to opacity-only. | The responsive reduced branch landed, but the normal animations last 500-800ms and the reduced branch can retain a 200ms opacity cue. |
| `components/features/media/details/more-details-container.tsx:64-72,81-82` GSAP matchMedia entrance | Keep the reduced branch, shorten normal 700ms entrance below 300ms, and fix the separate tab timeline's ease-in. | MatchMedia landed, but its normal entrance is 700ms and the tab animation remains outside the media-query handling. |
| `components/features/media/details/detail-hero.tsx:263-264` title reveal still has `duration: 0.9` | Change to 280ms or less. | The announced hero reveal shortening is not applied to this title tween; it still lasts 900ms. |
