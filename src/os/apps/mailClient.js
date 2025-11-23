// ===== Mail Client App =====
// Quest hub with Inbox/Spam/System tabs

import { gameState } from '../../state/gameState.js';
import { eventBus, EVENTS } from '../../state/eventBus.js';

export const mailClientApp = {
  id: 'mailClient',
  title: 'Mail – QuestHub.exe',

  createContent(rootEl) {
    render(rootEl);

    // Listen for new mail
    eventBus.on(EVENTS.QUEST_ACCEPTED, () => render(rootEl));
  }
};

function render(rootEl) {
  const mailboxCategories = categorizeMailbox();

  rootEl.innerHTML = `
    <div class="window-content mail-client">
      <div class="mail-sidebar">
        <h2 class="window-subtitle">Folders</h2>
        <div class="mail-folders">
          <button class="mail-folder-btn active" data-folder="inbox">
            📥 Inbox <span class="mail-count">(${mailboxCategories.inbox.length})</span>
          </button>
          <button class="mail-folder-btn" data-folder="quests">
            ⚔️ Quests <span class="mail-count">(${mailboxCategories.quests.length})</span>
          </button>
          <button class="mail-folder-btn" data-folder="system">
            ⚙️ System <span class="mail-count">(${mailboxCategories.system.length})</span>
          </button>
          <button class="mail-folder-btn" data-folder="spam">
            🗑️ Spam <span class="mail-count">(${mailboxCategories.spam.length})</span>
          </button>
        </div>
        <button class="btn btn-secondary btn-block" id="btn-refresh-mail">🔄 Check Mail</button>
      </div>

      <div class="mail-main">
        <div class="mail-list" id="mail-list"></div>
        <div class="mail-detail" id="mail-detail">
          <div class="mail-empty">Select a message to read</div>
        </div>
      </div>
    </div>
  `;

  // Initial render of inbox
  renderMailList(rootEl, mailboxCategories.inbox);

  // Folder switching
  rootEl.querySelectorAll('.mail-folder-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active state
      rootEl.querySelectorAll('.mail-folder-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Render folder
      const folder = btn.dataset.folder;
      renderMailList(rootEl, mailboxCategories[folder] || []);
    });
  });

  // Refresh mail button
  const refreshBtn = rootEl.querySelector('#btn-refresh-mail');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      checkForNewMail();
      render(rootEl);
    });
  }
}

function renderMailList(rootEl, messages) {
  const mailList = rootEl.querySelector('#mail-list');
  if (!mailList) return;

  if (messages.length === 0) {
    mailList.innerHTML = '<div class="mail-empty-folder">No messages in this folder</div>';
    return;
  }

  mailList.innerHTML = messages.map((msg, index) => `
    <div class="mail-item ${msg.read ? 'read' : 'unread'}" data-mail-id="${msg.id}">
      <div class="mail-item-header">
        <span class="mail-sender">${msg.from}</span>
        <span class="mail-time">${formatTime(msg.timestamp)}</span>
      </div>
      <div class="mail-subject">${msg.subject}</div>
      <div class="mail-preview">${msg.preview}</div>
    </div>
  `).join('');

  // Add click handlers
  mailList.querySelectorAll('.mail-item').forEach(item => {
    item.addEventListener('click', () => {
      const mailId = item.dataset.mailId;
      const message = messages.find(m => m.id === mailId);
      if (message) {
        renderMailDetail(rootEl, message);
        markAsRead(mailId);
        item.classList.add('read');
      }
    });
  });
}

function renderMailDetail(rootEl, message) {
  const detailPanel = rootEl.querySelector('#mail-detail');
  if (!detailPanel) return;

  detailPanel.innerHTML = `
    <div class="mail-detail-header">
      <h3 class="mail-detail-subject">${message.subject}</h3>
      <div class="mail-detail-meta">
        <span class="mail-detail-from">From: ${message.from}</span>
        <span class="mail-detail-time">${new Date(message.timestamp).toLocaleString()}</span>
      </div>
    </div>
    <div class="mail-detail-body">${message.body}</div>
    ${message.quest ? renderQuestSection(message.quest) : ''}
    ${message.attachment ? renderAttachment(message.attachment) : ''}
  `;

  // Add quest accept handler
  if (message.quest) {
    const acceptBtn = detailPanel.querySelector('#btn-accept-quest');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        acceptQuest(message.quest);
        message.quest.accepted = true;
        renderMailDetail(rootEl, message);
      });
    }
  }
}

function renderQuestSection(quest) {
  if (quest.accepted) {
    return `
      <div class="mail-quest accepted">
        <div class="quest-status">✅ Quest Accepted</div>
        <div class="quest-name">${quest.name}</div>
        <div class="quest-progress">Progress: ${quest.progress || 0} / ${quest.target}</div>
      </div>
    `;
  }

  return `
    <div class="mail-quest">
      <h4 class="quest-header">Quest Available</h4>
      <div class="quest-name">${quest.name}</div>
      <div class="quest-description">${quest.description}</div>
      <div class="quest-objective">Objective: ${quest.objective}</div>
      <div class="quest-rewards">
        <strong>Rewards:</strong>
        ${Object.entries(quest.rewards).map(([res, amt]) => `
          <span class="quest-reward">${amt} ${res}</span>
        `).join(', ')}
      </div>
      <button class="btn btn-success btn-block" id="btn-accept-quest">⚔️ Accept Quest</button>
    </div>
  `;
}

function renderAttachment(attachment) {
  return `
    <div class="mail-attachment">
      <span class="attachment-icon">📎</span>
      <span class="attachment-name">${attachment.name}</span>
    </div>
  `;
}

function categorizeMailbox() {
  return {
    inbox: gameState.mailbox.filter(m => m.category === 'inbox'),
    quests: gameState.mailbox.filter(m => m.category === 'quest'),
    system: gameState.mailbox.filter(m => m.category === 'system'),
    spam: gameState.mailbox.filter(m => m.category === 'spam')
  };
}

function markAsRead(mailId) {
  const message = gameState.mailbox.find(m => m.id === mailId);
  if (message) {
    message.read = true;
  }
}

function acceptQuest(quest) {
  gameState.quests.push({
    ...quest,
    acceptedAt: Date.now(),
    progress: 0
  });

  eventBus.emit(EVENTS.QUEST_ACCEPTED, quest);
  console.log(`Quest accepted: ${quest.name}`);
}

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function checkForNewMail() {
  // Add some starter mail if mailbox is empty
  if (gameState.mailbox.length === 0) {
    addStarterMail();
  }
}

function addStarterMail() {
  const starterMessages = [
    {
      id: 'welcome_001',
      from: 'Kernelius <kernel@reincarnos.sys>',
      subject: 'Welcome to ReincarnOS',
      preview: 'Greetings, Process. Your reincarnation is complete...',
      body: `
        <p>Greetings, Process.</p>
        <p>Your reincarnation into the Kernel is now complete. You exist as data, consciousness translated to computation.</p>
        <p>Your purpose: to grow stronger, to survive the malware, and perhaps to understand the true nature of this digital afterlife.</p>
        <p>Check your other messages for quests and tasks.</p>
        <p>- Kernelius, Kernel Administrator</p>
      `,
      category: 'system',
      timestamp: Date.now() - 3600000,
      read: false
    },
    {
      id: 'quest_001',
      from: 'SysOps Command <sysops@reincarnos.sys>',
      subject: '[QUEST] First Steps',
      preview: 'Complete your first wave and earn rewards...',
      body: `
        <p>Agent,</p>
        <p>Your training begins now. Complete 10 waves of combat to prove yourself.</p>
        <p>The malware grows stronger each day. We need all processes combat-ready.</p>
      `,
      category: 'quest',
      timestamp: Date.now() - 1800000,
      read: false,
      quest: {
        id: 'quest_first_steps',
        name: 'First Steps',
        description: 'Complete 10 waves of combat',
        objective: 'Clear 10 waves',
        target: 10,
        progress: 0,
        rewards: {
          gold: 100,
          codeFragments: 25
        },
        accepted: false
      }
    },
    {
      id: 'spam_001',
      from: 'Clippy.exe <totally.not.malware@spam.net>',
      subject: 'It looks like you\'re trying to survive!',
      preview: 'Click here for FREE System Upgrades!!!',
      body: `
        <p style="color: #ff0000; font-weight: bold;">🎉 CONGRATULATIONS! 🎉</p>
        <p>You've been selected for a FREE SYSTEM UPGRADE!</p>
        <p>Click here to claim your 1,000,000 CPU Cycles!</p>
        <p><small>(This is obviously spam. Please use the Antivirus app to scan suspicious messages.)</small></p>
      `,
      category: 'spam',
      timestamp: Date.now() - 900000,
      read: false
    }
  ];

  gameState.mailbox.push(...starterMessages);
}
