# Eclipse Weaver: Echoes of the Cosmos

![Eclipse Weaver Cover](https://img.shields.io/badge/Platform-iOS%20%7C%20Web-00f0ff?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-ff0077?style=for-the-badge)
![Build](https://img.shields.io/badge/Build-GitHub%20Actions%20IPA-00ff88?style=for-the-badge)

A brand-new, visually stunning, addictive physics & time-weaving arcade puzzle game for **iOS** and **Web Browsers**.

---

## 🌟 Game Overview & Core Hook

In **Eclipse Weaver**, you pilot `Astra`, a glowing celestial core navigating dynamic orbital fields filled with stars, black hole singularities, and corrupted dark matter.

### Core Mechanics & Features
1. **Gravitational Kinetics & Thread Weaving**:
   - Touch drag, virtual joystick, or WASD/Arrow keys to control velocity.
   - Tether glowing energy threads behind you as you move between orbiting celestial nodes.
2. **Temporal Echo System ("Co-op with Past Self")**:
   - Activate **Temporal Echo (Space / Tap)** to record a 4-second ghost path of your core.
   - Partner with your past playback self to weave intricate closed polygons that a single core could never form alone!
3. **Harmonic Resonances & Solar Bursts**:
   - Form closed geometric loops (triangles, squares, complex polygons) around nodes to unleash a **Solar Burst**.
   - Solar Bursts purify corruptors, absorb stellar energy, and build pentatonic chord scales using dynamic procedural sound synthesis (Web Audio API).
4. **Supernova Surge**:
   - Fill your Supernova gauge by executing multi-node constellation combos to unleash a screen-clearing pulse blast.
5. **30 Campaign Sectors + Endless High Score Mode**:
   - Challenge 30 handcrafted levels with scaling mechanics (pulsar nodes, gravitational pull, moving black holes).
   - Endless Surge survival mode with global high score saving.

---

## 📱 Download iOS .IPA Package

This repository is integrated with **GitHub Actions**. Every commit automatically compiles the native iOS package.

To get the `.ipa` file:
1. Go to the **Actions** tab or **Releases** tab in this GitHub repository.
2. Select the latest workflow run or Release `v1.0.0`.
3. Download **`EclipseWeaver.ipa`**.
4. Install on your iOS device using **AltStore**, **Sideloadly**, **TrollStore**, or Apple Xcode.

---

## 🎮 How to Play Locally (Browser)

Simply open `index.html` in any modern web browser (Safari, Chrome, Edge, Firefox, Mobile Web Browser). No local web server or build tool step required!

```bash
# Open directly in browser
open index.html  # macOS
start index.html # Windows
```

---

## 📜 Repository Structure

```
eclipse-weaver/
├── index.html                  # HTML5 Game Canvas & Glassmorphism UI
├── css/
│   └── style.css               # Futuristic neon glass styles
├── js/
│   ├── engine/
│   │   ├── Vector2.js          # 2D Math library
│   │   ├── Physics.js          # Physics, gravity, & polygon intersection math
│   │   ├── ParticleSystem.js   # Visual sparks & solar shockwaves
│   │   └── SoundSynth.js       # Web Audio API sound synthesizer
│   ├── game/
│   │   ├── Entities.js         # Player, Echo, Nodes, Corruptors, Black Holes
│   │   ├── Constellation.js    # Thread loop detector & solar burst engine
│   │   ├── LevelManager.js     # 30 Sector Campaign & Endless Wave Generator
│   │   └── Game.js             # Main 60 FPS Game Loop & Render Controller
│   └── app.js                  # Application entry point & UI event wiring
├── ios/
│   └── App/                    # Native iOS Xcode Project & Swift App Delegate
├── .github/
│   └── workflows/
│       └── build-ipa.yml       # macOS GitHub Actions workflow for building .IPA
└── README.md
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
