// ===== Drag Manager =====
// Handles drag-and-drop operations for items, heroes, etc.

let draggedData = null;
let dragGhost = null;
let currentDropZones = [];

/**
 * Start dragging an element
 * @param {HTMLElement} element - Element being dragged
 * @param {object} data - Data associated with the drag (e.g., {type: 'item', item: {...}})
 * @param {string} ghostContent - HTML content for the drag ghost
 */
export function startDrag(element, data, ghostContent) {
  draggedData = data;

  // Create ghost element
  dragGhost = document.createElement('div');
  dragGhost.className = 'drag-ghost';
  dragGhost.innerHTML = ghostContent;
  dragGhost.style.position = 'fixed';
  dragGhost.style.pointerEvents = 'none';
  dragGhost.style.zIndex = '10001';
  dragGhost.style.opacity = '0';
  document.body.appendChild(dragGhost);

  // Fade in
  requestAnimationFrame(() => {
    dragGhost.style.opacity = '0.8';
  });

  // Add dragging class to source element
  element.classList.add('is-dragging');

  // Highlight valid drop zones
  highlightDropZones(data);
}

/**
 * Update drag ghost position
 */
export function updateDragPosition(clientX, clientY) {
  if (!dragGhost) return;

  dragGhost.style.left = (clientX + 10) + 'px';
  dragGhost.style.top = (clientY + 10) + 'px';
}

/**
 * End drag operation
 */
export function endDrag() {
  // Remove ghost
  if (dragGhost) {
    dragGhost.style.opacity = '0';
    setTimeout(() => {
      if (dragGhost && dragGhost.parentNode) {
        dragGhost.parentNode.removeChild(dragGhost);
      }
      dragGhost = null;
    }, 200);
  }

  // Remove dragging classes
  document.querySelectorAll('.is-dragging').forEach(el => {
    el.classList.remove('is-dragging');
  });

  // Remove drop zone highlights
  currentDropZones.forEach(zone => {
    zone.element.classList.remove('drop-zone-active', 'drop-zone-hover');
  });
  currentDropZones = [];

  draggedData = null;
}

/**
 * Register a drop zone
 * @param {HTMLElement} element - Drop zone element
 * @param {function} validator - Function to validate if dragged data can be dropped (returns boolean)
 * @param {function} onDrop - Function to call when item is dropped
 */
export function registerDropZone(element, validator, onDrop) {
  const dropZone = {
    element,
    validator,
    onDrop
  };

  // Mouse events
  element.addEventListener('mouseenter', () => {
    if (!draggedData) return;
    if (validator(draggedData)) {
      element.classList.add('drop-zone-hover');
    }
  });

  element.addEventListener('mouseleave', () => {
    element.classList.remove('drop-zone-hover');
  });

  element.addEventListener('mouseup', (e) => {
    if (!draggedData) return;
    if (validator(draggedData)) {
      e.preventDefault();
      e.stopPropagation();
      onDrop(draggedData);
      endDrag();
    }
  });

  // Touch events for mobile
  element.addEventListener('touchend', (e) => {
    if (!draggedData) return;

    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    if (dropTarget && (dropTarget === element || element.contains(dropTarget))) {
      if (validator(draggedData)) {
        e.preventDefault();
        e.stopPropagation();
        onDrop(draggedData);
        endDrag();
      }
    }
  });

  return dropZone;
}

/**
 * Make an element draggable
 * @param {HTMLElement} element - Element to make draggable
 * @param {object} data - Data to pass when dragging
 * @param {function} getGhostContent - Function that returns HTML for ghost element
 */
export function makeDraggable(element, data, getGhostContent) {
  element.setAttribute('draggable', 'false'); // Disable native drag
  element.style.cursor = 'grab';

  let isDragging = false;
  let startX, startY;

  // Mouse events
  element.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only left click

    startX = e.clientX;
    startY = e.clientY;
    isDragging = false;
  });

  document.addEventListener('mousemove', (e) => {
    if (!startX || !startY) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Start drag after moving 5px
    if (!isDragging && distance > 5) {
      isDragging = true;
      element.style.cursor = 'grabbing';
      startDrag(element, data, getGhostContent());
      updateDragPosition(e.clientX, e.clientY);
    }

    if (isDragging) {
      updateDragPosition(e.clientX, e.clientY);
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      endDrag();
    }
    startX = null;
    startY = null;
    isDragging = false;
    element.style.cursor = 'grab';
  });

  // Touch events for mobile
  element.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    isDragging = false;
  });

  element.addEventListener('touchmove', (e) => {
    if (!startX || !startY) return;

    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!isDragging && distance > 5) {
      isDragging = true;
      startDrag(element, data, getGhostContent());
      updateDragPosition(touch.clientX, touch.clientY);
      e.preventDefault(); // Prevent scrolling
    }

    if (isDragging) {
      updateDragPosition(touch.clientX, touch.clientY);
      e.preventDefault();
    }
  });

  element.addEventListener('touchend', () => {
    if (isDragging) {
      // End drag will be handled by drop zone touch end
      setTimeout(() => {
        if (draggedData) {
          endDrag(); // Clean up if not dropped
        }
      }, 100);
    }
    startX = null;
    startY = null;
    isDragging = false;
  });
}

/**
 * Highlight valid drop zones for current drag data
 */
function highlightDropZones(data) {
  currentDropZones.forEach(zone => {
    if (zone.validator(data)) {
      zone.element.classList.add('drop-zone-active');
    }
  });
}

/**
 * Get currently dragged data
 */
export function getDraggedData() {
  return draggedData;
}
