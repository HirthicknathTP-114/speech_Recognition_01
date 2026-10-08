# EchoWave — Automatic Speech Recognition

High-performance real-time speech-to-text intelligence web application powered by [Vosk](https://alphacephei.com/vosk/) offline speech recognition.

![EchoWave](https://img.shields.io/badge/EchoWave-ASR-7c3aed?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.12-3776ab?style=for-the-badge&logo=python&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%204-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## Overview

**EchoWave** is a modern, privacy-focused speech recognition application. By coupling a React + TanStack Start frontend with a local Python WebSocket server running Vosk, EchoWave processes audio completely on your device without sending voice data to external cloud APIs.

---

## ✨ Features

- **🎙️ Live Microphone Streaming** — Capture voice from any input device with real-time dual-waveform & frequency spectrum visualization.
- **📁 Audio File Transcription** — Drag-and-drop or browse `.wav`, `.mp3`, `.m4a`, `.webm`, or `.ogg` files with interactive progress tracking.
- **🔒 100% Offline & Private** — Local Python server running Kaldi-based Vosk models; zero audio leaves your machine.
- **🎨 Multi-Palette Studio Theme Engine**:
  - **Cyber Violet** (Default): Deep midnight obsidian with radiant electric violet and neon cyan.
  - **Emerald Studio**: High-tech studio slate with vivid emerald and electric mint.
  - **Electric Azure**: Deep sonic navy with royal cobalt and ice flare cyan.
  - **Sunset Ember**: Warm volcanic dark with crimson coral and golden amber.
  - **Dark & Light Modes**: Seamless contrast toggle with tailored glassmorphic surfaces.
- **📊 Real-Time Telemetry Dashboard** — Live words count, speech pacing (WPM), word confidence %, active duration, and Voice Activity Detection (VAD) ratio.
- **✏️ Interactive Transcript Editor** — Search highlighter, clickable timestamp pills that seek audio directly, low-confidence word marking, and inline double-click editing.
- **🎧 Precision Audio Player** — Interactive timeline scrubber, audio playback, mute toggle, and real-time engine diagnostic card.
- **💾 Multi-Format Export** — One-click download as plain text (`.txt`), formatted document (`.pdf`), or subtitle track (`.srt`).
- **📚 Local Session Library** — Automatically persists past transcripts to browser `localStorage` with title filtering, re-loading, and deletion.
- **⌨️ Keyboard Shortcuts** — Full hands-free accessibility with quick shortcut hotkeys.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Framework** | [TanStack Start](https://tanstack.com/start) + [Vite](https://vitejs.dev/) | React 19 full-stack SSR/SPA framework |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS variables, glassmorphism, OKLCH color palettes |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight global state management |
| **ASR Server** | **Python + Vosk** | WebSocket streaming server using Kaldi recognizer |
| **ASR Client** | Native WebSocket Client | 16 kHz 16-bit PCM streaming with auto-reconnection |
| **Audio Engine** | Web Audio API | Live audio capture, audio downsampling, and FFT analyser |
| **Exporting** | jsPDF + Custom Generators | Client-side PDF, TXT, and SRT subtitle compilation |
| **Storage** | `localStorage` + IndexedDB | Client-side transcript history and audio blob cache |
| **Typography** | Outfit, Space Grotesk, Inter, JetBrains Mono | Curated Google Fonts typography system |

---

## 🚀 Quick Start & Setup

### Prerequisites

- **Node.js 18+** (or Bun / pnpm) — for running the frontend
- **Python 3.9+** — for running the local Vosk ASR server
- (Optional) A microphone for real-time speech input

---

### 1. Install Frontend Dependencies

```bash
cd speech_Recognition_01
npm install
```

---

### 2. Set Up the Vosk Python Server

Install the Python dependencies:

```bash
pip install -r server/requirements.txt
```

Download the default accurate English model (~1.8 GB):

```bash
cd server
python download_model.py
```

#### Available Vosk Models

Run `python download_model.py --list` to inspect all supported models:

| Key | Model Name | Description | Size |
|-----|------------|-------------|------|
| `en-us-0.22` | Accurate generic English (US) — **Default** | High general accuracy | ~1.8 GB |
| `en-us-0.42-gigaspeech` | Gigaspeech English (US) | Maximum published accuracy (needs up to 16 GB RAM) | ~2.3 GB |
| `en-us-lgraph` | Lgraph English (US) | High accuracy with low memory footprint | ~128 MB |
| `en-us-0.15` | Small English (US) | Lightweight & fast | ~40 MB |
| `en-in-0.5` | Small English (India) | Tuned for Indian English accents | ~36 MB |
| `hi-0.22` | Small Hindi | Hindi language model | ~42 MB |
| `fr-0.22` | Small French | French language model | ~41 MB |
| `de-0.21` | Small German | German language model | ~45 MB |
| `es-0.42` | Small Spanish | Spanish language model | ~39 MB |

To download a specific model:
```bash
python download_model.py --model en-in-0.5
```

---

### 3. Running EchoWave

#### Option A: Quick Launch (Windows)

Double-click [`start.bat`](start.bat) from the project root. It will automatically launch both the Vosk server and frontend development server in dedicated terminal windows.

#### Option B: Manual Launch

**Terminal 1 — Vosk Server:**
```bash
cd server
python vosk_server.py
```
*You should see:*
```
EchoWave Vosk Server is READY
Listening on ws://0.0.0.0:2700
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open your browser to the URL printed by Vite (typically `http://localhost:3000`). The header will display a green **Vosk Live** indicator when connected to the local engine.

---

## 📡 Architecture & Data Flow

```
┌─────────────────────────────────┐               ┌────────────────────────────────┐
│         EchoWave Client         │               │     Local Python Vosk Server   │
│                                 │               │                                │
│  Mic / Audio File Input         │               │  WebSocket Listener (Port 2700)│
│               │                 │               │               │                │
│  Downsample to 16 kHz 16-bit PCM│───WebSocket──▶│  Vosk KaldiRecognizer         │
│                                 │   (Raw PCM)   │               │                │
│  Live Visualizer & Editor       │◀──WebSocket───│  JSON Hypotheses & Confidences │
│  (Clickable timestamps, export) │  (Stream JSON)│  (Words, Start, End, Conf)     │
└─────────────────────────────────┘               └────────────────────────────────┘
```

1. **Audio Capture**: Browser captures audio from microphone via `AudioContext` and an `AudioWorkletProcessor`.
2. **Audio Resampling**: Audio is converted to single-channel 16 kHz, 16-bit signed integer linear PCM.
3. **WebSocket Stream**: Binary PCM chunks are piped to `ws://localhost:2700`.
4. **Vosk Decoding**: Kaldi recognizer streams real-time partial hypotheses and final phrases with timestamps.
5. **Reactive UI**: Zustand store updates live streaming text, telemetry metrics, and segment lists.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
|:---------|:------------|
| `Space` | Start / Pause active voice recording |
| `Escape` | Stop recording session |
| `Ctrl + E` | Export transcript as plain text (`.txt`) |
| `Ctrl + Shift + E` | Export transcript as PDF document (`.pdf`) |
| `Ctrl + K` | Focus transcript search input |
| `Ctrl + ,` | Open preferences & settings drawer |
| `Ctrl + L` | Clear current transcript |
| `?` | Toggle keyboard shortcuts modal |

---

## 📂 Project Directory Structure

```
speech_Recognition_01/
├── server/                        # Python Vosk WebSocket Server
│   ├── vosk_server.py             # Server entry point (ws://0.0.0.0:2700)
│   ├── download_model.py          # Model downloader CLI
│   ├── requirements.txt           # Python dependencies (vosk, websockets)
│   └── model/                     # Active Vosk acoustic model
├── src/
│   ├── components/
│   │   ├── ui/                    # Base UI primitives (buttons, dialogs, inputs)
│   │   └── voxnova/               # Application-specific components
│   │       ├── Header.tsx         # Brand logo, color palette picker, connection pill
│   │       ├── InputPanel.tsx     # Mic source selector, language/model options, dropzone
│   │       ├── LiveTranscription.tsx # Live streaming transcript terminal
│   │       ├── Recorder.tsx       # Waveform visualizer & glowing recording controls
│   │       ├── StatsRow.tsx       # 5 KPI telemetry cards (WPM, Confidence, etc.)
│   │       ├── TranscriptEditor.tsx # Search, clickable timecodes, inline editor, exporters
│   │       ├── AudioPlayer.tsx    # Audio scrubber & ASR diagnostics
│   │       ├── RecentTranscriptions.tsx # Persistent local library
│   │       ├── SettingsPanel.tsx  # Palette picker, theme toggle, and ASR settings
│   │       ├── ShortcutsOverlay.tsx # Keyboard shortcuts cheat sheet
│   │       ├── Toasts.tsx         # Glassmorphic alert notifications
│   │       └── ui.tsx             # Design system card surfaces, buttons & fields
│   ├── hooks/                     # Custom React hooks (useRecorder, useKeyboardShortcuts)
│   ├── routes/                    # TanStack Start file-based routing
│   │   ├── __root.tsx             # Root layout and error boundaries
│   │   └── index.tsx              # Main EchoWave page
│   ├── services/                  # ASR WebSocket client, exporters, local storage
│   ├── store/                     # Zustand state management
│   ├── styles.css                 # Design tokens, multi-palette themes & animations
│   └── types/                     # TypeScript data interfaces
├── package.json
└── README.md
```

---

## 🧪 Testing & Verification

Run the test suite using Vitest:

```bash
npm test
```

Build the production distribution:

```bash
npm run build
```

---

## 📄 License

This project is developed for speech recognition research and academic demonstrations. Powered by [Vosk ASR](https://alphacephei.com/vosk/).
