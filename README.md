# 🎂 Interactive Birthday Celebration Web Portal 🎈✨

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://bday-template.netlify.app/?preview=1)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Canvas Confetti](https://img.shields.io/badge/Canvas_Confetti-FF69B4?style=flat)](https://www.npmjs.com/package/canvas-confetti)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enchanting, production-grade **Interactive Birthday Celebration Web Portal** built with vanilla HTML5, CSS3, JavaScript, and HTML5 Canvas particle physics. Featuring smooth 3D zoom transitions, floating sakura petals, dynamic video universe showcases, an interactive blooming memory tree, a pullable magic wish hat, a sliceable 3-tier birthday cake with flame blowout, and an interactive archery bow-and-arrow grand finale.

Designed to be easily customizable for any best friend, sibling, partner, or colleague in less than 2 minutes!

---

## 🎮 Live Preview & Unlock Password

Anyone can instantly test and preview the live website:

| Access Method | Link / Details | Action |
|---|---|---|
| **🚀 Instant Preview Link** | [**Click to Open (Direct Bypass)**](https://bday-template.netlify.app/?preview=1) | Automatically bypasses the countdown lock and opens all pages! |
| **🌐 Standard Live Link** | [https://bday-template.netlify.app/](https://bday-template.netlify.app/) | Shows real-time countdown timer locked until birthday. |
| **🔑 Secret Unlock Password** | `birthday` *(all lowercase)* | Click the lock button on the countdown screen & enter this password to unlock! |

---

## 🌟 Key Interactive Features

1. **⏳ Live IST Countdown & Password Gate**
   - Real-time countdown timer locked until the exact birthday date.
   - Built-in instant preview bypass: append `?preview=1` or enter password `birthday`.
2. **🌌 6 Multiverse Character Universes**
   - **Universe 01 — The Joyful Soul ✨**: Radiant star shower with gold gradients.
   - **Universe 02 — Master Chef 👩‍🍳**: Warm flame glow with culinary spice animations.
   - **Universe 03 — The Foodie 🍔**: Neon diner vibe with floating treats.
   - **Universe 04 — Island Wanderer 🌊**: Tropical ocean beach with rolling wave gradients.
   - **Universe 05 — The Dance Star 💃**: Dance floor with animated audio visualizer bars.
   - **Universe 06 — Birthday Royalty 👑**: Galactic cosmos nebula with royal crown sparkles.
3. **🌳 Blooming Memory Tree & Polaroid Gallery**
   - Click the interactive heart tree to bloom vibrant leaves and reveal 8 tilt-styled Polaroid memory photos with customizable captions.
4. **🎩 The Magic Wish Hat**
   - Interactive pullable ribbon: drag the ribbon upwards to unveil 6 heartfelt birthday wishes one by one with sparkler effects.
5. **🎂 Sliceable 3-Tier Cake with Candle Blowout**
   - Click or tap the birthday cake to slice through layers, extinguish the candle flame, and trigger realistic fireworks + confetti blast.
6. **🏹 Grand Finale: Crossbow Archery & Secret Envelope**
   - Pull back the crossbow arrow and fire at the royal wax heart to unseal the secret letter and royal birthday card!
7. **🎵 Smart Background Audio Engine**
   - Seamless background music with auto-pause when universe video showcases are playing.

---

## 🚀 How to Customize & Deploy (Step-by-Step)

You can personalize this portal with your friend's photos, favorite song, and birthday date in 3 simple steps:

### Step 1: Download or Clone the Code

Click the green **`< > Code`** button above and select **Download ZIP** (or run):
```bash
git clone https://github.com/Stark345/interactive-birthday-webpage.git
cd interactive-birthday-webpage
```

---

### Step 2: Personalize with Your Photos, Music & Text

#### A. Configure Birthday Details (`script.js`)
Open `script.js` in any text editor (VS Code, Notepad, etc.) and edit the `CONFIG` block at the top:

```javascript
const CONFIG = {
  birthdayMonth: 9,           // Birthday month (1 to 12)
  birthdayDay:   19,          // Day of the birthday (e.g., 19)
  timeZone:      "Asia/Kolkata", // Your timezone
  passcode:      "birthday",  // Change or keep your secret unlock password!
  friendName:    "Bestie",    // Friend's name or nickname

  // 8 Polaroid Memories on the Blooming Tree
  gallery: [
    { caption: "Our First Selfie", stamp: "#Memories", tilt: -2.5, img: "assets/images/memory-1.webp", icon: "📸" },
    { caption: "Milestone Moments", stamp: "#Victories", tilt: 3.2, img: "assets/images/memory-2.webp", icon: "⭐" },
    // ... customize captions for all 8 memories
  ],

  // 6 Magic Hat Wishes
  balloons: [
    { msg: "Stay wonderfully authentic and uniquely you, always!", icon: "🌈", cls: "b1" },
    // ... customize your 6 personal wishes
  ]
};
```

#### B. Replace Media Files in `assets/`:
- **Photos (`assets/images/`)**:
  - Replace `birthday-queen.webp` (or `.jpg`/`.png`) with your friend's main portrait.
  - Replace `memory-1.webp` through `memory-8.webp` with your 8 favorite memory photos.
- **Music (`assets/audio/`)**:
  - Replace `song.mp3` with your friend's favorite celebration song.
- **Videos (`assets/videos/`)** *(Optional)*:
  - Add short video clips `universe-1.mp4` through `universe-6.mp4` for the multiverse showcases.

---

### Step 3: Deploy for FREE in 60 Seconds

#### Option 1: Netlify Drag & Drop (Easiest - No Coding Required!)
1. Go to [Netlify Drop](https://app.netlify.com/drop) (sign in or create a free account).
2. Simply **drag and drop** your project folder into the upload box on Netlify.
3. Your site is live instantly! You will get a link like `https://your-name.netlify.app`.
4. *(Optional)* Go to **Site Configuration > Change site name** to give it a custom name (e.g., `happy-bday-bestie.netlify.app`).

#### Option 2: Deploy with GitHub Pages
1. Push your customized project to a new repository on your GitHub account.
2. In your GitHub repo, go to **Settings > Pages**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your site will be published at `https://<your-username>.github.io/<repo-name>/`.

#### Option 3: Deploy with Vercel
1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository and click **Deploy**.

---

## 📂 Project Structure

```
interactive-birthday-webpage/
├── index.html              # Main application page
├── script.js               # Central configuration, physics engine & interactions
├── style.css               # Responsive styling, animations & 3D transforms
├── assets/
│   ├── audio/
│   │   └── song.mp3        # Celebration background track
│   ├── images/
│   │   ├── birthday-queen.webp # Royal crown portrait photo
│   │   ├── memory-[1-8].webp   # 8 Polaroid memory photos
│   │   └── universe-[0-5].webp # Universe fallback posters
│   └── videos/
│       └── README.md       # Drop-in guide for optional universe video clips
├── .gitignore              # Keeps your private media safe
├── LICENSE                 # MIT License
└── README.md               # Documentation & setup guide
```

---

## 🛡️ Privacy & Safety

- Built to ensure sensitive media is kept secure.
- Video and personal photo folders have gitignore protections so private media is never exposed publicly without intent.

---

## 📜 License

Distributed under the [MIT License](LICENSE). Feel free to use, modify, and share this celebration template to bring joy to your friends and loved ones!

Crafted with 💖 and creative coding by [S Jaichandran](https://github.com/Stark345).
