const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  try {
    const items = await kv.lrange('ccna:resultats', 0, -1);
    const resultats = items.map(item => {
      try { return typeof item === 'string' ? JSON.parse(item) : item; }
      catch { return null; }
    }).filter(Boolean);

    resultats.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({ resultats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};