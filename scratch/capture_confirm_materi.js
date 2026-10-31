const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3360;
const CDP_PORT = 9360;
const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\18c10724-d821-484f-99b8-5aa873cd0ab2';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0].split('#')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath.replace(/^\//, ''));
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=' + CDP_PORT,
    '--window-size=1280,800',
    'http://localhost:' + PORT + '/index.html'
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const resp = await fetch('http://localhost:' + CDP_PORT + '/json');
      targets = await resp.json();
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const send = (m, p = {}) => new Promise(res => {
    const curId = id++;
    const handler = (ev) => {
      const d = JSON.parse(ev.data);
      if (d.id === curId) { ws.removeEventListener('message', handler); res(d); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method: m, params: p }));
  });

  await new Promise(r => ws.addEventListener('open', r));
  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 1200));

  await send('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('ct_gamelab_student', JSON.stringify({ name: 'Andi Prasetyo', absen: 5, kelas: 'X-1' }));
      const modal = document.getElementById('studentModal');
      if (modal) modal.style.display = 'none';
      if (typeof updateNavStudentProfile === 'function') updateNavStudentProfile({ name: 'Andi Prasetyo', absen: 5, kelas: 'X-1' });
      if (typeof showPage === 'function') showPage('materi', 'bacaan', false);
      const btn = document.getElementById('btnCompleteBacaan');
      if (btn) btn.click();
    })()`
  });

  await new Promise(r => setTimeout(r, 600));
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_confirm_modal_over_materi.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved screenshot_confirm_modal_over_materi.png');

  edgeProc.kill();
  server.close();
  process.exit(0);
});

