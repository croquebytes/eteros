export const gameState = {
  wave: 1,
  gold: 0,
  xp: 0,
};

export function initGameLoop() {
  // Simple demo loop: increments wave & gold every few seconds.
  setInterval(() => {
    gameState.wave += 1;
    gameState.gold += 5;
    console.log(`Wave ${gameState.wave} | Gold ${gameState.gold}`);
  }, 5000);
}
