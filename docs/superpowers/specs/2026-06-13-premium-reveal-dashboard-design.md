# Premium Reveal Dashboard Design

## Overview
A complete overhaul of the dashboard layout to solve space constraints while maintaining a premium aesthetic. The design relies on a full-viewport "Hero" section focused purely on core metrics, with secondary information appearing via high-quality scroll animations.

## Layout Structure
The `view-dashboard` will be divided into two main logical sections, stacked vertically within a globally scrollable container.

### 1. The Hero Section (100dvh)
- Takes up precisely `100dvh` to ensure it completely fills the screen upon opening.
- Contains:
  - The Header (Hello message + Add Log button)
  - The Centered Environment Quote
  - The Large Calorie Tracker Wheel (200px)
  - The Compact Horizontal Macro Chips
- **Behavior:** No elements from the lower section will "peek" into this area. It will look like a fixed, non-scrolling dashboard at first glance, fulfilling the user's request for a clean, distraction-free start screen.

### 2. The Reveal Section
- Exists strictly below the fold.
- Contains:
  - **Mini Calendar Preview:** A horizontal row of 7 day-icons (Mon-Sun). The active day is highlighted. Logged days feature a subtle glowing dot.
  - **Today's Log:** The list of logged food items for the day.
- **Animation (Intersection Observer):**
  - Elements in this section start hidden (`opacity: 0`, `transform: translateY(30px) scale(0.95)`).
  - As the user scrolls down and elements enter the viewport, an Intersection Observer triggers a staggered CSS class (`.reveal-active`).
  - This transitions elements to `opacity: 1`, `transform: translateY(0) scale(1)` with a smooth, premium glass-like easing curve.

## Implementation Details

### CSS Updates
- Remove `overflow: hidden !important` from `.dashboard-view`. Allow standard vertical scrolling.
- Create a `.dash-hero` wrapper inside the dashboard view with `min-height: 100dvh`, containing the header, wheel, and macros.
- Add `.reveal-item` class with starting animation states and transition properties.
- Add `.reveal-active` class for the final state.
- Create CSS styles for the `.mini-calendar` component.

### JavaScript Updates
- Add an `IntersectionObserver` to `renderDashboard()` that selects all `.reveal-item` elements.
- When an entry is `isIntersecting`, add the `.reveal-active` class.
- Build a helper function `renderMiniCalendar()` to generate the HTML for the 7-day strip, calculating the current week and active day dynamically based on `store.history`.

## Trade-offs & Considerations
- **Global Scrolling:** Removing the `100dvh` overflow lock on the dashboard means the whole page scrolls. This is required for the scroll animation to work seamlessly.
- **Scroll Affordance:** Since the Hero section takes exactly 100dvh and nothing peeks, the user must rely on intuition to know they can scroll. This keeps the design ultra-minimal but might hide functionality for some users. We will rely on natural swipe-up behavior.
