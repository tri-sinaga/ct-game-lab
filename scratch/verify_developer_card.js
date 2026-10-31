const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3352;
const CDP_PORT = 9352;
const ARTIFACT_DIR = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\18c10724-d821-484f-99b8-5aa873cd0ab2';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0].split('#')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), reqPath.replace(/^\//, ''));
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, async () => {
  console.log(`Server started at http://localhost:${PORT}`);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProc = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,800',
    `http://localhost:${PORT}/index.html`
  ]);

  let isExited = false;
  const cleanup = () => {
    if (!isExited) {
      isExited = true;
      try { edgeProc.kill(); } catch (e) {}
      try { server.close(); } catch (e) {}
    }
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(0); });

  let targets = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const resp = await fetch(`http://localhost:${CDP_PORT}/json`);
      targets = await resp.json();
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve } = pending.get(data.id);
      pending.delete(data.id);
      resolve(data);
    }
  });

  const sendCommand = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, { resolve });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise(resolve => ws.addEventListener('open', resolve));

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');

  await sendCommand('Page.navigate', { url: `http://localhost:${PORT}/index.html` });
  
  // Wait for load
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    const readyState = await sendCommand('Runtime.evaluate', { expression: 'document.readyState' });
    if (readyState.result?.result?.value === 'complete') break;
  }

  // Set student profile and navigate to tentang
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('ct_gamelab_student', JSON.stringify({ name: 'Andi', absen: 1, kelas: 'X-1' }));
      const modal = document.getElementById('studentModalOverlay');
      if (modal) modal.style.display = 'none';
      if (typeof showPage === 'function') {
        showPage('tentang', null, false);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Diagnostic on Desktop
  const desktopDiag = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const img = document.querySelector('.developer-profile-img');
      const name = document.querySelector('.developer-name');
      const nim = document.querySelector('.developer-nim');
      const role = document.querySelector('.developer-role');
      const wrap = document.querySelector('.developer-profile-wrap');
      const card = document.getElementById('cardPengembangMedia');

      const imgStyle = window.getComputedStyle(img);
      const wrapStyle = window.getComputedStyle(wrap);

      const imgR = img.getBoundingClientRect();
      const nameR = name.getBoundingClientRect();
      const nimR = nim.getBoundingClientRect();
      const roleR = role.getBoundingClientRect();
      const cardR = card.getBoundingClientRect();

      return {
        cardVisible: cardR.width > 0 && cardR.height > 0,
        imgVisible: imgR.width > 0 && imgR.height > 0,
        imgSrc: img.src,
        imgComplete: img.complete,
        imgNaturalW: img.naturalWidth,
        imgNaturalH: img.naturalHeight,
        computedW: imgStyle.width,
        computedH: imgStyle.height,
        computedRadius: imgStyle.borderRadius,
        computedFit: imgStyle.objectFit,
        wrapDirection: wrapStyle.flexDirection,
        isNameBesideImg: nameR.left >= imgR.right - 2,
        isNimBelowName: nimR.top >= nameR.bottom - 4,
        isRoleBelowNim: roleR.top >= nimR.bottom - 4,
        cardPageBox: {
          x: Math.round(cardR.left + window.scrollX),
          y: Math.round(cardR.top + window.scrollY),
          width: Math.round(cardR.width),
          height: Math.round(cardR.height),
          scale: 1
        }
      };
    })()`,
    returnByValue: true
  });

  const dResult = desktopDiag.result?.result?.value;
  console.log('--- DESKTOP DIAGNOSTIC ---');
  console.log(JSON.stringify(dResult, null, 2));

  if (dResult?.cardPageBox) {
    const shot = await sendCommand('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: dResult.cardPageBox
    });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_developer_desktop.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved screenshot_developer_desktop.png');
  }

  // Mobile 375px
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 600));

  const mobileDiag = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const img = document.querySelector('.developer-profile-img');
      const name = document.querySelector('.developer-name');
      const nim = document.querySelector('.developer-nim');
      const role = document.querySelector('.developer-role');
      const card = document.getElementById('cardPengembangMedia');

      const imgStyle = window.getComputedStyle(img);
      const imgR = img.getBoundingClientRect();
      const nameR = name.getBoundingClientRect();
      const nimR = nim.getBoundingClientRect();
      const roleR = role.getBoundingClientRect();
      const cardR = card.getBoundingClientRect();

      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;

      return {
        docW,
        scrollW,
        hasHorizontalOverflow: scrollW > docW,
        computedW: imgStyle.width,
        computedH: imgStyle.height,
        isNameBesideImg: nameR.left >= imgR.right - 2,
        isNimBelowName: nimR.top >= nameR.bottom - 4,
        isRoleBelowNim: roleR.top >= nimR.bottom - 4,
        cardPageBox: {
          x: Math.round(cardR.left + window.scrollX),
          y: Math.round(cardR.top + window.scrollY),
          width: Math.round(cardR.width),
          height: Math.round(cardR.height),
          scale: 1
        }
      };
    })()`,
    returnByValue: true
  });

  const mResult = mobileDiag.result?.result?.value;
  console.log('--- MOBILE DIAGNOSTIC ---');
  console.log(JSON.stringify(mResult, null, 2));

  if (mResult?.cardPageBox) {
    const shot = await sendCommand('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: mResult.cardPageBox
    });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_developer_mobile.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved screenshot_developer_mobile.png');
  }

  cleanup();
  process.exit(0);
});

