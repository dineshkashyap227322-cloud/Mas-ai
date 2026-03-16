// ============================================
// AgentForge - Frontend Logic
// script.js
// ============================================

// ── State ────────────────────────────────────
const AVATARS = ['🤖','🧠','✍️','🔬','💻','📚','📊','🎨','⚡','🌟'];
const COLORS  = ['#6C63FF','#00BFA5','#FF6584','#FFA500','#3F51B5','#E91E63','#009688','#FF5722'];

let state = {
  agents: JSON.parse(localStorage.getItem('agentforge_agents') || 'null') || [
    { id:'1', name:'Atlas',  role:'Assistant',  avatar:'🤖', color:'#6C63FF', active:true,  instructions:'You are Atlas, a highly intelligent, friendly and helpful AI assistant. Be concise, clear and supportive.', memory:true,  created:Date.now()-86400000, messages:[], logs:[] },
    { id:'2', name:'Nova',   role:'Researcher', avatar:'🔬', color:'#00BFA5', active:true,  instructions:'You are Nova, an expert researcher. Provide detailed, accurate, well-structured research with analysis.', memory:true,  created:Date.now()-43200000, messages:[], logs:[] },
    { id:'3', name:'Cipher', role:'Coder',       avatar:'💻', color:'#FF6584', active:true,  instructions:'You are Cipher, an expert software engineer. Write clean, efficient, well-commented code. Explain solutions clearly.', memory:false, created:Date.now(),          messages:[], logs:[] },
  ],
  view: 'dashboard',
  dark: true,
  chatAgent: null,
  editAgent: null,
  formMemory: true,
  formAvatar: '🤖',
  formColor: '#6C63FF',
  search: '',
};

function save() { localStorage.setItem('agentforge_agents', JSON.stringify(state.agents)); }
function timeAgo(ts) {
  const s = Math.floor((Date.now()-ts)/1000);
  if(s<60) return 'just now';
  if(s<3600) return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

// ── Theme ─────────────────────────────────────
function toggleTheme() {
  state.dark = !state.dark;
  document.body.className = state.dark ? 'dark' : 'light';
  document.querySelector('.theme-btn').textContent = state.dark ? '☀️' : '🌙';
}

// ── Views ─────────────────────────────────────
function setView(v) {
  state.view = v;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase().includes(v)));
  render();
}

function render() {
  const main = document.getElementById('main-content');
  if (state.view === 'chat' && state.chatAgent) { renderChat(main); return; }
  if (state.view === 'logs') { renderLogs(main); return; }
  renderDashboard(main);
}

// ── Dashboard ─────────────────────────────────
function renderDashboard(main) {
  const totalMsgs = state.agents.reduce((s,a) => s+a.messages.length, 0);
  const activeCount = state.agents.filter(a=>a.active).length;
  const filtered = state.agents.filter(a =>
    a.name.toLowerCase().includes(state.search.toLowerCase()) ||
    a.role.toLowerCase().includes(state.search.toLowerCase())
  );

  main.innerHTML = `
    <div class="stats-grid">
      ${[
        {label:'Total Agents',  value:state.agents.length, icon:'🤖', color:'#6C63FF'},
        {label:'Active Agents', value:activeCount,          icon:'⚡', color:'#00BFA5'},
        {label:'Total Messages',value:totalMsgs,            icon:'💬', color:'#FF6584'},
        {label:'API Connected', value:'Manus AI',           icon:'🔌', color:'#FFA500'},
      ].map(s=>`
        <div class="stat-card" style="border-left:4px solid ${s.color}">
          <div class="stat-icon">${s.icon}</div>
          <div class="stat-value" style="color:${s.color}">${s.value}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('')}
    </div>

    <div class="search-bar">
      <div class="search-wrap">
        <span>🔍</span>
        <input type="text" placeholder="Search agents..." value="${state.search}" oninput="state.search=this.value;render()"/>
      </div>
      <span class="search-count">${filtered.length} agent${filtered.length!==1?'s':''}</span>
    </div>

    ${filtered.length === 0 ? `
      <div class="empty-state">
        <div class="emoji">🤖</div>
        <p>No agents found. Create your first agent!</p>
        <button class="create-btn" onclick="openCreate()">+ Create Agent</button>
      </div>
    ` : `
      <div class="agents-grid">
        ${filtered.map(a => agentCardHTML(a)).join('')}
      </div>
    `}
  `;
}

function agentCardHTML(a) {
  return `
    <div class="agent-card" style="border-top:3px solid ${a.color}" onmouseenter="this.style.boxShadow='0 12px 35px ${a.color}22'" onmouseleave="this.style.boxShadow='none'">
      <div class="card-header">
        <div class="agent-info">
          <div class="agent-avatar" style="background:${a.color}22;border:2px solid ${a.color}44">${a.avatar}</div>
          <div>
            <div class="agent-name">${a.name}</div>
            <span class="badge" style="background:${a.color}22;color:${a.color}">${a.role}</span>
          </div>
        </div>
        <div class="status-dot">
          <div class="dot ${a.active?'active':'idle'}"></div>
          <span class="status-text" style="color:${a.active?'#00BFA5':'var(--muted)'}">${a.active?'Active':'Idle'}</span>
        </div>
      </div>
      <p class="agent-desc">${a.instructions || 'No instructions set.'}</p>
      <div class="card-meta">
        <span>💬 ${a.messages.length} messages</span>
        <span>🕐 ${timeAgo(a.created)}</span>
        <span>${a.memory?'🧠 Memory ON':'🚫 No Memory'}</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-chat" style="background:${a.color};box-shadow:0 4px 14px ${a.color}44" onclick="openChat('${a.id}')">💬 Chat</button>
        <button class="btn btn-edit" onclick="openEdit('${a.id}')">✏️ Edit</button>
        <button class="btn ${a.active?'btn-deactivate':'btn-toggle'}" onclick="toggleAgent('${a.id}')">${a.active?'Deactivate':'Activate'}</button>
        <button class="btn btn-delete" onclick="deleteAgent('${a.id}')">🗑️</button>
      </div>
    </div>
  `;
}

// ── Logs ──────────────────────────────────────
function renderLogs(main) {
  main.innerHTML = `
    <h2 style="margin-bottom:1.5rem;font-size:1.3rem">📊 Agent Performance Logs</h2>
    ${state.agents.map(a=>`
      <div class="log-agent">
        <div class="log-header">
          <span style="font-size:1.3rem">${a.avatar}</span>
          <div>
            <div style="font-weight:700">${a.name}</div>
            <span class="badge" style="background:${a.color}22;color:${a.color}">${a.role}</span>
          </div>
          <div class="meta">${a.messages.length} messages · ${(a.logs||[]).length} sessions</div>
        </div>
        ${(a.logs||[]).length === 0 ? '<div class="no-logs">No activity yet. Start chatting!</div>' : `
          <div class="log-entries">
            ${[...(a.logs||[])].reverse().map(log=>`
              <div class="log-entry">
                <span class="log-time">${timeAgo(log.ts)}</span>
                <span class="log-prompt">"${log.prompt}..."</span>
                <span class="log-tokens">~${log.tokens} tokens</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `).join('')}
  `;
}

// ── Chat ──────────────────────────────────────
function openChat(id) {
  state.chatAgent = state.agents.find(a=>a.id===id);
  state.view = 'chat';
  render();
}

function renderChat(main) {
  const a = state.chatAgent;
  main.innerHTML = `
    <div class="chat-view">
      <div class="chat-header">
        <button class="back-btn" onclick="closeChat()">← Back</button>
        <div class="chat-agent-avatar" style="background:${a.color}22">${a.avatar}</div>
        <div>
          <div class="chat-agent-name">${a.name}</div>
          <div class="chat-agent-status">● ${a.role} · Online</div>
        </div>
        <button class="chat-reset" onclick="resetChat()">🔄 Reset</button>
      </div>
      <div class="chat-messages" id="chat-messages">
        ${(a.messages||[]).length === 0 ? `
          <div class="empty-chat">
            <div style="font-size:3rem;margin-bottom:1rem">${a.avatar}</div>
            <div style="font-size:1.1rem;font-weight:600;color:var(--text)">Hi! I'm ${a.name}</div>
            <div style="margin-top:0.5rem">${a.role} · Ready to help you</div>
          </div>
        ` : (a.messages||[]).map(m=>messageBubble(m,a)).join('')}
      </div>
      <div class="chat-input-area">
        <textarea id="chat-input" placeholder="Message ${a.name}... (Enter to send)" rows="1"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMessage()}"
          oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea>
        <button class="send-btn" id="send-btn" style="background:${a.color};box-shadow:0 4px 14px ${a.color}55" onclick="sendMessage()">➤</button>
      </div>
    </div>
  `;
  scrollChat();
}

function messageBubble(m, a) {
  return `
    <div class="msg-wrap ${m.role}">
      <div class="msg-meta">${m.role==='user'?'You':a.name} · ${timeAgo(m.ts)}</div>
      <div class="msg-bubble ${m.role}" ${m.role==='user'?`style="background:${a.color};box-shadow:0 4px 14px ${a.color}44"`:''}>
        ${escHtml(m.content)}
      </div>
      ${m.role==='assistant'?`<button class="msg-copy" onclick="copyMsg(this,'${btoa(m.content)}')">📋 Copy</button>`:''}
    </div>
  `;
}

function escHtml(t) { const d=document.createElement('div'); d.textContent=t; return d.innerHTML; }

function scrollChat() {
  setTimeout(()=>{ const el=document.getElementById('chat-messages'); if(el) el.scrollTop=el.scrollHeight; }, 50);
}

function closeChat() { state.chatAgent=null; state.view='dashboard'; render(); }
function resetChat() {
  const a = state.agents.find(x=>x.id===state.chatAgent.id);
  a.messages=[]; state.chatAgent=a; save(); renderChat(document.getElementById('main-content'));
}

function copyMsg(btn, b64) {
  navigator.clipboard.writeText(atob(b64));
  btn.textContent='✅ Copied';
  setTimeout(()=>btn.textContent='📋 Copy',1500);
}

let isSending = false;

async function sendMessage() {
  if (isSending) return;
  const input = document.getElementById('chat-input');
  const text = input?.value?.trim();
  if (!text) return;

  isSending = true;
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('send-btn').disabled = true;

  const a = state.agents.find(x=>x.id===state.chatAgent.id);
  const userMsg = { id: Date.now(), role:'user', content:text, ts:Date.now() };
  a.messages.push(userMsg);
  state.chatAgent = a;
  save();

  const messagesEl = document.getElementById('chat-messages');

  // Remove empty state
  const emptyEl = messagesEl.querySelector('.empty-chat');
  if (emptyEl) emptyEl.remove();

  // Append user bubble
  messagesEl.insertAdjacentHTML('beforeend', messageBubble(userMsg, a));

  // Typing indicator
  const typingId = 'typing-' + Date.now();
  messagesEl.insertAdjacentHTML('beforeend', `
    <div class="msg-wrap assistant" id="${typingId}">
      <div class="msg-meta">${a.name}</div>
      <div class="msg-bubble assistant">
        <span class="typing-dot" style="background:${a.color}"></span>
        <span class="typing-dot" style="background:${a.color};animation-delay:0.2s"></span>
        <span class="typing-dot" style="background:${a.color};animation-delay:0.4s"></span>
      </div>
    </div>
  `);
  scrollChat();

  try {
    const history = (a.memory ? a.messages : [userMsg]).map(m=>({ role:m.role, content:m.content }));

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ messages: history, systemPrompt: a.instructions }),
    });

    const typingEl = document.getElementById(typingId);
    let fullText = '';

    // Handle streaming SSE
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let bubbleEl = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l=>l.startsWith('data:'));

      for (const line of lines) {
        const data = line.slice(5).trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) { fullText = parsed.error; break; }
          if (parsed.text) {
            fullText += parsed.text;
            if (!bubbleEl) {
              // Replace typing with streaming bubble
              typingEl?.remove();
              messagesEl.insertAdjacentHTML('beforeend', `
                <div class="msg-wrap assistant" id="stream-bubble">
                  <div class="msg-meta">${a.name}</div>
                  <div class="msg-bubble assistant" id="stream-text"></div>
                  <button class="msg-copy">📋 Copy</button>
                </div>
              `);
              bubbleEl = document.getElementById('stream-text');
            }
            bubbleEl.innerHTML = escHtml(fullText) + '<span class="cursor" style="border-color:'+a.color+'"></span>';
            scrollChat();
          }
        } catch {}
      }
    }

    // Finalize
    if (bubbleEl) {
      bubbleEl.innerHTML = escHtml(fullText);
      const copyBtn = bubbleEl.parentElement.querySelector('.msg-copy');
      if (copyBtn) copyBtn.onclick = () => { navigator.clipboard.writeText(fullText); copyBtn.textContent='✅ Copied'; setTimeout(()=>copyBtn.textContent='📋 Copy',1500); };
    } else {
      document.getElementById(typingId)?.remove();
    }

    const aiMsg = { id: Date.now()+1, role:'assistant', content:fullText, ts:Date.now() };
    a.messages.push(aiMsg);
    a.logs = [...(a.logs||[]), { ts:Date.now(), prompt:text.slice(0,60), tokens: fullText.split(' ').length }];
    state.chatAgent = a;
    save();

  } catch(err) {
    document.getElementById(typingId)?.remove();
    const errMsg = { id:Date.now()+1, role:'assistant', content:'⚠️ AI service temporarily unavailable. Please try again.', ts:Date.now() };
    a.messages.push(errMsg);
    state.chatAgent = a;
    save();
    messagesEl.insertAdjacentHTML('beforeend', messageBubble(errMsg, a));
    scrollChat();
  }

  isSending = false;
  document.getElementById('send-btn').disabled = false;
  document.getElementById('chat-input')?.focus();
}

// ── Agent CRUD ────────────────────────────────
function toggleAgent(id) {
  const a = state.agents.find(x=>x.id===id);
  if(a) { a.active=!a.active; save(); render(); }
}
function deleteAgent(id) {
  if(confirm('Delete this agent?')) { state.agents=state.agents.filter(x=>x.id!==id); save(); render(); }
}

// ── Modal ─────────────────────────────────────
function buildAvatarGrid() {
  document.getElementById('avatar-grid').innerHTML = AVATARS.map(av=>`
    <button class="avatar-btn ${state.formAvatar===av?'selected':''}" onclick="selectAvatar('${av}')">${av}</button>
  `).join('');
}
function buildColorGrid() {
  document.getElementById('color-grid').innerHTML = COLORS.map(c=>`
    <button class="color-btn ${state.formColor===c?'selected':''}" style="background:${c};box-shadow:${state.formColor===c?`0 0 10px ${c}`:''}" onclick="selectColor('${c}')"></button>
  `).join('');
}
function selectAvatar(av) { state.formAvatar=av; buildAvatarGrid(); }
function selectColor(c) { state.formColor=c; buildColorGrid(); document.getElementById('modal-save-btn').style.background=c; }

function toggleMemory() {
  state.formMemory=!state.formMemory;
  const t=document.getElementById('memory-toggle');
  t.className='toggle'+(state.formMemory?' on':'');
  document.getElementById('memory-label').textContent=state.formMemory?'On — Remembers conversation':'Off — Fresh each chat';
}

function openCreate() {
  state.editAgent=null;
  state.formAvatar='🤖'; state.formColor='#6C63FF'; state.formMemory=true;
  document.getElementById('modal-title').textContent='✨ Create New Agent';
  document.getElementById('modal-save-btn').textContent='🚀 Create Agent';
  document.getElementById('modal-save-btn').style.background='#6C63FF';
  document.getElementById('f-name').value='';
  document.getElementById('f-role').value='Assistant';
  document.getElementById('f-instructions').value='';
  document.getElementById('memory-toggle').className='toggle on';
  document.getElementById('memory-label').textContent='On — Remembers conversation';
  buildAvatarGrid(); buildColorGrid();
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function openEdit(id) {
  const a = state.agents.find(x=>x.id===id);
  state.editAgent=a;
  state.formAvatar=a.avatar; state.formColor=a.color; state.formMemory=a.memory;
  document.getElementById('modal-title').textContent=`✏️ Edit — ${a.name}`;
  document.getElementById('modal-save-btn').textContent='💾 Save Changes';
  document.getElementById('modal-save-btn').style.background=a.color;
  document.getElementById('f-name').value=a.name;
  document.getElementById('f-role').value=a.role;
  document.getElementById('f-instructions').value=a.instructions;
  document.getElementById('memory-toggle').className='toggle'+(a.memory?' on':'');
  document.getElementById('memory-label').textContent=a.memory?'On — Remembers conversation':'Off — Fresh each chat';
  buildAvatarGrid(); buildColorGrid();
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }

function saveAgent() {
  const name = document.getElementById('f-name').value.trim();
  if(!name) { alert('Please enter an agent name.'); return; }
  const patch = {
    name, role: document.getElementById('f-role').value,
    avatar: state.formAvatar, color: state.formColor,
    instructions: document.getElementById('f-instructions').value.trim(),
    memory: state.formMemory,
  };
  if (state.editAgent) {
    Object.assign(state.agents.find(a=>a.id===state.editAgent.id), patch);
  } else {
    state.agents.push({ id:Date.now().toString(), ...patch, active:true, created:Date.now(), messages:[], logs:[] });
  }
  save(); closeModal(); render();
}

// ── Init ──────────────────────────────────────
render();
