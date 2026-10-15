// Node 18+ ، بدون وابستگی. اجرا: node server.js
const http = require('http'), fs = require('fs'), path = require('path');
const KEY = process.env.ZEROX_API_KEY;
const FEE_WALLET = process.env.FEE_WALLET;       // آدرس کیف پول شما برای دریافت کارمزد
const FEE_BPS = process.env.FEE_BPS || '20';     // 20 = 0.2%
const PORT = process.env.PORT || 3000;
const USDT = '0x55d398326f99059fF775485246999027B3197955'; // USDT روی BSC
const BTCB = '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c'; // BTCB روی BSC

if (!KEY || !FEE_WALLET) { console.error('ZEROX_API_KEY و FEE_WALLET را تنظیم کنید'); process.exit(1); }

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api/swap') {
    const mode = u.searchParams.get('mode') === 'quote' ? 'quote' : 'price';
    const q = new URLSearchParams({
      chainId: '56', sellToken: USDT, buyToken: BTCB,
      sellAmount: u.searchParams.get('sellAmount') || '0',
      taker: u.searchParams.get('taker') || '',
      swapFeeRecipient: FEE_WALLET, swapFeeBps: FEE_BPS, swapFeeToken: BTCB,
    });
    try {
      const r = await fetch(`https://api.0x.org/swap/allowance-holder/${mode}?${q}`,
        { headers: { '0x-api-key': KEY, '0x-version': 'v2' } });
      res.writeHead(r.status, { 'Content-Type': 'application/json' });
      return res.end(await r.text());
    } catch (e) {
      res.writeHead(502); return res.end(JSON.stringify({ error: String(e) }));
    }
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
}).listen(PORT, () => console.log('http://localhost:' + PORT));
