# 🍓 Fruit Runner

**Fruit Runner** is a responsive, feature-rich 2D HTML5 arcade platformer built using vanilla JavaScript (ES6 modules) and HTML5 Canvas.

Players control the fruit runner across 10 progressively challenging stages—navigating double-jumps, crumbling ledges, bounce spring pads, and stomping enemies—culminating in an epic boss fight against the **Giant Pineapple**.

---

## 🌟 Key Features

* **Dynamic Physics & Platforming:** Built-in AABB collision detection supporting double-jumps, spring launchpads, crumbling platforms, and enemy stomping.
* **10-Stage Progression & Multi-Phase Boss:** 10 hand-balanced levels ending in a final Boss Stage featuring an interactive HUD health bar and invulnerability phases.
* **Persistent LocalStorage Progress:** Tracks unlocked levels, high scores, lifetime fruit collected, star ratings (1–3 stars), and mute settings across sessions.
* **Native Web Audio Engine:** Retro 8-bit sound synthesizers generated on-the-fly with the browser's Web Audio API—zero external audio assets required.
* **Visual Polish & FX:** Emitter-based particle explosions for pickups/stomps, canvas screen shake on heavy impacts, and an interactive Start Cover & Level Select menu.

---

## 🕹️ Controls

| Action | Keyboard Controls |
| :--- | :--- |
| **Move Left / Right** | `A` / `D` or `Left Arrow` / `Right Arrow` |
| **Jump / Double Jump** | `W`, `Up Arrow`, or `Spacebar` |
| **Start / Pause / Confirm** | `Spacebar` or On-Screen Controls |
| **Mute SFX** | On-Screen HUD Toggle Button |

---

## 📂 Project Structure

```text
fruit-runner/
├── index.html            # Core HTML frame & HUD UI overlays
├── style.css             # Visual styling, responsive layout & canvas container
└── src/
    ├── main.js           # Entry point & application bootstrapper
    ├── game.js           # Game loop engine, state machine & event dispatcher
    ├── player.js         # Player physics, sprite state & movement mechanics
    ├── platform.js       # Standard, crumbling, and spring platform entities
    ├── enemy.js          # Patrol AI & enemy collision logic
    ├── boss.js           # Level 10 Giant Pineapple Boss AI & health system
    ├── levelManager.js   # Level designs (1–10) & unlock progression tracker
    ├── storageManager.js # LocalStorage abstraction for saves & high scores
    ├── audio.js          # Web Audio API 8-bit sound synthesizer
    └── particles.js      # Emitter system for particle bursts & screen shake
🚀 Getting Started
Since Fruit Runner is built with zero build steps or third-party dependencies, you can run it locally with any web server.

Prerequisites
A modern web browser (Chrome, Firefox, Safari, Edge).

A local development server (e.g., VS Code Live Server extension or Python/Node static server).

Running Locally
Clone the repository:

Bash
git clone [https://github.com/bighartedbon/fruit-runner.git](https://github.com/bighartedbon/fruit-runner.git)
cd fruit-runner
Start a local server:

VS Code: Right-click index.html and click "Open with Live Server".

Python 3: Run python -m http.server 8000 in your terminal and open http://localhost:8000.

🌐 Online Deployment
Play the live version online via GitHub Pages:
https://bighartedbon.github.io/fruit-runner/

🛠️ Built With
HTML5 Canvas – 2D rendering pipeline

JavaScript (ES6 Modules) – Object-Oriented modular game logic

Web Audio API – Dynamic audio synthesis

CSS3 – Responsive HUD and layout overlay styling

📄 License
This project is open-source software under the MIT License.
