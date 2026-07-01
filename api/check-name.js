const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { nom } = req.body || {};
  if (!nom || nom.trim() === '') {
    return res.status(400).json({ error: 'Nom requis' });
  }

  const nomNormalise = nom.trim().toLowerCase();
  const key = `ccna:etudiant:${nomNormalise}`;

  try {
    const existant = await kv.get(key);
    if (existant) {
      if (existant.bloque) {
        return res.status(403).json({ error: 'bloque', message: 'Vous avez été bloqué pour tentative de triche.' });
      }
      return res.status(409).json({ error: 'existe', message: 'Ce nom a déjà passé le QCM.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};