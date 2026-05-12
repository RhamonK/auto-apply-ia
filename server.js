require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const buildPath = path.join(__dirname, 'build');
const hasBuild = fs.existsSync(buildPath);

app.use(cors({ origin: hasBuild ? false : 'http://localhost:3000' }));
app.use(express.json());

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY manquante dans les variables Railway');
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  try {
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{ googleSearch: {} }],
    });

    const result = await model.generateContent(
      `Recherche des offres d'emploi pour: "${query}".
Trouve des offres réelles et actuelles.
Retourne UNIQUEMENT un tableau JSON valide (sans markdown, sans backticks) avec jusqu'à 8 offres:
[{"id":"1","title":"...","company":"...","location":"...","type":"...","salary":"...","tags":["..."],"url":"..."}]`
    );

    const text = result.response.text();
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
    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
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
  app.use((req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
