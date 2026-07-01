const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { nom, score, total, violations, details } = req.body || {};
  if (!nom) return res.status(400).json({ error: 'Nom requis' });

  const nomNormalise = nom.trim().toLowerCase();
  const key = `ccna:etudiant:${nomNormalise}`;

  try {
    const existant = await kv.get(key);
    if (existant && existant.bloque) {
      return res.status(403).json({ error: 'bloque' });
    }
    if (existant && existant.score !== undefined) {
      return res.status(409).json({ error: 'existe' });
    }

    const bloque = violations >= 3;
    const data = {
      nom: nom.trim(),
      nom_normalise: nomNormalise,
      score,
      total,
      pourcentage: Math.round((score / total) * 100),
      violations: violations || 0,
      bloque,
      details: details || [],
      date: new Date().toISOString()
    };

    await kv.set(key, data);
    await kv.lpush('ccna:resultats', JSON.stringify(data));

    return res.status(200).json({ ok: true, bloque });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};