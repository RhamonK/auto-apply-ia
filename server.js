require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({ origin: isProd ? false : 'http://localhost:3000' }));
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Recherche des offres d'emploi pour: "${query}".
Utilise web_search pour trouver des offres réelles et actuelles.
Retourne UNIQUEMENT un tableau JSON valide (sans markdown) avec jusqu'à 8 offres:
[{"id":"1","title":"...","company":"...","location":"...","type":"...","salary":"...","tags":["..."],"url":"..."}]`
      }]
    });

    const text = response.content.find(c => c.type === 'text')?.text ?? '';
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return res.json(JSON.parse(match[0]));
    res.json([]);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/apply', async (req, res) => {
  const { job, profile } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const prompt = `Tu es expert en rédaction professionnelle en français canadien.

PROFIL DU CANDIDAT:
Prénom: ${profile.firstName || 'Non précisé'}
Email: ${profile.email || 'Non précisé'}
Téléphone: ${profile.phone || 'Non précisé'}
Expérience: ${profile.experience || 'Non précisé'}
Compétences: ${profile.skills || 'Non précisé'}
Formation: ${profile.education || 'Non précisé'}
Langues: ${profile.languages || 'Français'}

OFFRE D'EMPLOI:
Titre: ${job.title}
Entreprise: ${job.company}
Lieu: ${job.location}
Type: ${job.type}
Salaire: ${job.salary || 'Non précisé'}

Génère une lettre de motivation (3 paragraphes, ton sincère et professionnel) puis un résumé de CV adapté au poste.
Utilise ce format EXACT:

===LETTRE===
[lettre de motivation ici]

===CV===
**PROFIL**
[2-3 phrases]

**EXPÉRIENCES**
[expériences pertinentes]

**COMPÉTENCES**
[compétences clés]

**FORMATION**
[diplômes et formations]

**LANGUES**
[langues parlées]

**COORDONNÉES**
[email, téléphone]`;

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    await stream.finalMessage();
    res.write('data: [DONE]\n\n');
  } catch (err) {
    console.error('Apply error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

// En production, sert le build React
if (isProd) {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
