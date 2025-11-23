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
    <div class="window-content task-scheduler-enhanced">
      <div class="task-scheduler-layout">
        <!-- Active Tasks Panel (Left 35%) -->
        <div class="task-queue-panel">
          <div class="panel-header">
            <h2 class="window-subtitle">⏱️ Active Tasks</h2>
            <span class="task-count-badge">${activeTasks.length}</span>
          </div>
          <div class="task-list" id="active-task-list">
            ${activeTasks.length === 0 ?
              '<div class="task-empty"><div class="empty-icon">📋</div><p>No active tasks</p><p class="small-text">Select a template to start</p></div>' :
              activeTasks.map(task => renderTaskCard(task)).join('')
            }
          </div>
        </div>

        <!-- Available Templates Panel (Right 65%) -->
        <div class="task-templates-panel">
          <div class="panel-header">
            <h2 class="window-subtitle">📚 Task Templates</h2>
          </div>
          <div class="template-tabs">
            <button class="template-tab active" data-tab="research">🔬 Research</button>
            <button class="template-tab" data-tab="compilation">⚙️ Compilation</button>
            <button class="template-tab" data-tab="defrag">💾 Defrag</button>
          </div>
          <div class="template-list" id="template-list"></div>
        </div>
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

  // Get color based on task type
  const typeColor = getTypeColor(task.type);

  return `
    <div class="task-card-compact ${progress >= 100 ? 'task-card--completing' : ''}" data-task-id="${task.id}">
      <div class="task-card-header-compact">
        <div class="task-icon-badge" style="background: ${typeColor}33; border-color: ${typeColor};">
          ${getTypeIcon(task.type)}
        </div>
        <div class="task-info-compact">
          <div class="task-name-compact">${task.name}</div>
          <div class="task-time-compact">⏱️ ${remainingStr}</div>
        </div>
        <button class="btn-cancel-task" data-task-id="${task.id}" title="Cancel task">✕</button>
      </div>

      <div class="task-progress-bar-compact">
        <div class="task-progress-fill-compact" style="width: ${progress}%; background: ${typeColor};"></div>
        <span class="task-progress-label">${progress}%</span>
      </div>

      ${task.reward && Object.keys(task.reward).length > 0 ? `
        <div class="task-rewards-compact">
          ${Object.entries(task.reward).map(([res, amt]) => `
            <span class="reward-badge-compact" style="color: ${RESOURCE_INFO[res]?.color || '#60a5fa'}">
              ${RESOURCE_INFO[res]?.icon || '?'} +${amt}
            </span>
          `).join('')}
        </div>
      ` : ''}
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

  templateList.innerHTML = templates.map(tmpl => {
    const typeColor = getTypeColor(tmpl.type);
    return `
      <div class="template-card-grid">
        <div class="template-header-grid">
          <div class="template-icon-large" style="background: ${typeColor}22; border-color: ${typeColor};">
            ${getTypeIcon(tmpl.type)}
          </div>
          <div class="template-info-grid">
            <div class="template-name-grid">${tmpl.name}</div>
            <div class="template-duration-grid">⏱️ ${formatDuration(tmpl.duration)}</div>
          </div>
        </div>

        <div class="template-resources-grid">
          <div class="resource-section">
            <span class="resource-label">Cost:</span>
            <div class="resource-items">
              ${Object.entries(tmpl.cost).map(([res, amt]) => `
                <span class="resource-badge" style="color: ${RESOURCE_INFO[res]?.color || '#93c5fd'}">
                  ${RESOURCE_INFO[res]?.icon || '?'} ${amt}
                </span>
              `).join('')}
            </div>
          </div>

          ${Object.keys(tmpl.reward || {}).length > 0 ? `
            <div class="resource-section">
              <span class="resource-label">Reward:</span>
              <div class="resource-items">
                ${Object.entries(tmpl.reward).map(([res, amt]) => `
                  <span class="resource-badge" style="color: ${RESOURCE_INFO[res]?.color || '#10b981'}">
                    ${RESOURCE_INFO[res]?.icon || '?'} +${amt}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <button class="btn btn-primary btn-sm btn-block btn-start-task" data-template="${tmpl.key}">
          Start Task
        </button>
      </div>
    `;
  }).join('');

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
