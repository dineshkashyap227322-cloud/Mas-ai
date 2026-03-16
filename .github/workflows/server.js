// ============================================
// AgentForge - AI Agent Platform Backend
// server.js
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Chat Endpoint ────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  try {
    // Set headers for SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch('https://api.manus.im/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.MANUS_API_KEY}`,
      },
      body: JSON.stringify({
        model: config.MODEL,
        messages: [
          { role: 'system', content: systemPrompt || config.DEFAULT_SYSTEM },
          ...messages
        ],
        stream: true,
        max_tokens: config.MAX_TOKENS,
        temperature: config.TEMPERATURE,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      res.write(`data: ${JSON.stringify({ error: 'API error', detail: err })}\n\n`);
      return res.end();
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data:'));
      for (const line of lines) {
        const data = line.slice(5).trim();
        if (data === '[DONE]') {
          res.write('data: [DONE]\n\n');
        } else {
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content || '';
            if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
          } catch {}
        }
      }
    }
    res.end();

  } catch (error) {
    console.error('Chat error:', error.message);
    res.write(`data: ${JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.' })}\n\n`);
    res.end();
  }
});

// ── Health Check ─────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: config.MODEL, timestamp: new Date().toISOString() });
});

// ── Serve Frontend ───────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start Server ─────────────────────────────
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 AgentForge running at http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${config.MANUS_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
  console.log(`🤖 Model: ${config.MODEL}\n`);
});
