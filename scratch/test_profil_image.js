const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3346;
const CDP_PORT = 9346;
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

  if (!targets || targets.length === 0) {
    console.error('Failed to connect to Edge CDP');
    cleanup();
    process.exit(1);
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
  await new Promise(r => setTimeout(r, 1200));

  // Initialize student profile and navigate to tentang
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('ct_gamelab_student', JSON.stringify({ name: 'Andi', absen: 1, kelas: 'X-1' }));
      const modal = document.getElementById('studentModalOverlay');
      if (modal) modal.style.display = 'none';
      if (typeof showPage === 'function') {
        showPage('tentang', null, false);
      }
      const card = document.getElementById('cardPengembangMedia');
      if (card) card.scrollIntoView({ block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // Check the image element and card layout on Desktop
  const evalMsg = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const img = document.querySelector('.developer-profile-img');
      const wrap = document.querySelector('.developer-profile-wrap');
      const name = document.querySelector('.developer-name');
      const nim = document.querySelector('.developer-nim');
      const role = document.querySelector('.developer-role');
      const card = document.getElementById('cardPengembangMedia');
      
      const imgRect = img ? img.getBoundingClientRect() : null;
      const nameRect = name ? name.getBoundingClientRect() : null;
      const nimRect = nim ? nim.getBoundingClientRect() : null;
      const roleRect = role ? role.getBoundingClientRect() : null;

      const imgStyle = img ? window.getComputedStyle(img) : null;
      const wrapStyle = wrap ? window.getComputedStyle(wrap) : null;

      return {
        hasImg: !!img,
        src: img ? img.getAttribute('src') : null,
        complete: img ? img.complete : false,
        naturalWidth: img ? img.naturalWidth : 0,
        naturalHeight: img ? img.naturalHeight : 0,
        imgWidth: imgRect ? imgRect.width : 0,
        imgHeight: imgRect ? imgRect.height : 0,
        imgBorderRadius: imgStyle ? imgStyle.borderRadius : null,
        imgObjectFit: imgStyle ? imgStyle.objectFit : null,
        imgObjectPosition: imgStyle ? imgStyle.objectPosition : null,
        wrapFlexDirection: wrapStyle ? wrapStyle.flexDirection : null,
        // Check relative positions (Beside: name is to the right of img)
        isNameBesideImg: (imgRect && nameRect) ? (nameRect.left >= imgRect.right) : false,
        // NIM is below name
        isNimBelowName: (nameRect && nimRect) ? (nimRect.top >= nameRect.bottom - 4) : false,
        // Role is below NIM
        isRoleBelowNim: (nimRect && roleRect) ? (roleRect.top >= nimRect.bottom - 4) : false,
        nameText: name ? name.textContent.trim() : '',
        nimText: nim ? nim.textContent.trim() : '',
        roleText: role ? role.textContent.trim() : ''
      };
    })()`,
    returnByValue: true
  });

  const desktopData = evalMsg.result?.result?.value;
  console.log('--- EVALUATION RESULT (DESKTOP) ---');
  console.log(JSON.stringify(desktopData, null, 2));

  // Take screenshot of Desktop cardPengembangMedia
  const clipMsg = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const card = document.getElementById('cardPengembangMedia');
      const r = card.getBoundingClientRect();
      return { x: Math.max(0, r.left - 20), y: Math.max(0, r.top - 20), width: r.width + 40, height: r.height + 40, scale: 1 };
    })()`,
    returnByValue: true
  });

  const desktopClip = clipMsg.result?.result?.value;
  if (desktopClip) {
    const desktopScreenshot = await sendCommand('Page.captureScreenshot', {
      format: 'png',
      clip: desktopClip
    });
    const desktopShotPath = path.join(ARTIFACT_DIR, 'screenshot_developer_desktop.png');
    fs.writeFileSync(desktopShotPath, Buffer.from(desktopScreenshot.result.data, 'base64'));
    console.log(`Saved screenshot desktop: ${desktopShotPath}`);
  }

  // Test Mobile (375px)
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 600));

  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const card = document.getElementById('cardPengembangMedia');
      if (card) card.scrollIntoView({ block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  const mobileEvalMsg = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const img = document.querySelector('.developer-profile-img');
      const name = document.querySelector('.developer-name');
      const nim = document.querySelector('.developer-nim');
      const role = document.querySelector('.developer-role');
      const wrap = document.querySelector('.developer-profile-wrap');

      const imgRect = img ? img.getBoundingClientRect() : null;
      const nameRect = name ? name.getBoundingClientRect() : null;
      const nimRect = nim ? nim.getBoundingClientRect() : null;
      const roleRect = role ? role.getBoundingClientRect() : null;

      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;

      return {
        docW,
        scrollW,
        hasHorizontalOverflow: scrollW > docW,
        imgWidth: imgRect ? imgRect.width : 0,
        imgHeight: imgRect ? imgRect.height : 0,
        isNameBesideImg: (imgRect && nameRect) ? (nameRect.left >= imgRect.right) : false,
        isNimBelowName: (nameRect && nimRect) ? (nimRect.top >= nameRect.bottom - 4) : false,
        isRoleBelowNim: (nimRect && roleRect) ? (roleRect.top >= nimRect.bottom - 4) : false
      };
    })()`,
    returnByValue: true
  });

  const mobileData = mobileEvalMsg.result?.result?.value;
  console.log('--- EVALUATION RESULT (MOBILE 375px) ---');
  console.log(JSON.stringify(mobileData, null, 2));

  // Take screenshot of Mobile card
  const mobileClipMsg = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const card = document.getElementById('cardPengembangMedia');
      const r = card.getBoundingClientRect();
      return { x: 0, y: Math.max(0, r.top - 10), width: 375, height: r.height + 20, scale: 1 };
    })()`,
    returnByValue: true
  });

  const mobileClip = mobileClipMsg.result?.result?.value;
  if (mobileClip) {
    const mobileScreenshot = await sendCommand('Page.captureScreenshot', {
      format: 'png',
      clip: mobileClip
    });
    const mobileShotPath = path.join(ARTIFACT_DIR, 'screenshot_developer_mobile.png');
    fs.writeFileSync(mobileShotPath, Buffer.from(mobileScreenshot.result.data, 'base64'));
    console.log(`Saved screenshot mobile: ${mobileShotPath}`);
  }

  cleanup();
  process.exit(0);
});
