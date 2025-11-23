/**
 * Firewall Defense Mini-Game
 * Simple clicker defense game - click incoming malware packets to block them
 * Resource sink: costs entropyDust to play
 * Rewards: gold, XP, rare chance for items
 */

export const firewallDefense = {
  id: 'firewallDefense',
  title: 'Firewall Defense Protocol',
  resourceManager: null,

  // Game config
  entropyDustCost: 15,
  duration: 45, // seconds
  spawnInterval: 1500, // ms between spawns
  packetSpeed: 3000, // ms to cross screen

  // Game state
  score: 0,
  blocked: 0,
  escaped: 0,
  timeRemaining: 0,
  gameActive: false,
  gameInterval: null,
  spawnInterval: null,
  packets: [], // Active packets on screen
  nextPacketId: 0,

  createContent(rootEl) {
    rootEl.innerHTML = `
      <div class="firewall-container">
        <!-- Header -->
        <div class="firewall-header">
          <h3>🛡️ Firewall Defense Protocol</h3>
          <p class="firewall-subtitle">Protect the system from malware intrusion</p>
        </div>

        <!-- Game Info -->
        <div class="firewall-info">
          <div class="info-item">
            <span class="info-label">Cost:</span>
            <span class="info-value">${this.entropyDustCost} Entropy Dust</span>
          </div>
          <div class="info-item">
            <span class="info-label">Duration:</span>
            <span class="info-value">${this.duration} seconds</span>
          </div>
          <div class="info-item">
            <span class="info-label">Rewards:</span>
            <span class="info-value">Gold + XP</span>
          </div>
        </div>

        <!-- Game Area (Hidden until started) -->
        <div class="firewall-game" id="fw-game" style="display: none;">
          <!-- Game Stats -->
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">Time:</span>
              <span id="fw-time" class="stat-value">45</span>
            </div>
            <div class="stat">
              <span class="stat-label">Score:</span>
              <span id="fw-score" class="stat-value">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Blocked:</span>
              <span id="fw-blocked" class="stat-value success">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Escaped:</span>
              <span id="fw-escaped" class="stat-value error">0</span>
            </div>
          </div>

          <!-- Defense Grid -->
          <div class="firewall-grid" id="fw-grid">
            <div class="lane" id="lane-0"></div>
            <div class="lane" id="lane-1"></div>
            <div class="lane" id="lane-2"></div>
            <div class="lane" id="lane-3"></div>
          </div>

          <!-- Instructions -->
          <div class="game-instructions">
            <p>🎯 <strong>Click the red malware packets</strong> before they reach the right side of the screen!</p>
          </div>
        </div>

        <!-- Start Screen -->
        <div class="firewall-start" id="fw-start">
          <p class="start-description">
            The system is under attack! Malicious packets are attempting to breach the firewall.
            Click incoming threats to neutralize them before they penetrate system defenses.
          </p>
          <button id="btn-start-fw" class="btn btn-primary btn-lg btn-block">
            🛡️ Start Defense <span class="small-text">(${this.entropyDustCost} Entropy Dust)</span>
          </button>
          <div id="fw-start-message" class="start-message"></div>
        </div>

        <!-- Results Screen (Hidden) -->
        <div class="firewall-results" id="fw-results" style="display: none;">
          <h3>Defense Protocol Complete</h3>
          <div class="results-stats">
            <div class="result-stat">
              <span class="result-label">Final Score:</span>
              <span id="result-fw-score" class="result-value">0</span>
            </div>
            <div class="result-stat">
              <span class="result-label">Blocked:</span>
              <span id="result-fw-blocked" class="result-value success">0</span>
            </div>
            <div class="result-stat">
              <span class="result-label">Escaped:</span>
              <span id="result-fw-escaped" class="result-value error">0</span>
            </div>
            <div class="result-stat">
              <span class="result-label">Accuracy:</span>
              <span id="result-fw-accuracy" class="result-value">0%</span>
            </div>
            <div class="result-stat">
              <span class="result-label">Rewards:</span>
              <div id="result-fw-rewards"></div>
            </div>
          </div>
          <button id="btn-play-again-fw" class="btn btn-primary btn-lg btn-block">
            🛡️ Play Again <span class="small-text">(${this.entropyDustCost} Entropy Dust)</span>
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners(rootEl);
  },

  setResourceManager(rm) {
    this.resourceManager = rm;
  },

  attachEventListeners(rootEl) {
    rootEl.querySelector('#btn-start-fw')?.addEventListener('click', () => {
      this.startGame(rootEl);
    });

    rootEl.querySelector('#btn-play-again-fw')?.addEventListener('click', () => {
      this.startGame(rootEl);
    });
  },

  startGame(rootEl) {
    // Check if can afford
    if (!this.resourceManager || !this.resourceManager.canAfford({ entropyDust: this.entropyDustCost })) {
      const msgEl = rootEl.querySelector('#fw-start-message');
      msgEl.textContent = `Not enough Entropy Dust! Need ${this.entropyDustCost}.`;
      msgEl.className = 'start-message error';
      return;
    }

    // Spend resources
    this.resourceManager.spend('entropyDust', this.entropyDustCost);

    // Initialize game
    this.score = 0;
    this.blocked = 0;
    this.escaped = 0;
    this.timeRemaining = this.duration;
    this.gameActive = true;
    this.packets = [];
    this.nextPacketId = 0;

    // Hide start/results screens
    rootEl.querySelector('#fw-start').style.display = 'none';
    rootEl.querySelector('#fw-results').style.display = 'none';

    // Show game area
    rootEl.querySelector('#fw-game').style.display = 'block';

    // Clear lanes
    for (let i = 0; i < 4; i++) {
      const lane = rootEl.querySelector(`#lane-${i}`);
      if (lane) lane.innerHTML = '';
    }

    // Update UI
    this.updateUI(rootEl);

    // Start timer
    this.startTimer(rootEl);

    // Start spawning packets
    this.startSpawning(rootEl);
  },

  startTimer(rootEl) {
    this.gameInterval = setInterval(() => {
      this.timeRemaining--;

      const timeEl = rootEl.querySelector('#fw-time');
      if (timeEl) {
        timeEl.textContent = this.timeRemaining;
      }

      if (this.timeRemaining <= 0) {
        this.endGame(rootEl);
      }
    }, 1000);
  },

  startSpawning(rootEl) {
    this.spawnPacket(rootEl); // Spawn first immediately

    this.spawnIntervalHandle = setInterval(() => {
      if (this.gameActive) {
        this.spawnPacket(rootEl);
      }
    }, this.spawnInterval);
  },

  spawnPacket(rootEl) {
    const laneIndex = Math.floor(Math.random() * 4);
    const lane = rootEl.querySelector(`#lane-${laneIndex}`);
    if (!lane) return;

    const packetId = this.nextPacketId++;
    const packet = document.createElement('div');
    packet.className = 'malware-packet';
    packet.dataset.packetId = packetId;
    packet.textContent = '⚠️';

    // Add click handler
    packet.addEventListener('click', () => {
      if (this.gameActive) {
        this.blockPacket(packetId, packet, rootEl);
      }
    });

    lane.appendChild(packet);

    // Track packet
    this.packets.push({
      id: packetId,
      element: packet,
      lane: laneIndex,
      spawnTime: Date.now()
    });

    // Animate packet moving right
    setTimeout(() => {
      packet.style.transform = 'translateX(100%)';
    }, 50);

    // Check if packet escaped after animation
    setTimeout(() => {
      if (this.gameActive && packet.parentElement) {
        // Packet escaped
        this.packetEscaped(packetId, packet, rootEl);
      }
    }, this.packetSpeed);
  },

  blockPacket(packetId, packetEl, rootEl) {
    // Remove packet from array
    this.packets = this.packets.filter(p => p.id !== packetId);

    // Visual feedback
    packetEl.classList.add('blocked');
    packetEl.textContent = '✓';

    // Update stats
    this.blocked++;
    this.score += 10;

    // Remove from DOM
    setTimeout(() => {
      if (packetEl.parentElement) {
        packetEl.parentElement.removeChild(packetEl);
      }
    }, 200);

    this.updateUI(rootEl);
  },

  packetEscaped(packetId, packetEl, rootEl) {
    // Remove packet from array
    this.packets = this.packets.filter(p => p.id !== packetId);

    // Visual feedback
    packetEl.classList.add('escaped');

    // Update stats
    this.escaped++;

    // Remove from DOM
    setTimeout(() => {
      if (packetEl.parentElement) {
        packetEl.parentElement.removeChild(packetEl);
      }
    }, 200);

    this.updateUI(rootEl);
  },

  updateUI(rootEl) {
    rootEl.querySelector('#fw-score').textContent = this.score;
    rootEl.querySelector('#fw-blocked').textContent = this.blocked;
    rootEl.querySelector('#fw-escaped').textContent = this.escaped;
  },

  endGame(rootEl) {
    this.gameActive = false;

    // Clear intervals
    clearInterval(this.gameInterval);
    clearInterval(this.spawnIntervalHandle);
    this.gameInterval = null;
    this.spawnIntervalHandle = null;

    // Clear remaining packets
    for (let i = 0; i < 4; i++) {
      const lane = rootEl.querySelector(`#lane-${i}`);
      if (lane) lane.innerHTML = '';
    }

    // Hide game area
    rootEl.querySelector('#fw-game').style.display = 'none';

    // Calculate rewards
    const accuracy = this.blocked + this.escaped > 0
      ? Math.round((this.blocked / (this.blocked + this.escaped)) * 100)
      : 0;

    // Base rewards scale with performance
    const goldReward = Math.floor(50 + (this.score / 2));
    const xpReward = Math.floor(20 + (this.score / 5));

    // Bonus for high accuracy
    let bonusGold = 0;
    if (accuracy >= 90) {
      bonusGold = 50;
    } else if (accuracy >= 75) {
      bonusGold = 25;
    }

    // Grant rewards
    if (this.resourceManager) {
      this.resourceManager.add('gold', goldReward + bonusGold, 'firewallDefense');
      // XP would be added to gameState if accessible
    }

    // Show results
    const resultsEl = rootEl.querySelector('#fw-results');
    resultsEl.style.display = 'block';

    rootEl.querySelector('#result-fw-score').textContent = this.score;
    rootEl.querySelector('#result-fw-blocked').textContent = this.blocked;
    rootEl.querySelector('#result-fw-escaped').textContent = this.escaped;
    rootEl.querySelector('#result-fw-accuracy').textContent = `${accuracy}%`;

    const rewardsEl = rootEl.querySelector('#result-fw-rewards');
    rewardsEl.innerHTML = `
      <div class="reward-item">+${goldReward} Gold</div>
      <div class="reward-item">+${xpReward} XP</div>
      ${bonusGold > 0 ? `<div class="reward-item bonus">+${bonusGold} Bonus Gold (${accuracy}% accuracy!)</div>` : ''}
    `;
  }
};
