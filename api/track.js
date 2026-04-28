// POST /api/track  { event: string }
const NS = 'gdkc-pro';
const VALID = ['form_open','step2','step3','step4','submit','contact_submit','call_mobile','call_desktop'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const event = req.body && req.body.event;
  if (!event || !VALID.includes(event)) return res.status(400).json({ error: 'Invalid event' });

  try {
    await fetch(`https://api.counterapi.dev/v1/${NS}/${event}/up/`);
  } catch (_) { /* silent */ }

  return res.json({ ok: true });
};
