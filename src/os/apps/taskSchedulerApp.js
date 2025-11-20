// ===== Task Scheduler UI App =====
// Interface for managing time-based tasks

import { gameState } from '../../state/gameState.js';
import { TASK_TEMPLATES } from '../../state/taskScheduler.js';
import { RESOURCE_INFO } from '../../state/resourceManager.js';

let scheduler = null;

export const taskSchedulerUIApp = {
  id: 'taskScheduler',
  title: 'Task Scheduler – TaskMgr.exe',

  createContent(rootEl) {
    // Get scheduler from main.js injection or window
    scheduler = window.taskScheduler;

    render(rootEl);

    // Auto-refresh every second
    setInterval(() => {
      if (rootEl.isConnected) {
        render(rootEl);
      }
    }, 1000);
  }
};

function render(rootEl) {
  const activeTasks = gameState.activeTasks || [];

  rootEl.innerHTML = `
    <div class="window-content task-scheduler">
      <div class="task-queue">
        <h2 class="window-subtitle">Active Tasks (${activeTasks.length})</h2>
        <div class="task-list" id="active-task-list">
          ${activeTasks.length === 0 ?
            '<div class="task-empty">No active tasks. Start one from the templates below!</div>' :
            activeTasks.map(task => renderTaskCard(task)).join('')
          }
        </div>
      </div>

      <div class="task-templates">
        <h2 class="window-subtitle">Available Tasks</h2>
        <div class="template-tabs">
          <button class="template-tab active" data-tab="research">🔬 Research</button>
          <button class="template-tab" data-tab="compilation">⚙️ Compilation</button>
          <button class="template-tab" data-tab="defrag">💾 Defragmentation</button>
        </div>
        <div class="template-list" id="template-list"></div>
      </div>
    </div>
  `;

  // Render templates
  renderTemplates(rootEl, 'research');

  // Tab switching
  rootEl.querySelectorAll('.template-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      rootEl.querySelectorAll('.template-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTemplates(rootEl, btn.dataset.tab);
    });
  });

  // Cancel task buttons
  rootEl.querySelectorAll('.btn-cancel-task').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.dataset.taskId;
      if (scheduler && scheduler.cancelTask) {
        scheduler.cancelTask(taskId, false);
        render(rootEl);
      }
    });
  });
}

function renderTaskCard(task) {
  const progress = Math.floor(task.progress * 100);
  const remaining = Math.max(0, task.completionTime - Date.now());
  const remainingStr = formatDuration(remaining);
  const totalDuration = task.completionTime - task.startTime;
  const elapsed = Date.now() - task.startTime;

  // Calculate circular progress (SVG)
  const circumference = 2 * Math.PI * 45; // radius = 45
  const dashOffset = circumference - (progress / 100) * circumference;

  // Get color based on task type
  const typeColor = getTypeColor(task.type);

  return `
    <div class="task-card ${progress >= 100 ? 'task-card--completing' : ''}" data-task-id="${task.id}">
      <div class="task-card-layout">
        <!-- Circular Timer -->
        <div class="task-timer-circle">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              stroke-width="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="${typeColor}"
              stroke-width="6"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${dashOffset}"
              stroke-linecap="round"
              transform="rotate(-90 50 50)"
              class="task-timer-progress"
            />
          </svg>
          <div class="task-timer-text">
            <div class="task-timer-percent">${progress}%</div>
            <div class="task-timer-icon">${getTypeIcon(task.type)}</div>
          </div>
        </div>

        <!-- Task Info -->
        <div class="task-card-info">
          <div class="task-card-header">
            <span class="task-name">${task.name}</span>
            <button class="btn-cancel-task" data-task-id="${task.id}" title="Cancel task">✕</button>
          </div>

          <div class="task-progress-section">
            <div class="task-progress-bar-bg">
              <div
                class="task-progress-bar-fill"
                style="width: ${progress}%; background: linear-gradient(90deg, ${typeColor}80, ${typeColor})"
              ></div>
            </div>
            <div class="task-progress-details">
              <span class="task-remaining">⏱️ ${remainingStr} remaining</span>
              <span class="task-elapsed">Elapsed: ${formatDuration(elapsed)}</span>
            </div>
          </div>

          ${task.reward ? `
            <div class="task-rewards-preview">
              <strong>On Completion:</strong>
              ${Object.entries(task.reward).map(([res, amt]) => `
                <span class="reward-badge">
                  <span style="color: ${RESOURCE_INFO[res]?.color || '#fff'}">${RESOURCE_INFO[res]?.icon || '?'}</span>
                  +${amt}
                </span>
              `).join(' ')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderTemplates(rootEl, category) {
  const templateList = rootEl.querySelector('#template-list');
  if (!templateList) return;

  const templates = Object.entries(TASK_TEMPLATES)
    .filter(([_, tmpl]) => tmpl.type === category)
    .map(([key, tmpl]) => ({ key, ...tmpl }));

  if (templates.length === 0) {
    templateList.innerHTML = '<div class="task-empty">No templates in this category</div>';
    return;
  }

  templateList.innerHTML = templates.map(tmpl => `
    <div class="template-card">
      <div class="template-header">
        <span class="template-type-icon">${getTypeIcon(tmpl.type)}</span>
        <span class="template-name">${tmpl.name}</span>
      </div>
      <div class="template-duration">⏱️ ${formatDuration(tmpl.duration)}</div>
      <div class="template-cost">
        <strong>Cost:</strong>
        ${Object.entries(tmpl.cost).map(([res, amt]) => `
          <span class="cost-item">
            <span style="color: ${RESOURCE_INFO[res]?.color || '#fff'}">${RESOURCE_INFO[res]?.icon || '?'}</span>
            ${amt}
          </span>
        `).join(' ')}
      </div>
      ${Object.keys(tmpl.reward || {}).length > 0 ? `
        <div class="template-reward">
          <strong>Reward:</strong>
          ${Object.entries(tmpl.reward).map(([res, amt]) => `
            <span class="reward-item">
              <span style="color: ${RESOURCE_INFO[res]?.color || '#fff'}">${RESOURCE_INFO[res]?.icon || '?'}</span>
              ${amt}
            </span>
          `).join(' ')}
        </div>
      ` : ''}
      <button class="btn-start-task" data-template="${tmpl.key}">Start Task</button>
    </div>
  `).join('');

  // Add start task handlers
  templateList.querySelectorAll('.btn-start-task').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateKey = btn.dataset.template;
      const template = TASK_TEMPLATES[templateKey];
      if (scheduler && scheduler.startTask && template) {
        const success = scheduler.startTask(template);
        if (success) {
          render(rootEl);
        } else {
          alert('Cannot start task - insufficient resources!');
        }
      }
    });
  });
}

function getTypeIcon(type) {
  const icons = {
    research: '🔬',
    compilation: '⚙️',
    defragmentation: '💾'
  };
  return icons[type] || '📋';
}

function getTypeColor(type) {
  const colors = {
    research: '#10b981',      // Green
    compilation: '#60a5fa',   // Blue
    defragmentation: '#a855f7' // Purple
  };
  return colors[type] || '#8b5cf6';
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
