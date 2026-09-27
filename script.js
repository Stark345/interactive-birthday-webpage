/**
 * ============================================================================
 * INTERACTIVE BIRTHDAY CELEBRATION PORTAL — SCRIPT ENGINE v5
 * Features:
 *   - Smooth 3D Zoom-in & Zoom-out page transitions
 *   - Rich animated theme backgrounds (beach/waves/moon, dance lights/equalizer)
 *   - Floating sakura & flower petal canvas system
 *   - Pin-prick balloon animation with confetti per pop
 *   - Interactive 3-tier cake cutting with flame blowout & fireworks
 *   - REALISTIC canvas fireworks (star, willow, ring bursts + glow trails)
 *   - Smart music: Honey Pie on pages 0-1 & 8+, video audio on pages 2-7
 *   - Grand finale interactive archery & secret celebration letter
 * ============================================================================
 */

// ── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
  birthdayMonth: 9,   // 1 to 12 (e.g. 9 for September)
  birthdayDay:   19,  // Day of the month
  timeZone:      "Asia/Kolkata",
  totalPages:    12,  // pages 0 to 11
  passcode:      "birthday", // Secret passcode to unlock during countdown preview
  friendName:    "Bestie",

  // Universe background metadata
  universeThemes: [
    { name: "joy",    emojis: ["⭐","💛","✨","🌟","💫","🎉"] },
    { name: "chef",   emojis: ["🍳","🔥","👩‍🍳","💨","🧂","✨"] },
    { name: "foodie", emojis: ["🍔","🍕","🧋","🍟","🍰","🌮"] },
    { name: "wander", emojis: ["🌊","🌴","🌺","🐚","⛵","🌈"] },
    { name: "dancer", emojis: ["🎵","🎶","💃","✨","🎤","🌟"] },
    { name: "royalty",emojis: ["👑","💙","⚡","🌟","✨","💎"] }
  ],

  gallery: [
    { caption: "Our First Selfie",          stamp: "#Memories",      tilt: -2.5, img: "assets/images/memory-1.webp", icon: "📸" },
    { caption: "Milestone Moments",         stamp: "#Victories",     tilt:  3.2, img: "assets/images/memory-2.webp", icon: "⭐" },
    { caption: "Best Friends Forever",      stamp: "#Besties",       tilt: -1.8, img: "assets/images/memory-3.webp", icon: "✨" },
    { caption: "Late Night Talks & Fun",    stamp: "#GoodTimes",     tilt:  2.8, img: "assets/images/memory-4.webp", icon: "☕" },
    { caption: "All Time Foodie Quests",    stamp: "#FoodCrawl",     tilt: -3.5, img: "assets/images/memory-5.webp", icon: "🍔" },
    { caption: "Spontaneous Adventures",    stamp: "#Wanderlust",    tilt:  1.5, img: "assets/images/memory-6.webp", icon: "🚗" },
    { caption: "Celebration Shenanigans",   stamp: "#PartyVibes",    tilt: -2.2, img: "assets/images/memory-7.webp", icon: "🎉" },
    { caption: "The Inseparable Duo",       stamp: "#Forever",       tilt:  3.0, img: "assets/images/memory-8.webp", icon: "🧿" }
  ],

  balloons: [
    { msg: "Stay wonderfully authentic and uniquely you, always!", icon: "🌈", cls: "b1" },
    { msg: "Keep dancing fearlessly through every single adventure!", icon: "💃", cls: "b2" },
    { msg: "May your plate always be full of your favorite treats!", icon: "🍕", cls: "b3" },
    { msg: "May your spontaneous road trips never come to an end!", icon: "🌊", cls: "b4" },
    { msg: "Never stop shining as our legendary Birthday Star!", icon: "👑", cls: "b5" },
    { msg: "Wishing you a lifetime of joy, laughter and true happiness!", icon: "🎂", cls: "b6" }
  ]
};

// ── STATE ─────────────────────────────────────────────────────────────────────
let currentPage     = 0;
let previewMode     = "auto";
let isPlaying       = false;
let poppedCount     = 0;
let currentBalloon  = 0;
let nextBalloonIdx  = 0;
let galleryIndex    = 0;
let navigating      = false;
let musicHintShown  = true;
let cakeHasBeenCut  = false;
let fireworksActive = false;
let fireworksRAF    = null;
let builtThemes     = new Set();
let wasMusicPlayingBeforeVideo = false;
let isSwitchingVideos          = false;
const videoStates              = [false, false, false, false, false, false];

// ── AUDIO SFX (Web Audio API) ─────────────────────────────────────────────────
const SFX = (() => {
  let ctx = null;
  const init = () => {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  };
  const resume = () => ctx && ctx.state === "suspended" && ctx.resume();

  const playTone = (freq, type, dur, gain = 0.3, delay = 0) => {
    try {
      init(); resume();
      if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      g.gain.setValueAtTime(gain, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + dur + 0.02);
    } catch {}
  };

  return {
    pop: () => {
        try {
          init(); resume();
          if (!ctx) return;
          // Noise burst
          const bufferSize = ctx.sampleRate * 0.05;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.value = 1000;
          const noiseEnv = ctx.createGain();
          noiseEnv.gain.setValueAtTime(1, ctx.currentTime);
          noiseEnv.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          noise.connect(noiseFilter);
          noiseFilter.connect(noiseEnv);
          noiseEnv.connect(ctx.destination);
          noise.start();

          // Low pop synth
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(400, ctx.currentTime);
          o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
          g.gain.setValueAtTime(1, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          o.connect(g); g.connect(ctx.destination);
          o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.1);
        } catch {}
      },
    chime: (step = 0) => {
      const notes = [523, 587, 659, 784, 880, 1047];
      playTone(notes[step % notes.length], "sine", 0.45, 0.28);
    },
    page: () => {
      playTone(480, "sine", 0.08, 0.14);
      playTone(720, "sine", 0.18, 0.11, 0.06);
    },
    cake: () => {
      [523, 659, 784, 1047, 1318].forEach((f, i) => playTone(f, "sine", 0.4, 0.22, i * 0.09));
    },
    firework: () => {
      [220, 440, 660, 880].forEach((f, i) => {
        playTone(f, "triangle", 0.25, 0.14, i * 0.04);
      });
    }
  };
})();

// ── SMART MUSIC & VIDEO AUDIO MANAGEMENT ──────────────────────────────────────
// Background song plays continuously from its initial start until the final page without restarting.
// In Universe 1–6 (pages 2–7), playing a video automatically pauses background music, and
// pausing or ending the video resumes background music from the exact same timestamp
// (only if the song was already playing before the video).

function isVideoPage(page) {
  return page >= 2 && page <= 7;
}

function updateMusicPlayerUI(active) {
  const icon = document.getElementById("music-icon");
  const disc = document.getElementById("music-disc");
  if (icon) icon.textContent = active ? "⏸" : "▶";
  if (disc) {
    if (active) disc.classList.add("spinning");
    else disc.classList.remove("spinning");
  }
}

function updateVidBtn(i, playing) {
  const vid = document.getElementById(`vid-${i}`);
  if (!vid) return;
  const btn = document.getElementById(`vid-btn-${i}`) || 
              (vid.closest(".universe-media-panel") ? vid.closest(".universe-media-panel").querySelector(".vid-play-btn") : null) ||
              (vid.closest(".video-shell") ? vid.closest(".video-shell").querySelector(".vid-play-btn") : null);
  if (btn) {
    btn.textContent = playing ? "⏸" : "▶";
    btn.setAttribute("aria-label", playing ? "Pause" : "Play");
    btn.classList.toggle("is-playing", playing);
  }
}

function pauseAllVideos(exceptIndex = -1) {
  isSwitchingVideos = (exceptIndex >= 0);
  for (let j = 0; j < 6; j++) {
    if (j !== exceptIndex) {
      const v = document.getElementById(`vid-${j}`);
      if (v && !v.paused) {
        v.pause();
      }
      videoStates[j] = false;
      updateVidBtn(j, false);
    }
  }
  isSwitchingVideos = false;
}

function pauseMusicForVideo() {
  const audio = document.getElementById("bg-audio");
  if (audio) {
    if (isPlaying && (!audio.paused || wasMusicPlayingBeforeVideo)) {
      wasMusicPlayingBeforeVideo = true;
    }
    audio.pause();
    updateMusicPlayerUI(false);
  }
}

function resumeMusicAfterVideo() {
  if (isSwitchingVideos) return;

  const anyVidPlaying = [0, 1, 2, 3, 4, 5].some(idx => {
    const v = document.getElementById(`vid-${idx}`);
    return v && !v.paused && !v.ended;
  });

  if (anyVidPlaying) return;

  const audio = document.getElementById("bg-audio");
  if (wasMusicPlayingBeforeVideo && isPlaying && audio) {
    audio.play().catch(() => {});
    updateMusicPlayerUI(true);
  }
  wasMusicPlayingBeforeVideo = false;
}

function handleMusicForPage(page) {
  const audio = document.getElementById("bg-audio");
  const player = document.getElementById("music-player");

  // Pause all videos when entering or switching pages
  pauseAllVideos();

  if (player) player.style.display = "";

  // Resume background music if it was paused for a video on the prior page,
  // or ensure it keeps playing continuously across pages without restarting
  if (wasMusicPlayingBeforeVideo && isPlaying && audio) {
    audio.play().catch(() => {});
    updateMusicPlayerUI(true);
    wasMusicPlayingBeforeVideo = false;
  } else if (isPlaying && audio && audio.paused) {
    audio.play().catch(() => {});
    updateMusicPlayerUI(true);
  }

  // Manage hand pointer visibility
  const hand = document.getElementById("music-hand-pointer");
  if (hand) {
    if (page === 0 && !isPlaying && !isUnlocked()) {
      hand.classList.remove("hidden-hand");
    } else {
      hand.classList.add("hidden-hand");
    }
  }
}

// ── 3D ZOOM-IN & ZOOM-OUT PAGE NAVIGATION ────────────────────────────────────
function isUnlocked() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: CONFIG.timeZone }));
  const isBday = (now.getMonth() === CONFIG.birthdayMonth - 1 && now.getDate() === CONFIG.birthdayDay);
  return previewMode === "bday" || isBday;
}

function goTo(target) {
  if (navigating || target === currentPage) return;
  if (target < 0 || target >= CONFIG.totalPages) return;

  // Prevent bypassing Page 0 when locked
  if (!isUnlocked() && target !== 0) {
    return;
  }

  navigating = true;
  pauseAllVideos();
  resumeMusicAfterVideo();

  const oldEl = document.getElementById(`page-${currentPage}`);
  const newEl = document.getElementById(`page-${target}`);
  if (!oldEl || !newEl) { navigating = false; return; }

  const goingForward = target > currentPage;

  // Set outgoing classes for zoom-out effect
  oldEl.classList.remove("active");
  oldEl.classList.add(goingForward ? "zoom-out-forward" : "zoom-out-backward");

  // Prepare incoming page with starting zoom scale
  newEl.classList.remove("zoom-out-forward", "zoom-out-backward", "zoom-in-forward", "zoom-in-backward");
  newEl.classList.add(goingForward ? "zoom-in-forward" : "zoom-in-backward");
  newEl.style.pointerEvents = "none";

  // Force reflow and transition to active (scale 1.0)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      newEl.classList.remove("zoom-in-forward", "zoom-in-backward");
      newEl.classList.add("active");
      newEl.style.pointerEvents = "all";
    });
  });

  // Cleanup after animation completes
  setTimeout(() => {
    oldEl.classList.remove("zoom-out-forward", "zoom-out-backward");
    currentPage = target;
    updateDots();
    navigating = false;
    newEl.scrollTop = 0;

    // Fireworks management: stop when leaving cake/finale
    if (target !== 10 && target !== 11) {
      stopCustomFireworks();
    }

    // Handle music/audio for new page
    handleMusicForPage(target);

    
    // Trigger page-specific animations
    if (target >= 2 && target <= 7) {
      buildUniverseTheme(target - 2);
      syncUniverseNextBtn(target - 2);
    }
    
    if (target === 10) {
      if (cakeHasBeenCut) {
        document.getElementById("page-10")?.classList.remove("cake-dark-mode");
        restoreCutCakeState();
      } else {
        document.getElementById("page-10")?.classList.add("cake-dark-mode");
      }
      // Fireworks will strictly blast only after the cake is sliced!
    } else if (target !== 11) {
      stopCustomFireworks();
    }

    if (target === 9) onEnterMagicHat();
    if (target === 11) {
      setTimeout(() => {
        fireConfetti();
      }, 300);
    }

  }, 620);
}

// ── PAGE DOTS ─────────────────────────────────────────────────────────────────
function buildDots() {
  const nav = document.getElementById("page-dots");
  if (!nav) return;
  nav.innerHTML = "";
  for (let i = 0; i < CONFIG.totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "page-dot" + (i === 0 ? " active-dot" : "");
    btn.setAttribute("aria-label", `Page ${i + 1}`);
    btn.addEventListener("click", () => goTo(i));
    nav.appendChild(btn);
  }
}

function updateDots() {
  const dotsNav = document.getElementById("page-dots");
  if (dotsNav) {
    if (!isUnlocked() && currentPage === 0) {
      dotsNav.style.display = "none";
    } else {
      dotsNav.style.display = "flex";
    }
  }
  document.querySelectorAll(".page-dot").forEach((d, i) => {
    d.classList.toggle("active-dot", i === currentPage);
  });
}

// ── PASSWORD GATE & SYSTEM UNLOCKING ──────────────────────────────────────────
let isSystemUnlocking = false;

function handlePasswordClick(e) {
  if (e && e.preventDefault) e.preventDefault();
  const pass = prompt("System Locked. Enter password:");
  if (pass === null || pass.trim() === "") {
    // Empty or cancelled: stay locked
    return;
  }
  if (pass === CONFIG.passcode || pass === "birthday" ) {
    startSystemUnlocking();
  } else {
    alert("Incorrect password!");
  }
}

function startSystemUnlocking() {
  if (isSystemUnlocking) return;
  isSystemUnlocking = true;

  const $ = id => document.getElementById(id);
  const clockRow = $("clock-row");
  const bdayBanner = $("bday-banner");
  const landingHeading = $("landing-heading");
  const enterBtn = $("enter-btn");
  const pillTag = document.querySelector("#page-0 .pill-tag");
  const pullContainer = document.getElementById("heart-pull-container");

  if (clockRow) clockRow.classList.add("hidden");
  if (bdayBanner) bdayBanner.classList.add("hidden");
  if (pillTag) pillTag.style.display = "none";
  if (enterBtn) enterBtn.style.display = "none";
  if (pullContainer) {
    pullContainer.classList.add("hidden");
    pullContainer.style.display = "none";
  }

  let count = 5;
  if (landingHeading) {
    landingHeading.classList.remove("hidden");
    landingHeading.innerHTML = `System Unlocking...<br><span id="unlock-num" style="font-size: 5rem; font-family: var(--font-h); color: var(--pink-hot); display: block; margin-top: 14px; text-shadow: 0 0 25px rgba(240, 37, 154, 0.85);">${count}</span>`;
  }
  SFX.chime(0);

  const timer = setInterval(() => {
    count--;
    if (count > 0) {
      const numEl = document.getElementById("unlock-num");
      if (numEl) numEl.textContent = count;
      SFX.chime(5 - count);
    } else {
      clearInterval(timer);
      isSystemUnlocking = false;
      previewMode = "bday";
      fireConfetti();
      SFX.chime(5);

      const dotsNav = document.getElementById("page-dots");
      if (dotsNav) dotsNav.style.display = "flex";

      if (landingHeading) landingHeading.classList.add("hidden");
      if (bdayBanner) bdayBanner.classList.remove("hidden");
      if (pullContainer) {
        pullContainer.classList.remove("hidden");
        pullContainer.style.display = "flex";
        initHeartPull();
      }
    }
  }, 1000);
}

// ── COUNTDOWN (IST) ───────────────────────────────────────────────────────────
function initCountdown() {
  const $ = id => document.getElementById(id);

  function tick() {
    if (isSystemUnlocking) return;

    const now = new Date(new Date().toLocaleString("en-US", { timeZone: CONFIG.timeZone }));
    const isBday = previewMode === "bday" || window.location.search.includes("preview") || window.location.search.includes("demo") ||
      (now.getMonth() === CONFIG.birthdayMonth - 1 && now.getDate() === CONFIG.birthdayDay);

    const enterBtn = $("enter-btn");
    const pillTag = document.querySelector("#page-0 .pill-tag");
    const pullContainer = document.getElementById("heart-pull-container");
    const handPointer = document.getElementById("music-hand-pointer");
    const dotsNav = document.getElementById("page-dots");

    if (isBday) {
      // 🎂 HAPPY BIRTHDAY DUCKY STATE (Unlocked Page 0)
      if (dotsNav) dotsNav.style.display = "flex";
      if (pillTag) pillTag.style.display = "none";
      $("clock-row")?.classList.add("hidden");
      $("landing-heading")?.classList.add("hidden");
      $("bday-banner")?.classList.remove("hidden");
      
      if (handPointer) handPointer.classList.add("hidden-hand");
      if (enterBtn) enterBtn.style.display = "none";

      // Display ONLY the interactive draggable heart with downward space
      if (pullContainer) {
        pullContainer.classList.remove("hidden");
        pullContainer.style.display = "flex";
        initHeartPull();
      }
      return;
    }

    // ⏳ COUNTDOWN STATE (Locked until September 19th)
    if (dotsNav && !isUnlocked()) dotsNav.style.display = "none";
    if (pillTag) pillTag.style.display = "inline-flex";

    $("clock-row")?.classList.remove("hidden");
    $("bday-banner")?.classList.add("hidden");
    $("landing-heading")?.classList.remove("hidden");
    if ($("landing-heading")) $("landing-heading").innerHTML = 'Advance Happy Birthday to our <span class="landing-highlight">Birthday Star! 🌟</span>';

    // Strictly remove/hide pull-heart during countdown
    if (pullContainer) {
      pullContainer.classList.add("hidden");
      pullContainer.style.display = "none";
    }

    // Show "Unlocks on September 19th" ONLY after music plays
    if (isPlaying) {
      if (handPointer) handPointer.classList.add("hidden-hand");
      if (enterBtn) {
        enterBtn.style.display = "inline-flex";
        enterBtn.classList.add("locked-btn");
        enterBtn.disabled = false;
        enterBtn.innerHTML = `🔒 Unlocks on September 19th`;
        enterBtn.style.cursor = "pointer";
        enterBtn.style.pointerEvents = "auto";
        enterBtn.style.opacity = "0.9";
        enterBtn.onclick = handlePasswordClick;
      }
    } else {
      if (handPointer && currentPage === 0) {
        handPointer.classList.remove("hidden-hand");
      }
      if (enterBtn) {
        enterBtn.style.display = "none";
      }
    }

    let bday = new Date(now.getFullYear(), CONFIG.birthdayMonth - 1, CONFIG.birthdayDay);
    if (now > bday) bday = new Date(now.getFullYear() + 1, CONFIG.birthdayMonth - 1, CONFIG.birthdayDay);

    const diff = bday - now;
    if (diff > 0) {
      $("days").textContent    = String(Math.floor(diff / 86400000)).padStart(2, "0");
      $("hours").textContent   = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
      $("minutes").textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      $("seconds").textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    }
  }

  tick();
  setInterval(tick, 1000);
}

function setMode(mode) {
  previewMode = mode;
  document.getElementById("btn-auto")?.classList.toggle("active-chip", mode === "auto");
  document.getElementById("btn-bday")?.classList.toggle("active-chip", mode === "bday");
  initCountdown();
  if (mode === "bday") fireConfetti();
}

// ── AUDIO PLAYER ("Honey Pie") ────────────────────────────────────────────────
function initAudio() {
  const btn   = document.getElementById("music-play-btn");
  const disc  = document.getElementById("music-disc");
  const icon  = document.getElementById("music-icon");
  const hint  = document.getElementById("music-arrow-hint");
  const audio = document.getElementById("bg-audio");
  if (!btn) return;

  const toggle = () => {
    if (hint && musicHintShown) {
      hint.style.display = "none";
      musicHintShown = false;
    }

    // Stop blinking once music starts / button is clicked
    btn.classList.remove("blinking-play-btn");

    // Remove the hand after play is clicked
    const hand = document.getElementById("music-hand-pointer");
    if (hand) {
      hand.classList.add("hidden-hand");
    }

    if (!isPlaying) {
      pauseAllVideos();
      wasMusicPlayingBeforeVideo = false;
      audio?.play().catch(() => {});
      isPlaying = true;
      updateMusicPlayerUI(true);

      // Reveal "Unlocks on September 19th" button if on countdown
      const enterBtn = document.getElementById("enter-btn");
      if (enterBtn && !isUnlocked()) {
        enterBtn.style.display = "inline-flex";
        enterBtn.classList.add("locked-btn");
        enterBtn.disabled = false;
        enterBtn.innerHTML = `🔒 Unlocks on September 19th`;
        enterBtn.style.cursor = "pointer";
        enterBtn.style.pointerEvents = "auto";
        enterBtn.style.opacity = "0.9";
        enterBtn.onclick = handlePasswordClick;
      }
    } else {
      audio?.pause();
      isPlaying = false;
      wasMusicPlayingBeforeVideo = false;
      updateMusicPlayerUI(false);
    }
  };

  btn.addEventListener("click", toggle);
  disc?.addEventListener("click", toggle);

  // Auto-dismiss music hint
  setTimeout(() => {
    if (hint && musicHintShown) {
      hint.style.transition = "opacity 0.8s";
      hint.style.opacity = "0";
      setTimeout(() => hint && (hint.style.display = "none"), 800);
      musicHintShown = false;
    }
  }, 7000);
}

// ── RICH THEMED BACKGROUND BUILDER ───────────────────────────────────────────
function buildUniverseTheme(idx) {
  if (builtThemes.has(idx)) return;
  builtThemes.add(idx);

  const cfg  = CONFIG.universeThemes[idx];
  const bgEl = document.getElementById(`theme-bg-${idx}`);
  if (!bgEl) return;

  bgEl.innerHTML = "";

  // 1. MOANA THEME: Moon, Animated Ocean Waves, Palm Sway
  if (cfg.name === "moana") {
    const moon = document.createElement("div");
    moon.className = "moana-moon";
    bgEl.appendChild(moon);

    const waveWrap = document.createElement("div");
    waveWrap.className = "moana-waves";
    waveWrap.innerHTML = `
      <div class="ocean-wave"></div>
      <div class="ocean-wave"></div>
      <div class="ocean-wave"></div>
    `;
    bgEl.appendChild(waveWrap);

    const palm = document.createElement("div");
    palm.className = "palm-decor";
    palm.textContent = "🌴";
    bgEl.appendChild(palm);
  }

  // 2. DANCER THEME: Sweeping Spotlights & Pulsing Equalizer
  if (cfg.name === "dancer") {
    const spot1 = document.createElement("div");
    spot1.className = "disco-spotlight";
    bgEl.appendChild(spot1);

    const spot2 = document.createElement("div");
    spot2.className = "disco-spotlight disco-spotlight-2";
    bgEl.appendChild(spot2);

    const eqWrap = document.createElement("div");
    eqWrap.className = "equalizer-wrap";
    for (let i = 0; i < 24; i++) {
      const bar = document.createElement("div");
      bar.className = "eq-bar";
      bar.style.setProperty("--dur", `${0.4 + Math.random() * 0.7}s`);
      bar.style.setProperty("--h", `${25 + Math.random() * 65}px`);
      eqWrap.appendChild(bar);
    }
    bgEl.appendChild(eqWrap);
  }

}

// ── UNIVERSE NEXT BUTTON UNLOCK ENGINE ───────────────────────────────────────
const universeNextUnlocked = [false, false, false, false, false, false];

function unlockUniverseNextBtn(i) {
  if (i < 0 || i >= 6) return;
  universeNextUnlocked[i] = true;
  const btn = document.getElementById(`next-universe-btn-${i}`);
  if (btn) {
    btn.classList.remove("hidden");
    btn.classList.add("revealed-next-btn");
  }
  const hint = document.getElementById(`next-universe-hint-${i}`);
  if (hint) {
    hint.classList.remove("hidden");
  }
}

function syncUniverseNextBtn(i) {
  if (i < 0 || i >= 6) return;
  const btn = document.getElementById(`next-universe-btn-${i}`);
  const hint = document.getElementById(`next-universe-hint-${i}`);
  if (universeNextUnlocked[i]) {
    if (btn) btn.classList.remove("hidden");
    if (hint) hint.classList.remove("hidden");
  } else {
    if (btn) btn.classList.add("hidden");
    if (hint) hint.classList.add("hidden");
  }
}

function resetUniverseNextBtns() {
  universeNextUnlocked.fill(false);
  for (let i = 0; i < 6; i++) {
    syncUniverseNextBtn(i);
  }
}

// ── VIDEO HELPERS (Pages 2-7: video audio, no overlap) ─────────────────────────
function toggleVid(i) {
  const v = document.getElementById(`vid-${i}`);
  if (!v) return;

  // Reveal Next Universe button only after clicking this page's Play button
  unlockUniverseNextBtn(i);

  if (!v.paused) {
    v.pause();
    videoStates[i] = false;
    updateVidBtn(i, false);
    resumeMusicAfterVideo();
  } else {
    pauseAllVideos(i);
    pauseMusicForVideo();
    v.muted = false;
    videoStates[i] = true;
    updateVidBtn(i, true);
    v.play().catch(() => {
      videoStates[i] = false;
      updateVidBtn(i, false);
      // Ensure Next Universe button is clearly visible so user can proceed smoothly
      unlockUniverseNextBtn(i);
    });
  }
}

function initVideoListeners() {
  for (let i = 0; i < 6; i++) {
    const v = document.getElementById(`vid-${i}`);
    if (!v) continue;

    v.addEventListener("ended", () => {
      videoStates[i] = false;
      updateVidBtn(i, false);
      resumeMusicAfterVideo();
    });

    v.addEventListener("pause", () => {
      videoStates[i] = false;
      updateVidBtn(i, false);
      resumeMusicAfterVideo();
    });

    v.addEventListener("play", () => {
      videoStates[i] = true;
      updateVidBtn(i, true);
      pauseAllVideos(i);
      pauseMusicForVideo();
      unlockUniverseNextBtn(i);
    });

    v.addEventListener("click", () => {
      toggleVid(i);
    });
  }
}

// ── GALLERY & LIGHTBOX ────────────────────────────────────────────────────────
function buildGallery() {
  const grid = document.getElementById("polaroid-grid");
  if (!grid) return;
  grid.innerHTML = CONFIG.gallery.map((it, i) => `
    <article class="polaroid-card" style="--tilt:${it.tilt}deg;" data-idx="${i}" tabindex="0" role="button" aria-label="${it.caption}">
      <img src="${it.img}" alt="${it.caption}" class="polaroid-photo" loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div class="polaroid-mock" style="display:none;">
        <span class="pm-icon">${it.icon}</span>
        <span class="pm-label">${it.caption}</span>
        <span class="pm-file">${it.img}</span>
      </div>
      <div class="polaroid-footer">
        <p class="polaroid-caption">${it.caption}</p>
        <span class="polaroid-stamp">${it.stamp}</span>
      </div>
    </article>`).join("");

  grid.querySelectorAll(".polaroid-card").forEach(c => {
    c.addEventListener("click", () => openLightbox(+c.dataset.idx));
    c.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(+c.dataset.idx); }
    });
  });
}

function openLightbox(idx) {
  galleryIndex = idx;
  const it = CONFIG.gallery[idx];
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  document.getElementById("lb-media").innerHTML = `
    <img src="${it.img}" alt="${it.caption}"
      onerror="this.outerHTML='<div class=\\'polaroid-mock\\'><span class=\\'pm-icon\\'>${it.icon}</span><span class=\\'pm-label\\'>${it.caption}</span></div>';">
  `;
  document.getElementById("lb-caption").textContent = it.caption;
  document.getElementById("lb-counter").textContent = `${idx + 1} / ${CONFIG.gallery.length}`;
  lb.showModal();
}

function initLightbox() {
  const lb   = document.getElementById("lightbox");
  const prev = document.getElementById("lb-prev");
  const next = document.getElementById("lb-next");
  if (!lb) return;
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
  prev?.addEventListener("click", () => openLightbox((galleryIndex - 1 + CONFIG.gallery.length) % CONFIG.gallery.length));
  next?.addEventListener("click", () => openLightbox((galleryIndex + 1) % CONFIG.gallery.length));
}

// ── MAGIC WISH HAT 🎩✨ ───────────────────────────────────────────────────
let magicProgress          = 0;
let magicPersistedProgress = 0;
let magicIsDragging        = false;
let magicDragStartY        = 0;
let magicWishesUnlocked    = 0;
let currentDisplayedWish   = 0;
let magicPullCompleted     = false;
let magicCakeRevealed      = false;
let magicHatInitialized    = false;

function initMagicHat() {
  if (magicHatInitialized) return;
  const stage = document.getElementById("magic-hat-interactive-zone") || document.getElementById("compact-magic-layout");
  const handle = document.getElementById("ribbon-tip-handle");
  const track = document.getElementById("ribbon-pull-track");
  if (!stage || !handle || !track) return;
  magicHatInitialized = true;

  // Set initial ribbon height
  setRibbonVisuals(0);

  // Pointer drag events on ribbon handle
  handle.addEventListener("pointerdown", onRibbonPointerDown);
  window.addEventListener("pointermove", onRibbonPointerMove);
  window.addEventListener("pointerup", onRibbonPointerUp);
  window.addEventListener("pointercancel", onRibbonPointerUp);

  // Keyboard accessibility & click tap
  handle.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" || e.key === " " || e.key === "Enter") {
      e.preventDefault();
      triggerClickRibbonPull();
    }
  });

  handle.addEventListener("click", () => {
    if (!magicIsDragging && !magicPullCompleted && magicWishesUnlocked < 6) {
      triggerClickRibbonPull();
    }
  });

  // Tapping already revealed mini dots lets user re-read that wish popup
  document.querySelectorAll(".wish-mini-dot").forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      if (idx < magicWishesUnlocked) {
        renderWishPopup(idx);
      }
    });
  });
}

function hideMagicHatTutorial() {
  const tut = document.getElementById("magic-hat-tutorial");
  if (tut && !tut.classList.contains("hidden")) {
    tut.classList.add("hidden");
  }
}

function showMagicHatTutorial(text = null) {
  const tut = document.getElementById("magic-hat-tutorial");
  if (!tut) return;
  if (text) {
    const badge = tut.querySelector(".tutorial-text-badge");
    if (badge) badge.textContent = text;
  }
  tut.classList.remove("hidden");
}

function onRibbonPointerDown(e) {
  if (magicPullCompleted || magicWishesUnlocked >= 6) return;
  e.preventDefault();
  magicIsDragging = true;
  magicDragStartY = e.clientY;
  
  const handle = document.getElementById("ribbon-tip-handle");
  const track = document.getElementById("ribbon-pull-track");
  if (track) track.classList.remove("smooth-reset");
  if (handle) {
    handle.classList.add("is-dragging");
    try { handle.setPointerCapture(e.pointerId); } catch (_) {}
  }

  hideMagicHatTutorial();
}

function onRibbonPointerMove(e) {
  if (!magicIsDragging || magicPullCompleted) return;
  const track = document.getElementById("ribbon-pull-track");
  const trackRect = track ? track.getBoundingClientRect() : { height: 160 };
  const maxPullPx = Math.max(70, trackRect.height - 24);
  
  // Upward drag is positive delta
  const deltaY = magicDragStartY - e.clientY;
  const progressAdded = deltaY / maxPullPx;
  
  const currentP = Math.min(1, Math.max(0, progressAdded));
  magicProgress = currentP;
  setRibbonVisuals(magicProgress);

  // Complete ribbon pull if dragged past threshold (>= 72%)
  if (magicProgress >= 0.72 && !magicPullCompleted && magicWishesUnlocked < 6) {
    completeRibbonPull();
  }
}

function onRibbonPointerUp(e) {
  if (!magicIsDragging) return;
  magicIsDragging = false;
  
  const handle = document.getElementById("ribbon-tip-handle");
  if (handle) {
    handle.classList.remove("is-dragging");
    try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
  }

  // If user pulled past 0.45 before releasing and pull wasn't completed yet
  if (!magicPullCompleted && magicWishesUnlocked < 6) {
    if (magicProgress >= 0.45) {
      completeRibbonPull();
    } else {
      // Released too low: spring ribbon back down smoothly
      resetRibbonToBottom();
    }
  }
}

function triggerClickRibbonPull() {
  if (magicIsDragging || magicWishesUnlocked >= 6) return;
  hideMagicHatTutorial();
  const track = document.getElementById("ribbon-pull-track");
  if (track) track.classList.add("smooth-reset");
  setRibbonVisuals(1);
  setTimeout(() => {
    if (track) track.classList.remove("smooth-reset");
    completeRibbonPull();
  }, 260);
}

function resetRibbonToBottom() {
  const track = document.getElementById("ribbon-pull-track");
  if (track) track.classList.add("smooth-reset");
  setRibbonVisuals(0);
  magicProgress = 0;
  magicPersistedProgress = 0;
  setTimeout(() => {
    if (track) track.classList.remove("smooth-reset");
    magicPullCompleted = false;
  }, 350);
}

function completeRibbonPull() {
  if (magicWishesUnlocked >= 6) return;
  magicPullCompleted = true;
  setRibbonVisuals(1);

  const nextIdx = magicWishesUnlocked;
  unlockWish(nextIdx);

  // If more wishes remain, smoothly reset the ribbon into the hat for the next pull!
  if (magicWishesUnlocked < 6) {
    setTimeout(() => {
      resetRibbonToBottom();
      showMagicHatTutorial(`Pull again for Wish ${magicWishesUnlocked + 1}! 🎀⬆️`);
    }, 450);
  }
}

function setRibbonVisuals(progress) {
  const track = document.getElementById("ribbon-pull-track");
  const handle = document.getElementById("ribbon-tip-handle");
  const zone = document.getElementById("magic-hat-interactive-zone");
  const layout = document.getElementById("compact-magic-layout");
  const trackRect = track ? track.getBoundingClientRect() : { height: 160 };
  const minH = 24;
  const maxH = Math.max(minH + 60, trackRect.height);
  const currentH = minH + progress * (maxH - minH);

  if (zone) zone.style.setProperty("--ribbon-h", `${currentH.toFixed(1)}px`);
  if (layout) layout.style.setProperty("--ribbon-h", `${currentH.toFixed(1)}px`);
  if (track) track.style.setProperty("--ribbon-h", `${currentH.toFixed(1)}px`);
  if (handle) {
    handle.setAttribute("aria-valuenow", Math.round(progress * 100));
    const arrow = handle.querySelector(".ribbon-pull-arrow");
    if (arrow) arrow.style.display = progress >= 0.95 ? "none" : "";
  }
}

function unlockWish(idx) {
  magicWishesUnlocked = idx + 1;
  poppedCount = magicWishesUnlocked; // Keep synced
  
  // Update scores
  const scoreEl = document.getElementById("magic-score");
  if (scoreEl) scoreEl.textContent = magicWishesUnlocked;
  const legacyScore = document.getElementById("pop-score");
  if (legacyScore) legacyScore.textContent = magicWishesUnlocked;

  // Reveal only this wish in the single playful popup card in the right panel
  renderWishPopup(idx);

  // Play audio chime
  SFX.chime(idx);

  // Spawn celebratory flying particles (hearts, duck, crown, gift, sparkles)
  spawnMagicWishParticles(16);

  // Localized confetti
  if (typeof confetti === "function") {
    const hat = document.getElementById("magician-hat-wrap");
    const rect = hat ? hat.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    const cx = (rect.left + rect.width / 2) / window.innerWidth;
    const cy = (rect.top + 10) / window.innerHeight;
    confetti({
      particleCount: 36,
      spread: 60,
      startVelocity: 28,
      origin: { x: cx, y: cy },
      colors: ["#ff2a85", "#ffd700", "#c084fc", "#38bdf8", "#ff006e", "#34d399"]
    });
  }

  // After final wish (Wish 6 / 6)
  if (magicWishesUnlocked === 6 && !magicCakeRevealed) {
    triggerMagicHatFinale();
  }
}

function renderWishPopup(idx) {
  const wish = CONFIG.balloons[idx];
  if (!wish) return;
  currentDisplayedWish = idx;

  // Hide placeholder, show popup card
  const placeholder = document.getElementById("wish-placeholder-card");
  const popupCard = document.getElementById("wish-popup-card");
  const badge = document.getElementById("wish-popup-badge");
  const icon = document.getElementById("wish-popup-icon");
  const text = document.getElementById("wish-popup-text");

  if (placeholder) placeholder.classList.add("hidden");
  if (popupCard) {
    popupCard.classList.remove("hidden");
    popupCard.classList.remove("popup-bounce");
    void popupCard.offsetWidth; // force reflow for playful bounce
    popupCard.classList.add("popup-bounce");
  }

  if (badge) badge.textContent = `Wish ${idx + 1} of 6 ✨`;
  if (icon)  icon.textContent  = wish.icon;
  if (text)  text.textContent  = wish.msg;

  // Update mini dots in popup card
  document.querySelectorAll(".wish-mini-dot").forEach((dot, dIdx) => {
    dot.classList.toggle("revealed", dIdx < magicWishesUnlocked);
    dot.classList.toggle("active", dIdx === idx);
  });
}

function spawnMagicWishParticles(count = 14) {
  const layer = document.getElementById("hat-particles-layer");
  if (!layer) return;

  // Icons: hearts, duck, crown, gift, sparkles
  const ICONS = ["💖", "💕", "❤️", "🦆", "👑", "🎁", "✨", "🌟", "✦"];
  
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "magic-particle";
    p.textContent = ICONS[Math.floor(Math.random() * ICONS.length)];

    // Center above hat opening
    p.style.left = "50%";
    p.style.top = "30px";

    const tx = (Math.random() * 220 - 110).toFixed(0);
    const ty = (-60 - Math.random() * 110).toFixed(0);
    const rot = (Math.random() * 80 - 40).toFixed(0);
    const dur = (0.9 + Math.random() * 0.6).toFixed(2);

    p.style.setProperty("--tx", `${tx}px`);
    p.style.setProperty("--ty", `${ty}px`);
    p.style.setProperty("--rot", `${rot}deg`);
    p.style.setProperty("--dur", `${dur}s`);

    layer.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000 + 100);
  }
}

function spawnMagicSmoke(count = 8) {
  const layer = document.getElementById("hat-particles-layer");
  if (!layer) return;

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "magic-smoke";
    s.style.left = `${45 + (Math.random() * 20 - 10)}%`;
    s.style.top = "20px";

    const tx = (Math.random() * 120 - 60).toFixed(0);
    const ty = (-70 - Math.random() * 90).toFixed(0);
    const dur = (1.4 + Math.random() * 0.6).toFixed(2);

    s.style.setProperty("--tx", `${tx}px`);
    s.style.setProperty("--ty", `${ty}px`);
    s.style.setProperty("--dur", `${dur}s`);

    layer.appendChild(s);
    setTimeout(() => s.remove(), dur * 1000 + 100);
  }
}

function spawnMagicSparkles(count = 16) {
  const layer = document.getElementById("hat-particles-layer");
  if (!layer) return;

  const SPARKLE_ICONS = ["✨", "🌟", "✦", "💫", "⭐"];
  for (let i = 0; i < count; i++) {
    const sp = document.createElement("span");
    sp.className = "magic-particle";
    sp.textContent = SPARKLE_ICONS[Math.floor(Math.random() * SPARKLE_ICONS.length)];
    sp.style.left = `${48 + (Math.random() * 14 - 7)}%`;
    sp.style.top = "25px";

    const tx = (Math.random() * 180 - 90).toFixed(0);
    const ty = (-80 - Math.random() * 100).toFixed(0);
    const rot = (Math.random() * 120 - 60).toFixed(0);
    const dur = (1.0 + Math.random() * 0.5).toFixed(2);

    sp.style.setProperty("--tx", `${tx}px`);
    sp.style.setProperty("--ty", `${ty}px`);
    sp.style.setProperty("--rot", `${rot}deg`);
    sp.style.setProperty("--dur", `${dur}s`);

    layer.appendChild(sp);
    setTimeout(() => sp.remove(), dur * 1000 + 100);
  }
}

function triggerMagicHatFinale() {
  magicCakeRevealed = true;

  // 1. Shake the hat
  const hatWrap = document.getElementById("magician-hat-wrap");
  if (hatWrap) {
    hatWrap.classList.remove("hat-magic-shake");
    void hatWrap.offsetWidth;
    hatWrap.classList.add("hat-magic-shake");
  }

  // 2. Release magical smoke, sparkles and confetti
  spawnMagicSmoke(10);
  spawnMagicSparkles(20);
  spawnMagicWishParticles(16);
  fireConfetti();
  SFX.cake();

  setTimeout(() => {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 65,
        spread: 90,
        startVelocity: 35,
        origin: { y: 0.62 },
        colors: ["#ffd700", "#f0259a", "#38bdf8", "#c084fc", "#ffffff"]
      });
    }
  }, 350);

  // 3. Raise mini cake from the hat
  setTimeout(() => {
    const cakeWrap = document.getElementById("mini-magic-cake-wrap");
    if (cakeWrap) {
      cakeWrap.classList.remove("hidden");
      void cakeWrap.offsetWidth;
      cakeWrap.classList.add("cake-rising");
    }

    // 4. Show "Make a Wish 🎂" button
    const cakeBtn = document.getElementById("cake-unlock-btn");
    if (cakeBtn) {
      cakeBtn.textContent = "Make a Wish 🎂";
      cakeBtn.classList.remove("hidden");
      cakeBtn.classList.add("magic-pulse-btn");
    }
  }, 550);
}

function resetMagicHat() {
  magicProgress          = 0;
  magicPersistedProgress = 0;
  magicIsDragging        = false;
  magicPullCompleted     = false;
  magicWishesUnlocked    = 0;
  currentDisplayedWish   = 0;
  magicCakeRevealed      = false;
  poppedCount            = 0;

  const scoreEl = document.getElementById("magic-score");
  if (scoreEl) scoreEl.textContent = "0";
  const legacyScore = document.getElementById("pop-score");
  if (legacyScore) legacyScore.textContent = "0";

  // Reset ribbon
  setRibbonVisuals(0);

  // Show tutorial again
  showMagicHatTutorial("Grab the ribbon and pull it up! 🎀⬆️");

  // Show placeholder card, hide popup card
  const placeholder = document.getElementById("wish-placeholder-card");
  const popupCard = document.getElementById("wish-popup-card");
  if (placeholder) placeholder.classList.remove("hidden");
  if (popupCard) {
    popupCard.classList.remove("popup-bounce");
    popupCard.classList.add("hidden");
  }

  // Reset mini dots in popup card
  document.querySelectorAll(".wish-mini-dot").forEach((dot, dIdx) => {
    dot.classList.remove("revealed");
    dot.classList.toggle("active", dIdx === 0);
  });

  // Reset hat & mini cake
  const hatWrap = document.getElementById("magician-hat-wrap");
  if (hatWrap) hatWrap.classList.remove("hat-magic-shake");

  const cakeWrap = document.getElementById("mini-magic-cake-wrap");
  if (cakeWrap) {
    cakeWrap.classList.remove("cake-rising");
    cakeWrap.classList.add("hidden");
  }

  // Reset button
  const cakeBtn = document.getElementById("cake-unlock-btn");
  if (cakeBtn) {
    cakeBtn.classList.remove("magic-pulse-btn");
    cakeBtn.classList.add("hidden");
  }

  // Clear particles
  const layer = document.getElementById("hat-particles-layer");
  if (layer) layer.innerHTML = "";
}

function onEnterMagicHat() {
  initMagicHat();
  // Ensure visual state is accurate upon entering Page 9
  setRibbonVisuals(magicPersistedProgress);
  if (cakeHasBeenCut || magicCakeRevealed || magicWishesUnlocked >= 6) {
    const cakeBtn = document.getElementById("cake-unlock-btn");
    if (cakeBtn) {
      cakeBtn.classList.remove("hidden");
    }
  }
}

// ── CAKE CUTTING 🎂 ───────────────────────────────────────────────────────────
function cutCake() {
  if (cakeHasBeenCut) return;
  cakeHasBeenCut = true;
  SFX.cake();

  const scene   = document.getElementById("cake-scene");
  const knife   = document.getElementById("knife-anim");
  const cutLine = document.getElementById("cut-line");
  const flame   = document.getElementById("flame-wrap");
  const reveal  = document.getElementById("cake-reveal");
  const title   = document.getElementById("cake-title");
  const sub     = document.getElementById("cake-subtitle");

  knife?.classList.remove("hidden");

  setTimeout(() => {
    cutLine?.classList.remove("hidden");
    scene?.classList.add("cut");
  }, 320);

  setTimeout(() => {
    flame?.classList.add("blown-out");
    document.getElementById("page-10").classList.remove("cake-dark-mode");
    
    // 🎆 BLAST REALISTIC CANVAS FIREWORKS!
    startCustomFireworks();
    for (let k = 0; k < 6; k++) {
      setTimeout(() => {
        launchCustomRocket(
          window.innerWidth * (0.15 + Math.random() * 0.7),
          window.innerHeight * (0.15 + Math.random() * 0.35)
        );
      }, k * 200);
    }
    fireConfetti();
    setTimeout(fireConfetti, 500);
  }, 550);

  setTimeout(() => {
    reveal?.classList.remove("hidden");
    knife?.classList.add("hidden");
  }, 950);
}

// ── 🎆 REALISTIC CANVAS FIREWORKS ENGINE ──────────────────────────────────────
// === REALISTIC FIREWORKS ENGINE ===
let customFwRAF = null;
let customFwActive = false;
let customFwCtx = null;
let customFwW = 0, customFwH = 0;
let customFwLast = 0;
let customFwAutoTimer = 0;
let customFwNextAuto = 600;
let customFwQuality = 1;
let customFwFrameTimes = [];
let customFwSprites = [];
let customFwWhiteSprite = null;
let customFwParticles = [];
let customFwRockets = [];
let customFwCursor = 0;

function resizeCustomFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  customFwW = window.innerWidth;
  customFwH = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(customFwW * dpr);
  canvas.height = Math.round(customFwH * dpr);
  if (customFwCtx) customFwCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', () => {
  if (customFwActive) resizeCustomFireworks();
});

function initCustomFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  customFwCtx = canvas.getContext('2d', { alpha: true });
  resizeCustomFireworks();
  if (customFwSprites.length > 0) return;
  const SPRITE_SIZE = 32;
  const buildSprite = (hue) => {
    const c = document.createElement('canvas');
    c.width = c.height = SPRITE_SIZE;
    const sctx = c.getContext('2d');
    const r = SPRITE_SIZE / 2;
    const g = sctx.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0.00, `hsla(${hue}, 100%, 95%, 1)`);
    g.addColorStop(0.25, `hsla(${hue}, 100%, 70%, 0.95)`);
    g.addColorStop(0.55, `hsla(${hue}, 100%, 55%, 0.45)`);
    g.addColorStop(1.00, `hsla(${hue}, 100%, 50%, 0)`);
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    return c;
  };
  for (let i = 0; i < 36; i++) customFwSprites[i] = buildSprite((i / 36) * 360);
  const wc = document.createElement('canvas');
  wc.width = wc.height = SPRITE_SIZE;
  const wsctx = wc.getContext('2d');
  const wr = SPRITE_SIZE / 2;
  const wg = wsctx.createRadialGradient(wr, wr, 0, wr, wr, wr);
  wg.addColorStop(0, 'rgba(255,255,255,1)');
  wg.addColorStop(0.4, 'rgba(255,255,255,0.9)');
  wg.addColorStop(1, 'rgba(255,255,255,0)');
  wsctx.fillStyle = wg;
  wsctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  customFwWhiteSprite = wc;
  for (let i = 0; i < 900; i++) {
    customFwParticles[i] = { active: false, x: 0, y: 0, vx: 0, vy: 0, hue: 0, size: 1, life: 0, maxLife: 1, drag: 0.985, gravity: 0.0018, flicker: false, crackle: false, crackled: false, crackleAt: 0, trailX: 0, trailY: 0 };
  }
}

function _fwSpriteFor(hue) {
  let h = ((hue % 360) + 360) % 360;
  return customFwSprites[Math.round(h / 10) % 36];
}

function _fwSpawnParticle(x, y, vx, vy, hue, size, maxLife, opts) {
  const p = customFwParticles[customFwCursor];
  customFwCursor = (customFwCursor + 1) % 900;
  p.active = true;
  p.x = p.trailX = x; p.y = p.trailY = y;
  p.vx = vx; p.vy = vy;
  p.hue = hue; p.size = size;
  p.life = 0; p.maxLife = maxLife;
  p.drag = (opts && opts.drag) || 0.985;
  p.gravity = (opts && opts.gravity) || 0.0018;
  p.flicker = !!(opts && opts.flicker);
  p.crackle = !!(opts && opts.crackle);
  p.crackled = false;
  p.crackleAt = maxLife * (0.45 + Math.random() * 0.3);
  return p;
}

const _FW_PALETTES = [[340,355,10],[45,38,50],[190,200,210],[270,285,300],[120,140,90],[0,0,0]];
function _fwRandomHue() {
  const set = _FW_PALETTES[(Math.random() * (_FW_PALETTES.length - 1)) | 0];
  return set[(Math.random() * set.length) | 0];
}

function launchCustomRocket(tx, ty) {
  if (customFwRockets.length >= 24) return;
  const startX = tx != null ? tx + (Math.random() - 0.5) * 40 : customFwW * (0.15 + Math.random() * 0.7);
  const startY = customFwH + 10;
  const apexY = ty != null ? ty : customFwH * (0.14 + Math.random() * 0.32);
  const travel = startY - apexY;
  const gravity = 0.00072;
  const vy = -Math.sqrt(2 * gravity * travel) * (0.98 + Math.random() * 0.04);
  customFwRockets.push({ x: startX, y: startY, vx: (Math.random() - 0.5) * 0.03, vy: vy, gravity: gravity, hue: _fwRandomHue(), trail: [], exploded: false });
}

function _fwExplode(rocket) {
  const hue = rocket.hue;
  const baseCount = 90 + Math.floor(Math.random() * 70);
  const count = Math.max(30, Math.floor(baseCount * customFwQuality));
  const shapeRoll = Math.random();
  const speedBase = 1.1 + Math.random() * 0.9;
  const isRing = shapeRoll > 0.82;
  const isWillow = shapeRoll <= 0.82 && shapeRoll > 0.62;
  for (let i = 0; i < count; i++) {
    let angle = (Math.PI * 2 * i) / count + Math.random() * 0.12;
    let speed = speedBase * (0.75 + Math.random() * 0.5);
    if (isRing) speed = speedBase * (0.95 + Math.random() * 0.1);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const hueJitter = hue + (Math.random() - 0.5) * 14;
    _fwSpawnParticle(rocket.x, rocket.y, vx, vy, hue === 0 && Math.random() < 0.15 ? null : hueJitter, 1.6 + Math.random() * 1.4, isWillow ? 1900 + Math.random() * 700 : 950 + Math.random() * 500, { drag: isWillow ? 0.992 : 0.965, gravity: isWillow ? 0.0026 : 0.0016, flicker: Math.random() < 0.35, crackle: !isRing && Math.random() < 0.18 });
  }
  _fwSpawnParticle(rocket.x, rocket.y, 0, 0, null, 7, 220, { drag: 0.9, gravity: 0 });
}

function _fwCrackleBurst(x, y, hue) {
  const n = Math.floor((4 + Math.random() * 5) * customFwQuality);
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 0.7;
    _fwSpawnParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, Math.random() < 0.5 ? null : hue, 1 + Math.random() * 0.8, 250 + Math.random() * 200, { drag: 0.94, gravity: 0.002 });
  }
}

function _fwUpdate(dt) {
  for (let i = customFwRockets.length - 1; i >= 0; i--) {
    const r = customFwRockets[i];
    r.trail.push({ x: r.x, y: r.y });
    if (r.trail.length > 6) r.trail.shift();
    r.vy += r.gravity * dt;
    r.x += r.vx * dt;
    r.y += r.vy * dt;
    if (r.vy >= -0.02 || r.y < customFwH * 0.05) { _fwExplode(r); customFwRockets.splice(i, 1); }
  }
  for (let i = 0; i < 900; i++) {
    const p = customFwParticles[i];
    if (!p.active) continue;
    p.life += dt;
    if (p.life >= p.maxLife) { p.active = false; continue; }
    p.trailX = p.x; p.trailY = p.y;
    const dragFactor = Math.pow(p.drag, dt / 16.67);
    p.vx *= dragFactor; p.vy *= dragFactor;
    p.vy += p.gravity * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.crackle && !p.crackled && p.life >= p.crackleAt) { p.crackled = true; _fwCrackleBurst(p.x, p.y, p.hue == null ? 45 : p.hue); }
  }
}

function _fwRender() {
  const c = customFwCtx;
  // Fade out existing pixels to transparent for motion trails
  c.globalCompositeOperation = 'destination-out';
  c.fillStyle = 'rgba(0, 0, 0, 0.25)';
  c.fillRect(0, 0, customFwW, customFwH);
  
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < customFwRockets.length; i++) {
    const r = customFwRockets[i];
    for (let t = 0; t < r.trail.length; t++) {
      const pt = r.trail[t];
      const a = (t + 1) / r.trail.length;
      const s = 5 * a;
      c.globalAlpha = a * 0.5;
      c.drawImage(customFwWhiteSprite, pt.x - s / 2, pt.y - s / 2, s, s);
    }
    c.globalAlpha = 1;
    c.drawImage(_fwSpriteFor(r.hue), r.x - 4, r.y - 4, 8, 8);
  }
  for (let i = 0; i < 900; i++) {
    const p = customFwParticles[i];
    if (!p.active) continue;
    const lifeRatio = p.life / p.maxLife;
    let alpha = 1 - lifeRatio; alpha *= alpha;
    if (p.flicker && Math.random() < 0.22) alpha *= 0.25;
    if (alpha <= 0) continue;
    const sprite = p.hue == null ? customFwWhiteSprite : _fwSpriteFor(p.hue);
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 0.35) {
      c.globalAlpha = alpha * 0.35;
      const s = p.size * 4;
      c.drawImage(sprite, p.trailX - s / 2, p.trailY - s / 2, s, s);
    }
    c.globalAlpha = alpha;
    const size = p.size * 6;
    c.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
  }
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
}

function _fwLoop(now) {
  if (!customFwActive) return;
  let dt = now - customFwLast; customFwLast = now; dt = Math.min(dt, 48);
  customFwFrameTimes.push(dt);
  if (customFwFrameTimes.length > 40) customFwFrameTimes.shift();
  const avg = customFwFrameTimes.reduce((a, b) => a + b, 0) / customFwFrameTimes.length;
  if (avg > 26) customFwQuality = 0.6; else if (avg > 20) customFwQuality = 0.8; else customFwQuality = 1;
  customFwAutoTimer += dt;
  if (customFwAutoTimer >= customFwNextAuto) {
    customFwAutoTimer = 0; customFwNextAuto = 700 + Math.random() * 900;
    launchCustomRocket();
    if (Math.random() < 0.18) setTimeout(() => launchCustomRocket(), 120 + Math.random() * 160);
  }
  _fwUpdate(dt); _fwRender();
  customFwRAF = requestAnimationFrame(_fwLoop);
}

function startCustomFireworks() {
  if (customFwActive) return;
  customFwActive = true;
  const canvas = document.getElementById('fireworks-canvas');
  if (canvas) canvas.classList.remove('hidden');
  initCustomFireworks();
  customFwLast = performance.now(); customFwAutoTimer = 0;
  customFwRAF = requestAnimationFrame(_fwLoop);
}

function stopCustomFireworks() {
  customFwActive = false;
  if (customFwRAF) { cancelAnimationFrame(customFwRAF); customFwRAF = null; }
  const canvas = document.getElementById('fireworks-canvas');
  if (canvas) { canvas.classList.add('hidden'); if (customFwCtx) customFwCtx.clearRect(0, 0, customFwW, customFwH); }
  customFwRockets = [];
  for (let i = 0; i < 900; i++) { if (customFwParticles[i]) customFwParticles[i].active = false; }
}

// Also alias old launchFireworks/stopFireworks to the new engine so nothing breaks
function launchFireworks() {
  startCustomFireworks();
  for (let k = 0; k < 5; k++) {
    setTimeout(() => {
      launchCustomRocket(
        window.innerWidth * (0.15 + Math.random() * 0.7),
        window.innerHeight * (0.15 + Math.random() * 0.35)
      );
    }, k * 160);
  }
}
function stopFireworks() { stopCustomFireworks(); }


let lastConfettiTimestamp = 0;
const CONFETTI_COOLDOWN_MS = 650;

function fireConfetti(opts = {}) {
  const now = performance.now();
  if (now - lastConfettiTimestamp < CONFETTI_COOLDOWN_MS) return;
  lastConfettiTimestamp = now;

  if (typeof confetti !== "function") return;
  const colors = ["#f0259a","#fde68a","#c084fc","#e91e63","#38bdf8","#34d399"];
  // Single lightweight, crisp burst - zero lag
  confetti({
    particleCount: 45,
    spread: 65,
    startVelocity: 44,
    ticks: 110,
    decay: 0.92,
    scalar: 0.9,
    colors,
    origin: { y: opts.y || 0.65, x: opts.x || 0.5 },
    disableForReducedMotion: true
  });
}

// ── 🌸 FLOATING SAKURA & FLOWER PETALS CANVAS ─────────────────────────────────
function initPetalParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W = (canvas.width = window.innerWidth), H = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const COUNT = Math.min(60, Math.floor(W * H / 12000));
  const petals = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    size: Math.random() * 9 + 6,
    speedY: Math.random() * 0.9 + 0.5,
    speedX: Math.random() * 0.6 - 0.3,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 1.5,
    osc: Math.random() * Math.PI * 2,
    oscSpeed: Math.random() * 0.02 + 0.01,
    alpha: Math.random() * 0.55 + 0.25,
    color: [
      "rgba(244, 114, 182, 0.7)",  // pink-mid
      "rgba(251, 207, 232, 0.75)", // pink-soft
      "rgba(244, 63, 94, 0.65)",   // rose
      "rgba(253, 230, 138, 0.7)",  // golden flower dust
      "rgba(255, 255, 255, 0.8)"   // pure white petal
    ][Math.floor(Math.random() * 5)]
  }));

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.scale(Math.cos(p.osc), 1);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    // Organic petal shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, p.size / 3, 0, p.size);
    ctx.bezierCurveTo(-p.size, p.size / 3, -p.size / 2, -p.size / 2, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    petals.forEach(p => {
      p.osc += p.oscSpeed;
      p.rot += p.rotSpeed;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.osc) * 0.6;

      if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;

      drawPetal(p);
    });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// ── 3D MOUSE TILT ─────────────────────────────────────────────────────────────
function init3DTilt() {
  document.addEventListener("mousemove", e => {
    document.querySelectorAll(".tilt-card").forEach(card => {
      const rect = card.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const rx = -(e.clientY - rect.top  - rect.height / 2) / (rect.height / 2) * 8;
        const ry =  (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2) * 8;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
        card.style.boxShadow = "0 24px 65px rgba(240,37,154,0.35)";
      } else {
        card.style.transform = "";
        card.style.boxShadow = "";
      }
    });
  });

  document.addEventListener("mouseleave", () => {
    document.querySelectorAll(".tilt-card").forEach(c => { c.style.transform = ""; c.style.boxShadow = ""; });
  });
}

// ── KEYBOARD NAVIGATION ───────────────────────────────────────────────────────
function initKeyboard() {
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(currentPage + 1);
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goTo(currentPage - 1);
  });
}

// ── REPLAY ALL ────────────────────────────────────────────────────────────────
function replayAll() {
  resetMagicHat();
  resetUniverseNextBtns();

  cakeHasBeenCut = false;
  cakeStage = 0;
  document.getElementById("page-10")?.classList.add("cake-dark-mode");
  document.getElementById("cake-reveal")?.classList.add("hidden");
  document.getElementById("cake-scene")?.classList.remove("cut");
  document.getElementById("knife-anim")?.classList.add("hidden");
  document.getElementById("cut-line")?.classList.add("hidden");
  document.getElementById("flame-wrap")?.classList.remove("blown-out");
  const cakeTitle = document.getElementById("cake-title");
  const cakeSub   = document.getElementById("cake-subtitle");
  if (cakeTitle) cakeTitle.textContent = "Let's Cut the Cake! 🎂";
  if (cakeSub)   cakeSub.textContent   = "👆 Tap the cake to slice & make a wish!";

  // Reset Tree & Crossbow interactive stages
  treeRevealedCount = 0;
  renderScrapbookGrid();
  document.getElementById("tree-tap-tutorial")?.classList.remove("hidden");
  resetFinaleCrossbow();

  stopFireworks();
  goTo(0);
}

// ── BOOTSTRAP ─────────────────────────────────────────────────────────────────

// Lightweight, page-related floating emojis for every page (first page 0 through final page 11)
const PAGE_EMOJIS = {
  0: ["🦆", "🎂", "✨", "🎉", "💛", "🎈"],  // Page 0: Birthday landing / The Joyful Soul
  1: ["🌌", "🪐", "✨", "⭐", "🔮", "💫"],  // Page 1: Multiverse madness portal
  2: ["🦆", "⭐", "💛", "✨", "🌟", "🐤"],  // Page 2: Universe 01 — The Joyful Soul
  3: ["🍳", "🔥", "👩‍🍳", "🧂", "🥞", "✨"],  // Page 3: Universe 02 — Master Chef
  4: ["🍔", "🍕", "🧋", "🍟", "🍰", "🌮"],  // Page 4: Universe 03 — The Foodie
  5: ["🌊", "🌴", "🌺", "🐚", "⛵", "🌈"],  // Page 5: Universe 04 — Island Wanderer
  6: ["🎵", "🎶", "💃", "✨", "🎤", "🌟"],  // Page 6: Universe 05 — The Dance Star
  7: ["👑", "💙", "⚡", "🌟", "✨", "💎"],  // Page 7: Universe 06 — The Madness Queen
  8: ["📸", "🌸", "💖", "🎞️", "✨", "💝"],  // Page 8: Scrapbook Memories & Blooming Tree
  9: ["🎩", "✨", "🎀", "👑", "🦆", "🎂"],  // Page 9: Magic Wish Hat 🎩✨
  10: ["🎂", "🕯️", "🍰", "✨", "🧁", "🍓"], // Page 10: Birthday Cake Slicing
  11: ["💌", "🏹", "👑", "💖", "✨", "💙"]  // Page 11: Grand Finale Letter & Wishes
};

function spawnFloatingDecorations() {
  // Remove any previously spawned floating emoji containers
  document.querySelectorAll(".page-floating-emojis").forEach(el => el.remove());

  for (let p = 0; p < CONFIG.totalPages; p++) {
    const pageEl = document.getElementById(`page-${p}`);
    if (!pageEl) continue;

    const emojis = PAGE_EMOJIS[p] || ["✨", "💖", "⭐", "🎉"];
    const container = document.createElement("div");
    container.className = "page-floating-emojis";
    container.setAttribute("aria-hidden", "true");

    // Insert container behind content (before page-inner / universe-layout)
    const contentEl = pageEl.querySelector(".page-inner, .universe-layout");
    if (contentEl) {
      pageEl.insertBefore(container, contentEl);
    } else {
      pageEl.appendChild(container);
    }

    const count = 8; // Lightweight: 8 emojis per page
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "floating-emoji";
      el.textContent = emojis[i % emojis.length];

      // Smooth horizontal and vertical distribution across viewport
      const left = ((i / count) * 84 + 8 + (Math.random() * 6 - 3)).toFixed(1);
      const top = (10 + (i % 4) * 22 + Math.random() * 10).toFixed(1);
      const dur = (12 + (i % 5) * 2.2 + Math.random() * 2).toFixed(1);
      const delay = ((i * 1.4) % 6).toFixed(1);
      const baseOpacity = (0.18 + (i % 3) * 0.05).toFixed(2);
      const tx = ((i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 20)).toFixed(0);
      const ty = (-30 - Math.random() * 35).toFixed(0);
      const tx2 = ((i % 2 === 0 ? -1 : 1) * (15 + Math.random() * 25)).toFixed(0);
      const ty2 = (-60 - Math.random() * 35).toFixed(0);
      const rot = ((i % 2 === 0 ? 1 : -1) * (10 + Math.random() * 15)).toFixed(0);

      el.style.left = `${left}%`;
      el.style.top = `${top}%`;
      el.style.setProperty("--dur", `${dur}s`);
      el.style.setProperty("--delay", `${delay}s`);
      el.style.setProperty("--base-opacity", baseOpacity);
      el.style.setProperty("--tx", `${tx}px`);
      el.style.setProperty("--ty", `${ty}px`);
      el.style.setProperty("--tx2", `${tx2}px`);
      el.style.setProperty("--ty2", `${ty2}px`);
      el.style.setProperty("--rot", `${rot}deg`);

      container.appendChild(el);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  buildDots();
  spawnFloatingDecorations();
  initCountdown();
  initAudio();
  initVideoListeners();
  buildGallery();
  initLightbox();
  initMagicHat();
  // initPetalParticles removed: stars and comets purely handle the background
  init3DTilt();
  initKeyboard();

  // Initial music state (page 0 — show music player)
  handleMusicForPage(0);
});


// ============================================================================
// 🌌 COSMIC STARFIELD & COMET ENGINE
// ============================================================================
let cosmicStars = [];
let cosmicComets = [];
let cosmicCanvas = null;
let cosmicCtx = null;
let cosmicW = 0, cosmicH = 0;
let lastCometTime = 0;

function initCosmicCanvas() {
  cosmicCanvas = document.getElementById("particle-canvas");
  if (!cosmicCanvas) return;
  cosmicCtx = cosmicCanvas.getContext("2d");
  resizeCosmicCanvas();

  window.addEventListener("resize", resizeCosmicCanvas);

  // Generate 160 flashy golden and diamond stars
  cosmicStars = [];
  for (let i = 0; i < 160; i++) {
    cosmicStars.push({
      x: Math.random() * cosmicW,
      y: Math.random() * cosmicH,
      radius: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.85 + 0.15,
      twinkleSpeed: Math.random() * 0.04 + 0.015,
      isSparkle: Math.random() < 0.28, // 28% are brilliant ✦ sparkles
      hue: Math.random() < 0.75 ? (40 + Math.random() * 15) : 345 // Rich Gold & Rose
    });
  }

  requestAnimationFrame(cosmicLoop);
}

function resizeCosmicCanvas() {
  if (!cosmicCanvas) return;
  cosmicW = cosmicCanvas.width = window.innerWidth;
  cosmicH = cosmicCanvas.height = window.innerHeight;
}

function spawnComet() {
  const startX = Math.random() * (cosmicW * 0.75);
  const startY = Math.random() * (cosmicH * 0.35);
  const length = Math.random() * 160 + 100;
  const speed = Math.random() * 7 + 8;
  const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.18;

  cosmicComets.push({
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length: length,
    life: 0,
    maxLife: 65,
    sparkles: [],
    // Flashy Realistic Golden Comet
    color: "rgba(255, 215, 0, "
  });
}

function cosmicLoop(time) {
  if (!cosmicCtx) return;
  cosmicCtx.clearRect(0, 0, cosmicW, cosmicH);

  // Twinkle stars
  for (let i = 0; i < cosmicStars.length; i++) {
    const s = cosmicStars[i];
    s.alpha += Math.sin(time * s.twinkleSpeed) * 0.015;
    const clampedAlpha = Math.max(0.15, Math.min(1, s.alpha));

    if (s.isSparkle) {
      // Draw 4-point ✦ sparkle
      cosmicCtx.save();
      cosmicCtx.translate(s.x, s.y);
      cosmicCtx.fillStyle = `hsla(${s.hue}, 100%, 80%, ${clampedAlpha})`;
      cosmicCtx.shadowBlur = 8;
      cosmicCtx.shadowColor = `hsla(${s.hue}, 100%, 75%, 0.9)`;
      cosmicCtx.beginPath();
      const r = s.radius * 2.8;
      cosmicCtx.moveTo(0, -r);
      cosmicCtx.lineTo(r * 0.25, 0);
      cosmicCtx.lineTo(0, r);
      cosmicCtx.lineTo(-r * 0.25, 0);
      cosmicCtx.closePath();
      cosmicCtx.fill();
      cosmicCtx.beginPath();
      cosmicCtx.moveTo(-r, 0);
      cosmicCtx.lineTo(0, r * 0.25);
      cosmicCtx.lineTo(r, 0);
      cosmicCtx.lineTo(0, -r * 0.25);
      cosmicCtx.closePath();
      cosmicCtx.fill();
      cosmicCtx.restore();
    } else {
      // Soft glowing circle star
      cosmicCtx.beginPath();
      cosmicCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      cosmicCtx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha})`;
      cosmicCtx.shadowBlur = s.radius > 1.2 ? 6 : 0;
      cosmicCtx.shadowColor = "rgba(255, 200, 230, 0.8)";
      cosmicCtx.fill();
    }
  }

  // Periodic Comet
  if (time - lastCometTime > 2500 + Math.random() * 2000) {
    spawnComet();
    lastCometTime = time;
  }

  // Render Comets
  for (let i = cosmicComets.length - 1; i >= 0; i--) {
    const c = cosmicComets[i];
    c.x += c.vx;
    c.y += c.vy;
    c.life++;

    const progress = c.life / c.maxLife;
    const alpha = Math.sin(progress * Math.PI); // fade in and out

    const tailX = c.x - (c.vx / Math.hypot(c.vx, c.vy)) * c.length;
    const tailY = c.y - (c.vy / Math.hypot(c.vx, c.vy)) * c.length;

    const grad = cosmicCtx.createLinearGradient(tailX, tailY, c.x, c.y);
    grad.addColorStop(0, c.color + "0)");
    grad.addColorStop(0.7, c.color + (alpha * 0.5) + ")");
    grad.addColorStop(1, "rgba(255, 255, 255, " + alpha + ")");

    cosmicCtx.save();
    cosmicCtx.strokeStyle = grad;
    cosmicCtx.lineWidth = 2.5;
    cosmicCtx.lineCap = "round";
    cosmicCtx.beginPath();
    cosmicCtx.moveTo(tailX, tailY);
    cosmicCtx.lineTo(c.x, c.y);
    cosmicCtx.stroke();

    // Comet bright head
    cosmicCtx.beginPath();
    cosmicCtx.arc(c.x, c.y, 3, 0, Math.PI * 2);
    cosmicCtx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
    cosmicCtx.shadowBlur = 12;
    cosmicCtx.shadowColor = "rgba(255, 200, 240, 1)";
    cosmicCtx.fill();
    cosmicCtx.restore();

    if (c.life >= c.maxLife) {
      cosmicComets.splice(i, 1);
    }
  }

  requestAnimationFrame(cosmicLoop);
}

// ============================================================================
// 💝 PULL-AND-RELEASE HEART CORD (Page 0)
// ============================================================================
let heartPullInitialized = false;

function initHeartPull() {
  if (heartPullInitialized) return;
  heartPullInitialized = true;

  const heart = document.getElementById("pull-heart");
  const string = document.getElementById("pull-string");
  const anchor = document.querySelector(".pull-string-anchor") || heart;
  if (!heart || !string) return;

  const baseHeight = 65;
  const maxPull = 140;
  const threshold = 75; // Must pull down at least 75px to open

  let isDragging = false;
  let startY = 0;
  let currentY = 0;
  let hasMovedFar = false;

  const onStart = (clientY, target, pointerId) => {
    isDragging = true;
    hasMovedFar = false;
    currentY = 0;
    startY = clientY;

    anchor.classList.add("is-dragging");
    heart.classList.add("is-dragging");
    string.classList.add("is-dragging");

    string.style.transition = "none";
    heart.style.transition = "none";

    if (target && target.setPointerCapture && pointerId !== undefined) {
      try { target.setPointerCapture(pointerId); } catch(err) {}
    }
  };

  const onMove = (clientY) => {
    if (!isDragging) return;
    const dy = clientY - startY;
    const delta = Math.max(0, Math.min(maxPull, dy));
    currentY = delta;

    if (delta > 15) {
      hasMovedFar = true;
    }

    // Follow downward movement smoothly
    string.style.height = `${baseHeight + delta}px`;
    heart.style.transform = `translateY(${delta}px) scale(${1 + delta * 0.0018})`;
  };

  const onEnd = (target, pointerId) => {
    if (!isDragging) return;
    isDragging = false;

    anchor.classList.remove("is-dragging");
    string.classList.remove("is-dragging");

    if (target && target.releasePointerCapture && pointerId !== undefined) {
      try { target.releasePointerCapture(pointerId); } catch(err) {}
    }

    // Only open the next page after being pulled far enough (threshold >= 75px)
    // A simple click (hasMovedFar is false or currentY < threshold) must not trigger it!
    if (hasMovedFar && currentY >= threshold) {
      // Rebound Snap & Burst!
      string.style.transition = "height 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.4)";
      heart.style.transition = "transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.4)";
      string.style.height = `${baseHeight}px`;
      heart.style.transform = "translateY(0) scale(1)";

      previewMode = "bday";
      const dotsNav = document.getElementById("page-dots");
      if (dotsNav) dotsNav.style.display = "flex";
      SFX.chime(2);

      // Trigger Floral Burst & navigate to Page 1
      spawnFloralBurst();
      setTimeout(() => {
        heart.classList.remove("is-dragging");
        goTo(1);
      }, 450);
    } else {
      // Return smoothly if released early or simply clicked
      string.style.transition = "height 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      heart.style.transition = "transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      string.style.height = `${baseHeight}px`;
      heart.style.transform = "translateY(0) scale(1)";

      setTimeout(() => {
        heart.classList.remove("is-dragging");
        string.style.transition = "";
        heart.style.transition = "";
      }, 350);
    }
  };

  // Modern Pointer Events API (Unified mouse + touch)
  anchor.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    onStart(e.clientY, e.target, e.pointerId);
  });

  window.addEventListener("pointermove", (e) => {
    onMove(e.clientY);
  });

  window.addEventListener("pointerup", (e) => {
    onEnd(e.target, e.pointerId);
  });

  window.addEventListener("pointercancel", (e) => {
    onEnd(e.target, e.pointerId);
  });

  // Touch event fallback
  anchor.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) onStart(e.touches[0].clientY, e.target);
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) onMove(e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    onEnd(e.target);
  });

  // A simple click must NEVER trigger navigation
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  heart.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
}

function spawnFloralBurst() {
  const petals = ["🌸", "🌺", "🌼", "🌷", "✨", "💐", "💖", "🏵️"];
  const count = 36;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "floral-burst-item";
    el.innerText = petals[Math.floor(Math.random() * petals.length)];

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (window.innerWidth * 0.45) + 60;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const rot = (Math.random() - 0.5) * 720;

    el.style.setProperty("--tx", `${tx}px`);
    el.style.setProperty("--ty", `${ty}px`);
    el.style.setProperty("--rot", `${rot}deg`);

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
}

// ============================================================================
// 🌳 PAGE 8: BLOOMING HEART TREE
// ============================================================================
let treeCanvas = null;
let treeCtx = null;
let treeHearts = [];
let fallingHearts = [];

function initBloomingTree() {
  treeCanvas = document.getElementById("tree-canvas");
  if (!treeCanvas) return;
  treeCtx = treeCanvas.getContext("2d");

  // Build tree canopy hearts in a giant heart silhouette
  treeHearts = [];
  const centerX = 170;
  const centerY = 150;
  const scale = 8.5;

  for (let t = 0; t < Math.PI * 2; t += 0.12) {
    // Heart equation
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    
    // Cluster inner fill
    for (let r = 0.2; r <= 1.0; r += 0.22) {
      const px = centerX + hx * scale * r + (Math.random() - 0.5) * 14;
      const py = centerY + hy * scale * r + (Math.random() - 0.5) * 14;
      treeHearts.push({
        x: px,
        y: py,
        size: Math.random() * 8 + 6,
        hue: 330 + Math.random() * 35, // pink / peach / magenta
        alpha: Math.random() * 0.35 + 0.65,
        pulseSpeed: Math.random() * 0.04 + 0.02
      });
    }
  }

  // Generate continuous falling heart petals
  fallingHearts = [];
  for (let i = 0; i < 22; i++) {
    fallingHearts.push({
      x: centerX + (Math.random() - 0.5) * 180,
      y: centerY + Math.random() * 180,
      vy: Math.random() * 1.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 6 + 4,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.04,
      alpha: Math.random() * 0.4 + 0.5
    });
  }

  requestAnimationFrame(treeLoop);
}

function drawHeartShape(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  const d = size;
  ctx.moveTo(0, d / 4);
  ctx.bezierCurveTo(0, -d / 2, -d, -d / 2, -d, d / 4);
  ctx.bezierCurveTo(-d, d, 0, d * 1.3, 0, d * 1.6);
  ctx.bezierCurveTo(0, d * 1.3, d, d, d, d / 4);
  ctx.bezierCurveTo(d, -d / 2, 0, -d / 2, 0, d / 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function treeLoop(time) {
  if (!treeCtx) return;
  treeCtx.clearRect(0, 0, 340, 380);

  // Draw tree trunk and branching silhouette
  treeCtx.save();
  treeCtx.strokeStyle = "#4a1936";
  treeCtx.fillStyle = "#3b122b";
  treeCtx.lineWidth = 14;
  treeCtx.lineCap = "round";

  // Base trunk
  treeCtx.beginPath();
  treeCtx.moveTo(170, 370);
  treeCtx.quadraticCurveTo(165, 280, 170, 220);
  treeCtx.stroke();

  // Primary branches
  treeCtx.lineWidth = 8;
  treeCtx.beginPath();
  treeCtx.moveTo(170, 230);
  treeCtx.quadraticCurveTo(140, 180, 110, 150);
  treeCtx.moveTo(170, 230);
  treeCtx.quadraticCurveTo(200, 180, 230, 150);
  treeCtx.moveTo(170, 210);
  treeCtx.quadraticCurveTo(170, 170, 170, 130);
  treeCtx.stroke();
  treeCtx.restore();

  // Draw Heart Canopy
  for (let i = 0; i < treeHearts.length; i++) {
    const h = treeHearts[i];
    const pulse = 1 + Math.sin(time * h.pulseSpeed + i) * 0.12;
    const color = `hsla(${h.hue}, 95%, 68%, ${h.alpha})`;
    drawHeartShape(treeCtx, h.x, h.y, h.size * pulse, color);
  }

  // Draw Falling Heart Petals
  for (let i = 0; i < fallingHearts.length; i++) {
    const p = fallingHearts[i];
    p.y += p.vy;
    p.x += Math.sin(p.y * 0.03) * 0.8 + p.vx;
    p.rot += p.vRot;

    if (p.y > 375) {
      p.y = 130 + Math.random() * 40;
      p.x = 170 + (Math.random() - 0.5) * 160;
    }

    treeCtx.save();
    treeCtx.translate(p.x, p.y);
    treeCtx.rotate(p.rot);
    drawHeartShape(treeCtx, 0, 0, p.size, `rgba(255, 182, 219, ${p.alpha})`);
    treeCtx.restore();
  }

  requestAnimationFrame(treeLoop);
}



// (Obsolete spotlight onTreeClick removed - implemented with progressive reveal below)


// ============================================================================
// 🎂 PAGE 10: MULTI-STAGE BAKING CAKE SEQUENCE
// ============================================================================
let cakeStage = 0; // 0: unbaked, 1: bot, 2: mid, 3: top, 4: ready, 5: cut

function restoreCutCakeState() {
  cakeStage = 5;
  const bot = document.getElementById("cake-tier-bot");
  const mid = document.getElementById("cake-tier-mid");
  const top = document.getElementById("cake-tier-top");
  const candle = document.getElementById("candle-wrap");
  const flame = document.getElementById("flame-wrap");
  const flash = document.getElementById("cake-ready-flash");
  const scene = document.getElementById("cake-scene");
  const cutLine = document.getElementById("cut-line");
  const knife = document.getElementById("knife-anim");
  const reveal = document.getElementById("cake-reveal");
  const title = document.getElementById("cake-title");
  const subtitle = document.getElementById("cake-subtitle");
  const page10 = document.getElementById("page-10");

  if (bot) bot.className = "cake-layer cake-bot stacked-tier";
  if (mid) mid.className = "cake-layer cake-mid stacked-tier";
  if (top) top.className = "cake-layer cake-top stacked-tier";
  if (flash) flash.classList.remove("flash-active");
  if (scene) scene.classList.add("cut");
  if (cutLine) cutLine.classList.remove("hidden");
  if (knife) knife.classList.add("hidden");
  if (candle) candle.classList.remove("hidden");
  if (flame) flame.classList.add("blown-out");
  if (reveal) reveal.classList.remove("hidden");
  if (title) title.innerHTML = '<span class="cake-text-glow">Happy Birthday, Bestie!</span> <span class="natural-emoji">🎂👑</span>';
  if (subtitle) subtitle.innerText = "👆 Tap the cake to slice & make a wish!";
  if (page10) page10.classList.remove("cake-dark-mode");
}

function startBakingSequence() {
  if (cakeHasBeenCut) {
    restoreCutCakeState();
    return;
  }
  cakeStage = 0;
  const bot = document.getElementById("cake-tier-bot");
  const mid = document.getElementById("cake-tier-mid");
  const top = document.getElementById("cake-tier-top");
  const candle = document.getElementById("candle-wrap");
  const flash = document.getElementById("cake-ready-flash");
  const title = document.getElementById("cake-title");
  const subtitle = document.getElementById("cake-subtitle");
  const cutLine = document.getElementById("cut-line");
  const knife = document.getElementById("knife-anim");
  const reveal = document.getElementById("cake-reveal");

  if (!bot || !mid || !top) return;

  // Reset initial state
  bot.className = "cake-layer cake-bot hidden-tier";
  mid.className = "cake-layer cake-mid hidden-tier";
  top.className = "cake-layer cake-top hidden-tier";
  if (candle) candle.classList.add("hidden");
  if (flash) flash.classList.remove("flash-active");
  if (cutLine) cutLine.classList.add("hidden");
  if (knife) knife.classList.add("hidden");
  if (reveal) reveal.classList.add("hidden");

  if (title) title.innerText = "First things first 🎂";
  if (subtitle) subtitle.innerText = "Baking something sweet...";

  // Trigger shooting comet across the top
  spawnComet();

  // Tier 1: Bot layer
  setTimeout(() => {
    if (cakeHasBeenCut) return;
    bot.className = "cake-layer cake-bot stacked-tier";
    cakeStage = 1;
  }, 400);

  // Tier 2: Mid layer
  setTimeout(() => {
    if (cakeHasBeenCut) return;
    mid.className = "cake-layer cake-mid stacked-tier";
    cakeStage = 2;
  }, 1100);

  // Tier 3: Top layer + frosting
  setTimeout(() => {
    if (cakeHasBeenCut) return;
    top.className = "cake-layer cake-top stacked-tier";
    cakeStage = 3;
  }, 1800);

  // "Ready" Flash Highlight
  setTimeout(() => {
    if (cakeHasBeenCut) return;
    if (flash) flash.classList.add("flash-active");
    cakeStage = 4;
  }, 2400);

  // Candle ignition & Reveal
  setTimeout(() => {
    if (cakeHasBeenCut) return;
    if (candle) candle.classList.remove("hidden");
    if (title) title.innerHTML = '<span class="cake-text-glow">Happy Birthday, Bestie!</span> <span class="natural-emoji">🎂👑</span>';
    if (subtitle) subtitle.innerText = "👆 Tap the cake to slice & make a wish!";
    cakeStage = 5;
  }, 3000);
}

function onCakeClick() {
  if (cakeHasBeenCut) {
    restoreCutCakeState();
    return;
  }
  if (cakeStage < 5) {
    // Fast-forward to ready state if clicked early
    const bot = document.getElementById("cake-tier-bot");
    const mid = document.getElementById("cake-tier-mid");
    const top = document.getElementById("cake-tier-top");
    const candle = document.getElementById("candle-wrap");
    const title = document.getElementById("cake-title");
    const subtitle = document.getElementById("cake-subtitle");
    if (bot) bot.className = "cake-layer cake-bot stacked-tier";
    if (mid) mid.className = "cake-layer cake-mid stacked-tier";
    if (top) top.className = "cake-layer cake-top stacked-tier";
    if (candle) candle.classList.remove("hidden");
    if (title) title.innerHTML = '<span class="cake-text-glow">Happy Birthday, Bestie!</span> <span class="natural-emoji">🎂👑</span>';
    if (subtitle) subtitle.innerText = "👆 Tap the cake to slice & make a wish!";
    cakeStage = 5;
    return;
  }

  // Trigger Cake Cutting
  cutCake();
}

// ============================================================================
// 💌 PAGE 11: PLAYFUL WAX-SEALED ENVELOPE
// ============================================================================
function toggleEnvelope() {
  const body = document.getElementById("envelope-body");
  const seal = document.getElementById("envelope-wax-seal");
  if (!body) return;

  if (!body.classList.contains("unsealed")) {
    if (seal) seal.classList.add("broken");
    body.classList.add("unsealed");
    fireConfetti();
  }
}

// Update goTo to trigger baking sequence on Page 10
const originalGoTo = goTo;
goTo = function(target) {
  originalGoTo(target);
  if (target === 8) {
    setTimeout(initBloomingTree, 300);
  }
  if (target === 10) {
    if (cakeHasBeenCut) {
      restoreCutCakeState();
    } else {
      setTimeout(startBakingSequence, 400);
    }
  }
};

// Start Cosmic Canvas on load
document.addEventListener("DOMContentLoaded", () => {
  initCosmicCanvas();
});




// ============================================================================
// 🌸 PAGE 8: BLOOMING TREE & SCRAPBOOK GRID (PROGRESSIVE REVEAL)
// ============================================================================
let treeRevealedCount = 0;

function updateScrapbookText() {
  const treeHint = document.getElementById("tree-hint-text");
  const gallerySub = document.getElementById("gallery-sub-text");

  if (treeRevealedCount === 0) {
    if (treeHint) treeHint.textContent = "💝 Tap tree to bloom memories!";
    if (gallerySub) gallerySub.textContent = "Tap the blooming tree to reveal memories! (Tap photo to zoom)";
  } else if (treeRevealedCount < 8) {
    if (treeHint) treeHint.textContent = `💝 Tap tree for next memory! (${treeRevealedCount}/8)`;
    if (gallerySub) gallerySub.textContent = `Memory ${treeRevealedCount} revealed! Tap tree for more (${treeRevealedCount}/8)`;
  } else {
    if (treeHint) treeHint.textContent = "✨ All 8 memories blossomed! 💖";
    if (gallerySub) gallerySub.textContent = "All 8 memories unlocked! Tap any photo to zoom 📸";
  }
}

function renderScrapbookGrid(justRevealedIdx = -1) {
  const container = document.getElementById("compact-polaroid-grid");
  if (!container) return;

  const html = [];
  for (let i = 0; i < 8; i++) {
    const it = CONFIG.gallery[i];
    if (i < treeRevealedCount && it) {
      const isNew = (i === justRevealedIdx);
      html.push(`
        <article class="polaroid-card revealed ${isNew ? 'just-revealed' : ''}" data-idx="${i}" onclick="openLightbox(${i})" tabindex="0" role="button" aria-label="${it.caption}">
          <div class="polaroid-img-frame">
            <img src="${it.img}" alt="${it.caption}" class="polaroid-photo" loading="lazy"
              onerror="this.onerror=null;this.src='assets/images/memory-1.webp';">
          </div>
          <div class="polaroid-footer">
            <span class="polaroid-caption">${it.caption}</span>
            <span class="polaroid-stamp">${it.stamp}</span>
          </div>
        </article>
      `);
    } else {
      html.push(`
        <div class="polaroid-slot-placeholder" aria-label="Memory ${i + 1} locked">
          <div class="placeholder-inner">
            <span class="placeholder-icon">🌸</span>
            <span class="placeholder-label">Memory ${i + 1}</span>
            <span class="placeholder-sub">Tap tree</span>
          </div>
        </div>
      `);
    }
  }
  container.innerHTML = html.join("");
  updateScrapbookText();
}

// Backward compatibility alias
const renderCompactGallery = renderScrapbookGrid;

// Tree click drops hearts, bursts confetti, and reveals exactly one photo in order
function onTreeClick() {
  // Hide tutorial animation on first successful tree click
  const treeTutorial = document.getElementById("tree-tap-tutorial");
  if (treeTutorial && !treeTutorial.classList.contains("hidden")) {
    treeTutorial.classList.add("hidden");
  }

  // 1. Shower heart petals on canvas
  for (let i = 0; i < 20; i++) {
    fallingHearts.push({
      x: 170 + (Math.random() - 0.5) * 140,
      y: 150 + (Math.random() - 0.5) * 80,
      vy: Math.random() * 2 + 1.2,
      vx: (Math.random() - 0.5) * 2,
      size: Math.random() * 7 + 4,
      rot: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.08,
      alpha: 1
    });
  }

  // 2. Burst confetti
  fireConfetti();

  // 3. Progressive reveal of exactly one photo in order up to 8
  if (treeRevealedCount < 8) {
    treeRevealedCount++;
    if (typeof SFX !== "undefined" && SFX.chime) {
      SFX.chime(treeRevealedCount);
    }
    renderScrapbookGrid(treeRevealedCount - 1);
  } else {
    // Extra taps (9+): must not add duplicates or other items.
    // Give satisfying card shimmer feedback on the existing cards.
    document.querySelectorAll(".compact-polaroid-grid .polaroid-card").forEach((card, idx) => {
      setTimeout(() => {
        card.style.transform = "scale(1.06) rotate(" + ((idx % 2 === 0 ? 1 : -1) * 2) + "deg)";
        setTimeout(() => { card.style.transform = "none"; }, 300);
      }, idx * 45);
    });
  }
}

// ============================================================================
// 🏹 REAL INTERACTIVE BOW AND ARROW DRAG-AND-RELEASE (Page 11)
// ============================================================================
let bowArrowInitialized = false;
let bowArrowShot = false;

function initInteractiveBow() {
  const rig = document.getElementById("bow-rig-container");
  const arrow = document.getElementById("notched-arrow");
  const stringTop = document.getElementById("bow-string-top");
  const stringBot = document.getElementById("bow-string-bot");
  const trajectory = document.getElementById("aim-trajectory");
  const targetStation = document.getElementById("target-heart-station");
  const impact = document.getElementById("target-prick-impact");
  const arena = document.getElementById("archery-arena");
  const envelope = document.getElementById("royal-closed-envelope");
  const bowStage = document.getElementById("bow-arrow-stage");
  const revealedStage = document.getElementById("finale-revealed-stage");
  const hintText = document.querySelector("#bow-instruction-row .drag-hint-text");

  if (!rig || !arrow) return;
  if (bowArrowInitialized) return;
  bowArrowInitialized = true;

  let isDragging = false;
  let startX = 0;
  let currentPull = 0;
  const maxPull = 80; // px pull backward
  const releaseThreshold = 35; // px threshold to fire

  function onDragStart(clientX) {
    if (bowArrowShot) return;
    isDragging = true;
    startX = clientX;
    arrow.style.transition = "none";
    if (trajectory) trajectory.style.opacity = "1";
    if (hintText) hintText.textContent = "Pull back further & release! 🎯";
  }

  function onDragMove(clientX) {
    if (!isDragging || bowArrowShot) return;
    const delta = clientX - startX;
    // Pulling backward (to the left = negative delta)
    currentPull = Math.max(0, Math.min(maxPull, -delta));

    // Move arrow backward with pull
    arrow.style.transform = `translateX(${-currentPull}px) translateY(-50%)`;

    // Bend SVG bowstring to meet nock of arrow
    const nockX = 30 - currentPull;
    if (stringTop) stringTop.setAttribute("d", `M30,10 L${nockX},80`);
    if (stringBot) stringBot.setAttribute("d", `M30,150 L${nockX},80`);

    if (currentPull >= releaseThreshold) {
      if (hintText) hintText.textContent = "Ready! Release to shoot! 💘";
      if (trajectory) trajectory.style.opacity = "1";
    } else {
      if (hintText) hintText.textContent = "Pull back more & release! 🏹";
    }
  }

  function onDragEnd() {
    if (!isDragging || bowArrowShot) return;
    isDragging = false;

    if (currentPull >= releaseThreshold) {
      // 🏹 FIRE THE ARROW!
      bowArrowShot = true;
      if (hintText) hintText.textContent = "Bullseye! 🎯💘";

      // 1. Bowstring snaps back instantly
      if (stringTop) stringTop.setAttribute("d", "M30,10 L30,80");
      if (stringBot) stringBot.setAttribute("d", "M30,150 L30,80");

      // 2. Arrow shoots forward across the arena to target heart
      const targetDist = arena ? (arena.clientWidth - 170) : 340;
      arrow.style.transition = "transform 0.26s cubic-bezier(0.22, 1, 0.36, 1)";
      arrow.style.transform = `translateX(${targetDist}px) translateY(-50%) scale(1.15)`;

      // 3. Arrow hits the heart!
      setTimeout(() => {
        if (impact) impact.classList.remove("hidden");
        if (targetStation) {
          targetStation.style.transform = "translate(-50%, -50%) scale(1.35) rotate(14deg)";
          targetStation.style.filter = "drop-shadow(0 0 30px #f0259a)";
        }
        if (typeof SFX !== "undefined" && SFX.pop) SFX.pop();
        fireConfetti();

        // 4. Envelope opening animation
        setTimeout(() => {
          if (envelope) envelope.classList.add("opening");
          if (targetStation) {
            targetStation.style.transition = "all 0.5s ease";
            targetStation.style.opacity = "0";
            targetStation.style.transform = "translate(-50%, -50%) scale(1.6)";
          }
          if (typeof SFX !== "undefined" && SFX.chime) SFX.chime(3);
          fireConfetti();

          // 5. Reveal Photo, Crown, Message Card, and 3 Buttons!
          setTimeout(() => {
            if (bowStage) {
              bowStage.style.transition = "opacity 0.4s ease, transform 0.4s ease";
              bowStage.style.opacity = "0";
              bowStage.style.transform = "scale(0.92)";
              setTimeout(() => {
                bowStage.classList.add("hidden");
                if (revealedStage) {
                  revealedStage.classList.remove("hidden");
                  revealedStage.style.opacity = "1";
                }
                fireConfetti();
                launchFireworks();
              }, 400);
            }
          }, 650);
        }, 300);
      }, 240);

    } else {
      // Released before threshold: spring smoothly back to resting position
      arrow.style.transition = "transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      arrow.style.transform = "translateX(0) translateY(-50%)";
      if (stringTop) stringTop.setAttribute("d", "M30,10 L30,80");
      if (stringBot) stringBot.setAttribute("d", "M30,150 L30,80");
      if (trajectory) trajectory.style.opacity = "0.65";
      if (hintText) hintText.textContent = "Pull back the arrow & release to shoot! 🏹💘";
      currentPull = 0;
    }
  }

  // Pointer Events (Unified Mouse + Touch + Pen with pointer capture)
  rig.addEventListener("pointerdown", (e) => {
    try { rig.setPointerCapture(e.pointerId); } catch {}
    onDragStart(e.clientX);
  });
  rig.addEventListener("pointermove", (e) => onDragMove(e.clientX));
  rig.addEventListener("pointerup", (e) => {
    try { rig.releasePointerCapture(e.pointerId); } catch {}
    onDragEnd();
  });
  rig.addEventListener("pointercancel", (e) => {
    try { rig.releasePointerCapture(e.pointerId); } catch {}
    onDragEnd();
  });

  // Additional Window Fallbacks
  window.addEventListener("mousemove", (e) => {
    if (isDragging) onDragMove(e.clientX);
  });
  window.addEventListener("mouseup", () => {
    if (isDragging) onDragEnd();
  });

  // Mobile Touch Fallbacks
  rig.addEventListener("touchstart", (e) => {
    if (e.touches && e.touches.length > 0) onDragStart(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (isDragging && e.touches && e.touches.length > 0) {
      if (e.cancelable) e.preventDefault();
      onDragMove(e.touches[0].clientX);
    }
  }, { passive: false });
  window.addEventListener("touchend", () => {
    if (isDragging) onDragEnd();
  });
}

function resetFinaleCrossbow() {
  bowArrowShot = false;
  const bowStage = document.getElementById("bow-arrow-stage");
  const revealedStage = document.getElementById("finale-revealed-stage");
  const arrow = document.getElementById("notched-arrow");
  const stringTop = document.getElementById("bow-string-top");
  const stringBot = document.getElementById("bow-string-bot");
  const trajectory = document.getElementById("aim-trajectory");
  const targetStation = document.getElementById("target-heart-station");
  const impact = document.getElementById("target-prick-impact");
  const envelope = document.getElementById("royal-closed-envelope");
  const hintText = document.querySelector("#bow-instruction-row .drag-hint-text");

  if (bowStage) {
    bowStage.classList.remove("hidden");
    bowStage.style.opacity = "1";
    bowStage.style.transform = "none";
    bowStage.style.display = "";
  }
  if (revealedStage) {
    revealedStage.classList.add("hidden");
    revealedStage.style.opacity = "0";
  }
  if (arrow) {
    arrow.style.transition = "none";
    arrow.style.transform = "translateX(0) translateY(-50%)";
  }
  if (stringTop) stringTop.setAttribute("d", "M30,10 L30,80");
  if (stringBot) stringBot.setAttribute("d", "M30,150 L30,80");
  if (trajectory) trajectory.style.opacity = "0.65";
  if (impact) impact.classList.add("hidden");
  if (targetStation) {
    targetStation.style.transition = "none";
    targetStation.style.opacity = "1";
    targetStation.style.transform = "translate(-50%, -50%)";
    targetStation.style.filter = "none";
  }
  if (envelope) envelope.classList.remove("opening");
  if (hintText) hintText.textContent = "Pull back the arrow & release to shoot! 🏹💘";
}

// Hook renderCompactGallery and initInteractiveBow into navigation
const priorGoTo = goTo;
goTo = function(target) {
  priorGoTo(target);
  if (target === 8) {
    setTimeout(() => {
      renderCompactGallery();
      initBloomingTree();
    }, 250);
  }
  if (target === 11) {
    setTimeout(() => {
      initInteractiveBow();
    }, 250);
  }
};

// Initialize interactive bow on startup
document.addEventListener("DOMContentLoaded", () => {
  initInteractiveBow();
});
