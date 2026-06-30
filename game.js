/**
 * Space Journey - Gamified Portfolio Engine
 * Author: Ankit Dwivedi
 * Zero-dependency HTML5 Canvas & Web Audio API Game Engine
 */

// Initialize Audio Context lazily on first user interaction
let audioCtx = null;
let isMuted = true;
let thrusterSound = null;

function initAudio() {
  if (audioCtx) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  } catch (e) {
    console.warn("Web Audio API not supported", e);
  }
}

let bgmInterval = null;
let bgmGain = null;

function startBGM() {
  initAudio();
  if (!audioCtx || bgmInterval || isMuted) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  bgmGain = audioCtx.createGain();
  bgmGain.gain.value = 0.05; // Base volume
  bgmGain.connect(audioCtx.destination);
  
  const tempo = 120;
  const secondsPerBeat = 60.0 / tempo;
  const notes = [
    261.63, 329.63, 392.00, 523.25, 
    392.00, 329.63, 261.63, 196.00,
    220.00, 261.63, 329.63, 440.00,
    329.63, 261.63, 220.00, 164.81
  ];
  let noteIndex = 0;
  let nextNoteTime = audioCtx.currentTime + 0.1;
  
  bgmInterval = setInterval(() => {
    if(isMuted) {
      stopBGM();
      return;
    }
    while (nextNoteTime < audioCtx.currentTime + 0.1) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = notes[noteIndex];
      
      gain.gain.setValueAtTime(0, nextNoteTime);
      gain.gain.linearRampToValueAtTime(0.06, nextNoteTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, nextNoteTime + (secondsPerBeat/2));
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(bgmGain);
      
      osc.start(nextNoteTime);
      osc.stop(nextNoteTime + secondsPerBeat);
      
      nextNoteTime += secondsPerBeat / 2;
      noteIndex = (noteIndex + 1) % notes.length;
    }
  }, 25);
}

function stopBGM() {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
}

// Sound Synthesizer Functions
function playWarpSound() {
  if (isMuted || !audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
  
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  osc.start(now);
  osc.stop(now + 0.5);
}

function playDockSound() {
  if (isMuted || !audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
  const now = audioCtx.currentTime;
  
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.08);
    
    gain.gain.setValueAtTime(0, now + index * 0.08);
    gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.2);
    
    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.25);
  });
}

function startThrusterSound() {
  if (isMuted || !audioCtx || thrusterSound) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  try {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate pink noise-like rocket engine hum
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // volume correction
      b6 = white * 0.115926;
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;
    
    const gain = audioCtx.createGain();
    gain.gain.value = 0.08;
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noiseNode.start(0);
    thrusterSound = { source: noiseNode, gain: gain, filter: filter };
  } catch (e) {
    console.error("Thruster sound error", e);
  }
}

function updateThrusterVolume(speedRatio) {
  if (!thrusterSound || isMuted) return;
  const targetGain = Math.min(0.08 + speedRatio * 0.15, 0.2);
  const targetFreq = 180 + speedRatio * 150;
  
  if (audioCtx) {
    thrusterSound.gain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.1);
    thrusterSound.filter.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.1);
  }
}

function stopThrusterSound() {
  if (thrusterSound) {
    try {
      thrusterSound.source.stop();
    } catch (e) {}
    thrusterSound = null;
  }
}

// Particle System
class Particle {
  constructor(x, y, vx, vy, color, size, maxLife) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = maxLife;
    this.maxLife = maxLife;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
  
  draw(ctx, cameraX, cameraY) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.size * 2;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y - cameraY, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Main Game Controller
class SpaceGame {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.shinchanImg = new Image();
    this.shinchanImg.src = "assets/shinchan_avatar.png";
    
    // Coordinates
    this.worldWidth = 7200;
    this.worldHeight = 1200;
    
    // Player
    this.player = {
      x: 350,
      y: 600,
      vx: 0,
      vy: 0,
      angle: 0,
      targetAngle: 0,
      radius: 20,
      accel: 0.28,
      maxSpeed: 8,
      friction: 0.94,
      thrustActive: false
    };
    
    // Camera
    this.camera = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Autopilot
    this.autopilot = {
      active: false,
      tx: 0,
      ty: 0
    };
    
    // Stars layers
    this.stars = [];
    this.nebulae = [];
    
    // Stations setup
    this.stations = [
      { id: "about", name: "Home Station", x: 350, y: 600, radius: 85, color: "#00f2fe", subtitle: "Ankit Dwivedi" },
      { id: "wheelseye", name: "Wheelseye Outpost", x: 1150, y: 480, radius: 90, color: "#ffd700", subtitle: "Fastag SDE 1" },
      { id: "hotstar", name: "Hotstar Hub", x: 2050, y: 720, radius: 95, color: "#ff007f", subtitle: "Disney+ SDE 1" },
      { id: "google", name: "Google Core", x: 2950, y: 450, radius: 100, color: "#39ff14", subtitle: "Geo/Ads SWE 2" },
      { id: "stripe", name: "Stripe Port", x: 3850, y: 760, radius: 95, color: "#b927fc", subtitle: "Integrations SWE" },
      { id: "agoda", name: "Agoda Resort", x: 4750, y: 480, radius: 100, color: "#00f2fe", subtitle: "Senior SWE" },
      { id: "projects", name: "Arcade Belt", x: 5650, y: 720, radius: 90, color: "#ffd700", subtitle: "Side Projects" },
      { id: "blogs", name: "Blog Nebula", x: 6550, y: 550, radius: 90, color: "#b927fc", subtitle: "Medium Articles" }
    ];
    
    this.dockedStation = null;
    this.particles = [];
    this.keys = {};
    
    // Mobile controls state
    this.joystick = {
      active: false,
      startX: 0,
      startY: 0,
      currX: 0,
      currY: 0,
      maxDist: 50,
      vx: 0,
      vy: 0
    };
    
    this.init();
  }
  
  init() {
    this.resize();
    this.generateParallaxUniverse();
    this.setupEventListeners();
    
    // Kick off loops
    window.addEventListener("resize", () => this.resize());
    this.loop();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.width = window.innerWidth;
    this.camera.height = window.innerHeight;
    
    // Scale game limits dynamically if needed, keeping world coordinates stable
    this.player.y = Math.max(100, Math.min(this.player.y, this.worldHeight - 100));
  }
  
  generateParallaxUniverse() {
    // Generate stars
    const densities = [
      { count: 400, speed: 0.15, size: 0.8, color: "rgba(255,255,255,0.4)" }, // Background distant
      { count: 180, speed: 0.35, size: 1.5, color: "rgba(0, 242, 254, 0.6)" }, // Midground neon cyan
      { count: 60, speed: 0.7, size: 2.2, color: "rgba(185, 39, 252, 0.7)" }  // Foreground neon purple
    ];
    
    densities.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        this.stars.push({
          x: Math.random() * this.worldWidth,
          y: Math.random() * this.worldHeight,
          speed: layer.speed,
          size: layer.size + Math.random() * 0.5,
          color: layer.color,
          twinkle: Math.random() < 0.3,
          twinklePhase: Math.random() * Math.PI
        });
      }
    });
    
    // Generate slow floating Nebulae blobs
    const nebColors = [
      "rgba(185, 39, 252, 0.08)", // Purple
      "rgba(0, 242, 254, 0.07)",  // Cyan
      "rgba(255, 0, 127, 0.05)"   // Pink
    ];
    for (let i = 0; i < 20; i++) {
      this.nebulae.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        radius: 200 + Math.random() * 250,
        color: nebColors[Math.floor(Math.random() * nebColors.length)],
        pulseSpeed: 0.005 + Math.random() * 0.005,
        phase: Math.random() * Math.PI
      });
    }
  }
  
  setupEventListeners() {
    // Keyboard inputs
    window.addEventListener("keydown", e => {
      this.keys[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key)) {
        e.preventDefault();
      }
      this.autopilot.active = false; // Override autopilot on manual input
      initAudio();
    });
    
    window.addEventListener("keyup", e => {
      this.keys[e.key.toLowerCase()] = false;
    });
    
    // Canvas pointerdown - trigger autopilot
    this.canvas.addEventListener("pointerdown", e => {
      // Ensure we didn't click inside active HUD button/modals
      if (e.target !== this.canvas) return;
      initAudio();
      
      const clickX = e.clientX + this.camera.x;
      const clickY = e.clientY + this.camera.y;
      
      // Don't trigger autopilot if clicking extremely close to player
      const dx = clickX - this.player.x;
      const dy = clickY - this.player.y;
      if (Math.hypot(dx, dy) > 20) {
        this.autopilot.active = true;
        this.autopilot.tx = clickX;
        this.autopilot.ty = clickY;
        
        // Visual feedback at clicked spot
        this.createAutopilotPulse(clickX, clickY);
        
        // Show indicator HUD
        const indicator = document.getElementById("autopilot-hud");
        if (indicator) {
          indicator.classList.add("active");
        }
      }
    });
    
    // Mobile Virtual Joystick Handlers
    const joyContainer = document.getElementById("joystick-container");
    const joyKnob = document.getElementById("joystick-knob");
    
    if (joyContainer && joyKnob) {
      joyContainer.addEventListener("touchstart", e => {
        e.preventDefault(); // Prevent standard page touch actions (scrolling/gestures)
        initAudio();
        const touch = e.touches[0];
        const rect = joyContainer.getBoundingClientRect();
        this.joystick.active = true;
        this.joystick.startX = rect.left + rect.width / 2;
        this.joystick.startY = rect.top + rect.height / 2;
        this.autopilot.active = false;
        
        this.updateJoystickPosition(touch.clientX, touch.clientY, joyKnob);
      });
      
      window.addEventListener("touchmove", e => {
        if (!this.joystick.active) return;
        e.preventDefault(); // Prevent scroll while dragging joystick
        const touch = e.touches[0];
        this.updateJoystickPosition(touch.clientX, touch.clientY, joyKnob);
      }, { passive: false });
      
      window.addEventListener("touchend", () => {
        if (!this.joystick.active) return;
        this.joystick.active = false;
        this.joystick.vx = 0;
        this.joystick.vy = 0;
        joyKnob.style.transform = `translate(0px, 0px)`;
      });
    }
  }
  
  updateJoystickPosition(clientX, clientY, knobEl) {
    let dx = clientX - this.joystick.startX;
    let dy = clientY - this.joystick.startY;
    const dist = Math.hypot(dx, dy);
    
    if (dist > this.joystick.maxDist) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * this.joystick.maxDist;
      dy = Math.sin(angle) * this.joystick.maxDist;
    }
    
    knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
    
    // Set direction velocities (-1 to 1 range)
    this.joystick.vx = dx / this.joystick.maxDist;
    this.joystick.vy = dy / this.joystick.maxDist;
  }
  
  createAutopilotPulse(x, y) {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        "rgba(0, 242, 254, 0.8)",
        2 + Math.random() * 2,
        25 + Math.floor(Math.random() * 15)
      ));
    }
  }
  
  createThrusterFlame() {
    // Generate trailing particles behind the spaceship opposite to its motion
    const angle = this.player.angle + Math.PI + (Math.random() * 0.4 - 0.2);
    const speed = 2 + Math.random() * 4;
    const offsetX = Math.cos(this.player.angle) * -18;
    const offsetY = Math.sin(this.player.angle) * -18;
    
    const colors = ["#00f2fe", "#b927fc", "#ff007f"];
    const col = colors[Math.floor(Math.random() * colors.length)];
    
    this.particles.push(new Particle(
      this.player.x + offsetX,
      this.player.y + offsetY,
      Math.cos(angle) * speed + this.player.vx * 0.3,
      Math.sin(angle) * speed + this.player.vy * 0.3,
      col,
      2.5 + Math.random() * 2.5,
      20 + Math.floor(Math.random() * 15)
    ));
  }
  
  createWarpParticles(x, y) {
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        "#ffffff",
        2 + Math.random() * 3,
        30 + Math.floor(Math.random() * 20)
      ));
    }
  }
  
  teleportTo(stationId) {
    initAudio();
    const target = this.stations.find(s => s.id === stationId);
    if (!target) return;
    
    this.autopilot.active = false;
    this.createWarpParticles(this.player.x, this.player.y);
    playWarpSound();
    
    // Teleport player adjacent to the station
    this.player.x = target.x - 70;
    this.player.y = target.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.angle = 0;
    
    this.createWarpParticles(this.player.x, this.player.y);
    
    // Open docking menu immediately
    this.dock(target);
  }
  
  dock(station) {
    if (this.dockedStation === station.id) return;
    this.dockedStation = station.id;
    
    playDockSound();
    
    // Trigger slide-in HUD panel content updating
    const dockPanel = document.getElementById("dock-panel");
    const navButtons = document.querySelectorAll(".hud-btn");
    
    navButtons.forEach(btn => {
      if (btn.getAttribute("data-station") === station.id) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    
    if (dockPanel) {
      this.populateDockPanel(station.id);
      dockPanel.classList.add("active");
    }
  }
  
  undock() {
    if (!this.dockedStation) return;
    this.dockedStation = null;
    
    const dockPanel = document.getElementById("dock-panel");
    const navButtons = document.querySelectorAll(".hud-btn");
    
    navButtons.forEach(btn => btn.classList.remove("active"));
    
    if (dockPanel) {
      dockPanel.classList.remove("active");
    }
  }
  
  populateDockPanel(stationId) {
    const pCompany = document.getElementById("p-company");
    const pRole = document.getElementById("p-role");
    const pPeriod = document.getElementById("p-period");
    const pBody = document.getElementById("p-body");
    
    if (!pCompany || !pRole || !pPeriod || !pBody) return;
    
    pBody.innerHTML = "";
    
    // Home / About Station
    if (stationId === "about") {
      pCompany.innerHTML = `<img src="assets/shinchan_avatar.png" style="width: 24px; height: 24px; display: inline-block; vertical-align: middle;"> ${PORTFOLIO_DATA.about.name}`;
      pRole.innerText = PORTFOLIO_DATA.about.title;
      pPeriod.innerText = PORTFOLIO_DATA.about.headline;
      
      pBody.innerHTML = `
        <h4 class="dock-section-title">Overview</h4>
        <p class="dock-desc">${PORTFOLIO_DATA.about.subheading}</p>
        <p class="dock-desc"><em>"${PORTFOLIO_DATA.about.tagline}"</em></p>
        
        <h4 class="dock-section-title">Navigation Controls</h4>
        <ul class="achievements-list">
          <li>Fly using <strong>WASD</strong> or <strong>Arrow Keys</strong>.</li>
          <li>Or simply <strong>Tap anywhere on space</strong> to autopilot there.</li>
          <li>Approach any Space Station to dock and reveal resume details.</li>
        </ul>
        
        <h4 class="dock-section-title">Social Links</h4>
        <div class="dock-tags">
          ${PORTFOLIO_DATA.social.map(s => `
            <a href="${s.url}" target="_blank" class="hud-btn" style="text-decoration:none;">
              ${s.name}
            </a>
          `).join('')}
        </div>
      `;
      return;
    }
    
    // Experience Stations (Agoda, Stripe, Google, Hotstar, Wheelseye)
    const exp = PORTFOLIO_DATA.experience.find(e => e.id === stationId);
    if (exp) {
      pCompany.innerHTML = `<span>🏢</span> ${exp.company}`;
      pRole.innerText = exp.role;
      pPeriod.innerText = `${exp.period} | ${exp.location}`;
      
      let achievementsHTML = exp.achievements.map(ach => `<li>${ach}</li>`).join("");
      pBody.innerHTML = `
        <h4 class="dock-section-title">Role Summary</h4>
        <p class="dock-desc">${exp.description}</p>
        <h4 class="dock-section-title">Key Engineering Work</h4>
        <ul class="achievements-list">
          ${achievementsHTML}
        </ul>
      `;
      return;
    }
    
    // Skills Station
    if (stationId === "projects") {
      pCompany.innerHTML = "<span>🎮</span> Projects Arcade";
      pRole.innerText = "Interactive Prototypes";
      pPeriod.innerText = "GSoC, Backend, & Game Dev";
      
      const cardsHTML = PORTFOLIO_DATA.projects.map(proj => `
        <div class="dock-item-card">
          <div class="dock-item-title">
            <span>${proj.icon} ${proj.title}</span>
          </div>
          <p class="dock-item-desc">${proj.description}</p>
          <div class="dock-item-meta">
            <span>${proj.tags.slice(0,2).join(" | ")}</span>
            <a href="${proj.link}" target="_blank" class="dock-item-link">Launch ↗</a>
          </div>
        </div>
      `).join("");
      
      pBody.innerHTML = `
        <h4 class="dock-section-title">Cabinet Directory</h4>
        ${cardsHTML}
      `;
      return;
    }
    
    // Blogs Station
    if (stationId === "blogs") {
      pCompany.innerHTML = "<span>📝</span> Blog Nebula";
      pRole.innerText = "Technical Writer";
      pPeriod.innerText = "Medium Publications";
      
      const blogsHTML = PORTFOLIO_DATA.blogs.map(blog => `
        <div class="dock-item-card">
          <div class="dock-item-title">${blog.title}</div>
          <div class="dock-item-meta">
            <span>Published: ${blog.date}</span>
            <a href="${blog.link}" target="_blank" class="dock-item-link">Read post ↗</a>
          </div>
        </div>
      `).join("");
      
      pBody.innerHTML = `
        <h4 class="dock-section-title">Log Library</h4>
        ${blogsHTML}
      `;
      return;
    }
  }
  
  updatePhysics() {
    let ax = 0;
    let ay = 0;
    this.player.thrustActive = false;
    
    // Autopilot tracking
    if (this.autopilot.active) {
      const dx = this.autopilot.tx - this.player.x;
      const dy = this.autopilot.ty - this.player.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < 8) {
        this.autopilot.active = false;
        const indicator = document.getElementById("autopilot-hud");
        if (indicator) indicator.classList.remove("active");
      } else {
        const angle = Math.atan2(dy, dx);
        this.player.targetAngle = angle;
        
        // Calculate dynamic brake approach
        const brakeDist = 120;
        const speedMultiplier = dist < brakeDist ? dist / brakeDist : 1;
        
        ax = Math.cos(angle) * this.player.accel * speedMultiplier;
        ay = Math.sin(angle) * this.player.accel * speedMultiplier;
        this.player.thrustActive = true;
      }
    }
    
    // Keyboard inputs override autopilot
    if (this.keys['w'] || this.keys['arrowup']) {
      ay = -this.player.accel;
      this.player.thrustActive = true;
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      ay = this.player.accel;
      this.player.thrustActive = true;
    }
    if (this.keys['a'] || this.keys['arrowleft']) {
      ax = -this.player.accel;
      this.player.thrustActive = true;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      ax = this.player.accel;
      this.player.thrustActive = true;
    }
    
    // Joystick overlay override
    if (this.joystick.active) {
      ax = this.joystick.vx * this.player.accel;
      ay = this.joystick.vy * this.player.accel;
      this.player.thrustActive = true;
    }
    
    // Calculate player speed and apply acceleration
    this.player.vx += ax;
    this.player.vy += ay;
    
    // Apply speed limits
    let speed = Math.hypot(this.player.vx, this.player.vy);
    if (speed > this.player.maxSpeed) {
      this.player.vx = (this.player.vx / speed) * this.player.maxSpeed;
      this.player.vy = (this.player.vy / speed) * this.player.maxSpeed;
      speed = this.player.maxSpeed;
    }
    
    // Sound synth response to speed
    if (this.player.thrustActive) {
      startThrusterSound();
      updateThrusterVolume(speed / this.player.maxSpeed);
      this.createThrusterFlame();
    } else {
      // Fade out engine sound gradually
      updateThrusterVolume(0);
      if (speed < 0.5) {
        stopThrusterSound();
      }
    }
    
    // Apply coordinates
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;
    
    // Friction
    this.player.vx *= this.player.friction;
    this.player.vy *= this.player.friction;
    
    // Space bounds confinement (horizontal corridor wrapper/bounds)
    this.player.x = Math.max(this.player.radius, Math.min(this.player.x, this.worldWidth - this.player.radius));
    this.player.y = Math.max(120, Math.min(this.player.y, this.worldHeight - 120)); // Margin for HUD
    
    // Update player facing angle based on speed heading
    if (this.player.thrustActive) {
      this.player.targetAngle = Math.atan2(ay || this.player.vy, ax || this.player.vx);
    }
    
    // Slerp angle for visual smoothness
    let da = this.player.targetAngle - this.player.angle;
    // Normalize angular difference
    da = Math.atan2(Math.sin(da), Math.cos(da));
    this.player.angle += da * 0.18;
  }
  
  updateCamera() {
    // Camera centers around the player smoothly
    const targetCamX = this.player.x - this.camera.width / 2;
    const targetCamY = this.player.y - this.camera.height / 2;
    
    this.camera.x += (targetCamX - this.camera.x) * 0.12;
    this.camera.y += (targetCamY - this.camera.y) * 0.12;
    
    // Confinement within world width
    this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldWidth - this.camera.width));
    this.camera.y = Math.max(0, Math.min(this.camera.y, this.worldHeight - this.camera.height));
  }
  
  checkDockingRanges() {
    let nearAnyStation = false;
    
    this.stations.forEach(station => {
      const dx = this.player.x - station.x;
      const dy = this.player.y - station.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < station.radius) {
        nearAnyStation = true;
        this.dock(station);
      }
    });
    
    // If not in range of any station, close the dock panels
    if (!nearAnyStation && this.dockedStation) {
      this.undock();
    }
  }
  
  // High-fidelity procedurally drawn stops
  drawStations(time) {
    this.stations.forEach(st => {
      const relativeX = st.x - this.camera.x;
      const relativeY = st.y - this.camera.y;
      
      this.ctx.save();
      
      // Draw detection proximity glow ring
      this.ctx.strokeStyle = st.color;
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.15 + Math.sin(time * 0.05 + st.x) * 0.05;
      this.ctx.beginPath();
      this.ctx.arc(relativeX, relativeY, st.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Reset alpha for structural drawing
      this.ctx.globalAlpha = 1.0;
      
      // Base Station Core Sphere
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = st.color;
      this.ctx.fillStyle = "rgba(10, 8, 26, 0.85)";
      this.ctx.strokeStyle = st.color;
      this.ctx.lineWidth = 2.5;
      
      this.ctx.beginPath();
      this.ctx.arc(relativeX, relativeY, 32, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.shadowBlur = 0; // Reset shadows for performance
      
      // STATION-SPECIFIC ANIMATIONS
      
      // 1. Home / About Station: Twirling planetary nodes
      if (st.id === "about") {
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(relativeX, relativeY, 50, 0, Math.PI * 2);
        this.ctx.stroke();
        
        const orbitAngle = time * 0.02;
        const ox = relativeX + Math.cos(orbitAngle) * 50;
        const oy = relativeY + Math.sin(orbitAngle) * 50;
        
        this.ctx.fillStyle = st.color;
        this.ctx.beginPath();
        this.ctx.arc(ox, oy, 6, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // 2. Wheelseye: Highway loop & moving truck nodes
      else if (st.id === "wheelseye") {
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        this.ctx.lineWidth = 2;
        
        // Draw miniature highway track loop
        this.ctx.beginPath();
        this.ctx.ellipse(relativeX, relativeY, 58, 22, 0.1, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Animated vehicle packet traversing track
        const t = (time * 0.015) % (Math.PI * 2);
        const vx = relativeX + Math.cos(t) * 58;
        const vy = relativeY + Math.sin(t) * 22;
        
        this.ctx.fillStyle = "#ffd700";
        this.ctx.beginPath();
        this.ctx.arc(vx, vy, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // 3. Disney+ Hotstar: Glowing play emblem & circular rays
      else if (st.id === "hotstar") {
        this.ctx.fillStyle = "rgba(255, 0, 127, 0.15)";
        this.ctx.beginPath();
        this.ctx.arc(relativeX, relativeY, 46 + Math.sin(time * 0.04) * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Render mini Play Icon in center
        this.ctx.fillStyle = "#ff007f";
        this.ctx.beginPath();
        const iconSize = 8;
        this.ctx.moveTo(relativeX - iconSize/2 + 2, relativeY - iconSize);
        this.ctx.lineTo(relativeX + iconSize + 2, relativeY);
        this.ctx.lineTo(relativeX - iconSize/2 + 2, relativeY + iconSize);
        this.ctx.closePath();
        this.ctx.fill();
      }
      
      // 4. Google: Scaling matrix data panels
      else if (st.id === "google") {
        this.ctx.strokeStyle = "rgba(57, 255, 20, 0.3)";
        this.ctx.lineWidth = 1.5;
        
        // Draw rotating cube frame
        const rot = time * 0.01;
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = rot + (Math.PI / 2) * i;
          const x1 = relativeX + Math.cos(a) * 44;
          const y1 = relativeY + Math.sin(a) * 44;
          const x2 = relativeX + Math.cos(a + Math.PI/2) * 44;
          const y2 = relativeY + Math.sin(a + Math.PI/2) * 44;
          
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
        }
        this.ctx.stroke();
        
        // Server node pulses
        this.ctx.fillStyle = "#39ff14";
        const dotPulse = 2 + Math.abs(Math.sin(time * 0.08)) * 3;
        this.ctx.beginPath();
        this.ctx.arc(relativeX - 12, relativeY, dotPulse, 0, Math.PI * 2);
        this.ctx.arc(relativeX + 12, relativeY, dotPulse, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // 5. Stripe: In-band secure webhook pipeline packet exchange
      else if (st.id === "stripe") {
        this.ctx.strokeStyle = "rgba(185, 39, 252, 0.4)";
        this.ctx.lineWidth = 2;
        // Horizontal transmission pipeline
        this.ctx.beginPath();
        this.ctx.moveTo(relativeX - 55, relativeY);
        this.ctx.lineTo(relativeX + 55, relativeY);
        this.ctx.stroke();
        
        // Moving data packets
        const packetOffset1 = (time * 1.5) % 110 - 55;
        this.ctx.fillStyle = "#b927fc";
        this.ctx.beginPath();
        this.ctx.arc(relativeX + packetOffset1, relativeY, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // 6. Agoda: Rotating vacation hotel orbital deck
      else if (st.id === "agoda") {
        this.ctx.strokeStyle = "rgba(0, 242, 254, 0.35)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(relativeX, relativeY, 48, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Solar-like arrays rotating around Agoda Resort
        const a1 = time * 0.015;
        for (let i = 0; i < 4; i++) {
          const phi = a1 + (Math.PI / 2) * i;
          const ax = relativeX + Math.cos(phi) * 48;
          const ay = relativeY + Math.sin(phi) * 48;
          
          this.ctx.fillStyle = "#00f2fe";
          this.ctx.beginPath();
          this.ctx.rect(ax - 4, ay - 4, 8, 8);
          this.ctx.fill();
        }
      }
      
      // 7. Projects: Dynamic Arcade cabinet frame
      else if (st.id === "projects") {
        this.ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
        this.ctx.lineWidth = 1.5;
        this.ctx.save();
        this.ctx.translate(relativeX, relativeY);
        this.ctx.rotate(time * 0.008);
        this.ctx.beginPath();
        this.ctx.rect(-24, -24, 48, 48);
        this.ctx.stroke();
        this.ctx.restore();
      }
      
      // 8. Blogs: Floating holographic book shells
      else if (st.id === "blogs") {
        const offset = Math.sin(time * 0.05) * 6;
        this.ctx.strokeStyle = "rgba(185, 39, 252, 0.4)";
        this.ctx.beginPath();
        this.ctx.moveTo(relativeX - 22, relativeY - 14 + offset);
        this.ctx.lineTo(relativeX + 22, relativeY - 14 + offset);
        this.ctx.lineTo(relativeX, relativeY + 18 + offset);
        this.ctx.closePath();
        this.ctx.stroke();
      }
      
      // TEXT LABELS
      this.ctx.font = "bold 13px 'Space Grotesk'";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.textAlign = "center";
      this.ctx.fillText(st.name, relativeX, relativeY + 54);
      
      this.ctx.font = "500 11px 'Inter'";
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      this.ctx.fillText(st.subtitle, relativeX, relativeY + 68);
      
      this.ctx.restore();
    });
  }
  
  drawPlayer(time) {
    const relativeX = this.player.x - this.camera.x;
    const relativeY = this.player.y - this.camera.y;
    
    this.ctx.save();
    this.ctx.translate(relativeX, relativeY);
    this.ctx.rotate(this.player.angle);
    
    // Draw Thruster Glow
    if (this.player.thrustActive) {
      this.ctx.save();
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = "#00f2fe";
      const flicker = 10 + Math.random() * 8;
      this.ctx.fillStyle = "rgba(0, 242, 254, 0.85)";
      this.ctx.beginPath();
      this.ctx.moveTo(-16, -6);
      this.ctx.lineTo(-16 - flicker, 0);
      this.ctx.lineTo(-16, 6);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }
    
    // Spaceship / Capsule Base Hull
    this.ctx.fillStyle = "#0c0a25";
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = "rgba(255, 255, 255, 0.2)";
    
    this.ctx.beginPath();
    this.ctx.moveTo(18, 0);
    this.ctx.lineTo(-10, -14);
    this.ctx.lineTo(-14, -7);
    this.ctx.lineTo(-14, 7);
    this.ctx.lineTo(-10, 14);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.shadowBlur = 0; // reset
    
    // Left & Right Wings
    this.ctx.fillStyle = "#00f2fe";
    this.ctx.beginPath();
    this.ctx.moveTo(-6, -12);
    this.ctx.lineTo(-16, -18);
    this.ctx.lineTo(-12, -9);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.fillStyle = "#b927fc";
    this.ctx.beginPath();
    this.ctx.moveTo(-6, 12);
    this.ctx.lineTo(-16, 18);
    this.ctx.lineTo(-12, 9);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Glass Dome Canopy (Draw Koala Inside!)
    this.ctx.fillStyle = "rgba(0, 242, 254, 0.25)";
    this.ctx.strokeStyle = "#00f2fe";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 9, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Drawing the mini Shinchan Astronaut image inside
    if (this.shinchanImg && this.shinchanImg.complete) {
      this.ctx.save();
      this.ctx.rotate(Math.PI / 2); // rotate so top of head points to left
      this.ctx.drawImage(this.shinchanImg, -6, -6, 12, 12);
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = "#ffd3b6"; // peach skin fallback
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }
  
  drawSpaceHighway() {
    // Draws a thin, beautiful neon track connecting the timeline stations
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(0, 242, 254, 0.08)";
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([12, 18]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.stations[0].x - this.camera.x, this.stations[0].y - this.camera.y);
    for (let i = 1; i < this.stations.length; i++) {
      this.ctx.lineTo(this.stations[i].x - this.camera.x, this.stations[i].y - this.camera.y);
    }
    this.ctx.stroke();
    this.ctx.restore();
  }
  
  drawParallaxUniverse(time) {
    // 1. Draw Nebula layer
    this.nebulae.forEach(neb => {
      const rx = neb.x - this.camera.x;
      const ry = neb.y - this.camera.y;
      
      const pulseRadius = neb.radius + Math.sin(time * neb.pulseSpeed + neb.phase) * 15;
      
      const grad = this.ctx.createRadialGradient(rx, ry, 5, rx, ry, pulseRadius);
      grad.addColorStop(0, neb.color);
      grad.addColorStop(1, "transparent");
      
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(rx, ry, pulseRadius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // 2. Draw Stars layer (parallax motion)
    this.stars.forEach(star => {
      // Calculate parallax offset
      let rx = star.x - this.camera.x * star.speed;
      let ry = star.y - this.camera.y * star.speed;
      
      // Infinite wrapping bounds checking
      if (rx < 0) rx += this.camera.width + 100;
      if (rx > this.camera.width) rx = rx % (this.camera.width + 100) - 100;
      if (ry < 0) ry += this.camera.height + 100;
      if (ry > this.camera.height) ry = ry % (this.camera.height + 100) - 100;
      
      let size = star.size;
      let alpha = 1;
      
      // Soft star twinkling
      if (star.twinkle) {
        alpha = 0.35 + Math.abs(Math.sin(time * 0.03 + star.twinklePhase)) * 0.65;
      }
      
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = star.color;
      this.ctx.beginPath();
      this.ctx.arc(rx, ry, size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }
  
  render(time) {
    // Clear screen
    this.ctx.fillStyle = "#05030f";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render Parallax Background
    this.drawParallaxUniverse(time);
    
    // Render space corridor pathway
    this.drawSpaceHighway();
    
    // Render Particles
    this.particles.forEach((part, index) => {
      part.update();
      if (part.life <= 0) {
        this.particles.splice(index, 1);
      } else {
        part.draw(this.ctx, this.camera.x, this.camera.y);
      }
    });
    
    // Render Stations
    this.drawStations(time);
    
    // Render Player Spaceship
    this.drawPlayer(time);
  }
  
  loop(time = 0) {
    // Main loop
    const classicView = document.getElementById("classic-view");
    const isClassic = classicView && classicView.style.display === "block";
    
    // Stop game loops if we are in classic mode to conserve battery/performance
    if (!isClassic) {
      this.updatePhysics();
      this.updateCamera();
      this.checkDockingRanges();
      this.render(time);
    }
    
    requestAnimationFrame(t => this.loop(t));
  }
}

// Entry Point Init
let gameInstance = null;

window.addEventListener("DOMContentLoaded", () => {
  // --- UI Interactions ---
  
  // Welcome Overlay
  const startTourBtn = document.getElementById("start-tour-btn");
  const welcomeOverlay = document.getElementById("welcome-overlay");
  
  if (startTourBtn && welcomeOverlay) {
    startTourBtn.addEventListener("click", () => {
      welcomeOverlay.classList.add("hidden");
      
      const audioBtn = document.getElementById("audio-btn");
      if (isMuted && audioBtn) {
        audioBtn.click(); // Auto-unmute when starting tour
      }
      
      setTimeout(() => {
        if (welcomeOverlay.parentNode) {
          welcomeOverlay.parentNode.removeChild(welcomeOverlay);
        }
      }, 500);
    });
  }

  gameInstance = new SpaceGame();
  
  // Audio toggle controls
  const audioBtn = document.getElementById("audio-btn");
  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      initAudio();
      isMuted = !isMuted;
      
      if (isMuted) {
        audioBtn.innerHTML = "🔇";
        audioBtn.title = "Unmute Audio";
        audioBtn.classList.remove("active");
        stopThrusterSound();
        stopBGM();
      } else {
        audioBtn.innerHTML = "🔊";
        audioBtn.title = "Mute Audio";
        audioBtn.classList.add("active");
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        startBGM();
        playDockSound();
      }
    });
  }
  
  // Fast travel button mapping
  const fastTravelButtons = document.querySelectorAll(".fast-travel");
  fastTravelButtons.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const station = btn.getAttribute("data-station");
      if (gameInstance) {
        gameInstance.teleportTo(station);
      }
    });
  });
  
  // Close docking overlay button
  const closePanelBtn = document.getElementById("close-panel");
  if (closePanelBtn) {
    closePanelBtn.addEventListener("click", () => {
      if (gameInstance) {
        // Undock and nudge player slightly left away from the station to prevent instant re-docking
        const st = gameInstance.stations.find(s => s.id === gameInstance.dockedStation);
        if (st) {
          gameInstance.player.x = st.x - st.radius - 25;
        }
        gameInstance.undock();
      }
    });
  }
  
  // Mode Switch Trigger (Game <-> Classic Resume)
  const modeSwitchBtn = document.getElementById("mode-switch-btn");
  const gameView = document.getElementById("game-view");
  const classicView = document.getElementById("classic-view");
  
  if (modeSwitchBtn && gameView && classicView) {
    modeSwitchBtn.addEventListener("click", () => {
      initAudio();
      const isClassicActive = classicView.style.display === "block";
      
      if (isClassicActive) {
        // Switch to Game Mode
        classicView.style.display = "none";
        gameView.style.display = "block";
        document.body.classList.remove("classic-mode");
        modeSwitchBtn.innerHTML = "🚀 <span>Game Mode</span>";
        if (gameInstance) {
          gameInstance.resize();
        }
      } else {
        // Switch to Classic Mode
        gameView.style.display = "none";
        classicView.style.display = "block";
        document.body.classList.add("classic-mode");
        modeSwitchBtn.innerHTML = "📄 <span>Classic Mode</span>";
        stopThrusterSound();
        
        // Render classic content dynamically on transition
        renderClassicResume();
        triggerScrollAnimations();
      }
    });
  }
});

// Dynamic rendering of Classic Resume View
function renderClassicResume() {
  const container = document.getElementById("classic-content");
  if (!container || container.querySelector('section')) return; // Avoid redundant rendering
  
  // 1. About / Hero Section
  const aboutHtml = `
    <section id="c-about" class="classic-section show">
      <div class="hero-content">
        <div class="hero-avatar-wrapper">
          <img src="assets/shinchan_avatar.png" alt="Avatar" class="hero-avatar" style="object-fit: contain; width: 100%; height: 100%; border-radius: 50%;">
        </div>
        <h1 class="hero-name">${PORTFOLIO_DATA.about.name}</h1>
        <p class="hero-tagline">${PORTFOLIO_DATA.about.title}</p>
        <p class="hero-bio">${PORTFOLIO_DATA.about.subheading}</p>
        <p class="hero-bio" style="font-style:italic;">"${PORTFOLIO_DATA.about.tagline}"</p>
        <div class="hero-socials">
          ${PORTFOLIO_DATA.social.map(s => `
            <a href="${s.url}" target="_blank" class="hud-btn">
              ${s.name}
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `;
  
  // 2. Experience Section
  const expHtml = `
    <section id="c-experience" class="classic-section">
      <h2 class="classic-title">🏢 Career Journey</h2>
      <div class="classic-timeline">
        ${PORTFOLIO_DATA.experience.map(exp => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-card glass-panel">
              <div class="timeline-header">
                <div>
                  <h3 style="font-family:var(--font-game); font-size:1.3rem;">${exp.company}</h3>
                  <p style="color:var(--neon-cyan); font-weight:600; font-size:0.95rem;">${exp.role}</p>
                </div>
                <div style="text-align:right;">
                  <span class="tag-badge" style="color:var(--text-muted);">${exp.period}</span>
                  <p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">${exp.location}</p>
                </div>
              </div>
              <p class="dock-desc">${exp.description}</p>
              <h4 class="dock-section-title">Key Work</h4>
              <ul class="achievements-list">
                ${exp.achievements.map(ach => `<li>${ach}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
  
  // 3. Skills Section
  const skillsHtml = `
    <section id="c-skills" class="classic-section">
      <h2 class="classic-title">⚙️ Engineering Skills</h2>
      <div class="skills-container">
        <div class="skills-card glass-panel">
          <h4>Languages & Frameworks</h4>
          <div class="skills-list">
            ${PORTFOLIO_DATA.skills.languages.map(s => `<span class="tag-badge">${s}</span>`).join('')}
          </div>
        </div>
        <div class="skills-card glass-panel">
          <h4>Databases & Caching</h4>
          <div class="skills-list">
            ${PORTFOLIO_DATA.skills.databases.map(s => `<span class="tag-badge">${s}</span>`).join('')}
          </div>
        </div>
        <div class="skills-card glass-panel">
          <h4>Tools & Streaming</h4>
          <div class="skills-list">
            ${PORTFOLIO_DATA.skills.infrastructure.map(s => `<span class="tag-badge">${s}</span>`).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
  
  // 4. Projects Section
  const projHtml = `
    <section id="c-projects" class="classic-section">
      <h2 class="classic-title">🎮 Highlight Projects</h2>
      <div class="projects-grid">
        ${PORTFOLIO_DATA.projects.map(proj => `
          <div class="project-card glass-panel">
            <div class="project-card-header">
              <span class="project-icon">${proj.icon}</span>
              <h3 class="project-title">${proj.title}</h3>
            </div>
            <p class="project-desc">${proj.description}</p>
            <div class="project-footer">
              <div class="dock-tags">
                ${proj.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}
              </div>
              <a href="${proj.link}" target="_blank" class="hud-btn" style="padding:6px 12px; font-size:0.75rem;">Launch ↗</a>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
  
  // 5. Blogs Section
  const blogsHtml = `
    <section id="c-blogs" class="classic-section">
      <h2 class="classic-title">📝 Medium Publications</h2>
      <div class="blogs-grid">
        ${PORTFOLIO_DATA.blogs.map(blog => `
          <div class="blog-card glass-panel">
            <h3 class="blog-header">${blog.title}</h3>
            <div class="blog-footer">
              <span>Published: ${blog.date}</span>
              <a href="${blog.link}" target="_blank" class="blog-link">Read article ↗</a>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
  
  container.innerHTML = aboutHtml + expHtml + skillsHtml + projHtml + blogsHtml;
}

// Scroll animation trigger for classic mode elements
function triggerScrollAnimations() {
  const classicScrollArea = document.getElementById("classic-view");
  if (!classicScrollArea) return;
  
  const handleScroll = () => {
    const sections = document.querySelectorAll(".classic-section");
    const viewportHeight = window.innerHeight;
    
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      // If element is partially visible inside scroll boundary
      if (rect.top < viewportHeight - 100) {
        sec.classList.add("show");
      }
    });
  };
  
  classicScrollArea.addEventListener("scroll", handleScroll);
  // Trigger initial check
  setTimeout(handleScroll, 100);
}
