# Premium Reveal Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a scrolling dashboard with a 100dvh hero section and a premium scroll animation for the food log and mini calendar.

**Architecture:** Use global window scrolling instead of fixed height containers. Use CSS transitions and the JavaScript `IntersectionObserver` API to trigger reveal animations for list items as they enter the viewport. Add a dynamic mini-calendar component.

**Tech Stack:** HTML, CSS (Vanilla), JavaScript (Vanilla)

---

### Task 1: Update Dashboard CSS Structure

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Write minimal implementation**

Update `src/styles.css` to allow scrolling and define the new classes:

```css
/* In src/styles.css, find .dashboard-view and update: */
.dashboard-view {
  min-height: 100dvh; /* Changed from height: 100dvh */
  overflow-y: auto !important; /* Changed from hidden */
  display: flex;
  flex-direction: column;
  padding-bottom: 110px !important;
  box-sizing: border-box;
  position: relative;
  /* Keep existing paddings */
}

/* Add new hero wrapper class */
.dash-hero {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
}

/* Reveal Animation Classes */
.reveal-item {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

.reveal-item.reveal-active {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Mini Calendar Styles */
.mini-calendar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0 4px;
}

.mini-calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.mini-calendar-day .day-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
}

.mini-calendar-day .day-bubble {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  background: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.6);
  position: relative;
}

.mini-calendar-day.active .day-bubble {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(130, 207, 160, 0.4);
}

.mini-calendar-day .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary);
  position: absolute;
  bottom: -8px;
  opacity: 0;
}

.mini-calendar-day.logged .dot {
  opacity: 1;
}

.mini-calendar-day.active.logged .dot {
  background: var(--primary-dark);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles.css
git commit -m "style: add premium reveal animation classes and hero layout"
```

---

### Task 2: Update Dashboard HTML Structure

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Write minimal implementation**

Wrap the top elements (header, wheel, macros) inside `<div class="dash-hero">`. Add the mini-calendar container right before the food log list. Also remove `flex: 1; min-height: 0; overflow: hidden;` from `.dash-log-section` so it grows with its content instead of scrolling internally.

```html
<!-- Inside <div id="view-dashboard" class="view dashboard-view">, add the hero wrapper: -->
<div class="dash-hero" style="padding-top: 24px; padding-left: 20px; padding-right: 20px;">
  <!-- Place the existing dashboard-header, inventory-premium-card, premium-wheel-card, and dash-top-section here -->
</div>

<!-- Below dash-hero, update dash-log-section: -->
<div class="dash-log-section" style="background: rgba(255,255,255,0.3); backdrop-filter: blur(24px); border-radius: 24px; padding: 20px; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05); display: flex; flex-direction: column; margin: 0 20px;">
  
  <div class="section-title-wrap" style="margin-bottom: 16px;">
    <h3 style="font-size: 16px; margin: 0; font-family: 'Outfit', sans-serif; color: var(--text);">This Week</h3>
  </div>
  
  <!-- Mini Calendar Container -->
  <div id="mini-calendar-container" class="reveal-item"></div>

  <div class="section-title-wrap" style="margin-bottom: 12px; margin-top: 24px;">
    <h3 style="font-size: 16px; margin: 0; font-family: 'Outfit', sans-serif; color: var(--text);">Today's Log</h3>
  </div>
  
  <!-- Change ul to overflow: visible so the whole page scrolls, not the list -->
  <ul class="todays-foods-list-container" style="list-style: none; padding: 0; margin: 0;"></ul>
</div>
```

*Note: Ensure you move the `padding-top`, `padding-left`, `padding-right` from `.dashboard-view` CSS into the `.dash-hero` inline style or define it properly, as `.dashboard-view` now acts as a normal scrolling page.*

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "refactor: wrap dashboard in hero section and add calendar container"
```

---

### Task 3: Implement Mini Calendar and Intersection Observer in JS

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Write minimal implementation**

In `src/main.js`, add the Intersection Observer logic at the end of `renderDashboard()`, update the food log items to include `reveal-item`, and implement `renderMiniCalendar()`.

```javascript
// In src/main.js, add renderMiniCalendar function at the top level or inside renderDashboard scope:
function renderMiniCalendar() {
  const container = document.getElementById('mini-calendar-container');
  if (!container) return;
  
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
  
  // Calculate start of week (Monday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  let html = '<div class="mini-calendar">';
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Check if this date has any history in store
    const state = getState();
    const isLogged = state.history && state.history.some(h => h.date === dateStr && h.foods && h.foods.length > 0);
    
    const isToday = d.toDateString() === today.toDateString();
    
    html += `
      <div class="mini-calendar-day ${isToday ? 'active' : ''} ${isLogged ? 'logged' : ''}">
        <span class="day-label">${days[i]}</span>
        <div class="day-bubble">
          ${d.getDate()}
          <div class="dot"></div>
        </div>
      </div>
    `;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

// In renderDashboard(), call renderMiniCalendar():
// ... existing code ...
renderMiniCalendar();

// In renderDashboard(), when rendering foods (around line 728):
// Add "reveal-item" to the <li> and remove flex-shrink: 0 and inline padding/margins if they conflict.
list.innerHTML = foods.map((f, index) => `
  <li class="reveal-item" style="transition-delay: ${index * 0.05}s; display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin-bottom: 8px; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid rgba(255,255,255,0.8);">
    <!-- existing inner HTML -->
  </li>
`).join('');

// At the very end of renderDashboard(), initialize the IntersectionObserver:
setTimeout(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        // Optional: stop observing once revealed
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: "0px 0px -20px 0px"
  });

  document.querySelectorAll('.reveal-item').forEach(item => {
    observer.observe(item);
  });
}, 100);
```

- [ ] **Step 2: Commit**

```bash
git add src/main.js
git commit -m "feat: implement mini calendar and scroll reveal observer"
```

---
