# UnifierBBinary 🛡️✨
### Advanced Wellness, Accessibility & Safety Suite

**UnifierBBinary** is an integrated ecosystem designed to empower seniors and people with disabilities through the intersection of **AI Vision**, **Conversational Intelligence**, and **Smart Navigation**. 

This suite brings together three powerful modules into a single, cohesive experience for both users and caregivers.

---

## The Three Pillars

### 1. Aurora (AI Wellness Assistant)
*The empathetic heart of the system.*
- **Vision Intelligence**: Real-time detection of emotions, hydration events (drinking water), and falls.
- **Conversational Memory**: A Google Gemini-powered partner that remembers your activities and feelings to provide supportive context.
- **Biometric Dashboard**: Glassmorphism UI showing live activity, safety status, and situational awareness.
- **Location**: `BBinary/`

### 2. PathGuardian 2.0 (Navigation)
*Independent mobility, shared peace of mind.*
- **Voice-First Wayfinding**: Large-button, voice-controlled navigation for seniors.
- **Caregiver Live Map**: Real-time tracking with route deviation alerts and SOS triggers.
- **Simulation Mode**: Pre-built "Walk to National Museum" for demonstration.
- **Location**: `PathGuardian/`

### 3. SignMeUp (Sign Language recognition)
*Privacy-focused local translation.*
- **Local Gesture Recognition**: Teach the machine *your* specific signs (e.g., "Hungry", "Medicine").
- **Edge Deployment**: Uses MediaPipe and LSTMs to recognize signs entirely in your browser.
- **Integration**: Accessible directly from the Aurora Dashboard.
- **Location**: `SignLanguageInterpreter/`

---

## Getting Started

The entire suite is managed by a centralized control script.

### 1. Unified Installation
```bash
npm run install:all
```

### 2. Configure Secrets
Create a `.env` file in the root directory:
```env
GOOGLE_API_KEY=your_key_here
VITE_MODEL_NAME=gemma-3-4b-it
```

### 3. Launch One-Click Management
```bash
npm run dev
```
This interactive CLI lets you start/stop individual modules or the entire suite simultaneously.

---

## Tech Stack

| Component | Tech |
|-----------|------|
| **Core AI** | Google Gemini (GenAI SDK), MediaPipe |
| **Edge Vision** | ONNX Runtime Web, TFLite, MediaPipe Tasks |
| **Frontend** | React 19, Vite 7, TailwindCSS 4, Leaflet.js |
| **Backend** | Node.js (Management Layer), Next.js (SLI) |
| **Voice** | Web Speech API (TTS/STT) |

---

## Project Structure

- `/scripts`: The "brain" of the unified workspace management.
- `/BBinary`: Aurora's React-based frontend and vision pipeline.
- `/PathGuardian`: Accessibility-first navigation assets.
- `/SignLanguageInterpreter`: Next.js gesture recognition engine.
- `.env`: Centralized secret management.

---

## Hackathon Context
Built for **Beyond Binary 2026**. This project demonstrates how edge computing and conversational AI can create a truly private, proactive caregiving environment.

**Independent Mobility. Empathetic Support. Local Privacy.**
