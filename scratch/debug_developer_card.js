const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3350;
const CDP_PORT = 9350;
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
    `http://localhost:${PORT}/index.html#tentang`
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

  await new Promise(r => setTimeout(r, 1500));

  // Switch to tentang
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('ct_gamelab_student', JSON.stringify({ name: 'Andi', absen: 1, kelas: 'X-1' }));
      const modal = document.getElementById('studentModalOverlay');
      if (modal) modal.style.display = 'none';
      if (typeof showPage === 'function') {
        showPage('tentang', null, false);
      }
      const pageTentang = document.getElementById('page-tentang');
      if (pageTentang) {
        document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
        pageTentang.classList.add('active');
      }
      const card = document.getElementById('cardPengembangMedia');
      if (card) card.scrollIntoView({ block: 'center', behavior: 'instant' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  // Inspect developer elements
  const res = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const img = document.querySelector('.developer-profile-img');
      const name = document.querySelector('.developer-name');
      const nim = document.querySelector('.developer-nim');
      const role = document.querySelector('.developer-role');
      const wrap = document.querySelector('.developer-profile-wrap');
      const card = document.getElementById('cardPengembangMedia');

      const imgStyle = img ? window.getComputedStyle(img) : null;
      const wrapStyle = wrap ? window.getComputedStyle(wrap) : null;

      const imgRect = img ? img.getBoundingClientRect() : null;
      const nameRect = name ? name.getBoundingClientRect() : null;
      const nimRect = nim ? nim.getBoundingClientRect() : null;
      const roleRect = role ? role.getBoundingClientRect() : null;
      const cardRect = card ? card.getBoundingClientRect() : null;

      return {
        cardVisible: cardRect ? (cardRect.width > 0 && cardRect.height > 0) : false,
        imgVisible: imgRect ? (imgRect.width > 0 && imgRect.height > 0) : false,
        imgSrc: img ? img.src : null,
        imgComplete: img ? img.complete : null,
        imgNaturalWidth: img ? img.naturalWidth : null,
        imgNaturalHeight: img ? img.naturalHeight : null,
        computedImgWidth: imgStyle ? imgStyle.width : null,
        computedImgHeight: imgStyle ? imgStyle.height : null,
        computedImgBorderRadius: imgStyle ? imgStyle.borderRadius : null,
        computedImgObjectFit: imgStyle ? imgStyle.objectFit : null,
        wrapFlexDirection: wrapStyle ? wrapStyle.flexDirection : null,
        rects: {
          img: imgRect ? { x: Math.round(imgRect.x), y: Math.round(imgRect.y), w: Math.round(imgRect.width), h: Math.round(imgRect.height) } : null,
          name: nameRect ? { x: Math.round(nameRect.x), y: Math.round(nameRect.y), w: Math.round(nameRect.width), h: Math.round(nameRect.height) } : null,
          nim: nimRect ? { x: Math.round(nimRect.x), y: Math.round(nimRect.y), w: Math.round(nimRect.width), h: Math.round(nimRect.height) } : null,
          role: roleRect ? { x: Math.round(roleRect.x), y: Math.round(roleRect.y), w: Math.round(roleRect.width), h: Math.round(roleRect.height) } : null,
        },
        isNameBesideImg: (nameRect && imgRect) ? (nameRect.x >= imgRect.right) : false,
        isNimBelowName: (nimRect && nameRect) ? (nimRect.y >= nameRect.bottom - 4) : false,
        isRoleBelowNim: (roleRect && nimRect) ? (roleRect.y >= nimRect.bottom - 4) : false
      };
    })()`,
    returnByValue: true
  });

  console.log('--- DIAGNOSTIC RESULT (DESKTOP) ---');
  console.log(JSON.stringify(res.result?.result?.value, null, 2));

  // Take screenshot of Desktop (Card in viewport)
  // We can get bounding box relative to page:
  const desktopBox = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const card = document.getElementById('cardPengembangMedia');
      const r = card.getBoundingClientRect();
      return {
        x: Math.round(r.left),
        y: Math.round(r.top),
        width: Math.round(r.width),
        height: Math.round(r.height),
        scale: 1
      };
    })()`,
    returnByValue: true
  });

  const dBox = desktopBox.result?.result?.value;
  if (dBox) {
    const shot = await sendCommand('Page.captureScreenshot', {
      format: 'png',
      clip: dBox
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

  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const card = document.getElementById('cardPengembangMedia');
      if (card) card.scrollIntoView({ block: 'center', behavior: 'instant' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const mobileRes = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const img = document.querySelector('.developer-profile-img');
      const name = document.querySelector('.developer-name');
      const nim = document.querySelector('.developer-nim');
      const role = document.querySelector('.developer-role');
      const card = document.getElementById('cardPengembangMedia');
      const imgRect = img ? img.getBoundingClientRect() : null;
      const nameRect = name ? name.getBoundingClientRect() : null;
      const nimRect = nim ? nim.getBoundingClientRect() : null;
      const roleRect = role ? role.getBoundingClientRect() : null;
      const cardRect = card ? card.getBoundingClientRect() : null;

      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;

      return {
        docW,
        scrollW,
        hasHorizontalOverflow: scrollW > docW,
        rects: {
          card: cardRect ? { x: Math.round(cardRect.x), y: Math.round(cardRect.y), w: Math.round(cardRect.width), h: Math.round(cardRect.height) } : null,
          img: imgRect ? { x: Math.round(imgRect.x), y: Math.round(imgRect.y), w: Math.round(imgRect.width), h: Math.round(imgRect.height) } : null,
          name: nameRect ? { x: Math.round(nameRect.x), y: Math.round(nameRect.y), w: Math.round(nameRect.width), h: Math.round(nameRect.height) } : null,
        },
        isNameBesideImg: (nameRect && imgRect) ? (nameRect.x >= imgRect.right) : false,
        isNimBelowName: (nimRect && nameRect) ? (nimRect.y >= nameRect.bottom - 4) : false,
        isRoleBelowNim: (roleRect && nimRect) ? (roleRect.y >= nimRect.bottom - 4) : false
      };
    })()`,
    returnByValue: true
  });

  console.log('--- MOBILE DIAGNOSTIC RESULT ---');
  console.log(JSON.stringify(mobileRes.result?.result?.value, null, 2));

  const mobileBox = mobileRes.result?.result?.value?.rects?.card;
  if (mobileBox) {
    const shot = await sendCommand('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: Math.max(0, mobileBox.x - 10),
        y: Math.max(0, mobileBox.y - 10),
        width: Math.min(375, mobileBox.w + 20),
        height: mobileBox.h + 20,
        scale: 1
      }
    });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_developer_mobile.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved screenshot_developer_mobile.png');
  }

  cleanup();
  process.exit(0);
});
