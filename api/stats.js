// GET /api/stats  → { configured: true, stats: { ... } }
// Uses CountAPI (countapi.xyz) — no setup, no env vars required.
const NS = 'gdkc-pro';
const KEYS = ['form_open','step2','step3','step4','submit','contact_submit','call_mobile','call_desktop'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const results = await Promise.all(
      KEYS.map(k =>
        fetch(`https://api.countapi.xyz/get/${NS}/${k}`)
          .then(r => r.json())
          .then(d => [k, typeof d.value === 'number' ? d.value : 0])
          .catch(() => [k, 0])
      )
    );
    return res.json({ configured: true, stats: Object.fromEntries(results) });
  } catch (e) {
    return res.json({ configured: false, stats: {}, error: e.message });
  }
};
