# Behavioral Health SPA Design Spec

## 1. Overview
A Behavioral Health Single Page Application (SPA) designed for the US market, heavily based on the "Atomic Habits" methodology. The application is completely offline-first, leveraging `LocalStorage` for all data to ensure maximum privacy. It uses Vanilla HTML5, CSS3, and JavaScript without any external frameworks (No React, Angular, or Vue).

## 2. Architecture & Tech Stack
- **Tech Stack:** Vanilla HTML5, CSS3, and JavaScript (ES6+).
- **Data Storage:** 100% offline-first via `LocalStorage`. 
- **Data Portability:** Includes a dedicated Export/Import feature via the Privacy tab so users don't lose data across devices or browser clears.
- **Performance:** Target bundle size < 500KB. UI transitions < 200ms. Mobile-first approach optimized for WebView.

## 3. Core Pillars (Atomic Habits)
1. **Make it Obvious:** Baseline Confrontation Feature (Diet scoring based on US context), Daily Schedule Alignment (Web Push triggers), Habit Stacking Engine, Environment Priming Module.
2. **Make it Attractive:** Temptation Bundling Framework, Micro-Culture Leaderboard Simulation (simulated local leaderboard for social norming), Motivation Ritual Trigger.
3. **Make it Easy:** Friction Reduction Wizard (1-click meal prep blueprints), 2-Minute Rule Starter.
4. **Make it Satisfying:** Immediate Visual Reward System (CSS confetti), Advanced Streak Tracker ("Never Miss Twice" logic).

## 4. UI Views (Bottom Navigation)
1. **Dashboard:** Multi-nutrient progress wheel, live differential displays, and a contextual recipe-push card. Layout specifics will be determined during implementation.
2. **Logging:** Step-counter logger and localized US calorie dictionary search bar.
3. **Habit Architect:** Habit-stacking config, streak visualization, and environment priming toggle.
4. **Transparency & Privacy:** Exposes raw JSON data payload, explains local-only architecture, and provides **Export/Import** buttons for data backups.

## 5. Design System
- **Theme:** "Fresh Sprout" (Pastel White + Green)
- **Palette:** 
  - Background: `#f4f8f5` (Cool white)
  - Primary: `#a3d9b1` (Vibrant but soft yellow-green)
  - Text/Contrast: `#1e362d` (Deep grey-green)
- **Typography:** Modern, clean. Headers 16-18pt, Subheaders 12-14pt, Body text 10.5pt.
