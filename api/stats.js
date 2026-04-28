// GET /api/stats  → { configured: true, stats: { ... } }
const NS = 'gdkc-pro';
const KEYS = ['form_open','step2','step3','step4','submit','contact_submit','call_mobile','call_desktop'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const results = await Promise.all(
      KEYS.map(k =>
        fetch(`https://api.counterapi.dev/v1/${NS}/${k}/?_=${Date.now()}`, { cache: 'no-store' })
          .then(r => r.json())
          .then(d => [k, Number(d.count) || 0])
          .catch(() => [k, 0])
      )
    );
    return res.json({ configured: true, stats: Object.fromEntries(results) });
  } catch (e) {
    return res.json({ configured: false, stats: {}, error: e.message });
  }
};
