# UnifierBBinary
### Advanced Wellness, Accessibility & Safety Suite

**Problem Statement 1**

Technology has transformed the way we communicate, learn, and navigate the world. However, its potential to support specially-abled individuals remains under-explored. While assistive tools do exist, many of them are designed for only one mode of interaction - such as speech, text, or vision - which unintentionally excludes users who cannot rely on that specific mode. As a result, a multimodal approach is needed to combine different methods so more specially-abled individuals can access communication, learning, and independence.

**Design an inclusive assistive solution that works across multiple abilities, rather than depending on a single mode of interaction.**

---

## The Three Pillars

### 1. Aurora (AI Wellness Assistant)
The empathetic heart of the system.
- **Vision Intelligence**: Real-time detection of emotions, hydration events (drinking water), and falls.
- **Conversational Memory**: A Google Gemini-powered partner that remembers your activities and feelings to provide supportive context.
- **Biometric Dashboard**: Glassmorphism UI showing live activity, safety status, and situational awareness.
- **Location**: `BBinary/`

### 2. PathGuardian 2.0 (Navigation)
Independent mobility, shared peace of mind.
- **Voice-First Wayfinding**: Large-button, voice-controlled navigation for seniors.
- **Caregiver Live Map**: Real-time tracking with route deviation alerts and SOS triggers.
- **Simulation Mode**: Pre-built "Walk to National Museum" for demonstration.
- **Location**: `PathGuardian/`

### 3. SignMeUp (Sign Language recognition)
Privacy-focused local translation.
- **Local Gesture Recognition**: Teach the machine your specific signs (e.g., "Hungry", "Medicine").
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

### 2. Configure Secrets (Crucial)
You must create a file named `.env` in the root directory of the project. This file is required for the API keys and configuration to load correctly.

Example `.env` content:
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

## Detailed Tech Stack

### Artificial Intelligence & Vision
- **LLM**: **Google Gemini (GenAI SDK)** for empathetic, context-aware conversations.
- **Vision Foundation**: **Google MediaPipe Tasks Vision** for object detection and pose estimation.
- **Emotion Recognition**: **ONNX Runtime Web** running custom emotion classification models client-side.
- **Activity Heuristics**: Custom algorithms for **Fall Detection** and **Hydration tracking**.
- **Edge ML**: **TFLite** (EfficientDet Lite0) for low-latency object tracking in the browser.

### Frontend & Design
- **Core Framework**: **React 19** with **TypeScript** for type-safe, component-driven UI.
- **Build System**: **Vite 7** for near-instant development and optimized production builds.
- **Styling**: **TailwindCSS 4** & **Glassmorphism** for a premium, accessible design language.
- **Mapping**: **Leaflet.js** integrated with **OpenStreetMap** for real-time navigation tracking.
- **Icons**: **Lucide React** for consistent, high-contrast visual cues.

### Voice & Accessibility
- **Speech-to-Text**: **Web Speech API (Recognition)** for hands-free navigation commands.
- **Text-to-Speech**: **Web Speech API (Synthesis)** with personalized female voice selection for Aurora.
- **UX**: Accessibility-first design with 64px touch targets and high-contrast color palettes.

### Infrastructure & Tooling
- **Orchestration**: Custom **Node.js** management layer (`manage.js`) for coordinated service control.
- **Sign Language Engine**: **Next.js** based gesture classifier with local training capabilities.
- **Persistence**: **LocalStorage** for secure, local chat history and environmental observations.
- **Environment**: Centralized `.env` synchronization across monorepo components.

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
