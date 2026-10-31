// ========================================================
// SISTEM NAVIGASI MULTI-HALAMAN & SUBBAB TAB
// ========================================================

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
}

let lastMateriSubtab = 'bacaan';
let lastAsesmenSubtab = 'kuis-wayground';

function showMateriSubtab(subtabId) {
  const validSubtabs = ['bacaan', 'video', 'game', 'flowchart'];
  if (!validSubtabs.includes(subtabId)) subtabId = 'bacaan';
  lastMateriSubtab = subtabId;

  document.querySelectorAll('#page-materi .subtab-panel').forEach((panel) => {
    const isActive = panel.id === `subbab-${subtabId}`;
    panel.classList.toggle('active', isActive);
  });

  // Sinkronkan highlight kartu aktivitas materi (Tahap 3.3)
  document.querySelectorAll('#materiActivities .activity-card').forEach((card) => {
    const isActive = card.dataset.subtab === subtabId;
    card.classList.toggle('active-activity-card', isActive);
  });

  if (subtabId === 'flowchart') {
    setTimeout(() => {
      if (typeof window.renderFlowchartCanvas === 'function') {
        window.renderFlowchartCanvas();
      }
    }, 60);
  }
}


function showAsesmenSubtab(subtabId = 'kuis-wayground') {
  const validSubtabs = ['kuis-wayground'];

  if (!validSubtabs.includes(subtabId)) {
    subtabId = 'kuis-wayground';
  }

  lastAsesmenSubtab = subtabId;

  document.querySelectorAll('#page-asesmen .subtab-btn').forEach((btn) => {
    const isActive = btn.dataset.subtab === subtabId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  document.querySelectorAll('#page-asesmen .subtab-panel').forEach((panel) => {
    const isActive = panel.id === `subtab-${subtabId}`;
    panel.classList.toggle('active', isActive);
  });
}

function showPage(pageId, subtabId = null, shouldScroll = true) {
  const validPages = [
    'beranda',
    'orientasi',
    'materi',
    'asesmen',
    'refleksi',
    'tentang'
  ];

  // Sembunyikan halaman lain dan tampilkan hanya halaman terpilih
  document.querySelectorAll('.page-view').forEach((page) => {
    page.classList.remove('active');
  });

  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Berikan penanda visual pada menu utama yang aktif
  document.querySelectorAll('.topbar nav a').forEach((a) => {
    if (a.dataset.page === pageId) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    } else {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    }
  });

  // Atur subbab jika berada pada halaman Materi atau Asesmen
  if (pageId === 'materi') {
    const activeSub = subtabId || lastMateriSubtab || 'bacaan';
    showMateriSubtab(activeSub);
  } else if (pageId === 'asesmen') {
    const isUnlocked = typeof isAssessmentUnlocked === 'function' ? isAssessmentUnlocked() : false;
    const lockedView = document.getElementById('asesmenLockedView');
    const unlockedView = document.getElementById('asesmenUnlockedView');
    const prog = typeof getStudentProgress === 'function' ? getStudentProgress() : { progress: 0, completedCount: 0 };

    if (!isUnlocked) {
      if (lockedView) lockedView.style.display = 'block';
      if (unlockedView) unlockedView.style.display = 'none';
      const pctEl = document.getElementById('lockedProgressPercent');
      const barEl = document.getElementById('lockedProgressBar');
      const hintEl = document.getElementById('lockedProgressHint');
      const statusBtn = document.getElementById('btnLockedStatus');
      if (pctEl) pctEl.textContent = `${prog.progress}%`;
      if (barEl) barEl.style.width = `${prog.progress}%`;
      if (hintEl) hintEl.textContent = `${prog.completedCount} dari 4 aktivitas selesai`;
      if (statusBtn) statusBtn.innerHTML = `<svg class="ui-icon ui-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> <span>Asesmen Terkunci (${prog.progress}%)</span>`;
    } else {
      if (lockedView) lockedView.style.display = 'none';
      if (unlockedView) unlockedView.style.display = 'block';
      const activeSub = subtabId || lastAsesmenSubtab || 'kuis-wayground';
      showAsesmenSubtab(activeSub);
    }
  }

  // Tutup menu mobile jika sedang terbuka
  if (nav) nav.classList.remove('open');

  // Tampilkan halaman dari bagian atas jika diminta
  if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Handler Routing berdasarkan URL Hash
function handleRoute() {
  const rawHash = (window.location.hash || '').toLowerCase().replace(/^#/, '');

  if (!rawHash || rawHash === 'beranda') {
    showPage('beranda', null, false);
  } else if (rawHash === 'materi') {
    showPage('materi', 'bacaan', false);
  } else if (rawHash === 'bacaan' || rawHash === 'materi-bacaan' || rawHash === 'subbab-bacaan') {
    showPage('materi', 'bacaan', false);
  } else if (rawHash === 'video' || rawHash === 'materi-video' || rawHash === 'subbab-video') {
    showPage('materi', 'video', false);
  } else if (rawHash === 'game' || rawHash === 'materi-game' || rawHash === 'subbab-game') {
    showPage('materi', 'game', false);
  } else if (
    rawHash === 'builder' ||
    rawHash === 'flowchart' ||
    rawHash === 'materi-flowchart' ||
    rawHash === 'subbab-flowchart' ||
    rawHash === 'builderworkspace'
  ) {
    showPage('materi', 'flowchart', false);

  } else if (
    rawHash === 'asesmen' ||
    rawHash === 'misi' ||
    rawHash === 'kuis' ||
    rawHash === 'asesmen-kuis-internal' ||
    rawHash === 'wayground' ||
    rawHash === 'asesmen-kuis-wayground'
  ) {
    showPage('asesmen', 'kuis-wayground', false);

  } else if (rawHash === 'refleksi') {
    showPage('refleksi', null, false);
  } else if (rawHash === 'tentang' || rawHash === 'about') {
    showPage('tentang', null, false);
  } else if (rawHash === 'info-pembelajaran') {
    showPage('tentang', null, false);
    setTimeout(() => {
      document.getElementById('info-pembelajaran')?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  } else {
    // Cek apakah elemen dengan id tersebut ada di dalam halaman
    const targetEl = document.getElementById(rawHash);
    if (targetEl) {
      const parentPage = targetEl.closest('.page-view');
      if (parentPage) {
        const pageId = parentPage.id.replace('page-', '');
        const parentSubtab = targetEl.closest('.subtab-panel');
        const subtabId = parentSubtab
          ? parentSubtab.id.replace('subbab-', '').replace('subtab-', '')
          : null;
        showPage(pageId, subtabId, false);
        setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth' }), 120);
        return;
      }
    }
    showPage('materi', 'bacaan', false);
  }
}

// ========================================================
// REVISI 3: MANAJEMEN REFLEKSI SISWA TOWER OF HANOI
// ========================================================
const HANOI_STORAGE_KEY = 'ct_gamelab_hanoi_records_v1';
const HANOI_LAST_KEY = 'ct_gamelab_hanoi_last_active';

function getHanoiRecords() {
  try {
    return JSON.parse(localStorage.getItem(HANOI_STORAGE_KEY) || '{}');
  } catch (err) {
    console.warn('Gagal membaca localStorage Tower of Hanoi:', err);
    return {};
  }
}

function setHanoiRecords(records) {
  try {
    localStorage.setItem(HANOI_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Gagal menyimpan localStorage Tower of Hanoi:', err);
  }
}

function makeStudentKey(name, absen) {
  return `${(name || '').trim().toLowerCase()}___${(absen || '').trim().toLowerCase()}`;
}

function loadHanoiDataForStudent(name, absen) {
  const statusEl = document.getElementById('hanoiSaveStatus');
  if (!name && !absen) return;
  const key = makeStudentKey(name, absen);
  const records = getHanoiRecords();
  const data = records[key];
  if (data) {
    document.getElementById('hanoiAns1').value = data.ans1 || '';
    document.getElementById('hanoiAns2').value = data.ans2 || '';
    document.getElementById('hanoiAns3').value = data.ans3 || '';
    if (statusEl) {
      statusEl.innerHTML = `<span class="status-good"><svg class="ui-icon ui-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Jawaban tersimpan ditemukan (Disimpan: ${data.savedAt})</span>`;
    }
    // Jika data refleksi sudah terisi, sinkronkan ke status aktivitas hanoi
    if (typeof setActivityStatus === 'function' && (data.ans1 || data.ans2 || data.ans3)) {
      setActivityStatus('hanoi', true);
    }
  }
}

function saveHanoiReflection() {
  const name = (document.getElementById('hanoiStudentName')?.value || '').trim();
  const absen = (document.getElementById('hanoiStudentAbsen')?.value || '').trim();
  const ans1 = (document.getElementById('hanoiAns1')?.value || '').trim();
  const ans2 = (document.getElementById('hanoiAns2')?.value || '').trim();
  const ans3 = (document.getElementById('hanoiAns3')?.value || '').trim();
  const statusEl = document.getElementById('hanoiSaveStatus');

  if (!name || !absen) {
    if (statusEl) {
      statusEl.innerHTML = `<span class="status-warn"><svg class="ui-icon ui-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Mohon isi Nama Lengkap dan Nomor Absen / Kelas terlebih dahulu.</span>`;
    }
    document.getElementById(name ? 'hanoiStudentAbsen' : 'hanoiStudentName')?.focus();
    return;
  }

  if (!ans1 && !ans2 && !ans3) {
    if (statusEl) {
      statusEl.innerHTML = `<span class="status-warn"><svg class="ui-icon ui-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Mohon isi minimal salah satu pertanyaan refleksi sebelum menyimpan.</span>`;
    }
    document.getElementById('hanoiAns1')?.focus();
    return;
  }

  const key = makeStudentKey(name, absen);
  const records = getHanoiRecords();
  const nowStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  records[key] = {
    name,
    absen,
    ans1,
    ans2,
    ans3,
    savedAt: nowStr
  };

  setHanoiRecords(records);
  try {
    localStorage.setItem(HANOI_LAST_KEY, key);
  } catch (_) { }

  // Sinkronkan ke sistem progres pembelajaran (Tahap 4)
  if (typeof setActivityStatus === 'function') {
    setActivityStatus('hanoi', true);
  }

  if (statusEl) {
    statusEl.innerHTML = `<span class="status-good"><svg class="ui-icon ui-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Jawaban berhasil disimpan di perangkat ini pada ${nowStr}.</span>`;
  }
}

function editHanoiReflection() {
  const statusEl = document.getElementById('hanoiSaveStatus');
  ['hanoiStudentName', 'hanoiStudentAbsen', 'hanoiAns1', 'hanoiAns2', 'hanoiAns3'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.readOnly = false;
  });
  document.getElementById('hanoiAns1')?.focus();
  if (statusEl) {
    statusEl.innerHTML = `<span class="status-warn"><svg class="ui-icon ui-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg> Mode edit aktif. Silakan perbarui jawaban, lalu tekan “Simpan Jawaban”.</span>`;
  }
}

function getHanoiFormattedText() {
  const val = (id) => (document.getElementById(id)?.value || '-').trim();
  return `======================================================
REFLEKSI PENALARAN & STRATEGI ALGORITMIK — TOWER OF HANOI
CT GAME LAB — INFORMATIKA SMA KELAS X
======================================================

Identitas Siswa:
Nama Lengkap : ${val('hanoiStudentName')}
Nomor Absen  : ${val('hanoiStudentAbsen')}
Waktu Cetak  : ${new Date().toLocaleString('id-ID')}

------------------------------------------------------
1. Dekomposisi (Memecah Masalah):
Bagaimana masalah besar dipecah menjadi langkah kecil?
Jawaban:
${val('hanoiAns1')}

------------------------------------------------------
2. Pengenalan Pola (Pola Berulang):
Strategi atau gerakan apa yang selalu berulang saat memindahkan cakram?
Jawaban:
${val('hanoiAns2')}

------------------------------------------------------
3. Algoritma & Abstraksi (Efisiensi Langkah):
Bagaimana kamu membandingkan efisiensi strategi langkahmu?
Jawaban:
${val('hanoiAns3')}

======================================================
Catatan: Disimpan secara lokal di browser CT Game Lab.
======================================================`;
}

async function copyHanoiReflection() {
  const text = getHanoiFormattedText();
  const statusEl = document.getElementById('hanoiSaveStatus');
  try {
    await navigator.clipboard.writeText(text);
    if (statusEl) {
      statusEl.innerHTML = `<span class="status-good"><svg class="ui-icon ui-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Teks refleksi Tower of Hanoi berhasil disalin ke clipboard!</span>`;
    }
  } catch (_) {
    downloadHanoiReflection();
  }
}

function downloadHanoiReflection() {
  const text = getHanoiFormattedText();
  const name = (document.getElementById('hanoiStudentName')?.value || 'siswa')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `refleksi-hanoi-${name}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const statusEl = document.getElementById('hanoiSaveStatus');
  if (statusEl) {
    statusEl.innerHTML = `<span class="status-good"><svg class="ui-icon ui-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> File teks refleksi berhasil diunduh (${a.download}).</span>`;
  }
}

function initHanoiReflection() {
  document.getElementById('saveHanoiBtn')?.addEventListener('click', saveHanoiReflection);
  document.getElementById('editHanoiBtn')?.addEventListener('click', editHanoiReflection);
  document.getElementById('downloadHanoiBtn')?.addEventListener('click', downloadHanoiReflection);
  document.getElementById('copyHanoiBtn')?.addEventListener('click', copyHanoiReflection);

  const nameInput = document.getElementById('hanoiStudentName');
  const absenInput = document.getElementById('hanoiStudentAbsen');

  const onIdentityChange = () => {
    const n = (nameInput?.value || '').trim();
    const a = (absenInput?.value || '').trim();
    if (n && a) {
      loadHanoiDataForStudent(n, a);
    }
  };

  nameInput?.addEventListener('blur', onIdentityChange);
  absenInput?.addEventListener('blur', onIdentityChange);

  // Muat identitas dan jawaban terakhir yang tersimpan jika ada
  try {
    const lastKey = localStorage.getItem(HANOI_LAST_KEY);
    if (lastKey) {
      const records = getHanoiRecords();
      const data = records[lastKey];
      if (data && nameInput && absenInput) {
        nameInput.value = data.name || '';
        absenInput.value = data.absen || '';
        document.getElementById('hanoiAns1').value = data.ans1 || '';
        document.getElementById('hanoiAns2').value = data.ans2 || '';
        document.getElementById('hanoiAns3').value = data.ans3 || '';
        const statusEl = document.getElementById('hanoiSaveStatus');
        if (statusEl) {
          statusEl.innerHTML = `<span class="status-good"><svg class="ui-icon ui-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Memuat jawaban tersimpan (${data.name} - ${data.absen})</span>`;
        }
      }
    }
  } catch (_) { }
}

// ========================================================
// TAHAP 2: SISTEM IDENTITAS SISWA & PROFIL GLOBAL
// ========================================================
const STUDENT_STORAGE_KEY = 'ct_gamelab_student';

function getStudentProfile() {
  try {
    const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.name && data.absen && data.className) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Gagal membaca localStorage identitas siswa:', err);
    return null;
  }
}

function saveStudentProfile(name, absen, className) {
  const profile = {
    name: (name || '').trim(),
    absen: String(absen).trim(),
    className: String(className).trim(),
    savedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Gagal menyimpan profil siswa ke localStorage:', err);
  }
  return profile;
}

function updateNavStudentProfile(profile) {
  const container = document.getElementById('userNavProfile');
  const infoEl = document.getElementById('userProfileInfo');
  if (!container || !infoEl) return;

  if (profile && profile.name) {
    infoEl.textContent = `${profile.name} (${profile.className})`;
    container.style.display = 'flex';
  } else {
    container.style.display = 'none';
  }
}

function clearStudentFormErrors() {
  ['nameError', 'absenError', 'classError'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['studentInputName', 'studentInputAbsen', 'studentInputClass'].forEach((id) => {
    document.getElementById(id)?.classList.remove('input-invalid');
  });
}

function openStudentModal(prefill = true) {
  const modal = document.getElementById('studentModal');
  if (!modal) return;

  clearStudentFormErrors();

  if (prefill) {
    const current = getStudentProfile();
    if (current) {
      const nameInput = document.getElementById('studentInputName');
      const absenInput = document.getElementById('studentInputAbsen');
      const classInput = document.getElementById('studentInputClass');
      if (nameInput) nameInput.value = current.name || '';
      if (absenInput) absenInput.value = current.absen || '';
      if (classInput) classInput.value = current.className || '';
    }
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    document.getElementById('studentInputName')?.focus();
  }, 100);
}

function closeStudentModal() {
  const modal = document.getElementById('studentModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function validateAndSaveStudent(e) {
  if (e) e.preventDefault();
  clearStudentFormErrors();

  const nameInput = document.getElementById('studentInputName');
  const absenInput = document.getElementById('studentInputAbsen');
  const classInput = document.getElementById('studentInputClass');

  const nameVal = (nameInput?.value || '').trim();
  const absenVal = (absenInput?.value || '').trim();
  const classVal = (classInput?.value || '').trim();

  let hasError = false;

  if (!nameVal) {
    const err = document.getElementById('nameError');
    if (err) err.textContent = 'Nama lengkap wajib diisi.';
    nameInput?.classList.add('input-invalid');
    hasError = true;
  }

  const parsedAbsen = parseInt(absenVal, 10);
  if (!absenVal) {
    const err = document.getElementById('absenError');
    if (err) err.textContent = 'Nomor absen wajib diisi.';
    absenInput?.classList.add('input-invalid');
    hasError = true;
  } else if (isNaN(parsedAbsen) || parsedAbsen <= 0) {
    const err = document.getElementById('absenError');
    if (err) err.textContent = 'Nomor absen harus berupa angka positif.';
    absenInput?.classList.add('input-invalid');
    hasError = true;
  }

  const validClasses = ['X-1', 'X-2', 'X-3', 'X-4', 'X-5', 'X-6'];
  if (!classVal) {
    const err = document.getElementById('classError');
    if (err) err.textContent = 'Silakan pilih kelas.';
    classInput?.classList.add('input-invalid');
    hasError = true;
  } else if (!validClasses.includes(classVal)) {
    const err = document.getElementById('classError');
    if (err) err.textContent = 'Pilih kelas dari daftar yang tersedia.';
    classInput?.classList.add('input-invalid');
    hasError = true;
  }

  if (hasError) return false;

  const savedProfile = saveStudentProfile(nameVal, parsedAbsen, classVal);
  updateNavStudentProfile(savedProfile);

  // Kompatibilitas tanpa merusak rekaman Tower of Hanoi
  syncStudentToHanoi(savedProfile);

  // Sinkronkan progres pembelajaran spesifik untuk profil siswa ini (Tahap 4)
  if (typeof getStudentProgress === 'function') {
    const prog = getStudentProgress(savedProfile);
    if (typeof updateProgressUI === 'function') updateProgressUI(prog);
    if (typeof updateAsesmenGatingUI === 'function') updateAsesmenGatingUI(prog);
  }

  closeStudentModal();
  return true;
}

function syncStudentToHanoi(profile) {
  if (!profile) return;
  const hanoiName = document.getElementById('hanoiStudentName');
  const hanoiAbsen = document.getElementById('hanoiStudentAbsen');
  if (hanoiName && !hanoiName.value.trim()) {
    hanoiName.value = profile.name;
  }
  if (hanoiAbsen && !hanoiAbsen.value.trim()) {
    hanoiAbsen.value = `${profile.absen} / ${profile.className}`;
  }
  if (typeof loadHanoiDataForStudent === 'function') {
    loadHanoiDataForStudent(profile.name, `${profile.absen} / ${profile.className}`);
  }
}

function initStudentIdentitySystem() {
  const form = document.getElementById('studentIdentityForm');
  if (form) {
    form.addEventListener('submit', validateAndSaveStudent);
  }

  const changeBtn = document.getElementById('changeStudentBtn');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      openStudentModal(true);
    });
  }

  // Tutup modal jika tombol ESC ditekan hanya bila siswa sudah terdaftar
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && getStudentProfile()) {
      closeStudentModal();
    }
  });

  // Periksa profil saat inisialisasi awal
  const existing = getStudentProfile();
  if (existing) {
    updateNavStudentProfile(existing);
    syncStudentToHanoi(existing);
    closeStudentModal();
  } else {
    // Siswa belum mengisi profil, tampilkan formulir sambutan
    openStudentModal(false);
  }
}

// ========================================================
// TAHAP 4: SISTEM PROGRES PEMBELAJARAN & PENGUNCIAN ASESMEN
// ========================================================
const PROGRESS_STORAGE_KEY = 'ct_gamelab_progress_v1';

function getStudentStorageKey(profile) {
  if (!profile || !profile.name) return 'guest_student';
  const n = (profile.name || '').trim().toLowerCase().replace(/\s+/g, '_');
  const a = String(profile.absen || '').trim().toLowerCase();
  const c = String(profile.className || '').trim().toLowerCase().replace(/\s+/g, '_');
  return `${n}___${a}___${c}`;
}

function getAllProgressRecords() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || '{}');
  } catch (err) {
    console.warn('Gagal membaca localStorage progres:', err);
    return {};
  }
}

function saveAllProgressRecords(records) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Gagal menyimpan localStorage progres:', err);
  }
}

function getStudentProgress(profile = null) {
  const p = profile || getStudentProfile();
  const studentKey = getStudentStorageKey(p);
  const records = getAllProgressRecords();

  if (!records[studentKey]) {
    records[studentKey] = {
      studentKey,
      name: p?.name || 'Siswa',
      absen: p?.absen || '',
      className: p?.className || '',
      activities: {
        bacaan: false,
        video: false,
        hanoi: false,
        flowchart: false
      },
      completedCount: 0,
      progress: 0,
      updatedAt: new Date().toISOString()
    };
    saveAllProgressRecords(records);
  }

  // Hitung ulang dinamis persentase dan jumlah selesai (0, 25, 50, 75, 100)
  const act = records[studentKey].activities || {};
  let count = 0;
  if (act.bacaan) count++;
  if (act.video) count++;
  if (act.hanoi) count++;
  if (act.flowchart) count++;

  records[studentKey].completedCount = count;
  records[studentKey].progress = count * 25;

  return records[studentKey];
}

function setActivityStatus(activityKey, isComplete = true, profile = null) {
  const validKeys = ['bacaan', 'video', 'hanoi', 'flowchart'];
  if (!validKeys.includes(activityKey)) return null;

  const p = profile || getStudentProfile();
  const studentKey = getStudentStorageKey(p);
  const records = getAllProgressRecords();

  if (!records[studentKey]) {
    records[studentKey] = {
      studentKey,
      name: p?.name || 'Siswa',
      absen: p?.absen || '',
      className: p?.className || '',
      activities: {
        bacaan: false,
        video: false,
        hanoi: false,
        flowchart: false
      }
    };
  }

  if (!records[studentKey].activities) {
    records[studentKey].activities = { bacaan: false, video: false, hanoi: false, flowchart: false };
  }

  records[studentKey].activities[activityKey] = !!isComplete;
  records[studentKey].updatedAt = new Date().toISOString();

  // Hitung ulang dinamis
  const act = records[studentKey].activities;
  let count = 0;
  if (act.bacaan) count++;
  if (act.video) count++;
  if (act.hanoi) count++;
  if (act.flowchart) count++;

  records[studentKey].completedCount = count;
  records[studentKey].progress = count * 25;

  saveAllProgressRecords(records);

  // Perbarui tampilan antarmuka
  updateProgressUI(records[studentKey]);
  updateAsesmenGatingUI(records[studentKey]);

  return records[studentKey];
}

function isAssessmentUnlocked(profile = null) {
  const data = getStudentProgress(profile);
  return !!(data && data.progress >= 100);
}

function updateProgressUI(progData) {
  if (!progData) progData = getStudentProgress();

  const countEl = document.getElementById('materiProgressCount');
  const pctEl = document.getElementById('materiProgressPercent');
  const barEl = document.getElementById('materiProgressBar');
  const celebEl = document.getElementById('materiProgressCelebration');

  if (countEl) countEl.textContent = `${progData.completedCount} dari 4 aktivitas`;
  if (pctEl) pctEl.textContent = `${progData.progress}%`;
  if (barEl) {
    barEl.style.width = `${progData.progress}%`;
    barEl.setAttribute('aria-valuenow', progData.progress);
  }
  if (celebEl) {
    celebEl.style.display = progData.progress === 100 ? 'flex' : 'none';
  }

  // Update pills pada kartu Progres Pembelajaran
  const act = progData.activities || {};
  const setPill = (pillId, isDone) => {
    const el = document.getElementById(pillId);
    if (!el) return;
    if (isDone) {
      el.textContent = 'Selesai';
      el.classList.remove('status-uncompleted');
      el.classList.add('status-completed');
    } else {
      el.textContent = 'Belum selesai';
      el.classList.remove('status-completed');
      el.classList.add('status-uncompleted');
    }
  };

  setPill('progPillBacaan', act.bacaan);
  setPill('progPillVideo', act.video);
  setPill('progPillHanoi', act.hanoi);
  setPill('progPillFlowchart', act.flowchart);

  // Update pills pada 4 Grid Kartu Aktivitas Materi
  const setCardPill = (pillId, isDone) => {
    const el = document.getElementById(pillId);
    if (!el) return;
    if (isDone) {
      el.textContent = 'Selesai';
      el.classList.remove('status-uncompleted');
      el.classList.add('status-completed');
    } else {
      el.textContent = 'Belum selesai';
      el.classList.remove('status-completed');
      el.classList.add('status-uncompleted');
    }
  };

  setCardPill('cardStatusPillBacaan', act.bacaan);
  setCardPill('cardStatusPillVideo', act.video);
  setCardPill('cardStatusPillHanoi', act.hanoi);
  setCardPill('cardStatusPillFlowchart', act.flowchart);

  // Update tombol konfirmasi Bacaan
  const btnBacaan = document.getElementById('btnCompleteBacaan');
  const badgeBacaan = document.getElementById('badgeCompleteBacaan');
  if (btnBacaan && badgeBacaan) {
    if (act.bacaan) {
      btnBacaan.style.display = 'none';
      badgeBacaan.style.display = 'inline-flex';
    } else {
      btnBacaan.style.display = 'inline-block';
      badgeBacaan.style.display = 'none';
    }
  }

  // Update tombol konfirmasi Video
  const btnVideo = document.getElementById('btnCompleteVideo');
  const badgeVideo = document.getElementById('badgeCompleteVideo');
  if (btnVideo && badgeVideo) {
    if (act.video) {
      btnVideo.style.display = 'none';
      badgeVideo.style.display = 'inline-flex';
    } else {
      btnVideo.style.display = 'inline-block';
      badgeVideo.style.display = 'none';
    }
  }

  // Update badge Hanoi
  const badgeHanoi = document.getElementById('badgeCompleteHanoi');
  if (badgeHanoi) {
    badgeHanoi.style.display = act.hanoi ? 'inline-flex' : 'none';
  }

  // Update badge Flowchart
  const badgeFlowchart = document.getElementById('badgeCompleteFlowchart');
  if (badgeFlowchart) {
    badgeFlowchart.style.display = act.flowchart ? 'inline-flex' : 'none';
  }
}

function updateAsesmenGatingUI(progData) {
  if (!progData) progData = getStudentProgress();
  const isUnlocked = progData.progress >= 100;

  // Update Lock Icon pada Topbar Nav
  const lockIcon = document.getElementById('navLockIcon');
  const asesmenNavLink = document.querySelector('nav a[data-page="asesmen"]');
  if (lockIcon) {
    lockIcon.style.display = isUnlocked ? 'none' : 'inline-block';
  }
  if (asesmenNavLink) {
    asesmenNavLink.classList.toggle('assessment-unlocked', isUnlocked);
  }

  // Update Tampilan Halaman Asesmen (Locked vs Unlocked)
  const lockedView = document.getElementById('asesmenLockedView');
  const unlockedView = document.getElementById('asesmenUnlockedView');

  if (isUnlocked) {
    if (lockedView) lockedView.style.display = 'none';
    if (unlockedView) unlockedView.style.display = 'block';
  } else {
    if (lockedView) lockedView.style.display = 'block';
    if (unlockedView) unlockedView.style.display = 'none';

    const pctEl = document.getElementById('lockedProgressPercent');
    const barEl = document.getElementById('lockedProgressBar');
    const hintEl = document.getElementById('lockedProgressHint');
    const statusBtn = document.getElementById('btnLockedStatus');

    if (pctEl) pctEl.textContent = `${progData.progress}%`;
    if (barEl) barEl.style.width = `${progData.progress}%`;
    if (hintEl) hintEl.textContent = `${progData.completedCount} dari 4 aktivitas selesai`;
    if (statusBtn) statusBtn.innerHTML = `<svg class="ui-icon ui-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> <span>Asesmen Terkunci (${progData.progress}%)</span>`;
  }
}

let pendingConfirmationActivity = null;

function openCompletionConfirm(activityKey, iconSvg, title, desc) {
  pendingConfirmationActivity = activityKey;
  const modal = document.getElementById('completionConfirmModal');
  const iconEl = document.getElementById('confirmModalIcon');
  const titleEl = document.getElementById('confirmModalTitle');
  const descEl = document.getElementById('confirmModalDesc');

  if (iconEl) iconEl.innerHTML = iconSvg;
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  if (modal) modal.style.display = 'flex';
}

function closeCompletionConfirm() {
  pendingConfirmationActivity = null;
  const modal = document.getElementById('completionConfirmModal');
  if (modal) modal.style.display = 'none';
}

function initTahap4ProgressSystem() {
  // Tombol konfirmasi bacaan
  const btnBacaan = document.getElementById('btnCompleteBacaan');
  if (btnBacaan) {
    btnBacaan.addEventListener('click', () => {
      openCompletionConfirm(
        'bacaan',
        `<svg class="ui-icon ui-icon-xl text-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
        'Selesai Mempelajari Bahan Ajar?',
        'Apakah kamu sudah membaca dan memahami seluruh materi pengantar Berpikir Komputasional?'
      );
    });
  }

  // Tombol konfirmasi video
  const btnVideo = document.getElementById('btnCompleteVideo');
  if (btnVideo) {
    btnVideo.addEventListener('click', () => {
      openCompletionConfirm(
        'video',
        `<svg class="ui-icon ui-icon-xl text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon></svg>`,
        'Selesai Menyimak Video Pembelajaran?',
        'Apakah kamu sudah menyimak penjelasan konsep Berpikir Komputasional pada video sampai tuntas?'
      );
    });
  }

  // Tombol modal konfirmasi
  const confirmYes = document.getElementById('confirmBtnYes');
  if (confirmYes) {
    confirmYes.addEventListener('click', () => {
      if (pendingConfirmationActivity) {
        setActivityStatus(pendingConfirmationActivity, true);
      }
      closeCompletionConfirm();
    });
  }

  const confirmCancel = document.getElementById('confirmBtnCancel');
  if (confirmCancel) {
    confirmCancel.addEventListener('click', () => {
      closeCompletionConfirm();
    });
  }

  const confirmModal = document.getElementById('completionConfirmModal');
  if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
      if (e.target === confirmModal) {
        closeCompletionConfirm();
      }
    });
  }

  // Tombol kembali ke materi dari asesmen terkunci
  const btnLockedToMateri = document.getElementById('btnLockedToMateri');
  if (btnLockedToMateri) {
    btnLockedToMateri.addEventListener('click', () => {
      history.pushState(null, '', '#materi');
      showPage('materi', 'bacaan');
    });
  }

  // Tombol mulai asesmen (scroll ke kuis) pada asesmen terbuka
  const btnScrollQuiz = document.getElementById('btnScrollToQuiz');
  if (btnScrollQuiz) {
    btnScrollQuiz.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('ujiPemahamanSection');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Tombol Mulai Mengerjakan Kuis
  const btnStartQuiz = document.getElementById('btnStartQuizAction');
  if (btnStartQuiz) {
    btnStartQuiz.addEventListener('click', () => {
      const frameWrap = document.getElementById('waygroundFrameWrap');
      if (frameWrap) {
        frameWrap.classList.remove('hidden');
        frameWrap.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Expose to window for external integration & test runners
  window.setActivityStatus = setActivityStatus;
  window.getStudentProgress = getStudentProgress;
  window.isAssessmentUnlocked = isAssessmentUnlocked;
  window.updateProgressUI = updateProgressUI;
  window.updateAsesmenGatingUI = updateAsesmenGatingUI;

  // Inisialisasi awal UI progres
  const prog = getStudentProgress();
  updateProgressUI(prog);
  updateAsesmenGatingUI(prog);
}

// Inisialisasi event listener navigasi setelah DOM siap
window.addEventListener('DOMContentLoaded', () => {
  // Event listener menu utama topbar
  document.querySelectorAll('.topbar nav a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = a.dataset.page;
      history.pushState(null, '', `#${pageId}`);
      showPage(pageId);
    });
  });

  // Event listener kartu aktivitas Materi (Satu-satunya pemilih aktivitas pembelajaran)
  document.querySelectorAll('#materiActivities .activity-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const subtab = card.dataset.subtab;
      if (subtab) {
        showMateriSubtab(subtab);
        history.replaceState(null, '', `#materi-${subtab}`);
        const subbabContent = document.getElementById('materiSubbabContent');
        if (subbabContent) {
          subbabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Event listener subbab Asesmen
  document.querySelectorAll('#page-asesmen .subtab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const subtab = btn.dataset.subtab;
      showAsesmenSubtab(subtab);
      history.replaceState(null, '', `#asesmen-${subtab}`);
    });
  });

  // Tombol CTA Hero: Mulai Membaca Materi
  const heroStartBtn = document.getElementById('heroStartBtn');
  if (heroStartBtn) {
    heroStartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState(null, '', '#materi');
      showPage('materi', 'bacaan');
    });
  }

  // Tombol CTA Hero: Mulai Menyusun Flowchart
  const heroFlowchartBtn = document.getElementById('heroFlowchartBtn');
  if (heroFlowchartBtn) {
    heroFlowchartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState(null, '', '#flowchart');
      showPage('materi', 'flowchart');
    });
  }

  // Logo Brand kembali ke Beranda
  const brandLink = document.getElementById('brandLink');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState(null, '', '#beranda');
      showPage('beranda');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Footer Brand kembali ke Beranda
  const footerBrand = document.querySelector('footer .footer-brand-header, footer .footer-brand');
  if (footerBrand) {
    footerBrand.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState(null, '', '#beranda');
      showPage('beranda');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Footer Navigation Links
  document.querySelectorAll('footer a[data-page]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = a.dataset.page;
      history.pushState(null, '', `#${pageId}`);
      showPage(pageId);
    });
  });

  // Footer Scroll-to Links (misal Informasi Pembelajaran)
  document.querySelectorAll('footer a[data-scroll-to]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = a.dataset.scrollTo;
      history.pushState(null, '', `#${targetId}`);
      showPage('tentang', null, false);
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    });
  });

  // Tombol Kembali ke Atas
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Tombol dari Studi Kasus Terpadu menuju Kanvas Flowchart
  const caseToCanvasBtn = document.getElementById('caseToCanvasBtn');
  if (caseToCanvasBtn) {
    caseToCanvasBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('builderWorkspace')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Inisialisasi formulir refleksi Tower of Hanoi
  initHanoiReflection();

  // Inisialisasi sistem identitas siswa global (Tahap 2)
  initStudentIdentitySystem();

  // Inisialisasi sistem progres pembelajaran & penguncian asesmen (Tahap 4)
  initTahap4ProgressSystem();

  // Eksekusi routing awal berdasarkan hash URL
  handleRoute();
});

window.addEventListener('hashchange', handleRoute);

// Accordion penjelasan materi fondasi
document.querySelectorAll('[data-expand]').forEach(button => {
  button.addEventListener('click', () => {
    const panel = document.getElementById(button.dataset.expand);
    if (!panel) return;
    panel.classList.toggle('open');
    button.textContent = panel.classList.contains('open') ? 'Tutup penjelasan ↑' : 'Pelajari lebih lanjut ↗';
  });
});





// Optional embeds: paste the URL from the iframe src supplied by the platform.
// Do not paste the whole iframe HTML here.
const WAYGROUND_EMBED_URL = "https://wayground.com/join?gc=63331139";
const GOOGLE_FORMS_EMBED_URL = "";
function setupEmbed(url, frameId, wrapId, placeholderId) {
  const frame = document.getElementById(frameId), wrap = document.getElementById(wrapId), placeholder = document.getElementById(placeholderId);
  if (url && frame && wrap && placeholder) { frame.src = url; wrap.classList.remove('hidden'); placeholder.classList.add('hidden'); }
}
setupEmbed(WAYGROUND_EMBED_URL, 'waygroundFrame', 'waygroundFrameWrap', 'waygroundPlaceholder');
setupEmbed(GOOGLE_FORMS_EMBED_URL, 'formsFrame', 'formsFrameWrap', 'formsPlaceholder');

// Include student identity and flowchart link when copying the reflection.
const copyButton = document.getElementById('copyReflection');
if (copyButton) { copyButton.addEventListener('click', async () => { const value = id => (document.getElementById(id)?.value || '').trim(); const text = `REFLEKSI CT GAME LAB\nNama: ${value('studentName') || '-'}\nKelas: ${value('studentClass') || '-'}\n\n1. Fondasi CT yang paling dipahami:\n${value('reflection1') || '-'}\n\n2. Bagian yang paling menantang:\n${value('reflection2') || '-'}\n\n3. Penerapan CT / perbaikan flowchart:\n${value('reflection3') || '-'}\n\nTautan flowchart: ${value('flowchartLink') || '-'}`; const statusEl = document.getElementById('copyStatus'); try { await navigator.clipboard.writeText(text); if (statusEl) statusEl.textContent = 'Refleksi disalin. Tempelkan ke dokumen atau formulir pengumpulan.'; } catch (e) { const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'refleksi-ct-game-lab.txt'; a.click(); URL.revokeObjectURL(url); if (statusEl) statusEl.textContent = 'Fitur salin tidak tersedia; file refleksi diunduh.'; } }); }


// ========================================================
// FLOWCHART BUILDER REVISED
// Interactive Drag-and-Drop, Visual Connectors, YA/TIDAK Branches,
// Editable Decisions, and Comprehensive Algorithm Validation
// ========================================================
(() => {
  const canvas = document.getElementById('flowchartCanvas');
  if (!canvas) return;

  const $ = (id) => document.getElementById(id);

  const esc = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const types = {
    start: { label: 'Mulai', icon: '⬭', shape: 'terminal' },
    end: { label: 'Selesai', icon: '⬭', shape: 'terminal' },
    process: { label: 'Proses', icon: '▭', shape: 'process' },
    io: { label: 'Input / Output', icon: '▱', shape: 'io' },
    decision: { label: 'Keputusan', icon: '◇', shape: 'decision' }
  };

  // 5 Studi Kasus Mode Belajar Terpandu
  const guidedCases = {
    school: {
      title: 'Memeriksa perlengkapan sekolah',
      brief: 'Sebelum berangkat, periksa jadwal dan buku. Jika perlengkapan sudah lengkap (YA), berangkat ke sekolah. Jika belum lengkap (TIDAK), lengkapi perlengkapan terlebih dahulu lalu periksa kembali.',
      goals: [
        'Mulai dengan memeriksa jadwal dan buku',
        'Buat keputusan kondisi kelengkapan perlengkapan',
        'Cabang YA: langsung berangkat ke sekolah',
        'Cabang TIDAK: lengkapi perlengkapan dan ulangi pemeriksaan'
      ],
      keywords: ['jadwal', 'buku', 'lengkap', 'berangkat'],
      guidanceText: 'Diagram bantuan telah disiapkan. Alur awal (Mulai ➔ Periksa jadwal & buku ➔ Apakah perlengkapan lengkap?) dan cabang perulangan TIDAK (Lengkapi perlengkapan ➔ Periksa jadwal & buku) sudah terpasang.',
      unlinkedPrompt: 'Tarik panah atau klik tombol YA ↙ pada simbol “Apakah perlengkapan lengkap?” lalu hubungkan ke titik masuk (●) simbol “Berangkat ke sekolah”.',
      template: [
        ['start', 'Mulai', 270, 25],
        ['io', 'Periksa jadwal & buku', 230, 105],
        ['decision', 'Apakah perlengkapan lengkap?', 200, 195],
        ['process', 'Lengkapi perlengkapan', 40, 335],
        ['process', 'Berangkat ke sekolah', 420, 335],
        ['end', 'Selesai', 450, 435]
      ],
      // [2, 'yes', 4] sengaja dikosongkan agar murid melengkapi cabang YA
      links: [
        [0, 'next', 1],
        [1, 'next', 2],
        [2, 'no', 3],
        [3, 'next', 1],
        [4, 'next', 5]
      ]
    },
    umbrella: {
      title: 'Memutuskan membawa payung',
      brief: 'Sebelum bepergian, periksa kondisi cuaca. Jika hujan (YA), bawa payung lalu lanjutkan perjalanan. Jika tidak hujan (TIDAK), langsung lanjutkan perjalanan tanpa payung.',
      goals: [
        'Mulai dari memeriksa kondisi cuaca',
        'Keputusan: Apakah kondisi sedang hujan?',
        'Cabang YA: bawa payung sebelum berangkat',
        'Cabang TIDAK: lanjutkan perjalanan tanpa payung'
      ],
      keywords: ['cuaca', 'hujan', 'payung'],
      guidanceText: 'Diagram bantuan telah disiapkan. Alur awal dan cabang membawa payung saat hujan (YA) sudah terpasang rapi.',
      unlinkedPrompt: 'Tarik panah atau klik tombol TIDAK ↘ pada simbol “Apakah cuaca hujan?” lalu hubungkan ke titik masuk (●) simbol “Lanjut tanpa payung”.',
      template: [
        ['start', 'Mulai', 270, 25],
        ['io', 'Periksa kondisi cuaca', 230, 105],
        ['decision', 'Apakah cuaca hujan?', 210, 195],
        ['process', 'Bawa payung', 60, 335],
        ['process', 'Lanjut tanpa payung', 420, 335],
        ['end', 'Selesai', 270, 440]
      ],
      // [2, 'no', 4] sengaja dikosongkan agar murid melengkapi cabang TIDAK
      links: [
        [0, 'next', 1],
        [1, 'next', 2],
        [2, 'yes', 3],
        [3, 'next', 5]
      ]
    },
    homework: {
      title: 'Memeriksa pengumpulan tugas digital',
      brief: 'Sebelum batas waktu pengumpulan tugas, periksa berkas tugas. Jika tugas sudah sesuai instruksi (YA), kirim tugas ke portal. Jika belum sesuai (TIDAK), perbaiki tugas terlebih dahulu lalu periksa kembali.',
      goals: [
        'Periksa isi dan berkas tugas',
        'Keputusan: Apakah tugas sudah sesuai?',
        'Cabang YA: kirim tugas ke portal',
        'Cabang TIDAK: perbaiki tugas dan cek ulang'
      ],
      keywords: ['tugas', 'berkas', 'sesuai', 'kirim'],
      guidanceText: 'Diagram bantuan telah disiapkan. Alur pemeriksaan berkas dan perulangan perbaikan tugas TIDAK sudah terhubung.',
      unlinkedPrompt: 'Tarik panah atau klik tombol YA ↙ pada simbol “Apakah tugas sudah sesuai?” lalu hubungkan ke titik masuk (●) simbol “Kirim tugas ke portal”.',
      template: [
        ['start', 'Mulai', 270, 25],
        ['io', 'Periksa berkas tugas', 230, 105],
        ['decision', 'Apakah tugas sudah sesuai?', 200, 195],
        ['process', 'Perbaiki berkas tugas', 40, 335],
        ['process', 'Kirim tugas ke portal', 420, 335],
        ['end', 'Selesai', 450, 435]
      ],
      // [2, 'yes', 4] sengaja dikosongkan agar murid melengkapi cabang YA
      links: [
        [0, 'next', 1],
        [1, 'next', 2],
        [2, 'no', 3],
        [3, 'next', 1],
        [4, 'next', 5]
      ]
    },
    canteen: {
      title: 'Mengambil pesanan di kantin sekolah',
      brief: 'Pilih menu makanan yang diinginkan. Periksa apakah menu tersedia. Jika tersedia (YA), lakukan pembayaran dan ambil pesanan. Jika habis (TIDAK), pilih menu lain.',
      goals: [
        'Pilih menu makanan di kantin',
        'Keputusan: Apakah menu tersedia?',
        'Cabang YA: proses pembayaran dan ambil pesanan',
        'Cabang TIDAK: pilih menu alternatif lain'
      ],
      keywords: ['menu', 'tersedia', 'bayar', 'pesanan'],
      guidanceText: 'Diagram bantuan telah disiapkan. Alur memilih menu dan cabang alternatif TIDAK (Pilih menu lain) sudah terpasang.',
      unlinkedPrompt: 'Tarik panah atau klik tombol YA ↙ pada simbol “Apakah menu tersedia?” lalu hubungkan ke titik masuk (●) simbol “Bayar & ambil pesanan”.',
      template: [
        ['start', 'Mulai', 270, 25],
        ['process', 'Pilih menu makanan', 230, 105],
        ['decision', 'Apakah menu tersedia?', 210, 195],
        ['process', 'Pilih menu lain', 60, 335],
        ['process', 'Bayar & ambil pesanan', 420, 335],
        ['end', 'Selesai', 450, 435]
      ],
      // [2, 'yes', 4] sengaja dikosongkan
      links: [
        [0, 'next', 1],
        [1, 'next', 2],
        [2, 'no', 3],
        [3, 'next', 1],
        [4, 'next', 5]
      ]
    },
    waste: {
      title: 'Memilah sampah di lingkungan sekolah',
      brief: 'Kenali jenis sampah yang akan dibuang. Jika sampah organik (YA), masukkan ke tempat sampah organik. Jika sampah anorganik (TIDAK), masukkan ke tempat sampah anorganik.',
      goals: [
        'Identifikasi jenis sampah yang dipegang',
        'Keputusan: Apakah termasuk sampah organik?',
        'Cabang YA: buang ke tempat sampah organik',
        'Cabang TIDAK: buang ke tempat sampah anorganik'
      ],
      keywords: ['sampah', 'jenis', 'organik', 'anorganik'],
      guidanceText: 'Diagram bantuan telah disiapkan. Alur identifikasi sampah dan cabang pembuangan sampah organik (YA) sudah terpasang.',
      unlinkedPrompt: 'Tarik panah atau klik tombol TIDAK ↘ pada simbol “Apakah sampah organik?” lalu hubungkan ke titik masuk (●) simbol “Buang ke tempat anorganik”.',
      template: [
        ['start', 'Mulai', 270, 25],
        ['io', 'Identifikasi jenis sampah', 220, 105],
        ['decision', 'Apakah sampah organik?', 200, 195],
        ['process', 'Buang ke tempat anorganik', 40, 335],
        ['process', 'Buang ke tempat organik', 420, 335],
        ['end', 'Selesai', 270, 440]
      ],
      // [2, 'no', 3] sengaja dikosongkan
      links: [
        [0, 'next', 1],
        [1, 'next', 2],
        [2, 'yes', 4],
        [3, 'next', 5],
        [4, 'next', 5]
      ]
    }
  };

  // 5 Studi Kasus Berbeda untuk Mode Tantangan Mandiri
  const independentCases = {
    library: {
      title: 'Meminjam buku di perpustakaan',
      brief: 'Aturan perpustakaan: siswa harus memiliki kartu anggota aktif dan tidak memiliki riwayat buku terlambat. Jika syarat terpenuhi (YA), proses peminjaman disetujui. Jika tidak (TIDAK), selesaikan kewajiban terlebih dahulu.',
      goals: [
        'Periksa status keanggotaan perpustakaan',
        'Gunakan simbol Keputusan untuk mengecek syarat',
        'Arahkan cabang YA untuk menyetujui peminjaman',
        'Arahkan cabang TIDAK untuk penyelesaian tanggungan'
      ],
      keywords: ['anggota', 'terlambat', 'pinjam', 'buku']
    },
    battery: {
      title: 'Memeriksa daya baterai ponsel',
      brief: 'Aturan: periksa persentase baterai ponsel. Jika baterai di bawah 20% (YA), isi daya (charge) ponsel. Jika baterai 20% atau lebih (TIDAK), gunakan ponsel seperti biasa.',
      goals: [
        'Input/Cek persentase daya baterai',
        'Gunakan simbol Keputusan dengan batas 20%',
        'Cabang YA: sambungkan ke pengisi daya',
        'Cabang TIDAK: gunakan ponsel untuk aktivitas'
      ],
      keywords: ['baterai', '20%', 'isi daya']
    },
    crossing: {
      title: 'Menyeberang jalan raya dengan aman',
      brief: 'Aturan keselamatan: pejalan kaki hanya boleh menyeberang jika lampu penyeberangan berwarna hijau dan kendaraan telah berhenti. Jika belum aman (TIDAK), tetap tunggu di trotoar.',
      goals: [
        'Amati lampu pejalan kaki dan kendaraan',
        'Keputusan: Apakah kondisi sudah aman untuk menyeberang?',
        'Cabang YA: menyeberang jalan dengan waspada',
        'Cabang TIDAK: tunggu di trotoar sampai aman'
      ],
      keywords: ['lampu', 'kendaraan', 'aman', 'menyeberang']
    },
    stationery: {
      title: 'Membeli alat tulis di koperasi',
      brief: 'Aturan: pilih alat tulis yang dibutuhkan lalu hitung total belanja. Bandingkan dengan uang yang dibawa. Jika uang cukup (YA), lakukan pembayaran di kasir. Jika tidak cukup (TIDAK), kurangi barang belanjaan atau cari alternatif.',
      goals: [
        'Hitung total belanja alat tulis',
        'Keputusan: Apakah uang mencukupi total harga?',
        'Cabang YA: bayar pesanan di kasir',
        'Cabang TIDAK: kurangi belanjaan atau cari alternatif'
      ],
      keywords: ['harga', 'uang', 'cukup', 'bayar']
    },
    classroom: {
      title: 'Memeriksa kebersihan & keamanan kelas sebelum pulang',
      brief: 'Aturan: sebelum meninggalkan ruang kelas, periksa apakah lampu/elektronik sudah dimatikan dan tidak ada sampah di lantai. Jika semua sudah rapi dan aman (YA), kunci pintu lalu pulang. Jika belum (TIDAK), bereskan terlebih dahulu.',
      goals: [
        'Periksa kondisi perangkat listrik dan kebersihan kelas',
        'Keputusan: Apakah kelas sudah bersih, aman, dan perangkat mati?',
        'Cabang YA: kunci pintu dan pulang ke rumah',
        'Cabang TIDAK: matikan perangkat dan bersihkan kelas'
      ],
      keywords: ['lampu', 'perangkat', 'sampah', 'kelas', 'pulang']
    }
  };

  let nodes = [];
  let nextId = 1;
  let selectedCase = 'school';
  let currentMode = 'guided';
  let pending = null; // { id: number, key: 'next' | 'yes' | 'no' }
  let dragNode = null;
  let dragOffset = { x: 0, y: 0 };
  let lastIssues = [];

  const cases = () => (currentMode === 'guided' ? guidedCases : independentCases);

  // Offscreen canvas for accurate font measurement (Autosize)
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  measureCtx.font = '700 12.5px "DM Sans", -apple-system, BlinkMacSystemFont, Arial, sans-serif';

  function splitTextIntoLines(text, targetWidth) {
    const paragraphs = String(text || '').split('\n');
    const lines = [];
    paragraphs.forEach((para) => {
      const words = para.trim().split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push('');
        return;
      }
      let currentLine = words[0];
      for (let i = 1; i < words.length; i++) {
        const candidate = currentLine + ' ' + words[i];
        if (measureCtx.measureText(candidate).width <= targetWidth) {
          currentLine = candidate;
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);
    });
    return lines.length ? lines : [''];
  }

  function computeNodeMetrics(node) {
    const text = (node.text || '').trim() || types[node.type].label;
    const type = node.type;

    let targetLineWidth = 150;
    if (type === 'start' || type === 'end') targetLineWidth = 110;
    else if (type === 'decision') targetLineWidth = 135;
    else if (type === 'process') targetLineWidth = 160;
    else if (type === 'io') targetLineWidth = 150;

    const lines = splitTextIntoLines(text, targetLineWidth);
    const maxLineWidth = Math.max(...lines.map((l) => measureCtx.measureText(l).width));
    const lineHeight = 18;
    const textHeight = lines.length * lineHeight;

    let w, h;
    if (type === 'start' || type === 'end') {
      w = Math.max(110, Math.round(maxLineWidth + 46));
      h = Math.max(46, Math.round(textHeight + 20));
    } else if (type === 'process') {
      w = Math.max(120, Math.round(maxLineWidth + 36));
      h = Math.max(46, Math.round(textHeight + 22));
    } else if (type === 'io') {
      const slant = 16;
      w = Math.max(135, Math.round(maxLineWidth + slant * 2 + 28));
      h = Math.max(48, Math.round(textHeight + 22));
    } else if (type === 'decision') {
      w = Math.max(140, Math.round(maxLineWidth * 1.45 + 46));
      h = Math.max(82, Math.round(textHeight * 1.55 + 44));
    }

    node.w = w;
    node.h = h;
    node.lines = lines;
    return { w, h, lines };
  }

  const makeNode = (type, text, x, y) => {
    const n = {
      id: nextId++,
      type,
      text: text || types[type].label,
      x: Math.round(x),
      y: Math.round(y),
      w: 150,
      h: 50,
      next: null,
      yes: null,
      no: null
    };
    computeNodeMetrics(n);
    return n;
  };

  function setFeedback(kind, title, items = []) {
    const box = $('builderFeedback');
    if (!box) return;
    box.className = 'builder-feedback ' + kind;
    box.innerHTML =
      `<b>${esc(title)}</b>` +
      (items.length ? '<ul>' + items.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>' : '');
  }

  function updateCaseUI() {
    const c = cases()[selectedCase];
    if (!c) return;
    $('caseBrief').innerHTML = `<h3>${esc(c.title)}</h3><p>${esc(c.brief)}</p>`;
    $('caseGoals').innerHTML =
      '<b>Target solusi:</b><ul>' + c.goals.map((g) => `<li>${esc(g)}</li>`).join('') + '</ul>';

    const instr = $('modeInstructions');
    if (instr) {
      if (currentMode === 'guided') {
        instr.innerHTML = `
          <div class="guided-help-header">
            <b>Panduan & Bantuan Pengerjaan Terpandu: ${esc(c.title)}</b>
          </div>
          <p class="guided-help-desc">${esc(c.guidanceText || 'Diagram bantuan telah disiapkan di kanvas. Lengkapi langkah atau cabang yang masih terputus sesuai permasalahan.')}</p>
          <div class="guided-step-badge-row">
            <span class="guided-badge-item unlinked-badge">Langkah yang perlu kamu lengkapi: <strong>${esc(c.unlinkedPrompt || 'Hubungkan cabang yang belum tersambung ke langkah tujuan')}</strong></span>
            <span class="guided-badge-item target-badge">Simbol tujuan ditandai dengan bingkai putus-putus ungu dan badge khusus</span>
          </div>
        `;
      } else {
        instr.innerHTML = `
          <div class="guided-help-header">
            <b>Panduan Mode Tantangan Mandiri: ${esc(c.title)}</b>
          </div>
          <p class="guided-help-desc">Bangun diagram alur dari awal. Kanvas dimulai bersih dari Mulai dan Selesai. Seret simbol dari palet kiri, isi teks langkah secara spesifik, dan tarik panah dari node ungu ke simbol tujuan.</p>
          <div class="guided-step-badge-row">
            <span class="guided-badge-item free-badge">Pastikan simbol Keputusan memiliki percabangan YA dan TIDAK yang lengkap menuju langkah penyelesaian berbeda.</span>
          </div>
        `;
      }
    }
  }

  function updateCaseOptions() {
    const select = $('caseSelect');
    if (!select) return;
    select.innerHTML = '';
    const caseList = Object.entries(cases());
    caseList.forEach(([key, c], i) => {
      const o = document.createElement('option');
      o.value = key;
      o.textContent = `${i + 1}. ${c.title}`;
      select.appendChild(o);
    });
    selectedCase = caseList[0][0];
    select.value = selectedCase;
    updateCaseUI();
  }

  function reset() {
    pending = null;
    lastIssues = [];
    nextId = 1;
    const c = cases()[selectedCase];

    if (currentMode === 'guided') {
      // Muat diagram awal sesuai kasus
      nodes = c.template.map((t) => makeNode(t[0], t[1], t[2], t[3]));
      if (c.links) {
        c.links.forEach(([i, key, j]) => {
          if (nodes[i] && nodes[j]) {
            nodes[i][key] = nodes[j].id;
          }
        });
      }
      setFeedback(
        'neutral',
        `Panduan Mode Terpandu — ${c.title}`,
        [
          c.guidanceText || 'Diagram bantuan telah disiapkan.',
          `Tugasmu: ${c.unlinkedPrompt || 'Hubungkan cabang yang belum tersambung.'}`,
          'Klik tombol cabang (YA ↙ atau TIDAK ↘) pada simbol Keputusan, lalu klik titik masuk (●) pada simbol tujuan.',
          'Tekan tombol “Petunjuk Kasus ?” jika butuh bantuan lebih lanjut, lalu tekan “Periksa Flowchart” jika sudah selesai.'
        ]
      );
    } else {
      // Mode Mandiri: kanvas awal bersih, hanya Mulai dan Selesai tanpa koneksi awal
      const start = makeNode('start', 'Mulai', 270, 25);
      const end = makeNode('end', 'Selesai', 270, 360);
      nodes = [start, end];
      setFeedback(
        'neutral',
        `Mode Tantangan Mandiri: ${c.title}`,
        [
          'Bangun flowchart sendiri dari awal sesuai studi kasus.',
          'Seret atau klik simbol dari palet kiri untuk menambahkan langkah.',
          'Tulis langkah atau pertanyaan kondisi pada setiap simbol.',
          'Tarik panah atau klik node ungu di bagian bawah simbol untuk menyambungkan alur.',
          'Gunakan simbol Keputusan untuk percabangan YA dan TIDAK.'
        ]
      );
    }

    render();
    $('builderStatus').textContent =
      'Petunjuk: klik atau tarik node ungu di bawah simbol untuk membuat panah lurus ke simbol tujuan.';
  }

  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('[data-mode]').forEach((b) => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    updateCaseOptions();
    reset();
  }

  document.querySelectorAll('[data-mode]').forEach((b) =>
    b.addEventListener('click', () => setMode(b.dataset.mode))
  );

  $('caseSelect').addEventListener('change', () => {
    selectedCase = $('caseSelect').value;
    updateCaseUI();
    reset();
  });

  function nodeBy(id) {
    return nodes.find((n) => n.id === id);
  }

  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: Math.round(e.clientX - r.left + canvas.scrollLeft),
      y: Math.round(e.clientY - r.top + canvas.scrollTop)
    };
  }

  function addNode(type, x = 270, y = 200) {
    const defaultTexts = {
      start: 'Mulai',
      end: 'Selesai',
      process: 'Langkah proses',
      io: 'Input / Output data',
      decision: 'Apakah kondisi terpenuhi?'
    };

    const clampX = Math.max(15, Math.min(x, Math.max(15, canvas.scrollWidth - 215)));
    const clampY = Math.max(15, y);

    if (type === 'start') {
      const existing = nodes.find((n) => n.type === 'start');
      if (existing) {
        existing.x = clampX;
        existing.y = clampY;
        render();
        setFeedback('neutral', 'Posisi Simbol Mulai diperbarui.', [
          'Simbol Mulai telah dipindahkan ke posisi baru pada kanvas.'
        ]);
        return;
      }
    }

    if (type === 'end') {
      const existing = nodes.find((n) => n.type === 'end');
      if (existing) {
        existing.x = clampX;
        existing.y = clampY;
        render();
        setFeedback('neutral', 'Posisi Simbol Selesai diperbarui.', [
          'Simbol Selesai telah dipindahkan ke posisi baru pada kanvas.'
        ]);
        return;
      }
    }

    const n = makeNode(type, defaultTexts[type], clampX, clampY);
    nodes.push(n);
    render();
    setFeedback('neutral', `${types[type].label} berhasil ditambahkan.`, [
      'Ketik isi langkah atau kondisi pada simbol.',
      'Klik atau tarik node ungu di bawah simbol untuk menyambungkannya ke simbol berikutnya.'
    ]);
  }

  // Palette interactions: Click to add or Drag to drop
  document.querySelectorAll('[data-node]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.node;
      const count = nodes.length;
      const posX = 160 + ((count % 3) * 190);
      const posY = 150 + (Math.floor(count / 3) * 110);
      addNode(type, posX, posY);
    });

    btn.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', 'new:' + btn.dataset.node);
      e.dataTransfer.effectAllowed = 'copy';
    });
  });

  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    canvas.classList.add('canvas-drop-active');
  });

  canvas.addEventListener('dragleave', (e) => {
    if (!canvas.contains(e.relatedTarget)) {
      canvas.classList.remove('canvas-drop-active');
    }
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    canvas.classList.remove('canvas-drop-active');
    const data = e.dataTransfer.getData('text/plain');
    if (data && data.startsWith('new:')) {
      const p = canvasPoint(e);
      addNode(data.slice(4), p.x - 75, p.y - 25);
    }
  });

  // Connecting Logic
  function connect(fromId, key, toId) {
    const from = nodeBy(fromId);
    const to = nodeBy(toId);
    if (!from || !to) return;

    if (from.type === 'end') {
      setFeedback('needs-work', 'Koneksi tidak dapat dibuat', [
        'Simbol Selesai adalah akhir dari alur dan tidak boleh memiliki panah keluar.'
      ]);
      return;
    }
    if (to.type === 'start') {
      setFeedback('needs-work', 'Koneksi tidak dapat dibuat', [
        'Panah tidak boleh mengarah langsung kembali ke simbol Mulai. Hubungkan ke proses atau keputusan.'
      ]);
      return;
    }
    if (from.id === to.id) {
      setFeedback('needs-work', 'Koneksi tidak dapat dibuat', [
        'Sebuah simbol tidak boleh langsung terhubung ke dirinya sendiri.'
      ]);
      return;
    }

    from[key] = to.id;
    pending = null;
    render();

    const branchName = key === 'yes' ? 'YA' : key === 'no' ? 'TIDAK' : 'Lanjut';
    setFeedback('neutral', `Koneksi panah berhasil dibuat (${branchName}).`, [
      `${from.text} ➔ ${to.text}`,
      'Garis panah otomatis menempel saat simbol dipindahkan.',
      'Klik tombol ✕ di sebelah tombol konektor jika ingin memutus koneksi.'
    ]);
  }

  function disconnect(nodeId, key) {
    const n = nodeBy(nodeId);
    if (!n) return;
    n[key] = null;
    pending = null;
    render();
    const branchName = key === 'yes' ? 'YA' : key === 'no' ? 'TIDAK' : 'Lanjut';
    setFeedback('neutral', `Koneksi panah (${branchName}) telah diputus.`, [
      `Simbol “${n.text}” sekarang belum terhubung pada konektor ini.`,
      'Pilih kembali konektor keluar jika ingin menyambungkannya ke simbol lain.'
    ]);
  }

  // Branch semantic issue check for current case
  function branchIssue(from, key, to) {
    if (from.type !== 'decision') return '';
    const a = (to.text || '').toLowerCase();

    if (selectedCase === 'school') {
      if (key === 'yes' && !/(berangkat|sekolah|jalan)/.test(a)) {
        return 'Cabang YA: jika perlengkapan sudah lengkap, alur seharusnya menuju tindakan berangkat sekolah.';
      }
      if (key === 'no' && !/(lengkapi|siapkan|periksa|buku)/.test(a)) {
        return 'Cabang TIDAK: jika perlengkapan belum lengkap, alur seharusnya menuju tindakan melengkapi perlengkapan.';
      }
    }
    if (selectedCase === 'umbrella') {
      if (key === 'yes' && !/(payung|bawa)/.test(a)) {
        return 'Cabang YA: jika cuaca hujan, alur seharusnya menuju tindakan membawa payung.';
      }
      if (key === 'no' && !/(tanpa|lanjut|tidak|jalan|berangkat)/.test(a)) {
        return 'Cabang TIDAK: jika tidak hujan, alur seharusnya melanjutkan perjalanan tanpa payung.';
      }
    }
    if (selectedCase === 'homework') {
      if (key === 'yes' && !/(kirim|unggah|kumpul|portal)/.test(a)) {
        return 'Cabang YA: jika tugas sudah sesuai, alur seharusnya menuju pengiriman tugas.';
      }
      if (key === 'no' && !/(perbaiki|revisi|lengkapi)/.test(a)) {
        return 'Cabang TIDAK: jika tugas belum sesuai, alur seharusnya menuju perbaikan berkas tugas.';
      }
    }
    if (selectedCase === 'canteen') {
      if (key === 'yes' && !/(bayar|pembayaran|ambil|pesanan)/.test(a)) {
        return 'Cabang YA: jika menu tersedia, alur seharusnya menuju proses pembayaran atau pengambilan pesanan.';
      }
      if (key === 'no' && !/(pilih|menu|lain|alternatif)/.test(a)) {
        return 'Cabang TIDAK: jika menu habis, alur seharusnya menuju pemilihan menu lain.';
      }
    }
    if (selectedCase === 'waste') {
      if (key === 'yes' && !/(organik)/.test(a)) {
        return 'Cabang YA: jika sampah organik, arahkan ke tempat sampah organik.';
      }
      if (key === 'no' && !/(anorganik)/.test(a)) {
        return 'Cabang TIDAK: jika sampah anorganik, arahkan ke tempat sampah anorganik.';
      }
    }
    if (selectedCase === 'battery') {
      if (key === 'yes' && !/(isi|daya|cas|charge)/.test(a)) {
        return 'Cabang YA: jika baterai di bawah 20%, alur seharusnya menuju tindakan mengisi daya.';
      }
      if (key === 'no' && !/(gunakan|pakai|lanjut)/.test(a)) {
        return 'Cabang TIDAK: jika baterai cukup, ponsel dapat digunakan normal.';
      }
    }
    if (selectedCase === 'library') {
      if (key === 'yes' && !/(setujui|boleh|pinjam|proses)/.test(a)) {
        return 'Cabang YA: jika syarat terpenuhi, peminjaman buku dapat disetujui.';
      }
      if (key === 'no' && !/(tolak|tanggungan|kembalikan|perbarui|selesaikan)/.test(a)) {
        return 'Cabang TIDAK: jika ada syarat yang belum lengkap, alur menuju penyelesaian tanggungan atau penolakan.';
      }
    }
    if (selectedCase === 'crossing') {
      if (key === 'yes' && !/(menyeberang|jalan|waspada)/.test(a)) {
        return 'Cabang YA: jika lampu hijau dan aman, alur menuju tindakan menyeberang jalan.';
      }
      if (key === 'no' && !/(tunggu|trotoar|diam|berhenti)/.test(a)) {
        return 'Cabang TIDAK: jika belum aman, arahkan ke tindakan menunggu di trotoar.';
      }
    }
    if (selectedCase === 'stationery') {
      if (key === 'yes' && !/(bayar|kasir|beli)/.test(a)) {
        return 'Cabang YA: jika uang cukup, lakukan pembayaran di kasir.';
      }
      if (key === 'no' && !/(kurangi|alternatif|batal|pilih)/.test(a)) {
        return 'Cabang TIDAK: jika uang tidak cukup, kurangi belanjaan atau cari alternatif.';
      }
    }
    if (selectedCase === 'classroom') {
      if (key === 'yes' && !/(kunci|pulang|selesai)/.test(a)) {
        return 'Cabang YA: jika kelas sudah rapi dan aman, kunci pintu dan pulang.';
      }
      if (key === 'no' && !/(matikan|bersihkan|bereskan|sampah)/.test(a)) {
        return 'Cabang TIDAK: jika masih ada yang menyala atau kotor, bereskan terlebih dahulu.';
      }
    }
    return '';
  }

  // Calculate port positions on canvas for SVG lines
  function portPoint(node, portType) {
    if (!node.w || !node.h) computeNodeMetrics(node);
    const w = node.w;
    const h = node.h;
    if (portType === 'input') {
      return {
        x: Math.round(node.x + w / 2),
        y: Math.round(node.y)
      };
    } else if (portType === 'yes') {
      return {
        x: Math.round(node.x + w * 0.22),
        y: Math.round(node.y + h + 15)
      };
    } else if (portType === 'no') {
      return {
        x: Math.round(node.x + w * 0.78),
        y: Math.round(node.y + h + 15)
      };
    } else {
      return {
        x: Math.round(node.x + w / 2),
        y: Math.round(node.y + h + 15)
      };
    }
  }

  // Pure Orthogonal (Manhattan 90°) path routing:
  function getOrthogonalPath(a, b, isLoop, gutterPref = 'auto') {
    // 1. Straight vertical line if x coordinates match closely
    if (!isLoop && Math.abs(b.x - a.x) <= 6 && b.y >= a.y + 12) {
      return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    }

    // 2. Forward flow (target is below source):
    if (!isLoop && b.y >= a.y + 12) {
      const midY = Math.round((a.y + b.y) / 2);
      return `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`;
    }

    // 3. Backward or Loop flow (target is above source or looping back):
    const yExit = a.y + 18;
    const yEnter = Math.max(12, b.y - 18);
    let gx;
    if (gutterPref === 'right' || (gutterPref === 'auto' && a.x > 380)) {
      gx = Math.max(a.x, b.x) + 70;
    } else {
      gx = Math.max(20, Math.min(a.x, b.x) - 70);
    }

    return `M ${a.x} ${a.y} L ${a.x} ${yExit} L ${gx} ${yExit} L ${gx} ${yEnter} L ${b.x} ${yEnter} L ${b.x} ${b.y}`;
  }

  // Draw SVG connection lines and arrowheads
  function drawConnections() {
    const svg = canvas.querySelector('.connection-layer');
    if (!svg) return;

    // Clean all previous lines, labels, and groups
    svg.querySelectorAll('.edge-element').forEach((e) => e.remove());

    nodes.forEach((n) => {
      const pairs =
        n.type === 'decision'
          ? [
            ['yes', n.yes, '#10b981', 'YA', 'url(#arrow-yes)'],
            ['no', n.no, '#f59e0b', 'TIDAK', 'url(#arrow-no)']
          ]
          : [['next', n.next, '#6366f1', '', 'url(#arrow-next)']];

      pairs.forEach(([key, targetId, color, label, marker]) => {
        if (!targetId) return;
        const to = nodeBy(targetId);
        if (!to) return;

        const a = portPoint(n, key);
        const b = portPoint(to, 'input');
        const isLoop = b.y < a.y + 12;
        const d = getOrthogonalPath(a, b, isLoop);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'edge edge-element');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('marker-end', marker);
        path.setAttribute('data-from', String(n.id));
        path.setAttribute('data-key', key);
        path.setAttribute('title', `Panah ${label || ''}: klik untuk memutus koneksi`);
        path.addEventListener('click', () => {
          if (confirm(`Putus koneksi panah ${label ? 'cabang ' + label : ''} dari “${n.text}” ke “${to.text}”?`)) {
            disconnect(n.id, key);
          }
        });
        svg.appendChild(path);

        // Branch badge labels for YA and TIDAK placed directly on horizontal segment
        if (label) {
          let midX, midY;
          if (b.y >= a.y + 12) {
            midX = Math.round((a.x + b.x) / 2);
            midY = Math.round((a.y + b.y) / 2);
            if (Math.abs(b.x - a.x) <= 8) {
              midX = a.x;
              midY = a.y + 20;
            }
          } else {
            midX = a.x;
            midY = a.y + 18;
          }

          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('class', 'edge-label-group edge-element');
          group.setAttribute('title', `Cabang ${label}: klik untuk memutus`);
          group.addEventListener('click', () => {
            if (confirm(`Putus koneksi cabang ${label} dari “${n.text}”?`)) {
              disconnect(n.id, key);
            }
          });

          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('class', 'edge-label-rect');
          rect.setAttribute('x', String(midX - 22));
          rect.setAttribute('y', String(midY - 10));
          rect.setAttribute('width', '44');
          rect.setAttribute('height', '20');
          rect.setAttribute('fill', color);

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('class', 'edge-label-text');
          text.setAttribute('x', String(midX));
          text.setAttribute('y', String(midY));
          text.setAttribute('fill', '#ffffff');
          text.textContent = label;

          group.appendChild(rect);
          group.appendChild(text);
          svg.appendChild(group);
        }
      });
    });
  }

  // Live Drag-to-Connect state tracker
  let activeDragConn = null; // { fromId, key, startPt, pointerId, moved, btn }

  function startDragConn(e, n, key, dotBtn) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    e.stopPropagation();

    const startPt = portPoint(n, key);
    activeDragConn = {
      fromId: n.id,
      key: key,
      startPt: startPt,
      pointerId: e.pointerId,
      moved: false,
      btn: dotBtn
    };

    try {
      dotBtn.setPointerCapture(e.pointerId);
    } catch (_) { }

    canvas.classList.add('connecting-mode');

    // Create or show live preview path on SVG
    const svg = canvas.querySelector('.connection-layer');
    if (svg) {
      let preview = svg.querySelector('#dragPreviewLine');
      if (!preview) {
        preview = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        preview.setAttribute('id', 'dragPreviewLine');
        preview.setAttribute('class', 'edge-preview');
        svg.appendChild(preview);
      }
      const color = key === 'yes' ? '#10b981' : key === 'no' ? '#f59e0b' : '#6366f1';
      const marker = key === 'yes' ? 'url(#arrow-yes)' : key === 'no' ? 'url(#arrow-no)' : 'url(#arrow-next)';
      preview.setAttribute('stroke', color);
      preview.setAttribute('marker-end', marker);
      preview.setAttribute('d', `M ${startPt.x} ${startPt.y} L ${startPt.x} ${startPt.y + 1}`);
      preview.style.display = 'block';
    }
  }

  function moveDragConn(e) {
    if (!activeDragConn) return;
    e.preventDefault();
    e.stopPropagation();

    const cur = canvasPoint(e);
    const dist = Math.hypot(cur.x - activeDragConn.startPt.x, cur.y - activeDragConn.startPt.y);
    if (dist > 7) {
      activeDragConn.moved = true;
    }

    const preview = canvas.querySelector('#dragPreviewLine');
    if (preview) {
      const isLoop = cur.y < activeDragConn.startPt.y + 12;
      const d = getOrthogonalPath(activeDragConn.startPt, cur, isLoop);
      preview.setAttribute('d', d);
    }

    // Highlight candidate target under cursor
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const targetCard = el?.closest('.visual-node');
    canvas.querySelectorAll('.visual-node').forEach((c) => {
      const isTarget = targetCard === c && Number(c.dataset.id) !== activeDragConn.fromId;
      c.classList.toggle('drop-target-hover', isTarget);
    });
  }

  function endDragConn(e) {
    if (!activeDragConn) return;
    e.preventDefault();
    e.stopPropagation();

    const { fromId, key, pointerId, btn, moved } = activeDragConn;
    try {
      btn.releasePointerCapture(pointerId);
    } catch (_) { }

    const preview = canvas.querySelector('#dragPreviewLine');
    if (preview) preview.remove();
    canvas.classList.remove('connecting-mode');
    canvas.querySelectorAll('.visual-node').forEach((c) => c.classList.remove('drop-target-hover'));

    activeDragConn = null;

    if (moved) {
      // User dragged and released over a node!
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const targetCard = el?.closest('.visual-node');
      if (targetCard) {
        const toId = Number(targetCard.dataset.id);
        if (toId && toId !== fromId) {
          connect(fromId, key, toId);
          return;
        }
      }
      setFeedback('neutral', 'Tarik panah dibatalkan.', [
        'Lepaskan tepat di atas simbol atau titik masuk (●) tujuan untuk menghubungkan.'
      ]);
    } else {
      // User performed a quick click without dragging: toggle pending state for click-to-connect!
      if (pending && pending.id === fromId && pending.key === key) {
        pending = null;
        renderPending();
        setFeedback('neutral', 'Pemilihan konektor dibatalkan.');
      } else {
        pending = { id: fromId, key: key };
        renderPending();
        const branchName = key === 'yes' ? 'YA' : key === 'no' ? 'TIDAK' : 'Lanjut';
        setFeedback('neutral', `Konektor ${branchName} aktif.`, [
          'Tarik panah atau klik simbol tujuan berikutnya pada kanvas.',
          'Klik kembali konektor ini jika ingin membatalkan.'
        ]);
      }
    }
  }

  // Render the entire canvas and nodes
  function render() {
    canvas.innerHTML = '';

    nodes.forEach((n) => computeNodeMetrics(n));

    const maxX = Math.max(canvas.clientWidth || 720, ...nodes.map((n) => n.x + n.w + 60), 720);
    const maxY = Math.max(520, ...nodes.map((n) => n.y + n.h + 80), 520);
    canvas.style.minHeight = maxY + 'px';
    canvas.style.minWidth = maxX + 'px';

    // SVG Connection Layer with custom colored markers
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'connection-layer');
    svg.setAttribute('width', String(maxX));
    svg.setAttribute('height', String(maxY));
    svg.setAttribute('viewBox', `0 0 ${maxX} ${maxY}`);
    svg.innerHTML = `
      <defs>
        <marker id="arrow-next" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <polygon points="0 1, 8 4.5, 0 8" fill="#6366f1"/>
        </marker>
        <marker id="arrow-yes" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <polygon points="0 1, 8 4.5, 0 8" fill="#10b981"/>
        </marker>
        <marker id="arrow-no" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <polygon points="0 1, 8 4.5, 0 8" fill="#f59e0b"/>
        </marker>
      </defs>
    `;
    canvas.appendChild(svg);

    // Guided Mode: Deteksi bagian alur yang sengaja dikosongkan untuk dilengkapi siswa
    const unlinkedTargetIds = new Set();
    let guidedDecisionUnlinked = null;
    if (currentMode === 'guided') {
      nodes.forEach((n) => {
        if (n.type !== 'start') {
          const hasIncoming = nodes.some((src) => src.next === n.id || src.yes === n.id || src.no === n.id);
          if (!hasIncoming) {
            unlinkedTargetIds.add(n.id);
          }
        }
      });
      const dec = nodes.find((n) => n.type === 'decision' && (!n.yes || !n.no));
      if (dec) {
        guidedDecisionUnlinked = {
          id: dec.id,
          missingKey: !dec.yes ? 'yes' : 'no'
        };
      }
    }

    // Build Node Elements
    nodes.forEach((n) => {
      const card = document.createElement('article');
      card.className = `visual-node ${n.type}`;
      if (unlinkedTargetIds.has(n.id)) {
        card.classList.add('guided-target-slot');
      }
      card.dataset.id = n.id;
      card.style.left = n.x + 'px';
      card.style.top = n.y + 'px';
      card.style.width = n.w + 'px';
      card.style.height = n.h + 'px';

      // SVG Background Vector for IO (Parallelogram) and Decision (Diamond)
      if (n.type === 'io') {
        const bgSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        bgSvg.setAttribute('class', 'node-vector-bg');
        bgSvg.setAttribute('width', String(n.w));
        bgSvg.setAttribute('height', String(n.h));
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', `16,1.5 ${n.w - 1.5},1.5 ${n.w - 16},${n.h - 1.5} 1.5,${n.h - 1.5}`);
        poly.setAttribute('fill', '#f0f9ff');
        poly.setAttribute('stroke', '#0284c7');
        poly.setAttribute('stroke-width', '2.2');
        bgSvg.appendChild(poly);
        card.appendChild(bgSvg);
      } else if (n.type === 'decision') {
        const bgSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        bgSvg.setAttribute('class', 'node-vector-bg');
        bgSvg.setAttribute('width', String(n.w));
        bgSvg.setAttribute('height', String(n.h));
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', `${n.w / 2},1.5 ${n.w - 1.5},${n.h / 2} ${n.w / 2},${n.h - 1.5} 1.5,${n.h / 2}`);
        poly.setAttribute('fill', '#fffdf7');
        poly.setAttribute('stroke', '#f59e0b');
        poly.setAttribute('stroke-width', '2.2');
        bgSvg.appendChild(poly);
        card.appendChild(bgSvg);
      }

      // 1. Input Port (Titik Masuk - Node Ungu Atas, hanya untuk node selain Mulai)
      if (n.type !== 'start') {
        const inputPort = document.createElement('button');
        inputPort.type = 'button';
        inputPort.className = 'node-port input-port';
        inputPort.title = `Titik masuk: hubungkan ke “${n.text}”`;
        inputPort.setAttribute('aria-label', `Titik masuk ${n.text}`);
        inputPort.textContent = '●';
        inputPort.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!pending) {
            setFeedback('neutral', 'Pilih titik keluar terlebih dahulu', [
              'Tarik panah atau klik node ungu di bagian bawah simbol sumber terlebih dahulu.',
              'Setelah konektor aktif, barulah klik titik masuk (●) pada simbol tujuan.'
            ]);
            return;
          }
          if (pending.id === n.id) {
            setFeedback('needs-work', 'Koneksi tidak dapat dibuat', [
              'Sebuah simbol tidak boleh langsung terhubung ke dirinya sendiri.'
            ]);
            return;
          }
          connect(pending.id, pending.key, n.id);
        });
        card.appendChild(inputPort);
      }

      // Card-level click helper when pending is active
      card.addEventListener('click', (e) => {
        if (pending && pending.id !== n.id && !e.target.closest('button')) {
          connect(pending.id, pending.key, n.id);
        }
      });

      // 2. Delete Button (✕)
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'node-del-btn';
      del.title = 'Hapus simbol';
      del.setAttribute('aria-label', 'Hapus simbol');
      del.textContent = '✕';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        const deletedText = n.text;
        nodes = nodes.filter((x) => x.id !== n.id);
        nodes.forEach((x) => {
          ['next', 'yes', 'no'].forEach((k) => {
            if (x[k] === n.id) x[k] = null;
          });
        });
        if (pending && pending.id === n.id) pending = null;
        render();
        setFeedback('neutral', `Simbol “${deletedText}” telah dihapus.`, [
          'Koneksi yang mengarah ke simbol ini otomatis terputus.',
          'Gunakan palet di sebelah kiri jika ingin menambahkan simbol pengganti.'
        ]);
      });
      card.appendChild(del);

      // 3. Text Area directly inside shape with autosizing
      const textWrap = document.createElement('div');
      textWrap.className = 'node-text-wrap';

      const textarea = document.createElement('textarea');
      textarea.className = 'node-textarea';
      textarea.value = n.text || '';
      textarea.rows = n.lines ? n.lines.length : 1;
      textarea.placeholder = types[n.type].label;
      textarea.setAttribute('aria-label', types[n.type].label);

      if (n.type === 'start' || n.type === 'end') {
        textarea.readOnly = true;
        textarea.style.pointerEvents = 'none';
        textarea.style.userSelect = 'none';
      }

      textarea.addEventListener('input', () => {
        n.text = textarea.value;
        computeNodeMetrics(n);
        card.style.width = n.w + 'px';
        card.style.height = n.h + 'px';
        textarea.rows = n.lines.length;

        const bgSvg = card.querySelector('.node-vector-bg');
        if (bgSvg) {
          bgSvg.setAttribute('width', String(n.w));
          bgSvg.setAttribute('height', String(n.h));
          const poly = bgSvg.querySelector('polygon');
          if (poly) {
            if (n.type === 'decision') {
              poly.setAttribute('points', `${n.w / 2},1.5 ${n.w - 1.5},${n.h / 2} ${n.w / 2},${n.h - 1.5} 1.5,${n.h / 2}`);
            } else if (n.type === 'io') {
              poly.setAttribute('points', `16,1.5 ${n.w - 1.5},1.5 ${n.w - 16},${n.h - 1.5} 1.5,${n.h - 1.5}`);
            }
          }
        }
        drawConnections();
      });

      textWrap.appendChild(textarea);
      card.appendChild(textWrap);

      // 4. Drag handling anywhere on card
      card.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        dragNode = n.id;
        const p = canvasPoint(e);
        dragOffset = { x: p.x - n.x, y: p.y - n.y };
        if (card.setPointerCapture) {
          card.setPointerCapture(e.pointerId);
        }
        card.classList.add('dragging');
      });

      card.addEventListener('pointermove', (e) => {
        if (dragNode !== n.id) return;
        const p = canvasPoint(e);
        n.x = Math.max(10, Math.min(canvas.scrollWidth - n.w - 10, p.x - dragOffset.x));
        n.y = Math.max(10, p.y - dragOffset.y);
        card.style.left = n.x + 'px';
        card.style.top = n.y + 'px';

        if (n.y + n.h + 80 > canvas.scrollHeight) {
          canvas.style.minHeight = n.y + n.h + 100 + 'px';
        }
        drawConnections();
      });

      card.addEventListener('pointerup', (e) => {
        if (dragNode === n.id) {
          dragNode = null;
          card.classList.remove('dragging');
          if (card.hasPointerCapture && card.hasPointerCapture(e.pointerId)) {
            card.releasePointerCapture(e.pointerId);
          }
          render();
        }
      });

      card.addEventListener('pointercancel', (e) => {
        dragNode = null;
        card.classList.remove('dragging');
        if (card.hasPointerCapture && card.hasPointerCapture(e.pointerId)) {
          card.releasePointerCapture(e.pointerId);
        }
      });

      // 5. Output Ports Area
      if (n.type === 'decision') {
        // Cabang YA (Kiri)
        const wrapYes = document.createElement('div');
        wrapYes.className = 'node-ports-wrap bottom-left';

        const btnYes = document.createElement('button');
        btnYes.type = 'button';
        btnYes.className = `node-port output-dot yes ${n.yes ? 'connected' : ''}`;
        btnYes.dataset.portKey = 'yes';
        btnYes.innerHTML = `<span>YA ↙</span>${n.yes ? ' <small>✓</small>' : ''}`;
        btnYes.title = n.yes ? 'Cabang YA terhubung. Tarik atau klik untuk ubah tujuan' : 'Tarik panah atau klik untuk menghubungkan cabang YA';

        const isGuidedMissingYes =
          guidedDecisionUnlinked &&
          guidedDecisionUnlinked.id === n.id &&
          guidedDecisionUnlinked.missingKey === 'yes' &&
          !n.yes;
        if (isGuidedMissingYes) {
          btnYes.classList.add('guided-unlinked');
          btnYes.title = 'Lengkapi cabang YA ini! Tarik panah atau klik untuk menghubungkan ke langkah penyelesaian.';
        }

        btnYes.addEventListener('pointerdown', (e) => startDragConn(e, n, 'yes', btnYes));
        btnYes.addEventListener('pointermove', moveDragConn);
        btnYes.addEventListener('pointerup', endDragConn);
        btnYes.addEventListener('pointercancel', endDragConn);

        wrapYes.appendChild(btnYes);

        if (n.yes) {
          const discYes = document.createElement('button');
          discYes.type = 'button';
          discYes.className = 'disconnect-port';
          discYes.title = 'Putus cabang YA';
          discYes.textContent = '✕';
          discYes.addEventListener('click', (e) => {
            e.stopPropagation();
            disconnect(n.id, 'yes');
          });
          wrapYes.appendChild(discYes);
        }
        card.appendChild(wrapYes);

        // Cabang TIDAK (Kanan)
        const wrapNo = document.createElement('div');
        wrapNo.className = 'node-ports-wrap bottom-right';

        const btnNo = document.createElement('button');
        btnNo.type = 'button';
        btnNo.className = `node-port output-dot no ${n.no ? 'connected' : ''}`;
        btnNo.dataset.portKey = 'no';
        btnNo.innerHTML = `<span>TIDAK ↘</span>${n.no ? ' <small>✓</small>' : ''}`;
        btnNo.title = n.no ? 'Cabang TIDAK terhubung. Tarik atau klik untuk ubah tujuan' : 'Tarik panah atau klik untuk menghubungkan cabang TIDAK';

        const isGuidedMissingNo =
          guidedDecisionUnlinked &&
          guidedDecisionUnlinked.id === n.id &&
          guidedDecisionUnlinked.missingKey === 'no' &&
          !n.no;
        if (isGuidedMissingNo) {
          btnNo.classList.add('guided-unlinked');
          btnNo.title = 'Lengkapi cabang TIDAK ini! Tarik panah atau klik untuk menghubungkan ke langkah penyelesaian.';
        }

        btnNo.addEventListener('pointerdown', (e) => startDragConn(e, n, 'no', btnNo));
        btnNo.addEventListener('pointermove', moveDragConn);
        btnNo.addEventListener('pointerup', endDragConn);
        btnNo.addEventListener('pointercancel', endDragConn);

        wrapNo.appendChild(btnNo);

        if (n.no) {
          const discNo = document.createElement('button');
          discNo.type = 'button';
          discNo.className = 'disconnect-port';
          discNo.title = 'Putus cabang TIDAK';
          discNo.textContent = '✕';
          discNo.addEventListener('click', (e) => {
            e.stopPropagation();
            disconnect(n.id, 'no');
          });
          wrapNo.appendChild(discNo);
        }
        card.appendChild(wrapNo);
      } else if (n.type !== 'end') {
        // Start, Process, Input/Output: single "➜ Lanjut" Node Ungu
        const wrapNext = document.createElement('div');
        wrapNext.className = 'node-ports-wrap bottom-center';

        const btnNext = document.createElement('button');
        btnNext.type = 'button';
        btnNext.className = `node-port output-dot next ${n.next ? 'connected' : ''}`;
        btnNext.dataset.portKey = 'next';
        btnNext.innerHTML = `<span>➜ Lanjut</span>${n.next ? ' <small>✓</small>' : ''}`;
        btnNext.title = n.next ? 'Terhubung. Tarik atau klik untuk ubah tujuan' : 'Tarik panah atau klik untuk menghubungkan ke langkah berikutnya';

        const isGuidedMissingNext = currentMode === 'guided' && !n.next && n.type !== 'start';
        if (isGuidedMissingNext) {
          btnNext.classList.add('guided-unlinked');
          btnNext.title = 'Lengkapi panah ini! Tarik atau klik untuk menghubungkan ke simbol berikutnya.';
        }

        btnNext.addEventListener('pointerdown', (e) => startDragConn(e, n, 'next', btnNext));
        btnNext.addEventListener('pointermove', moveDragConn);
        btnNext.addEventListener('pointerup', endDragConn);
        btnNext.addEventListener('pointercancel', endDragConn);

        wrapNext.appendChild(btnNext);

        if (n.next) {
          const discNext = document.createElement('button');
          discNext.type = 'button';
          discNext.className = 'disconnect-port';
          discNext.title = 'Putus hubungan panah';
          discNext.textContent = '✕';
          discNext.addEventListener('click', (e) => {
            e.stopPropagation();
            disconnect(n.id, 'next');
          });
          wrapNext.appendChild(discNext);
        }
        card.appendChild(wrapNext);
      }

      canvas.appendChild(card);
    });

    drawConnections();
    $('builderCount').textContent = `${nodes.length} simbol`;
    renderPending();
  }

  // Click on empty canvas cancels any active connection selection
  canvas.addEventListener('click', (e) => {
    if (pending && !e.target.closest('.visual-node')) {
      pending = null;
      renderPending();
      setFeedback('neutral', 'Pemilihan konektor dibatalkan.');
    }
  });

  function renderPending() {
    canvas.classList.toggle('connecting-mode', !!pending);

    canvas.querySelectorAll('.visual-node').forEach((el) => {
      const isTarget = !!pending && Number(el.dataset.id) !== pending.id;
      el.classList.toggle('target-ready', isTarget);
    });

    canvas.querySelectorAll('.node-port.output-dot').forEach((b) => {
      const cardId = b.closest('.visual-node')?.dataset.id;
      const portKey = b.dataset.portKey;
      const isSelected =
        !!pending &&
        cardId === String(pending.id) &&
        pending.key === portKey;
      b.classList.toggle('selected', isSelected);
    });
  }

  // Comprehensive Multi-Tier Algorithm and Diagram Validation
  function validate(show = true) {
    const issues = [];
    const starts = nodes.filter((n) => n.type === 'start');
    const ends = nodes.filter((n) => n.type === 'end');

    // 1. Pemeriksaan Terminator
    if (starts.length === 0) {
      issues.push('Flowchart wajib memiliki satu simbol Mulai.');
    } else if (starts.length > 1) {
      issues.push('Hanya boleh ada tepat satu simbol Mulai pada diagram.');
    }

    if (ends.length === 0) {
      issues.push('Flowchart wajib memiliki satu simbol Selesai.');
    } else if (ends.length > 1) {
      issues.push('Gunakan tepat satu simbol Selesai pada diagram.');
    }

    // 2. Pemeriksaan Teks dan Kondisi Kosong
    nodes.forEach((n) => {
      const trimmed = (n.text || '').trim();
      if (!trimmed || trimmed.length < 3) {
        issues.push(`Simbol ${types[n.type].label} belum diisi dengan keterangan yang jelas.`);
      }
      if (n.type === 'decision') {
        if (!trimmed || trimmed === '?' || trimmed === 'Apakah kondisi terpenuhi?') {
          issues.push('Tuliskan pertanyaan kondisi spesifik pada simbol Keputusan.');
        }
      }
    });

    // 3. Pemeriksaan Kelengkapan Koneksi
    nodes.forEach((n) => {
      if (n.type === 'end') return;

      if (n.type === 'decision') {
        if (!n.yes && !n.no) {
          issues.push(`Simbol Keputusan “${n.text}” belum menghubungkan cabang YA dan TIDAK.`);
        } else {
          if (!n.yes) {
            issues.push(`Cabang YA pada simbol Keputusan “${n.text}” belum terhubung.`);
          }
          if (!n.no) {
            issues.push(`Cabang TIDAK pada simbol Keputusan “${n.text}” belum terhubung.`);
          }
        }
        if (n.yes && n.no && n.yes === n.no) {
          issues.push(`Cabang YA dan TIDAK pada “${n.text}” tidak boleh terhubung ke simbol tujuan yang sama.`);
        }
      } else {
        if (!n.next) {
          issues.push(`Simbol ${types[n.type].label} “${n.text}” belum terhubung ke langkah berikutnya.`);
        }
      }
    });

    // 4. Pemeriksaan Keterjangkauan (Reachability) & Jalan Buntu (Dead-ends)
    const startNode = starts[0];
    if (startNode) {
      const reachable = new Set();
      const queue = [startNode.id];

      while (queue.length) {
        const id = queue.shift();
        if (reachable.has(id)) continue;
        reachable.add(id);

        const curr = nodeBy(id);
        if (curr) {
          [curr.next, curr.yes, curr.no].filter(Boolean).forEach((nxt) => {
            if (!reachable.has(nxt)) queue.push(nxt);
          });
        }
      }

      // Simbol yang tidak dapat dijangkau dari Mulai
      nodes.forEach((n) => {
        if (!reachable.has(n.id)) {
          issues.push(`Simbol “${n.text}” belum terhubung ke alur utama (tidak dapat dicapai dari Mulai).`);
        }
      });

      // Apakah Mulai dapat mencapai Selesai?
      const endReachable = ends.some((e) => reachable.has(e.id));
      if (!endReachable) {
        issues.push('Belum ada jalur yang menghubungkan dari Mulai hingga mencapai Selesai.');
      }

      // Deteksi dead-end dari setiap langkah yang terjangkau
      reachable.forEach((id) => {
        const n = nodeBy(id);
        if (!n || n.type === 'end') return;

        // Cari apakah dari node ini ada jalan menuju Selesai
        const canReachEnd = (() => {
          const visited = new Set();
          const q = [id];
          while (q.length) {
            const curId = q.shift();
            if (visited.has(curId)) continue;
            visited.add(curId);

            const currNode = nodeBy(curId);
            if (currNode) {
              if (currNode.type === 'end') return true;
              [currNode.next, currNode.yes, currNode.no].filter(Boolean).forEach((nxt) => {
                if (!visited.has(nxt)) q.push(nxt);
              });
            }
          }
          return false;
        })();

        if (!canReachEnd) {
          issues.push(`Alur dari “${n.text}” tidak memiliki jalan keluar menuju simbol Selesai (jalan buntu).`);
        }
      });
    }

    // 5. Pemeriksaan Logika Spesifik Studi Kasus
    const currentCase = cases()[selectedCase];
    if (currentCase) {
      // Cek kebutuhan simbol Keputusan
      const decisions = nodes.filter((n) => n.type === 'decision');
      if (decisions.length === 0) {
        issues.push('Studi kasus ini memerlukan simbol Keputusan untuk menentukan alur berdasarkan kondisi.');
      }

      // Cek kata kunci penting
      const fullText = nodes.map((n) => (n.text || '').toLowerCase()).join(' ');
      const missingKeywords = (currentCase.keywords || []).filter((kw) => !fullText.includes(kw.toLowerCase()));
      if (missingKeywords.length > 0) {
        issues.push(`Pastikan diagram memuat informasi penting terkait kasus: ${missingKeywords.join(', ')}.`);
      }

      // Cek kesesuaian semantik cabang keputusan
      decisions.forEach((d) => {
        [['yes', d.yes], ['no', d.no]].forEach(([key, targetId]) => {
          if (targetId) {
            const target = nodeBy(targetId);
            if (target) {
              const msg = branchIssue(d, key, target);
              if (msg) issues.push(msg);
            }
          }
        });
      });
    }

    lastIssues = issues;

    if (show) {
      canvas.querySelectorAll('.visual-node').forEach((el) => el.classList.remove('node-error'));

      if (issues.length > 0) {
        setFeedback('needs-work', `Ada ${issues.length} hal yang perlu diperbaiki:`, issues);
        $('builderStatus').textContent = `Ditemukan ${issues.length} perbaikan pada diagram. Periksa tanda merah dan pesan umpan balik di atas.`;

        // Highlight nodes with issues
        issues.forEach((issue) => {
          const match = issue.match(/“([^”]+)”/);
          if (match) {
            const target = nodes.find((n) => n.text === match[1]);
            if (target) {
              canvas.querySelector(`.visual-node[data-id="${target.id}"]`)?.classList.add('node-error');
            }
          }
        });
      } else {
        setFeedback('success', 'Hebat! Flowchart Lengkap dan Logika Sesuai Kasus!', [
          'Seluruh struktur diagram valid: dimulai dari Mulai dan berakhir di Selesai.',
          'Semua langkah terhubung dengan benar tanpa ada jalan buntu.',
          'Cabang YA dan TIDAK pada Keputusan telah terhubung secara tepat ke langkah penyelesaian.',
          'Solusimu menunjukkan penerapan berpikir komputasional yang runtut dan logis.'
        ]);
        $('builderStatus').textContent =
          'Pemeriksaan berhasil! Kamu dapat mengunduh hasil diagram dalam bentuk SVG atau JSON.';
        // Sinkronkan ke sistem progres pembelajaran (Tahap 4)
        if (typeof window.setActivityStatus === 'function') {
          window.setActivityStatus('flowchart', true);
        }
      }
    }

    return issues;
  }

  $('checkFlowchart').addEventListener('click', () => validate(true));
  $('resetBuilder').addEventListener('click', reset);

  $('hintBuilder').addEventListener('click', () => {
    const c = cases()[selectedCase];
    if (currentMode === 'guided') {
      const missingDec = nodes.find((n) => n.type === 'decision' && (!n.yes || !n.no));
      if (missingDec) {
        const branchNeeded = !missingDec.yes ? 'YA' : 'TIDAK';
        setFeedback('neutral', `Petunjuk Cabang ${branchNeeded} — ${c.title}`, [
          `Tantangan: ${c.unlinkedPrompt || `Hubungkan cabang ${branchNeeded} ke langkah yang sesuai.`}`,
          `1. Klik tombol [${branchNeeded}] (node berkedip) di bawah simbol Keputusan “${missingDec.text}”.`,
          '2. Klik titik masuk (●) di atas simbol proses tujuan yang berbingkai putus-putus ungu.',
          '3. Jika salah menghubungkan, klik tanda silang (✕) di sebelah tombol cabang untuk memutus dan mengulang.'
        ]);
      } else {
        const missingNext = nodes.find((n) => n.type !== 'end' && n.type !== 'decision' && !n.next);
        if (missingNext) {
          setFeedback('neutral', `Petunjuk Alur — ${missingNext.text}`, [
            `Klik tombol [➜ Lanjut] di bawah simbol “${missingNext.text}”.`,
            'Lalu klik titik masuk (●) pada simbol berikutnya yang sesuai alur.'
          ]);
        } else {
          setFeedback('neutral', `Petunjuk Mode Belajar Terpandu — ${c.title}`, [
            'Semua simbol utama pada diagram bantuan telah terhubung.',
            'Pastikan alur mengalir runtut dari Mulai hingga berakhir di Selesai.',
            'Tekan tombol “Periksa Flowchart” untuk memeriksa kebenaran alur dan logika kasus.'
          ]);
        }
      }
    } else {
      setFeedback('neutral', `Petunjuk Mode Mandiri — ${c.title}`, [
        `Masalah: ${c.brief}`,
        '1. Dekomposisi masalah: tentukan masukan/input, kondisi pengujian (keputusan), dan tindakan akhir.',
        '2. Tambahkan simbol yang sesuai dari palet sebelah kiri (Input/Output atau Proses).',
        '3. Buat simbol Keputusan dan isi pertanyaan kondisi yang jelas.',
        '4. Hubungkan panah dari Mulai hingga Selesai, pastikan percabangan YA dan TIDAK lengkap.',
        '5. Kata kunci penting yang perlu dimuat: ' + (c.keywords ? c.keywords.join(', ') : 'terkait kasus') + '.'
      ]);
    }

    const fb = $('builderFeedback');
    if (fb) {
      fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Export File Helpers
  function downloadFile(name, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const exportJsonBtn = $('exportJson');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      const data = window.getFlowchartJsonData();
      downloadFile(
        `flowchart-ct-gamelab-${selectedCase}.json`,
        JSON.stringify(data, null, 2),
        'application/json'
      );
    });
  }

  // Internal JSON data accessor
  window.getFlowchartJsonData = () => ({
    timestamp: new Date().toISOString(),
    mode: currentMode,
    studiKasus: cases()[selectedCase]?.title || selectedCase,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      text: n.text,
      x: n.x,
      y: n.y,
      w: n.w,
      h: n.h,
      next: n.next,
      yes: n.yes,
      no: n.no
    }))
  });

  $('exportSvg').addEventListener('click', () => {
    // 1. Ensure all node metrics are current
    nodes.forEach((n) => computeNodeMetrics(n));

    // 2. Compute dynamic bounding box encompassing all nodes, paths, and labels
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.w);
      maxY = Math.max(maxY, n.y + n.h);
    });

    const edgeData = [];
    nodes.forEach((n) => {
      const pairs =
        n.type === 'decision'
          ? [
            ['yes', n.yes, '#10b981', 'YA', 'url(#exp-arrow-yes)'],
            ['no', n.no, '#f59e0b', 'TIDAK', 'url(#exp-arrow-no)']
          ]
          : [['next', n.next, '#6366f1', '', 'url(#exp-arrow-next)']];

      pairs.forEach(([key, targetId, color, label, marker]) => {
        if (!targetId) return;
        const to = nodeBy(targetId);
        if (!to) return;

        const a = portPoint(n, key);
        const b = portPoint(to, 'input');
        const isLoop = b.y < a.y + 12;
        const d = getOrthogonalPath(a, b, isLoop);

        // Include path segment points in bounding box
        const coords = d.match(/([0-9.-]+)\s+([0-9.-]+)/g);
        if (coords) {
          coords.forEach((coord) => {
            const [px, py] = coord.trim().split(/\s+/).map(Number);
            if (!isNaN(px) && !isNaN(py)) {
              minX = Math.min(minX, px);
              maxX = Math.max(maxX, px);
              minY = Math.min(minY, py);
              maxY = Math.max(maxY, py);
            }
          });
        }

        let labelInfo = null;
        if (label) {
          let midX, midY;
          if (b.y >= a.y + 12) {
            midX = Math.round((a.x + b.x) / 2);
            midY = Math.round((a.y + b.y) / 2);
            if (Math.abs(b.x - a.x) <= 8) {
              midX = a.x;
              midY = a.y + 20;
            }
          } else {
            midX = a.x;
            midY = a.y + 18;
          }
          minX = Math.min(minX, midX - 25);
          maxX = Math.max(maxX, midX + 25);
          minY = Math.min(minY, midY - 14);
          maxY = Math.max(maxY, midY + 14);
          labelInfo = { midX, midY, label, color };
        }

        edgeData.push({ d, color, marker, labelInfo });
      });
    });

    if (nodes.length === 0) {
      minX = 0;
      minY = 0;
      maxX = 400;
      maxY = 300;
    }

    const pad = 35;
    const bbMinX = Math.round(minX - pad);
    const bbMinY = Math.round(minY - pad);
    const bbWidth = Math.round(maxX - minX + pad * 2);
    const bbHeight = Math.round(maxY - minY + pad * 2);

    let out = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${bbWidth}" height="${bbHeight}" viewBox="${bbMinX} ${bbMinY} ${bbWidth} ${bbHeight}" style="background-color:#ffffff; font-family:'DM Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif;">`,
      `<defs>`,
      `  <marker id="exp-arrow-next" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><polygon points="0 1, 8 4.5, 0 8" fill="#6366f1"/></marker>`,
      `  <marker id="exp-arrow-yes" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><polygon points="0 1, 8 4.5, 0 8" fill="#10b981"/></marker>`,
      `  <marker id="exp-arrow-no" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><polygon points="0 1, 8 4.5, 0 8" fill="#f59e0b"/></marker>`,
      `</defs>`,
      `<rect x="${bbMinX}" y="${bbMinY}" width="${bbWidth}" height="${bbHeight}" fill="#ffffff"/>`
    ];

    // Export edge paths
    edgeData.forEach(({ d, color, marker, labelInfo }) => {
      out.push(
        `<path d="${d}" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" marker-end="${marker}"/>`
      );
      if (labelInfo) {
        const { midX, midY, label, color } = labelInfo;
        out.push(
          `<rect x="${midX - 22}" y="${midY - 10}" width="44" height="20" rx="6" fill="${color}"/>` +
          `<text x="${midX}" y="${midY + 4}" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${label}</text>`
        );
      }
    });

    // Export nodes with exact flowchart shapes
    nodes.forEach((n) => {
      const w = n.w;
      const h = n.h;
      const x = n.x;
      const y = n.y;

      let shapeSvg = '';
      if (n.type === 'start' || n.type === 'end') {
        shapeSvg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>`;
      } else if (n.type === 'io') {
        const dx = 16;
        shapeSvg = `<polygon points="${x + dx},${y} ${x + w},${y} ${x + w - dx},${y + h} ${x},${y + h}" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/>`;
      } else if (n.type === 'decision') {
        shapeSvg = `<polygon points="${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}" fill="#fffdf7" stroke="#f59e0b" stroke-width="2"/>`;
      } else {
        // process
        shapeSvg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>`;
      }
      out.push(shapeSvg);

      // Multiline text rendering with tspan
      const lines = n.lines || splitTextIntoLines(n.text, 150);
      const lineHeight = 16;
      const startY = Math.round(y + (h - (lines.length - 1) * lineHeight) / 2 + 4.5);
      let t = `<text x="${Math.round(x + w / 2)}" y="${startY}" font-size="12.5" font-weight="700" fill="#1e293b" text-anchor="middle">`;
      lines.forEach((line, i) => {
        if (i === 0) {
          t += `<tspan x="${Math.round(x + w / 2)}">${esc(line)}</tspan>`;
        } else {
          t += `<tspan x="${Math.round(x + w / 2)}" dy="${lineHeight}">${esc(line)}</tspan>`;
        }
      });
      t += `</text>`;
      out.push(t);
    });

    out.push('</svg>');
    downloadFile(`flowchart-ct-gamelab-${selectedCase}.svg`, out.join(''), 'image/svg+xml');
  });

  // Initialization
  updateCaseOptions();
  reset();

  // Ekspor fungsi render agar kanvas dapat digambar ulang saat tab subbab Flowchart dibuka
  window.renderFlowchartCanvas = render;

  window.addEventListener('resize', () => {
    if (canvas && canvas.offsetParent !== null) {
      render();
    }
  });
})();


