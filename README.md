# 🎂 Interactive Birthday Celebration Web Portal 🎈✨

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Canvas Confetti](https://img.shields.io/badge/Canvas_Confetti-FF69B4?style=flat)](https://www.npmjs.com/package/canvas-confetti)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enchanting, production-grade **Interactive Birthday Celebration Web Portal** built with vanilla HTML5, CSS3, JavaScript, and HTML5 Canvas particle physics. Featuring smooth 3D zoom transitions, floating sakura petals, dynamic video universe showcases, an interactive blooming memory tree, a pullable magic wish hat, a sliceable 3-tier birthday cake with flame blowout, and an interactive archery bow-and-arrow grand finale.

Designed to be easily customizable for any best friend, sibling, partner, or colleague in less than 2 minutes!

---

## 🌟 Key Features

### 1. ⏳ Live IST Countdown & Password Gate
- Real-time countdown timer locked until the exact birthday date.
- Instant preview bypass support for testing: append `?preview=1` to the URL or enter passcode `birthday`.
- Celebratory unlock sequence with countdown chime SFX and full-screen confetti blast.

### 2. 🌌 6 Multiverse Character Universes
- **Universe 01 — The Joyful Soul ✨**: Vibrant gold & yellow star shower theme.
- **Universe 02 — Master Chef 👩‍🍳**: Warm flame glow with culinary spice and pancake animation.
- **Universe 03 — The Foodie 🍔**: Neon diner vibe with floating burgers, pizzas, and boba.
- **Universe 04 — Island Wanderer 🌊**: Tropical ocean beach with rolling wave gradients and palm breezes.
- **Universe 05 — The Dance Star 💃**: Club dance floor with animated audio equalizer visualizer bars.
- **Universe 06 — Birthday Royalty 👑**: Galactic cosmos nebula with royal crown jewels and diamond sparkles.

### 3. 🌳 Interactive Blooming Memory Tree & Polaroid Gallery
- Click the interactive heart tree to bloom vibrant heart-leaves and progressively reveal 8 tilt-styled Polaroid memory cards.
- Each memory card features customizable badges, handwritten captions, and nostalgic timestamps.

### 4. 🎩 The Magic Wish Hat
- Interactive draggable ribbon mechanic: pull the ribbon from the top hat to reveal 6 heartfelt birthday wishes one by one.
- Celebratory flying particles spawn upon revealing each wish, culminating in the cake reveal.

### 5. 🎂 Interactive 3-Tier Cake Slicing & Candle Blowout
- Click the birthday cake to slice through all 3 tiers with an animated knife and glowing cut line.
- Blows out the animated candle flame, triggers realistic fireworks, and launches celebratory confetti.

### 6. 🏹 Grand Finale: Crossbow Archery & Secret Envelope
- Draggable crossbow arrow rig: pull back the arrow and release to shoot across the arena.
- Pricks the sealed royal wax heart to open the secret wax envelope and unveil the royal birthday wish card and portrait.
- Action buttons: Fire Confetti, Launch Multi-Burst Fireworks, or Replay the journey from the beginning!

### 7. 🎵 Seamless Background Audio Engine
- Smart audio manager plays the celebration anthem continuously across pages.
- Automatically pauses background music when universe videos are playing, and seamlessly resumes from the exact timestamp when paused or finished.

---

## 🚀 Live Demo & Quick Start

### Run Locally:
1. Clone the repository:
   ```bash
   git clone https://github.com/Stark345/interactive-birthday-webpage.git
   cd interactive-birthday-webpage
   ```
2. Open `index.html` directly in any modern browser:
   - Double click `index.html`, OR
   - Run a local server:
     ```bash
     python -m http.server 8080
     ```
     Navigate to `http://localhost:8080/?preview=1`.

> 💡 **Tip**: Adding `?preview=1` to the URL instantly unlocks all pages without waiting for the countdown date!

---

## 🛠️ How to Customize in 2 Minutes

All configuration is centralized inside `script.js` in the `CONFIG` object:

```javascript
const CONFIG = {
  birthdayMonth: 9,      // Month (1-12)
  birthdayDay:   19,     // Day of birthday
  timeZone:      "Asia/Kolkata",
  passcode:      "birthday", // Bypass password
  friendName:    "Bestie",

  // 8 Polaroid Memories
  gallery: [
    { caption: "Our First Selfie", stamp: "#Memories", tilt: -2.5, img: "assets/images/memory-1.webp", icon: "📸" },
    { caption: "Milestone Moments", stamp: "#Victories", tilt: 3.2, img: "assets/images/memory-2.webp", icon: "⭐" },
    // ... add up to 8 memories
  ],

  // 6 Magic Hat Wishes
  balloons: [
    { msg: "Stay wonderfully authentic and uniquely you, always!", icon: "🌈", cls: "b1" },
    // ... add your custom wishes
  ]
};
```

### Adding Your Custom Media:
- **Photos**: Drop your photos into `assets/images/` named `memory-1.webp` to `memory-8.webp` and `birthday-queen.webp`.
- **Videos**: Drop your custom MP4 video clips into `assets/videos/` named `universe-1.mp4` through `universe-6.mp4`.
- **Music**: Replace `assets/audio/song.mp3` with your friend's favorite song.

---

## 📂 Project Architecture

```
interactive-birthday-webpage/
├── index.html              # Core single-page multiverse application
├── script.js               # Canvas physics, particle systems, smart audio & navigation
├── style.css               # 3D transforms, glassmorphism, responsive animations
├── assets/
│   ├── audio/
│   │   └── song.mp3        # High quality celebration soundtrack
│   ├── images/
│   │   ├── birthday-queen.webp # Royal crown avatar card
│   │   ├── memory-[1-8].webp   # 8 Polaroid memory cards
│   │   └── universe-[0-5].webp # 6 High-resolution universe video posters
│   └── videos/
│       └── README.md       # Video drop-in instructions (gitignored for privacy)
├── .gitignore              # Strict privacy rules preventing personal media leaks
└── README.md               # Documentation & customization guide
```

---

## 🛡️ Privacy & Security Best Practices

This template is privacy-hardened:
- All personal names, private contact details, and private videos are excluded from version control via `.gitignore`.
- Video elements feature responsive fallback posters, ensuring the portal looks stunning even before custom video files are loaded.

---

## 📜 License

Distributed under the [MIT License](LICENSE). Feel free to use, modify, and share this celebration template for your loved ones!

Crafted with 💖 and creative coding by [S Jaichandran](https://github.com/Stark345).
