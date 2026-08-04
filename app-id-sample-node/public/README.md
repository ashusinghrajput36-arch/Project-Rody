<div align="center">

# 🚦 Traffic Flow & Bottleneck Visualizer

### *"Watch congestion form in real time — and take control of the signal."*

An interactive, real-time **traffic simulation** built with pure **Vanilla HTML5 Canvas, CSS3, and ES6+ JavaScript** — no frameworks, no dependencies, no build tools.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-0f172a?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-34d399?style=for-the-badge)

</div>

---

## 📸 Preview

> **Live simulation in action:** vehicles spawn from the left, follow each other down a single-lane road, and queue up at a traffic signal you control.

```
┌─────────────────────────────────────────────────────────────┐
│  🚦  Rody Simulator — Traffic Simulation                    │
│  ──────────────────────────────────────────────────────     │
│  ● Canvas                                    Vehicles: 12   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🚗 🚙 🚕 🚗 🚙 🚗  🟢───────────🛑                │  │
│  │      ↳ moving freely            ↓ queued at signal    │  │
│  └───────────────────────────────────────────────────────┘  │
│  Control Panel:                                            │
│    Inflow Rate ──●──────────  40 cars/min                  │
│    Max Speed   ───────●─────  120 px/s                     │
│    [ Signal: GREEN ]                                       │
│    Live Metrics: Queue: 3 cars | Flow Status: Fluid        │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

| | Feature | Description |
|---|---|---|
| ⚙️ | **Real-Time Physics Engine** | Car-following model with dynamic speed control, smooth braking, and vehicle-ahead gap detection — mimicking real driver behavior. |
| 🚦 | **Interactive Signal Control** | Toggle the traffic light between **GREEN** and **RED** via the control panel button *or* by clicking directly on the canvas. |
| 📊 | **Live Analytics & Metrics** | Real-time dashboard tracking **active vehicle count**, **queue backups**, and **flow status** (*Fluid / Moderate / Congested*). |
| 🎛️ | **Adjustable Variables** | Live sliders to customize vehicle **inflow rate** (cars/min) and **maximum cruising speed** (px/sec) — watch the traffic react instantly. |
| ⏱️ | **Delta-Time Frame Sync** | Frame-rate independent animation loop ensures identical simulation speed across 60Hz, 120Hz, and beyond. |
| 📱 | **Responsive Architecture** | Auto-scaling canvas layout that adapts seamlessly to any screen size. |

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|--------|
| **HTML5** | Semantic layout shell + 2D Canvas viewport |
| **CSS3** | Modern dark-mode styling, responsive grid layout, UI components |
| **JavaScript (ES6+)** | Object-oriented vehicle architecture, physics logic, animation loop |

> 🧰 **Zero external dependencies** — everything runs natively in the browser.

---

## 📁 Project Structure

```
project-rodyy/
├── index.html   # Application structure & HTML controls
├── style.css    # CSS grid, dark theme, & visualizer styling
└── script.js    # Simulation engine, car class, & canvas rendering loop
```

---

## 🚀 Quick Start

Get the simulation running in **under 30 seconds** — no server, no packages, no build tools.

### Option 1 — Clone & Open

```bash
# Clone the repository
git clone https://github.com/your-username/traffic-flow-visualizer.git

# Navigate into the project
cd traffic-flow-visualizer

# Open in your default browser (or double-click index.html)
start index.html
```

### Option 2 — Just Download

1. Download the project as a ZIP.
2. Extract the folder.
3. Double-click **`index.html`**.

> ✅ Works in any modern web browser (Chrome, Firefox, Edge, Safari).

---

## 🔬 How It Works

### 🚗 Car-Following Logic

Every frame, each vehicle computes its desired speed based on **two primary factors**:

1. **🚦 Traffic Light Proximity** — If the signal is **RED** and the vehicle approaches the stop line, it decelerates to a full stop (`0 px/s`).
2. **🚙 Leader Gap Distance** — Each vehicle monitors the position and speed of the vehicle ahead. If the gap shrinks below a safe threshold, the trailing vehicle slows smoothly to match speed — or stops entirely.

```javascript
// Smooth speed transition logic
this.speed += (desiredSpeed - this.speed) * accelerationRate;
this.x += this.speed * deltaTime;
```

### 🧠 Vehicle Class

Each car is an instance of the `Vehicle` class, carrying its own state:

```javascript
class Vehicle {
    constructor(x, y, speed, color) {
        this.x = x;            // horizontal position
        this.y = y;            // lane position
        this.speed = speed;    // current velocity
        this.color = color;    // rendered color
        this.width = 28;       // visual size
        this.height = 14;
    }
}
```

### ⏱️ Delta-Time Rendering Loop

The core animation loop uses `requestAnimationFrame` with **delta-time normalization**, so simulation speed stays consistent regardless of monitor refresh rate.

```javascript
function gameLoop(now) {
    let dt = (now - lastTime) / 1000;  // seconds since last frame
    lastTime = now;
    // ... spawn, update, & render vehicles
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

---

## 🎮 Controls & Mechanics

| Control | Function |
|---------|----------|
| 🎚️ **Inflow Rate Slider** | Adjusts how frequently new vehicles spawn at the left boundary (10 – 120 cars/min). |
| 🎚️ **Cruise Speed Slider** | Sets the maximum desired velocity for vehicles when the road is clear (40 – 240 px/s). |
| 🔘 **Signal Toggle Button** | Switches the traffic light between GREEN and RED. |
| 🖱️ **Click the Canvas** | Shortcut — click anywhere on the road to toggle the signal instantly. |

---

## 📊 Live Metrics Explained

| Metric | Meaning |
|--------|---------|
| **Vehicles** | Total active cars currently on the road. |
| **Queue** | Cars stopped *behind* the stop line, waiting for a green light. |
| **Flow Status** | Traffic health indicator: **🟢 Fluid** → **🟡 Moderate** → **🔴 Congested**. |

> 💡 **Try this experiment:** Turn the signal **RED**, crank the inflow rate up to **120 cars/min**, and watch the queue explode. Then flip it GREEN and watch the congestion clear in real time.

---

## 🔮 Roadmap

- [x] Single-lane traffic simulation with signal control
- [ ] Multi-lane highway merging simulations
- [ ] Multi-direction 4-way intersection routing
- [ ] Variable driver behaviors (aggressive vs. cautious)
- [ ] Real-time heat maps for stopped traffic

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to fork the repo, open a PR, or submit an issue.

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-idea`)
3. 💾 **Commit** your changes (`git commit -m 'Add amazing idea'`)
4. 🚀 **Push** to the branch (`git push origin feature/amazing-idea`)
5. 🔀 **Open** a Pull Request

---

## 📜 License

Distributed under the **MIT License**. Free for open-source, educational, and commercial use.

```
MIT License

Copyright (c) 2024 Rody Simulator

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

**Built with ❤️ using pure JavaScript — no frameworks harmed in the making of this simulation.**

⭐ If you find this project useful, give it a star!

</div>

