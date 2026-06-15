# Keybind Animations Spec

This spec outlines the design and implementation for adding unique, cool transition animations when triggering keybinds `Alt + Shift + D` (showcase dummy data) and `Alt + Shift + C` (clean start).

## 1. Goals & Requirements
- **Showcase Animation (`Alt + Shift + D`)**: Trigger a 1.0-second full-screen green/gold celebration overlay with a pulsing lightning bolt, progress bar, and confetti before reloading.
- **Clean Animation (`Alt + Shift + C`)**: Trigger a 1.0-second full-screen blue reset overlay with a spinning sync icon, progress bar, and a scan line animation before reloading.
- **No reload cut-off**: Introduce a 1000ms delay before `window.location.reload()` to allow the animations to fully play out.

## 2. Style Definitions
The following classes and keyframes will be appended to `src/styles.css`:
- `.showcase-load-overlay`: Fixed full-screen overlay for showcase loading.
- `.clean-load-overlay`: Fixed full-screen overlay for database wiping.
- `@keyframes overlayFadeIn`: Animates overlay opacity from 0 to 1.
- `@keyframes contentScaleUp`: Scales up the content card inside the overlay.
- `@keyframes iconPulse`: Pulsing lightning icon with drop-shadow.
- `@keyframes spinWipe`: Rotating and scaling reset icon with drop-shadow.
- `@keyframes progressFill`: Animates the progress bar width from 0% to 100% in 1.0s.
- `@keyframes scanLineMove`: Moves the neon blue scan line from top to bottom.

## 3. Implementation Plan
### Step 1: Update `src/styles.css`
- Append the styles defined above to the end of the file.

### Step 2: Update `src/main.js`
- Create `showShowcaseAnimation()` which creates the showcase overlay, triggers `confetti()`, and schedules reload after 1000ms.
- Create `showCleanAnimation()` which creates the clean overlay and schedules reload after 1000ms.
- Update the `keydown` event listener to invoke these animations.

### Step 3: Run Tests
- Verify that the modifications do not break any existing store or routing tests by running `npx vitest run`.
