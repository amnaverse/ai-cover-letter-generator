require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.set('trust proxy', 1);

app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again in a few minutes' },
  })
);

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

app.get('/', (req, res) => res.send('AI Cover Letter API is running'));
app.get('/api/models', async (req, res) => {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
  });
  const data = await r.json();
  res.json(
    (data.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name)
  );
});

app.post('/api/cover-letter', async (req, res) => {
  try {
    const { name, skills, jobDescription } = req.body;

    if (!name || !skills || !jobDescription) {
      return res.status(400).json({ message: 'name, skills and jobDescription are required' });
    }
    if (jobDescription.length > 5000) {
      return res.status(400).json({ message: 'Job description is too long' });
    }

    const prompt = `Write a professional cover letter for a job application.

Applicant name: ${name}
Applicant skills and background: ${skills}
Job description: ${jobDescription}

Rules:
- Use only the skills and experience provided above. Do not invent experience, companies, or achievements.
- Keep it under 250 words, in a confident and polite tone.
- Start with "Dear Hiring Manager," and end with the applicant's name.
- Plain text only, no markdown.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();

         if (!response.ok) {
      console.error(data);
      return res.status(response.status === 429 ? 429 : 502).json({
        message: response.status === 429 ? 'AI is busy, please try again in a minute' : 'AI service error',
      });
    }
    

    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    if (!text) return res.status(502).json({ message: 'AI returned an empty response' });

    res.json({ coverLetter: text.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));