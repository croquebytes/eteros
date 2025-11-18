// ===== Speculation Terminal =====
// A simple resource sink mini-game where players can gamble gold for rewards

import { gameState } from '../../state/enhancedGameState.js';
import { showToast } from '../toastManager.js';

// Speculation game config
const SPECULATION_CONFIG = {
  slots: {
    cost: 100,
    outcomes: [
      { weight: 40, reward: { gold: 50 }, message: 'Small loss... -50 gold' },
      { weight: 30, reward: { gold: 120 }, message: 'Small win! +20 gold' },
      { weight: 15, reward: { gold: 200 }, message: 'Good win! +100 gold' },
      { weight: 10, reward: { gold: 500 }, message: 'BIG WIN! +400 gold!' },
      { weight: 4, reward: { gold: 1000, soulCores: 10 }, message: 'JACKPOT! +900 gold +10 cores!' },
      { weight: 1, reward: { gold: 5000, soulCores: 50 }, message: '💎 MEGA JACKPOT! 💎' }
    ]
  },
  highLow: {
    cost: 50,
    winMultiplier: 1.8,
    message: 'Guess if next value is Higher or Lower than'
  },
  lottery: {
    cost: 500,
    outcomes: [
      { weight: 70, reward: { gold: 0 }, message: 'No match...' },
      { weight: 20, reward: { gold: 500 }, message: 'One match! Break even' },
      { weight: 7, reward: { gold: 2000, soulCores: 5 }, message: 'Two matches! Nice!' },
      { weight: 2, reward: { gold: 5000, soulCores: 20 }, message: 'Three matches! Excellent!' },
      { weight: 1, reward: { gold: 20000, soulCores: 100, legendaryShards: 5 }, message: '🎰 LOTTERY GRAND PRIZE! 🎰' }
    ]
  }
};

export const speculationTerminalApp = {
  id: 'speculationTerminal',
  title: 'Speculation Terminal',

  createContent(rootEl) {
    rootEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px; height: 100%; overflow-y: auto;">

        <!-- Header -->
        <div style="background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 6px; padding: 12px;">
          <div style="font-size: 16px; font-weight: bold; color: #fca5a5; margin-bottom: 4px;">⚠️ Speculation Terminal</div>
          <div style="font-size: 11px; color: #dc2626;">WARNING: Gambling is risky. Play responsibly.</div>
          <div style="font-size: 11px; color: #999; margin-top: 6px;">Your Gold: <span id="spec-gold-display">0</span></div>
        </div>

        <!-- Slot Machine -->
        <div class="spec-game-card">
          <div class="spec-game-title">🎰 Slot Machine</div>
          <div class="spec-game-desc">Cost: 100 gold | Spin for random rewards</div>
          <div class="spec-game-results" id="slots-result"></div>
          <button class="spec-game-btn" id="slots-btn">Spin Slots (100g)</button>
        </div>

        <!-- High/Low -->
        <div class="spec-game-card">
          <div class="spec-game-title">📊 High/Low</div>
          <div class="spec-game-desc">Cost: 50 gold | Guess higher or lower</div>
          <div class="spec-game-results" id="highlow-result">
            <div style="font-size: 32px; font-weight: bold; margin: 8px 0;" id="highlow-number">50</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="spec-game-btn" id="highlow-high-btn" style="flex: 1;">Higher (50g)</button>
            <button class="spec-game-btn" id="highlow-low-btn" style="flex: 1;">Lower (50g)</button>
          </div>
        </div>

        <!-- Lottery -->
        <div class="spec-game-card">
          <div class="spec-game-title">🎫 Lottery</div>
          <div class="spec-game-desc">Cost: 500 gold | Match numbers for big rewards</div>
          <div class="spec-game-results" id="lottery-result"></div>
          <button class="spec-game-btn" id="lottery-btn">Buy Ticket (500g)</button>
        </div>

        <!-- Statistics -->
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 12px; margin-top: auto;">
          <div style="font-size: 12px; color: #999; margin-bottom: 6px;">Session Stats:</div>
          <div style="font-size: 11px; color: #666;">
            <div>Slots Played: <span id="slots-count">0</span></div>
            <div>High/Low Played: <span id="highlow-count">0</span></div>
            <div>Lottery Played: <span id="lottery-count">0</span></div>
          </div>
        </div>

      </div>
    `;

    // Add CSS if not already present
    if (!document.getElementById('spec-terminal-styles')) {
      const style = document.createElement('style');
      style.id = 'spec-terminal-styles';
      style.textContent = `
        .spec-game-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
        }
        .spec-game-title {
          font-size: 14px;
          font-weight: bold;
          color: #60a5fa;
          margin-bottom: 4px;
        }
        .spec-game-desc {
          font-size: 11px;
          color: #999;
          margin-bottom: 12px;
        }
        .spec-game-results {
          min-height: 60px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 12px;
          font-size: 13px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .spec-game-btn {
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          border-radius: 6px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        .spec-game-btn:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-1px);
        }
        .spec-game-btn:active {
          transform: translateY(0px);
        }
        .spec-game-btn:disabled {
          background: rgba(100, 100, 100, 0.3);
          cursor: not-allowed;
          opacity: 0.5;
        }
      `;
      document.head.appendChild(style);
    }

    // Initialize
    updateGoldDisplay();
    updateStats();

    // Slots button
    rootEl.querySelector('#slots-btn').addEventListener('click', () => {
      playSlots();
    });

    // High/Low buttons
    const currentNumber = Math.floor(Math.random() * 100);
    rootEl.querySelector('#highlow-number').textContent = currentNumber;

    rootEl.querySelector('#highlow-high-btn').addEventListener('click', () => {
      playHighLow('high', currentNumber);
    });

    rootEl.querySelector('#highlow-low-btn').addEventListener('click', () => {
      playHighLow('low', currentNumber);
    });

    // Lottery button
    rootEl.querySelector('#lottery-btn').addEventListener('click', () => {
      playLottery();
    });
  }
};

// === Game Logic ===

function updateGoldDisplay() {
  const goldEl = document.getElementById('spec-gold-display');
  if (goldEl) {
    goldEl.textContent = gameState.gold.toLocaleString();
  }
}

function updateStats() {
  const gamblingState = gameState.gamblingState || {
    slotsPlaysToday: 0,
    highLowPlaysToday: 0,
    lotteryTicketsToday: 0
  };

  const slotsEl = document.getElementById('slots-count');
  const highlowEl = document.getElementById('highlow-count');
  const lotteryEl = document.getElementById('lottery-count');

  if (slotsEl) slotsEl.textContent = gamblingState.slotsPlaysToday;
  if (highlowEl) highlowEl.textContent = gamblingState.highLowPlaysToday;
  if (lotteryEl) lotteryEl.textContent = gamblingState.lotteryTicketsToday;
}

function playSlots() {
  const cost = SPECULATION_CONFIG.slots.cost;

  if (gameState.gold < cost) {
    showToast('Not enough gold!', 'warning');
    return;
  }

  // Deduct cost
  gameState.gold -= cost;

  // Roll outcome
  const outcome = rollOutcome(SPECULATION_CONFIG.slots.outcomes);

  // Apply rewards
  if (outcome.reward.gold) {
    gameState.gold += outcome.reward.gold;
  }
  if (outcome.reward.soulCores) {
    gameState.soulCores = (gameState.soulCores || 0) + outcome.reward.soulCores;
  }

  // Update stats
  if (!gameState.gamblingState) {
    gameState.gamblingState = { slotsPlaysToday: 0, highLowPlaysToday: 0, lotteryTicketsToday: 0 };
  }
  gameState.gamblingState.slotsPlaysToday += 1;

  // Display result
  const resultEl = document.getElementById('slots-result');
  if (resultEl) {
    resultEl.innerHTML = `<div>${outcome.message}</div>`;
  }

  updateGoldDisplay();
  updateStats();
  showToast(outcome.message, outcome.reward.gold >= cost * 2 ? 'success' : 'info');
}

function playHighLow(guess, currentNumber) {
  const cost = SPECULATION_CONFIG.highLow.cost;

  if (gameState.gold < cost) {
    showToast('Not enough gold!', 'warning');
    return;
  }

  // Deduct cost
  gameState.gold -= cost;

  // Generate new number
  const newNumber = Math.floor(Math.random() * 100);

  // Check win
  const isWin = (guess === 'high' && newNumber > currentNumber) || (guess === 'low' && newNumber < currentNumber);

  let message = '';
  if (isWin) {
    const winAmount = Math.floor(cost * SPECULATION_CONFIG.highLow.winMultiplier);
    gameState.gold += winAmount;
    message = `✅ Correct! ${currentNumber} → ${newNumber}. Won ${winAmount}g!`;
    showToast(message, 'success');
  } else {
    message = `❌ Wrong! ${currentNumber} → ${newNumber}. Lost ${cost}g`;
    showToast(message, 'warning');
  }

  // Update stats
  if (!gameState.gamblingState) {
    gameState.gamblingState = { slotsPlaysToday: 0, highLowPlaysToday: 0, lotteryTicketsToday: 0 };
  }
  gameState.gamblingState.highLowPlaysToday += 1;

  // Display result
  const resultEl = document.getElementById('highlow-result');
  const numberEl = document.getElementById('highlow-number');
  if (resultEl) {
    resultEl.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="font-size: 32px; font-weight: bold;">${newNumber}</div>
        <div style="font-size: 11px; color: ${isWin ? '#10b981' : '#ef4444'}; margin-top: 4px;">${message}</div>
      </div>
    `;
  }

  // Update current number for next round
  if (numberEl) {
    setTimeout(() => {
      numberEl.textContent = newNumber;
      if (resultEl) {
        resultEl.innerHTML = `<div style="font-size: 32px; font-weight: bold;">${newNumber}</div>`;
      }
    }, 2000);
  }

  updateGoldDisplay();
  updateStats();
}

function playLottery() {
  const cost = SPECULATION_CONFIG.lottery.cost;

  if (gameState.gold < cost) {
    showToast('Not enough gold!', 'warning');
    return;
  }

  // Deduct cost
  gameState.gold -= cost;

  // Roll outcome
  const outcome = rollOutcome(SPECULATION_CONFIG.lottery.outcomes);

  // Apply rewards
  if (outcome.reward.gold) {
    gameState.gold += outcome.reward.gold;
  }
  if (outcome.reward.soulCores) {
    gameState.soulCores = (gameState.soulCores || 0) + outcome.reward.soulCores;
  }
  if (outcome.reward.legendaryShards) {
    gameState.currencies = gameState.currencies || {};
    gameState.currencies.legendaryShards = (gameState.currencies.legendaryShards || 0) + outcome.reward.legendaryShards;
  }

  // Update stats
  if (!gameState.gamblingState) {
    gameState.gamblingState = { slotsPlaysToday: 0, highLowPlaysToday: 0, lotteryTicketsToday: 0 };
  }
  gameState.gamblingState.lotteryTicketsToday += 1;

  // Display result
  const resultEl = document.getElementById('lottery-result');
  if (resultEl) {
    resultEl.innerHTML = `<div>${outcome.message}</div>`;
  }

  updateGoldDisplay();
  updateStats();
  showToast(outcome.message, outcome.reward.gold >= cost * 2 ? 'success' : 'info');
}

// === Helper Functions ===

function rollOutcome(outcomes) {
  const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const outcome of outcomes) {
    roll -= outcome.weight;
    if (roll <= 0) {
      return outcome;
    }
  }

  return outcomes[outcomes.length - 1]; // Fallback
}
