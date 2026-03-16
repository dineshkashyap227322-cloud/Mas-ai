# ⚡ AgentForge — AI Agent Management Platform

A full-stack AI agent creation and management platform powered by Manus AI.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ai-agent
npm install
```

### 2. Insert Your API Key

Open `config.js` and replace the key:

```js
MANUS_API_KEY: 'your-manus-api-key-here',
```

Or use an environment variable (recommended for production):

```bash
export MANUS_API_KEY=your-key-here
```

### 3. Run the Server

```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

### 4. Open the App

Visit: **http://localhost:3000**

---

## 📁 Project Structure

```
/ai-agent
 ├── server.js        ← Express backend + API proxy
 ├── config.js        ← API key + model settings
 ├── package.json     ← Dependencies
 └── public/
     ├── index.html   ← App shell
     ├── style.css    ← All styles (dark/light)
     └── script.js    ← Frontend logic
```

---

## ✨ Features

- **Agent Dashboard** — View, search, and manage all agents
- **Create Agents** — Custom name, role, avatar, color, instructions
- **Chat Interface** — Real-time streaming responses
- **Agent Memory** — Toggle conversation memory per agent
- **Dark / Light Mode** — Full theme switching
- **Performance Logs** — Track usage per agent
- **Mobile Responsive** — Works on all screen sizes

---

## 🔒 Security Notes

- API key is stored server-side in `config.js` — never exposed to the browser
- All AI requests are proxied through `/api/chat`
- For production: use environment variables and add authentication

---

## 🛠️ Customization

Edit `config.js` to change:
- `MODEL` — Switch AI model
- `MAX_TOKENS` — Adjust response length
- `TEMPERATURE` — Control creativity (0.0–1.0)
- `PORT` — Change server port
