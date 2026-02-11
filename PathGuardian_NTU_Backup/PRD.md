# PathGuardian 2.0 — Product Requirements Document

## 1. Overview

**PathGuardian** is a mobile-first web application that provides safe, voice-guided navigation for seniors and people with disabilities, while giving caregivers real-time visibility into their loved ones' journeys.

### Vision
Enable independent mobility for vulnerable populations while providing caregivers with peace of mind through real-time monitoring, smart alerts, and simple communication tools.

### Target Users
- **Primary**: Seniors (65+) who walk independently but may need navigation assistance
- **Secondary**: Caregivers (family members, professional carers) who monitor seniors remotely

---

## 2. Problem Statement

Seniors and people with mobility or cognitive challenges often face:
- Difficulty navigating unfamiliar routes
- Risk of getting lost or deviating from safe paths
- Limited ability to call for help quickly
- Caregivers lack real-time information about their location and safety

---

## 3. Core Features

### 3.1 Navigator (Senior) Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Destination Selection** | Dropdown of Singapore landmarks with City Hall MRT as default origin | P0 |
| **Voice Input** | Say "Take me to National Museum" — recognizes destination via Web Speech API | P0 |
| **Walking Map** | Leaflet.js map with blue route line, pulsing current location dot, red destination marker | P0 |
| **Auto-Play Simulation** | 12-step movement every 5 seconds from City Hall MRT → National Museum | P0 |
| **Turn-by-Turn Instructions** | Real-time instruction panel: direction icon, street name, distance, ETA | P0 |
| **Route Deviation Detection** | Red warning banner + "Off Route" status when user deviates from planned path | P0 |
| **NEED HELP Button** | Red emergency button → modal "Alert Sent to Caretaker Sarah" with Call/Cancel | P0 |
| **SOS / I'm Lost** | Emergency page for when user is completely lost | P1 |
| **Quick Destinations** | One-tap "Go Home" and "Pharmacy" buttons on dashboard | P1 |

### 3.2 Caregiver Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Live Map** | Full-screen Leaflet map showing all managed people with colored markers | P0 |
| **Person Cards** | Status cards: Arthur (walking), Eleanor (at home), Marcus (at pharmacy) | P0 |
| **Alerts Panel** | Color-coded alerts: Active (red), Warning (amber), Resolved (green), Past | P0 |
| **Settings Panel** | Toggle switches for: Route Deviation, Slow Pace, Geofence, Check-in alerts | P0 |
| **Add People** | Simple name + relationship form (no QR codes needed) | P0 |
| **View Route** | Button to see the senior's current walking route on the map | P1 |
| **One-Tap Check-In** | Quick status verification button | P1 |
| **Phone Call** | Direct call button from the dashboard | P1 |

### 3.3 Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Large touch targets | Minimum 64px buttons, 48px nav items |
| High contrast | Dark text on light backgrounds, colored status indicators |
| Voice-first input | Web Speech API for destination entry |
| Minimal cognitive load | One primary action per screen |
| Readable typography | Lexend font, 18px+ body text, bold labels |
| Back button | 64px circular back button on every page (fixed position) |

---

## 4. User Flows

### 4.1 Senior Navigation Flow
```
Landing Page → Senior Dashboard → Select Destination → Walking Map (auto-play)
                                → Voice Input → "Take me to National Museum" → Walking Map
```

### 4.2 Caregiver Monitoring Flow
```
Landing Page → Add People (name/relationship) → Continue to Dashboard
Dashboard → Map tab (see live locations)
         → Alerts tab (view active/past alerts)
         → Settings tab (configure notification preferences)
```

### 4.3 Emergency Flow
```
Walking Map → Red "NEED HELP" → Modal: "Alert Sent to Caretaker Sarah"
                               → Call Caretaker / Cancel Alert
```

---

## 5. Technical Architecture

### Frontend Stack
- **HTML5** — semantic structure
- **Tailwind CSS** (CDN) — responsive styling
- **Vanilla JavaScript** — logic, state management
- **Leaflet.js** — interactive maps with OpenStreetMap
- **Web Speech API** — voice recognition

### Data Model (Simulated)
- **Route**: Array of `[lat, lng]` waypoints (City Hall MRT → National Museum)
- **Deviation**: Pre-defined deviation points at steps 5-6
- **People**: Hardcoded profiles (Arthur, Eleanor, Marcus, Grandma Rose)
- **Alerts**: Static alert cards with various severity levels

### Map Implementation
- OpenStreetMap tiles via Leaflet.js
- Blue polyline for planned route
- Green polyline for walked path
- Pulsing dot for current location
- Colored markers for each person (blue=walking, green=home, amber=pharmacy, red=destination)

---

## 6. Simulation Details

### Walking Simulation (wayfinding.html)
- **12 steps**, each updating every **5 seconds**
- Steps 1-4: Normal walking along St Andrew's Road
- Steps 5-6: **Deviation detected** — user goes right instead of left, red warning banner
- Steps 7-8: **Auto-correction** — heading back to Stamford Road
- Steps 9-11: Normal walking, museum in sight
- Step 12: **Arrival celebration** — "🎉 You have arrived!"

### Dashboard Simulation (dashboard_live.html)
- Arthur's marker animates along the route every 5 seconds
- Eleanor shown as static marker at home (green)
- Marcus shown as static marker at pharmacy (amber)
- Alerts pre-populated with 5 sample events across 4 people

---

## 7. Pages Inventory

| # | Page | Purpose |
|---|------|---------|
| 1 | `index.html` | Landing — role selection |
| 2 | `senior_home.html` | Senior dashboard — destination picker |
| 3 | `voice_input.html` | Voice recognition input |
| 4 | `wayfinding.html` | Walking map + simulation |
| 5 | `dashboard_live.html` | Caregiver dashboard |
| 6 | `caregiver_welcome.html` | Add people |
| 7 | `im_lost.html` | Emergency "I'm Lost" |
| 8 | `safety_checkin.html` | Safety check-in |
| 9 | `deviation_alert.html` | Deviation alert detail |
| 10 | `alert_escalation.html` | Alert escalation |
| 11 | `alert_prefs.html` | Alert preferences |
| 12 | `invite_circle.html` | Care circle invitations |
| 13 | `journey_history.html` | Past journeys |
| 14 | `journey_details.html` | Journey detail view |
| 15 | `profile.html` | User profile |
| 16 | `accessibility.html` | Accessibility settings |
| 17 | `help.html` | Help & support |
| 18-32 | Supporting pages | Onboarding, locations, tutorials, etc. |

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Time to start navigation | < 3 taps or 1 voice command |
| Deviation detection | Alert within 5 seconds of leaving route |
| Caregiver alert delivery | Immediate modal + notification |
| Page load time | < 2 seconds on 4G |
| Accessibility compliance | WCAG 2.1 AA minimum |

---

## 9. Future Enhancements

- Real GPS integration (replacing simulation)
- Push notifications for caregivers
- Multiple route options
- Indoor navigation for malls/hospitals
- Multi-language support
- Integration with emergency services (995/999)
- Wearable device support (smartwatch)
