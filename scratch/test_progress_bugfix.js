const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3356;
const CDP_PORT = 9356;
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
  console.log(`Test Server running at http://localhost:${PORT}`);

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
  const consoleErrors = [];

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Console.messageAdded') {
      if (data.params.message.level === 'error') {
        consoleErrors.push(data.params.message.text);
      }
    }
    if (data.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(data.params.exceptionDetails.text + ' ' + (data.params.exceptionDetails.exception?.description || ''));
    }
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
  await sendCommand('Console.enable');

  await sendCommand('Page.navigate', { url: `http://localhost:${PORT}/index.html` });
  
  // Wait for load
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    const readyState = await sendCommand('Runtime.evaluate', { expression: 'document.readyState' });
    if (readyState.result?.result?.value === 'complete') break;
  }

  // Setup test student profile and clear any old progress for clean test
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const testStudent = { name: 'Budi Santoso', absen: 12, kelas: 'X-2' };
      localStorage.setItem('ct_gamelab_student', JSON.stringify(testStudent));
      
      // Clear progress for this specific student
      const studentKey = 'Budi Santoso_12_X-2';
      const allProg = JSON.parse(localStorage.getItem('ct_gamelab_progress_v1') || '{}');
      delete allProg[studentKey];
      localStorage.setItem('ct_gamelab_progress_v1', JSON.stringify(allProg));

      // Close student modal
      const modal = document.getElementById('studentModal');
      if (modal) modal.style.display = 'none';

      // Update UI
      if (typeof updateProgressUI === 'function') updateProgressUI();
      if (typeof updateAsesmenGatingUI === 'function') updateAsesmenGatingUI();
    })()`
  });
  await new Promise(r => setTimeout(r, 400));

  const testResults = [];

  // TEST 1: Initial State Check
  const initCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const p = getStudentProgress();
      const isLocked = !isAssessmentUnlocked();
      return {
        progress: p.progress,
        completedCount: p.completedCount,
        isLocked
      };
    })()`,
    returnByValue: true
  });
  const t1 = initCheck.result?.result?.value;
  testResults.push({
    test: 'Initial State: 0% and Asesmen Locked',
    pass: t1?.progress === 0 && t1?.completedCount === 0 && t1?.isLocked === true,
    detail: t1
  });

  // TEST 2: Bacaan Button opens Modal, and Cancel closes without increment
  const cancelTest = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      showPage('materi', 'bacaan', false);
      const btn = document.getElementById('btnCompleteBacaan');
      if (btn) btn.click();
      
      const modal = document.getElementById('completionConfirmModal');
      const isModalVisible = modal ? (window.getComputedStyle(modal).display !== 'none') : false;
      
      // Now click cancel
      const cancelBtn = document.getElementById('confirmBtnCancel');
      if (cancelBtn) cancelBtn.click();
      
      const isModalClosed = modal ? (window.getComputedStyle(modal).display === 'none') : false;
      const p = getStudentProgress();

      return {
        isModalVisible,
        isModalClosed,
        progressAfterCancel: p.progress
      };
    })()`,
    returnByValue: true
  });
  const t2 = cancelTest.result?.result?.value;
  testResults.push({
    test: 'Bacaan: Modal opens and Cancel closes without increment',
    pass: t2?.isModalVisible === true && t2?.isModalClosed === true && t2?.progressAfterCancel === 0,
    detail: t2
  });

  // TEST 3: Bacaan Button opens Modal, and Yes increments progress to 25%
  const yesTest = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.getElementById('btnCompleteBacaan');
      if (btn) btn.click();
      
      const yesBtn = document.getElementById('confirmBtnYes');
      if (yesBtn) yesBtn.click();

      const modal = document.getElementById('completionConfirmModal');
      const isModalClosed = modal ? (window.getComputedStyle(modal).display === 'none') : false;
      
      const p = getStudentProgress();
      const badge = document.getElementById('badgeCompleteBacaan');
      const isBadgeVisible = badge ? (window.getComputedStyle(badge).display !== 'none') : false;
      const isBtnHidden = btn ? (window.getComputedStyle(btn).display === 'none') : false;

      const cardPill = document.getElementById('cardStatusPillBacaan');
      const isCardCompleted = cardPill ? cardPill.classList.contains('status-completed') : false;

      return {
        isModalClosed,
        progress: p.progress,
        completedCount: p.completedCount,
        isBadgeVisible,
        isBtnHidden,
        isCardCompleted
      };
    })()`,
    returnByValue: true
  });
  const t3 = yesTest.result?.result?.value;
  testResults.push({
    test: 'Bacaan: Yes sets progress to 25% (1 dari 4) and displays badge',
    pass: t3?.isModalClosed === true && t3?.progress === 25 && t3?.completedCount === 1 && t3?.isBadgeVisible === true && t3?.isBtnHidden === true && t3?.isCardCompleted === true,
    detail: t3
  });

  // TEST 4: Persistence across Page Refresh
  await sendCommand('Page.reload');
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    const readyState = await sendCommand('Runtime.evaluate', { expression: 'document.readyState' });
    if (readyState.result?.result?.value === 'complete') break;
  }
  await new Promise(r => setTimeout(r, 600));

  const persistCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const p = getStudentProgress();
      const badge = document.getElementById('badgeCompleteBacaan');
      const isBadgeVisible = badge ? (window.getComputedStyle(badge).display !== 'none') : false;
      const cardPill = document.getElementById('cardStatusPillBacaan');
      const isCardCompleted = cardPill ? cardPill.classList.contains('status-completed') : false;
      return {
        progress: p.progress,
        completedCount: p.completedCount,
        isBadgeVisible,
        isCardCompleted
      };
    })()`,
    returnByValue: true
  });
  const t4 = persistCheck.result?.result?.value;
  testResults.push({
    test: 'Persistence: Progress remains 25% after page reload',
    pass: t4?.progress === 25 && t4?.completedCount === 1 && t4?.isBadgeVisible === true && t4?.isCardCompleted === true,
    detail: t4
  });

  // TEST 5: Video Pembelajaran Confirmation
  const videoTest = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      showPage('materi', 'video', false);
      const btn = document.getElementById('btnCompleteVideo');
      if (btn) btn.click();

      const modal = document.getElementById('completionConfirmModal');
      const isModalVisible = modal ? (window.getComputedStyle(modal).display !== 'none') : false;

      const yesBtn = document.getElementById('confirmBtnYes');
      if (yesBtn) yesBtn.click();

      const p = getStudentProgress();
      const badge = document.getElementById('badgeCompleteVideo');
      const isBadgeVisible = badge ? (window.getComputedStyle(badge).display !== 'none') : false;
      const cardPill = document.getElementById('cardStatusPillVideo');
      const isCardCompleted = cardPill ? cardPill.classList.contains('status-completed') : false;

      return {
        isModalVisible,
        progress: p.progress,
        completedCount: p.completedCount,
        isBadgeVisible,
        isCardCompleted
      };
    })()`,
    returnByValue: true
  });
  const t5 = videoTest.result?.result?.value;
  testResults.push({
    test: 'Video: Confirmation increments progress to 50% (2 dari 4)',
    pass: t5?.isModalVisible === true && t5?.progress === 50 && t5?.completedCount === 2 && t5?.isBadgeVisible === true && t5?.isCardCompleted === true,
    detail: t5
  });

  // TEST 6: Tower of Hanoi Reflection Save
  const hanoiTest = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      showPage('materi', 'game', false);

      const nameInput = document.getElementById('hanoiStudentName');
      const absenInput = document.getElementById('hanoiStudentAbsen');
      if (nameInput) nameInput.value = 'Budi Santoso';
      if (absenInput) absenInput.value = '12 (X-2)';

      const ans1 = document.getElementById('hanoiAns1');
      const ans2 = document.getElementById('hanoiAns2');
      const ans3 = document.getElementById('hanoiAns3');
      if (ans1) ans1.value = 'Menganalisis langkah terkecil terlebih dahulu.';
      if (ans2) ans2.value = 'Pola n-1 disk.';
      if (ans3) ans3.value = 'Dekomposisi dan algoritma rekursif.';

      const saveBtn = document.getElementById('saveHanoiBtn');
      if (saveBtn) saveBtn.click();

      const p = getStudentProgress();
      const cardPill = document.getElementById('cardStatusPillHanoi');
      const isCardCompleted = cardPill ? cardPill.classList.contains('status-completed') : false;
      const badgeHanoi = document.getElementById('badgeCompleteHanoi');
      const isBadgeVisible = badgeHanoi ? (window.getComputedStyle(badgeHanoi).display !== 'none') : false;

      return {
        progress: p.progress,
        completedCount: p.completedCount,
        isCardCompleted,
        isBadgeVisible
      };
    })()`,
    returnByValue: true
  });
  const t6 = hanoiTest.result?.result?.value;
  testResults.push({
    test: 'Tower of Hanoi: Saving reflection increments progress to 75% (3 dari 4)',
    pass: t6?.progress === 75 && t6?.completedCount === 3 && t6?.isCardCompleted === true && t6?.isBadgeVisible === true,
    detail: t6
  });

  // TEST 7: Flowchart Builder Validation and 100% Unlocking
  const flowchartTest = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      // Direct call to setActivityStatus for flowchart (simulating valid flowchart)
      setActivityStatus('flowchart', true);

      const p = getStudentProgress();
      const isUnlocked = isAssessmentUnlocked();
      
      showPage('asesmen', null, false);
      const lockedView = document.getElementById('asesmenLockedView');
      const unlockedView = document.getElementById('asesmenUnlockedView');
      const cardPill = document.getElementById('cardStatusPillFlowchart');
      const isCardCompleted = cardPill ? cardPill.classList.contains('status-completed') : false;

      return {
        progress: p.progress,
        completedCount: p.completedCount,
        isUnlocked,
        isCardCompleted,
        lockedViewDisplay: lockedView ? window.getComputedStyle(lockedView).display : null,
        unlockedViewDisplay: unlockedView ? window.getComputedStyle(unlockedView).display : null
      };
    })()`,
    returnByValue: true
  });
  const t7 = flowchartTest.result?.result?.value;
  testResults.push({
    test: 'Flowchart & Gating: 100% progress successfully unlocks Asesmen',
    pass: t7?.progress === 100 && t7?.completedCount === 4 && t7?.isUnlocked === true && t7?.isCardCompleted === true && t7?.unlockedViewDisplay === 'block',
    detail: t7
  });

  console.log('\n========================================');
  console.log('       SUMMARY HASIL PENGUJIAN');
  console.log('========================================');
  let allPass = true;
  testResults.forEach((t, idx) => {
    const status = t.pass ? 'PASS' : 'FAIL';
    if (!t.pass) allPass = false;
    console.log(`[${status}] Test ${idx + 1}: ${t.test}`);
    console.log('   Detail:', JSON.stringify(t.detail));
  });

  console.log('\nConsole Errors Count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }

  // Take screenshot of modal in action
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      showPage('materi', 'bacaan', false);
      openCompletionConfirm(
        'bacaan',
        '<svg class=\"ui-icon ui-icon-xl text-purple\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z\"></path><path d=\"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z\"></path></svg>',
        'Konfirmasi Penyelesaian',
        'Apakah kamu yakin sudah membaca dan memahami materi ini?'
      );
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  const modalShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'screenshot_confirm_modal_fixed.png'), Buffer.from(modalShot.result.data, 'base64'));
  console.log('\nSaved screenshot_confirm_modal_fixed.png');

  cleanup();
  process.exit(allPass && consoleErrors.length === 0 ? 0 : 1);
});
