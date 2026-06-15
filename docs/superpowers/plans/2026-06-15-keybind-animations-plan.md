# Keybind Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unique, cool transition animations for the showcase loading keybind (`Alt + Shift + D`) and clean database keybind (`Alt + Shift + C`) before reloading the page.

**Architecture:**
- Append CSS animations and overlays in `src/styles.css`.
- In `src/main.js`, implement DOM overlay creation functions (`showShowcaseAnimation` and `showCleanAnimation`).
- Update keybind listener in `src/main.js` to invoke the animations instead of directly reloading.
- Verify tests pass.

**Tech Stack:** JavaScript, CSS, Vitest, Canvas-Confetti

---

### Task 1: Append styles to src/styles.css

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Append overlay and animation styles to the end of src/styles.css**
  We will add styles for `.showcase-load-overlay`, `.clean-load-overlay`, progress bar, scan line, and keyframe animations.
  
  Code to append to `src/styles.css`:
  ```css
  /* Alt+Shift+D: Showcase Load Overlay */
  .showcase-load-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(18, 30, 24, 0.95);
    backdrop-filter: blur(8px);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-family: 'Outfit', 'Inter', sans-serif;
    opacity: 0;
    animation: overlayFadeIn 0.3s ease-out forwards;
  }

  @keyframes overlayFadeIn {
    to { opacity: 1; }
  }

  .showcase-load-content {
    text-align: center;
    transform: scale(0.8);
    animation: contentScaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes contentScaleUp {
    to { transform: scale(1); }
  }

  .showcase-icon-pulse {
    font-size: 64px;
    margin-bottom: 24px;
    display: inline-block;
    animation: iconPulse 0.5s ease-in-out infinite alternate;
  }

  @keyframes iconPulse {
    from { transform: scale(1); filter: drop-shadow(0 0 10px rgba(91, 157, 116, 0.6)); }
    to { transform: scale(1.15); filter: drop-shadow(0 0 25px rgba(91, 157, 116, 0.9)); }
  }

  .showcase-title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 1px;
    background: linear-gradient(135deg, #a3f7bf, #5b9d74);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 12px;
  }

  .showcase-subtitle {
    font-size: 16px;
    color: #a0aec0;
    margin-bottom: 30px;
  }

  .showcase-progress-bar-container {
    width: 250px;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin: 0 auto;
  }

  .showcase-progress-bar-fill {
    width: 0%;
    height: 100%;
    background: #5b9d74;
    border-radius: 3px;
    animation: progressFill 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes progressFill {
    to { width: 100%; }
  }

  /* Alt+Shift+C: Clean Slate Overlay */
  .clean-load-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(11, 15, 25, 0.95);
    backdrop-filter: blur(8px);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-family: 'Outfit', 'Inter', sans-serif;
    opacity: 0;
    animation: overlayFadeIn 0.3s ease-out forwards;
  }

  .clean-icon-spin {
    font-size: 64px;
    margin-bottom: 24px;
    display: inline-block;
    animation: spinWipe 1.0s cubic-bezier(0.68, -0.6, 0.32, 1.6) infinite;
  }

  @keyframes spinWipe {
    0% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.6)); }
    50% { transform: rotate(180deg) scale(0.8); filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.4)); }
    100% { transform: rotate(360deg) scale(1); filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8)); }
  }

  .clean-title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: 1px;
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 12px;
  }

  .clean-subtitle {
    font-size: 16px;
    color: #94a3b8;
    margin-bottom: 30px;
  }

  .clean-scan-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, transparent, #3b82f6, #60a5fa, #3b82f6, transparent);
    box-shadow: 0 0 20px #3b82f6, 0 0 10px #60a5fa;
    animation: scanLineMove 1.0s ease-in-out infinite;
  }

  @keyframes scanLineMove {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  ```

- [ ] **Step 2: Commit CSS changes**
  Run: `git commit -am "style: add custom CSS showcase and clean overlays"`

---

### Task 2: Implement overlay animations and update keybind listener in main.js

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Update main.js with showcase and clean animation helpers and keydown listener**
  We will add `showShowcaseAnimation` and `showCleanAnimation` functions to `src/main.js` and call them from the keydown event listener.
  
  Code changes:
  ```javascript
  function showShowcaseAnimation() {
    const overlay = document.createElement('div');
    overlay.className = 'showcase-load-overlay';
    overlay.innerHTML = `
      <div class="showcase-load-content">
        <div class="showcase-icon-pulse">⚡</div>
        <div class="showcase-title">SHOWCASE MODUS ACTIEF</div>
        <div class="showcase-subtitle">Simuleren van 5 dagen voortgang...</div>
        <div class="showcase-progress-bar-container">
          <div class="showcase-progress-bar-fill"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#5b9d74', '#ffd700', '#ff4500', '#60a5fa']
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            spread: 80,
            origin: { y: 0.65 },
            colors: ['#a3f7bf', '#fff', '#5b9d74']
          });
        }, 250);
      }
    }, 150);

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  function showCleanAnimation() {
    const overlay = document.createElement('div');
    overlay.className = 'clean-load-overlay';
    overlay.innerHTML = `
      <div class="clean-scan-line"></div>
      <div class="showcase-load-content">
        <div class="clean-icon-spin">🔄</div>
        <div class="clean-title">DATABASE GEWIST</div>
        <div class="clean-subtitle">Lege app aan het voorbereiden...</div>
        <div class="showcase-progress-bar-container">
          <div class="showcase-progress-bar-fill" style="background: #3b82f6;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
  ```

  Update the keydown listener:
  ```javascript
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      return;
    }
    if (e.altKey && e.shiftKey) {
      const key = e.key.toLowerCase();
      if (key === 'd') {
        e.preventDefault();
        resetProgress();
        showShowcaseAnimation();
      } else if (key === 'c') {
        e.preventDefault();
        cleanData();
        showCleanAnimation();
      }
    }
  });
  ```

- [ ] **Step 2: Commit main.js changes**
  Run: `git commit -am "feat: implement showShowcaseAnimation and showCleanAnimation in main.js"`

---

### Task 3: Run and verify tests

**Files:**
- Test: `tests/store.test.js`

- [ ] **Step 1: Run Vitest to ensure no logic has been broken**
  Run: `npx vitest run`
  Expected: All 7 tests pass successfully.
