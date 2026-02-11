# PathGuardian 2.0 — Development Task Checklist

## Phase 1: Core Senior Navigation
- [x] Landing page with wheelchair hero image and role selection
- [x] Senior dashboard with destination picker (City Hall MRT → landmarks)
- [x] Voice input page — recognizes "Take me to National Museum"
- [x] Walking map with Leaflet.js route visualization
- [x] Auto-play 12-step movement simulation (every 5 seconds)
- [x] Route deviation detection at steps 5-6 with red warning banner
- [x] Auto-correction and return to planned route
- [x] Arrival celebration at National Museum

## Phase 2: Emergency & Help
- [x] Red NEED HELP button on wayfinding page
- [x] Alert modal: "🚨 Alert Sent to Caretaker Sarah" with Call/Cancel
- [x] SOS / I'm Lost emergency page
- [x] Safety check-in flow

## Phase 3: Caregiver Dashboard
- [x] Live Leaflet map showing all managed people
- [x] Arthur (walking, blue), Eleanor (at home, green), Marcus (at pharmacy, amber)
- [x] Arthur marker animates along route every 5 seconds
- [x] Working Map / Alerts / Settings tab bar
- [x] Alerts panel: active (red), warning (amber), resolved (green), past alerts
- [x] Settings panel: toggle switches for alert preferences + managed people list

## Phase 4: Onboarding & People Management
- [x] Simplified caregiver onboarding (no QR codes)
- [x] Pre-connected people list: Eleanor, Marcus, Grandma Rose, Arthur
- [x] "Add New Person" form with name + relationship
- [x] "Continue to Dashboard" button

## Phase 5: Navigation Flow & UX
- [x] All back buttons navigate to specific pages (not history.back)
- [x] All Continue buttons are clickable
- [x] Voice input skips pharmacy confirm — goes straight to wayfinding
- [x] Consistent navigation bars across all pages

## Phase 6: Documentation & Deployment
- [x] README.md with features, tech stack, and getting started
- [x] PRD.md with full product requirements
- [x] TASK.md with development checklist
- [x] Push to GitHub
