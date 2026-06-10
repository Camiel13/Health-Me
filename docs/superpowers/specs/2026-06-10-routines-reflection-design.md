# Design Spec: Habit Reflection Friction & Routines Page

## Objective
Reduce cheating/faking in the habit tracker by introducing "reflection friction". To receive points for completing a habit, users must actively write a short reflection. Additionally, separate the Habit Tracker from the Calendar into its own dedicated "Routines & Habits" view for better UI/UX organization.

## Architecture & State
- **State Updates (`store.js`)**:
  - Extend the habit completion logic. Currently, `completeHabit(habitId)` just adds today's date to `completedDates`.
  - Introduce a new property `reflections` on each habit object, or store reflections alongside the completed date. Format: `reflections: { "YYYY-MM-DD": "reflection text..." }`.
  - Update `completeHabit(habitId, reflectionText)` to accept the mandatory reflection string.

## UI/UX Changes (`index.html` & `src/styles.css`)

### 1. New "Routines & Habits" Page
- **Container**: Create a new `<div id="view-routines" class="view">`.
- **Content**: Move the `#habits-list`, `#current-streak-display`, and the "Add Habit" mechanism from `view-habits` into this new `view-routines` page.
- **Bottom Navigation**: Add a new button to `.bottom-nav` with a checklist or list icon that triggers `navigateTo('view-routines')`. Ensure the layout of `.bottom-nav` still looks balanced (might require tweaking flex properties or removing the spacer).

### 2. Calendar Adjustments
- The existing `view-habits` container will be repurposed purely as the "Calendar / Logbook".
- The right-side daily summary panel will be updated to display the user's logged food AND their written habit reflections for that day (pulled from the new `reflections` data).

### 3. Reflection Modal
- **Trigger**: When a user clicks the "Done" button on a habit item in `view-routines`, instead of immediately calling `completeHabit`, we open a new modal: `#habit-reflection-modal`.
- **Content**:
  - A text area for the user to type their reflection.
  - A word counter below the text area (e.g., "0 / 10 words").
  - A "Claim Reward" button that is initially disabled.
- **Validation**:
  - An input event listener on the text area checks the word count (`text.trim().split(/\s+/).length`).
  - Once the word count is $\ge$ 10, the "Claim Reward" button is enabled.
- **Submission**: Clicking "Claim Reward" invokes `completeHabit(id, reflectionText)`, closes the modal, triggers the confetti animation, and re-renders the routines view.

## Edge Cases & Error Handling
- **Already Completed**: If a habit is already completed today, the "Done" button should be hidden or disabled (this logic already mostly exists, but must be preserved in the move).
- **Empty or Gibberish Input**: While we can't perfectly prevent users from typing "a a a a a a a a a a", the minimum word count introduces enough cognitive friction to deter casual cheating.

## Testing Strategy
- Ensure clicking "Done" opens the modal.
- Ensure the button remains disabled until 10 words are typed.
- Verify that saving the reflection correctly adds points and updates `store.js`.
- Verify the calendar summary displays the reflection text on the corresponding historical day.
