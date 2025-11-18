/**
 * Defragger Mini-Game
 * Grid-based puzzle where players align colored blocks
 * Resource sink: costs cpuCycles to play
 * Rewards: codeFragments + small chance for memoryBlocks
 */

export const defragger = {
  id: 'defragger',
  title: 'System Defragger',
  resourceManager: null,
  gameState: null,

  // Game config
  gridSize: 5,
  colors: ['#ff4444', '#44ff44', '#4444ff', '#ffff44'],
  timeLimit: 60, // seconds
  cpuCycleCost: 30,

  // Game state
  grid: [],
  selectedTile: null,
  score: 0,
  timeRemaining: 0,
  gameActive: false,
  gameInterval: null,

  createContent(rootEl) {
    rootEl.innerHTML = `
      <div class="defragger-container">
        <!-- Header -->
        <div class="defragger-header">
          <h3>🔧 System Defragger</h3>
          <p class="defragger-subtitle">Reorganize memory blocks to defragment the system</p>
        </div>

        <!-- Game Info -->
        <div class="defragger-info">
          <div class="info-item">
            <span class="info-label">Cost:</span>
            <span class="info-value">${this.cpuCycleCost} CPU Cycles</span>
          </div>
          <div class="info-item">
            <span class="info-label">Reward:</span>
            <span class="info-value">3-5 Code Fragments</span>
          </div>
          <div class="info-item">
            <span class="info-label">Bonus:</span>
            <span class="info-value">5% chance for Memory Block</span>
          </div>
        </div>

        <!-- Game Area (Hidden until started) -->
        <div class="defragger-game" id="defrag-game" style="display: none;">
          <!-- Game Stats -->
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">Score:</span>
              <span id="defrag-score" class="stat-value">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Time:</span>
              <span id="defrag-time" class="stat-value">60</span>
            </div>
            <div class="stat">
              <span class="stat-label">Moves:</span>
              <span id="defrag-moves" class="stat-value">0</span>
            </div>
          </div>

          <!-- Grid -->
          <div class="defragger-grid" id="defrag-grid">
            <!-- Grid tiles will be rendered here -->
          </div>

          <!-- Instructions -->
          <div class="game-instructions">
            <p>🎯 <strong>How to play:</strong> Click two adjacent tiles to swap them. Match 3+ tiles of the same color in a row or column to score points!</p>
          </div>
        </div>

        <!-- Start Screen -->
        <div class="defragger-start" id="defrag-start">
          <p class="start-description">
            The system memory is fragmented! Run the defragmentation protocol to reorganize memory blocks.
            Match colored blocks to score points and earn rewards.
          </p>
          <button id="btn-start-defrag" class="btn-primary">
            Start Defrag (${this.cpuCycleCost} CPU Cycles)
          </button>
          <div id="defrag-start-message" class="start-message"></div>
        </div>

        <!-- Results Screen (Hidden) -->
        <div class="defragger-results" id="defrag-results" style="display: none;">
          <h3>Defragmentation Complete!</h3>
          <div class="results-stats">
            <div class="result-stat">
              <span class="result-label">Final Score:</span>
              <span id="result-score" class="result-value">0</span>
            </div>
            <div class="result-stat">
              <span class="result-label">Rewards:</span>
              <div id="result-rewards"></div>
            </div>
          </div>
          <button id="btn-play-again" class="btn-primary">
            Play Again (${this.cpuCycleCost} CPU Cycles)
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners(rootEl);
  },

  /**
   * Set resource manager reference
   */
  setResourceManager(rm) {
    this.resourceManager = rm;
  },

  /**
   * Set game state reference
   */
  setGameState(gs) {
    this.gameState = gs;
  },

  /**
   * Attach event listeners
   */
  attachEventListeners(rootEl) {
    // Start button
    rootEl.querySelector('#btn-start-defrag')?.addEventListener('click', () => {
      this.startGame(rootEl);
    });

    // Play again button
    rootEl.querySelector('#btn-play-again')?.addEventListener('click', () => {
      this.startGame(rootEl);
    });
  },

  /**
   * Start the game
   */
  startGame(rootEl) {
    // Check if can afford
    if (!this.resourceManager || !this.resourceManager.canAfford({ cpuCycles: this.cpuCycleCost })) {
      const msgEl = rootEl.querySelector('#defrag-start-message');
      msgEl.textContent = `Not enough CPU Cycles! Need ${this.cpuCycleCost}.`;
      msgEl.className = 'start-message error';
      return;
    }

    // Spend resources
    this.resourceManager.spend('cpuCycles', this.cpuCycleCost);

    // Initialize game
    this.score = 0;
    this.moves = 0;
    this.timeRemaining = this.timeLimit;
    this.gameActive = true;
    this.selectedTile = null;

    // Hide start/results screens
    rootEl.querySelector('#defrag-start').style.display = 'none';
    rootEl.querySelector('#defrag-results').style.display = 'none';

    // Show game area
    rootEl.querySelector('#defrag-game').style.display = 'block';

    // Initialize grid
    this.initializeGrid();
    this.renderGrid(rootEl);

    // Start timer
    this.startTimer(rootEl);
  },

  /**
   * Initialize grid with random colors
   */
  initializeGrid() {
    this.grid = [];
    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col] = this.getRandomColor();
      }
    }

    // Ensure no initial matches (for fairness)
    this.clearInitialMatches();
  },

  /**
   * Clear any initial matches
   */
  clearInitialMatches() {
    let changed = true;
    while (changed) {
      changed = false;
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          const color = this.grid[row][col];

          // Check horizontal match
          if (col >= 2 && this.grid[row][col - 1] === color && this.grid[row][col - 2] === color) {
            this.grid[row][col] = this.getRandomColor();
            changed = true;
          }

          // Check vertical match
          if (row >= 2 && this.grid[row - 1][col] === color && this.grid[row - 2][col] === color) {
            this.grid[row][col] = this.getRandomColor();
            changed = true;
          }
        }
      }
    }
  },

  /**
   * Get random color
   */
  getRandomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  },

  /**
   * Render grid
   */
  renderGrid(rootEl) {
    const gridEl = rootEl.querySelector('#defrag-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const tile = document.createElement('div');
        tile.className = 'defrag-tile';
        tile.dataset.row = row;
        tile.dataset.col = col;
        tile.style.backgroundColor = this.grid[row][col];

        if (this.selectedTile && this.selectedTile.row === row && this.selectedTile.col === col) {
          tile.classList.add('tile-selected');
        }

        tile.addEventListener('click', () => {
          this.handleTileClick(row, col, rootEl);
        });

        gridEl.appendChild(tile);
      }
    }

    // Update stats
    rootEl.querySelector('#defrag-score').textContent = this.score;
    rootEl.querySelector('#defrag-moves').textContent = this.moves || 0;
  },

  /**
   * Handle tile click
   */
  handleTileClick(row, col, rootEl) {
    if (!this.gameActive) return;

    if (!this.selectedTile) {
      // First selection
      this.selectedTile = { row, col };
      this.renderGrid(rootEl);
    } else {
      // Second selection - check if adjacent
      const dr = Math.abs(this.selectedTile.row - row);
      const dc = Math.abs(this.selectedTile.col - col);

      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        // Adjacent - swap
        this.swapTiles(this.selectedTile.row, this.selectedTile.col, row, col);
        this.moves = (this.moves || 0) + 1;
        this.selectedTile = null;

        // Check for matches
        this.checkMatches(rootEl);
        this.renderGrid(rootEl);
      } else {
        // Not adjacent - reselect
        this.selectedTile = { row, col };
        this.renderGrid(rootEl);
      }
    }
  },

  /**
   * Swap two tiles
   */
  swapTiles(row1, col1, row2, col2) {
    const temp = this.grid[row1][col1];
    this.grid[row1][col1] = this.grid[row2][col2];
    this.grid[row2][col2] = temp;
  },

  /**
   * Check for matches
   */
  checkMatches(rootEl) {
    const matches = [];

    // Check horizontal matches
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize - 2; col++) {
        const color = this.grid[row][col];
        if (color === this.grid[row][col + 1] && color === this.grid[row][col + 2]) {
          matches.push({ row, col, direction: 'horizontal', length: 3 });
          // Check for longer matches
          let length = 3;
          while (col + length < this.gridSize && this.grid[row][col + length] === color) {
            length++;
          }
          matches[matches.length - 1].length = length;
          col += length - 1; // Skip checked tiles
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize - 2; row++) {
        const color = this.grid[row][col];
        if (color === this.grid[row + 1][col] && color === this.grid[row + 2][col]) {
          matches.push({ row, col, direction: 'vertical', length: 3 });
          // Check for longer matches
          let length = 3;
          while (row + length < this.gridSize && this.grid[row + length][col] === color) {
            length++;
          }
          matches[matches.length - 1].length = length;
          row += length - 1; // Skip checked tiles
        }
      }
    }

    // Clear matches and award points
    if (matches.length > 0) {
      matches.forEach(match => {
        const points = match.length * 10;
        this.score += points;

        // Clear matched tiles
        if (match.direction === 'horizontal') {
          for (let i = 0; i < match.length; i++) {
            this.grid[match.row][match.col + i] = this.getRandomColor();
          }
        } else {
          for (let i = 0; i < match.length; i++) {
            this.grid[match.row + i][match.col] = this.getRandomColor();
          }
        }
      });
    }
  },

  /**
   * Start timer
   */
  startTimer(rootEl) {
    this.gameInterval = setInterval(() => {
      this.timeRemaining--;

      const timeEl = rootEl.querySelector('#defrag-time');
      if (timeEl) {
        timeEl.textContent = this.timeRemaining;
      }

      if (this.timeRemaining <= 0) {
        this.endGame(rootEl);
      }
    }, 1000);
  },

  /**
   * End game
   */
  endGame(rootEl) {
    this.gameActive = false;
    clearInterval(this.gameInterval);
    this.gameInterval = null;

    // Hide game area
    rootEl.querySelector('#defrag-game').style.display = 'none';

    // Calculate rewards
    const baseReward = Math.min(3 + Math.floor(this.score / 100), 5); // 3-5 based on score
    const bonusChance = Math.random();
    const memoryBlockReward = bonusChance < 0.05 ? 1 : 0; // 5% chance

    // Grant rewards
    if (this.resourceManager) {
      this.resourceManager.add('codeFragments', baseReward, 'defragger');
      if (memoryBlockReward > 0) {
        this.resourceManager.add('memoryBlocks', memoryBlockReward, 'defragger');
      }
    }

    // Show results
    const resultsEl = rootEl.querySelector('#defrag-results');
    resultsEl.style.display = 'block';

    rootEl.querySelector('#result-score').textContent = this.score;

    const rewardsEl = rootEl.querySelector('#result-rewards');
    rewardsEl.innerHTML = `
      <div class="reward-item">+${baseReward} Code Fragments</div>
      ${memoryBlockReward > 0 ? '<div class="reward-item bonus">+1 Memory Block (BONUS!)</div>' : ''}
    `;
  }
};
