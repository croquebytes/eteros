// ===== Snap Preview System =====
// Shows visual overlay when dragging windows near snap zones
// Supports halves (left/right) and quarters (4 corners)

let previewEl = null;

/**
 * Initialize snap preview element
 */
function ensurePreviewElement() {
  if (!previewEl) {
    previewEl = document.createElement('div');
    previewEl.className = 'snap-preview';
    previewEl.style.display = 'none';
    document.body.appendChild(previewEl);
  }
  return previewEl;
}

/**
 * Calculate snap zone based on window position during drag
 * @param {number} x - Window center X position
 * @param {number} y - Window top Y position
 * @param {string} snapMode - 'halves' | 'quarters'
 * @returns {Object|null} Snap zone definition or null
 */
export function getSnapZone(x, y, snapMode = 'quarters') {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const taskbarHeight = 40; // Height of taskbar at bottom
  const snapMargin = 50; // Distance from edge to trigger snap

  // Calculate zones
  const leftZone = x < snapMargin;
  const rightZone = x > viewportWidth - snapMargin;
  const topZone = y < snapMargin;
  const bottomZone = y > viewportHeight - taskbarHeight - snapMargin;

  // Halves mode: left/right/maximize only
  if (snapMode === 'halves') {
    if (topZone && !leftZone && !rightZone) {
      // Top = maximize
      return {
        id: 'maximize',
        x: 0,
        y: 0,
        width: viewportWidth,
        height: viewportHeight - taskbarHeight
      };
    } else if (leftZone && !topZone) {
      // Left half
      return {
        id: 'left',
        x: 0,
        y: 0,
        width: viewportWidth / 2,
        height: viewportHeight - taskbarHeight
      };
    } else if (rightZone && !topZone) {
      // Right half
      return {
        id: 'right',
        x: viewportWidth / 2,
        y: 0,
        width: viewportWidth / 2,
        height: viewportHeight - taskbarHeight
      };
    }
  }

  // Quarters mode: 4 corners + halves + maximize
  else if (snapMode === 'quarters') {
    // Corners (highest priority)
    if (leftZone && topZone) {
      // Top-left quarter
      return {
        id: 'top-left',
        x: 0,
        y: 0,
        width: viewportWidth / 2,
        height: (viewportHeight - taskbarHeight) / 2
      };
    } else if (rightZone && topZone) {
      // Top-right quarter
      return {
        id: 'top-right',
        x: viewportWidth / 2,
        y: 0,
        width: viewportWidth / 2,
        height: (viewportHeight - taskbarHeight) / 2
      };
    } else if (leftZone && bottomZone) {
      // Bottom-left quarter
      return {
        id: 'bottom-left',
        x: 0,
        y: (viewportHeight - taskbarHeight) / 2,
        width: viewportWidth / 2,
        height: (viewportHeight - taskbarHeight) / 2
      };
    } else if (rightZone && bottomZone) {
      // Bottom-right quarter
      return {
        id: 'bottom-right',
        x: viewportWidth / 2,
        y: (viewportHeight - taskbarHeight) / 2,
        width: viewportWidth / 2,
        height: (viewportHeight - taskbarHeight) / 2
      };
    }
    // Edges (lower priority)
    else if (topZone) {
      // Top = maximize
      return {
        id: 'maximize',
        x: 0,
        y: 0,
        width: viewportWidth,
        height: viewportHeight - taskbarHeight
      };
    } else if (leftZone) {
      // Left half
      return {
        id: 'left',
        x: 0,
        y: 0,
        width: viewportWidth / 2,
        height: viewportHeight - taskbarHeight
      };
    } else if (rightZone) {
      // Right half
      return {
        id: 'right',
        x: viewportWidth / 2,
        y: 0,
        width: viewportWidth / 2,
        height: viewportHeight - taskbarHeight
      };
    }
  }

  return null;
}

/**
 * Show snap preview overlay
 * @param {Object} zone - Snap zone from getSnapZone()
 */
export function showSnapPreview(zone) {
  if (!zone) {
    hideSnapPreview();
    return;
  }

  const preview = ensurePreviewElement();

  preview.style.display = 'block';
  preview.style.left = zone.x + 'px';
  preview.style.top = zone.y + 'px';
  preview.style.width = zone.width + 'px';
  preview.style.height = zone.height + 'px';
  preview.dataset.snapId = zone.id;
}

/**
 * Hide snap preview overlay
 */
export function hideSnapPreview() {
  const preview = ensurePreviewElement();
  preview.style.display = 'none';
  delete preview.dataset.snapId;
}

/**
 * Apply snap to window element
 * @param {HTMLElement} windowEl - Window DOM element
 * @param {Object} zone - Snap zone from getSnapZone()
 * @returns {Object} Window state updates to apply
 */
export function applySnapToWindow(windowEl, zone) {
  if (!zone || !windowEl) {
    return null;
  }

  // Apply snap position
  windowEl.style.left = zone.x + 'px';
  windowEl.style.top = zone.y + 'px';
  windowEl.style.width = zone.width + 'px';
  windowEl.style.height = zone.height + 'px';

  // Return state updates
  return {
    x: zone.x,
    y: zone.y,
    width: zone.width,
    height: zone.height,
    snap: zone.id,
    isMaximized: zone.id === 'maximize'
  };
}

/**
 * Clear snap from window (restore to normal state)
 * @param {HTMLElement} windowEl - Window DOM element
 * @param {Object} previousState - Previous window state before snap
 */
export function clearSnapFromWindow(windowEl, previousState) {
  if (!windowEl || !previousState) return;

  windowEl.style.left = previousState.x + 'px';
  windowEl.style.top = previousState.y + 'px';
  windowEl.style.width = previousState.width + 'px';
  windowEl.style.height = previousState.height + 'px';
}
