// POST /api/seed  { key: string, value: number }
// Sets a counter to the given value by hitting it N times.
// Use once from the admin to seed historical data.
const NS = 'gdkc-pro';
const VALID = ['form_open','step2','step3','step4','submit','contact_submit','call_mobile','call_desktop'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { key, value } = req.body || {};
  if (!key || !VALID.includes(key) || typeof value !== 'number' || value < 0 || value > 9999)
    return res.status(400).json({ error: 'Invalid key or value' });

  try {
    // Get current count first
    const cur = await fetch(`https://api.counterapi.dev/v1/${NS}/${key}/?_=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json()).then(d => Number(d.count) || 0).catch(() => 0);

    const diff = value - cur;
    if (diff <= 0) return res.json({ ok: true, count: cur, note: 'No change needed' });

    // Hit diff times concurrently (in batches of 20)
    const batchSize = 20;
    for (let i = 0; i < diff; i += batchSize) {
      const batch = Array(Math.min(batchSize, diff - i)).fill(null);
      await Promise.all(batch.map(() =>
        fetch(`https://api.counterapi.dev/v1/${NS}/${key}/up/`).catch(() => {})
      ));
    }

    const final = await fetch(`https://api.counterapi.dev/v1/${NS}/${key}/?_=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json()).then(d => Number(d.count) || 0).catch(() => 0);

    return res.json({ ok: true, count: final });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
