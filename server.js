require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Groq = require('groq-sdk');

const app = express();
const buildPath = path.join(__dirname, 'build');
const hasBuild = fs.existsSync(buildPath);

app.use(cors({ origin: hasBuild ? false : 'http://localhost:3000' }));
app.use(express.json());

const getGroq = () => {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY manquante');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  try {
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Tu es un assistant de recherche d'emploi. Génère une liste réaliste de 8 offres d'emploi pour la recherche: "${query}".
Utilise des vraies entreprises connues dans la région mentionnée.
Retourne UNIQUEMENT un tableau JSON valide (sans markdown, sans backticks) :
[{"id":"1","title":"...","company":"...","location":"...","type":"Temps plein/Temps partiel/Contrat","salary":"XX$/h ou Non précisé","tags":["tag1","tag2"],"url":"https://www.jobpostings.ca"}]`
      }],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try { return res.json(JSON.parse(match[0])); } catch { return res.json([]); }
    }
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
${profile.email || ''} | ${profile.phone || ''}`;

  try {
    const stream = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
  } catch (err) {
    console.error('Apply error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

if (hasBuild) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
