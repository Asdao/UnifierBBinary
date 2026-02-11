# UnifierBBinary - Architecture and Design Statement

## Design Philosophy: Multimodal Inclusion

The core design principle of UnifierBBinary is **Multimodal Inclusion**. Most assistive technology is built around a single interface (e.g., just voice or just touch). This unintentionally excludes users who may have temporary or permanent limitations in those specific areas.

UnifierBBinary solves this by combining:
1.  **Computer Vision**: For silent, proactive monitoring (falls, hydration, emotions).
2.  **Conversational AI**: For empathetic, natural language support.
3.  **Large-Target UI**: For high-contrast, accessibility-standard touch interaction.
4.  **Gesture Recognition**: For non-verbal communication via sign language.

---

## System Architecture

### 1. Unified Management Layer (Node.js)
The root workspace uses a custom `manage.js` script to orchestrate the lifecycle of all sub-services. It handles environment variable synchronization and simultaneous startup of the frontend and backend components.

### 2. Aurora AI Assistant (React + MediaPipe + ONNX)
- **Vision Pipeline**: A three-stage pipeline using MediaPipe for landmarks (Face, Pose, Object) and ONNX Runtime Web for real-time emotion classification.
- **Contextual Memory**: A vector-based memory system that stores environmental observations and chat history, allowing the Gemini LLM to respond with situational awareness.
- **Vite Integration**: High-performance build system with secure environment variable injection.

### 3. PathGuardian 2.0 (Vanilla JS + Leaflet)
- **Accessibility Engine**: Built with a "Zero-Friction" goal, using large touch targets (64px) and voice-first input.
- **Simulation Logic**: A pre-built movement simulator that demonstrates route deviation detection and caregiver alerting without requiring physical travel.

### 4. SignMeUp Interpreter (Next.js + MediaPipe + LSTM)
- **Local Machine Learning**: Uses an LSTM (Long Short-Term Memory) neural network trained locally in the browser to translate hand landmarks into phrases.

---

## Project Structure Overview

```text
UnifierBBinary/
├── README.md               # Master Documentation (Setup & Vision)
├── scripts/                # Workspace Orchestration
├── BBinary/                # Aurora AI Assistant Source
│   ├── apps/web-app/       # Main React Application
│   └── ...
├── PathGuardian/           # Navigation & Caregiver Dashboard
│   ├── PRD.md              # Detailed Requirements
│   ├── wayfinding.html     # Map & Simulation Engine
│   └── ...
└── SignLanguageInterpreter/# Gesture Recognition Engine
    ├── app/                # Next.js Application
    └── ...
```

---

## Deployment and Setup
The repository includes all necessary source files. To run the solution:
1. Ensure Node.js 18+ is installed.
2. Run `npm run install:all` at the root.
3. Create a `.env` file in the root with your Gemini API Key.
4. Run `npm run dev` and select "Load All Services".
