# Panduan CT Game Lab — Revisi Visual dan Flowchart Builder

## Isi paket
- `index.html`: halaman pembelajaran, empat fondasi CT, studi kasus, dan aktivitas.
- `style.css`: desain responsif dengan ukuran teks lebih besar dan tampilan visual yang lebih kuat.
- `script.js`: kuis, refleksi, konfigurasi embed, dan Flowchart Builder drag-and-drop.
- `assets/CT_Game_Lab_Materi_Lengkap.pdf`: materi PDF yang disematkan.

## Struktur Navigasi & Tampilan Website (Pembaruan Terkini)
Website menggunakan tata kelola terpadu dengan **tiga menu utama** pada navigasi atas:
1. **Materi**: Halaman utama pembelajaran yang memuat:
   - **Hero Section**: Judul utama Computational Thinking, identitas penulis (Triana Elisabet Sinaga | 25105260168), deskripsi, ilustrasi dua kolom, dan tombol CTA langsung ke Bahan Bacaan / Flowchart.
   - **Intro Tujuan Pembelajaran**: Panduan kompetensi berpikir komputasional fase E.
   - **Empat Subbab Pembelajaran (Tab Horizontal)**:
     - **Bahan Bacaan**: Penjelasan 4 fondasi CT, contoh penerapan, PDF materi lengkap, dan simbol dasar flowchart.
     - **Video Pembelajaran**: Pemutaran video interaktif berpikir komputasional dengan tautan langsung ke YouTube.
     - **Games Tower of Hanoi**: Eksplorasi penalaran algoritmik disertai **Lembar Refleksi Siswa** interaktif dengan penyimpanan lokal (localStorage), pengeditan, penyalinan, dan pengunduhan file `.txt`.
     - **Flowchart Builder**: Alur pembelajaran pedagogis runtut yang diawali dengan **Studi Kasus Terpadu Antrean Kantin**, pemilihan 5 tantangan studi kasus, petunjuk identifikasi CT, pemilihan mode (Terpandu & Mandiri), kanvas interaktif, hingga evaluasi & ekspor SVG/JSON. (Bagian produk belajar dan rubrik telah disederhanakan).
2. **Asesmen**: Halaman terpisah berisi 2 subtab evaluasi:
   - **Kuis CT Game Lab**: Kuis internal 5 pertanyaan, umpan balik interaktif, skor, dan pengulangan.
   - **Kuis Wayground**: Area embed dan akses asesmen eksternal.
3. **Refleksi**: Halaman evaluasi mandiri berisi formulir refleksi belajar, salin refleksi mandiri, dan area integrasi Google Forms.

*Catatan: Logo CT Game Lab di bagian atas dan bawah berfungsi untuk mengarahkan kembali ke bagian atas halaman Materi (Hero).*

## Menjalankan website
1. Ekstrak ZIP atau buka folder proyek.
2. Buka folder `ct_game_lab_website_revised` di Visual Studio Code.
3. Jalankan `index.html` menggunakan ekstensi Live Server, atau buka langsung di browser.
4. Untuk GitHub Pages, unggah seluruh file dan folder `assets`, bukan hanya `index.html`.


## Menggunakan Flowchart Builder
1. Pilih **Mode Belajar Terpandu** atau **Mode Tantangan Mandiri**. Masing-masing mode memiliki lima studi kasus berbeda.
2. Pada mode Terpandu, diagram sebagian sudah disiapkan. Lengkapi koneksi yang belum ada dan perbaiki alur berdasarkan petunjuk.
3. Pada mode Mandiri, kanvas dimulai dengan simbol Mulai dan Selesai. Seret simbol yang diperlukan dari palet ke kanvas, lalu geser simbol melalui bagian judulnya.
4. Untuk menghubungkan simbol, klik konektor keluar **→ Lanjut**, **Ya**, atau **Tidak**. Setelah konektor terpilih, klik titik masuk **●** pada simbol tujuan. Tidak ada dropdown tujuan.
5. Pada simbol Keputusan, hubungkan cabang Ya dan Tidak secara terpisah. Kedua cabang harus mewakili tindakan yang sesuai dengan kondisi.
6. Tekan **Periksa flowchart**. Sistem memeriksa simbol Mulai/Selesai, koneksi yang hilang, jalur yang tidak terjangkau, kata kunci penting, dan beberapa aturan cabang khusus. Jika ditemukan masalah, umpan balik menyebutkan bagian yang perlu diperbaiki.
7. Gunakan **Petunjuk** untuk bantuan, **Mulai ulang** untuk mengulang kasus, **Unduh SVG** untuk ekspor diagram, atau **Simpan JSON** untuk menyimpan data rancangan.

### Studi kasus tiap mode
- **Terpandu:** perlengkapan sekolah; membawa payung; pengumpulan tugas digital; pesanan kantin; memilah sampah.
- **Mandiri:** peminjaman buku perpustakaan; baterai ponsel; menyeberang jalan; membeli alat tulis; pemeriksaan kelas sebelum pulang.

### Catatan tentang umpan balik otomatis
Pemeriksaan otomatis bersifat formatif dan berbasis struktur, kata kunci, serta aturan tertentu pada cabang keputusan. Sistem dapat menunjukkan kesalahan koneksi dan beberapa kesalahan logika dengan cepat, tetapi belum dapat menjamin seluruh solusi benar secara semantik. Guru tetap perlu menilai alasan, ketepatan logika, dan skenario pengujian murid; solusi alternatif yang logis sebaiknya tetap diterima.

## Memasang kuis Wayground
1. Buat kuis/asesmen di Wayground dan gunakan opsi `Embed`/`Sematkan` jika tersedia.
2. Salin URL `src` dari kode iframe yang diberikan.
3. Buka `script.js`, cari `const WAYGROUND_EMBED_URL = "";`, lalu tempel URL di antara tanda kutip.
4. Simpan dan muat ulang website. Sebagian resource dapat meminta login atau membatasi embed; jika demikian, gunakan tautan langsung ke Wayground.

## Memasang Google Forms untuk penyimpanan refleksi
1. Buat Google Form berisi nama, kelas, refleksi, dan tautan flowchart.
2. Pilih `Kirim` lalu ikon sematkan (`<>`). Salin URL `src` dari kode iframe.
3. Di `script.js`, tempel URL pada `const GOOGLE_FORMS_EMBED_URL = "";`.
4. Untuk menyimpan respons ke Google Sheets, buka tab `Respons` pada Google Forms dan tautkan ke spreadsheet.

Catatan: refleksi yang diketik pada kolom lokal website tidak dikirim ke server. Tombol `Salin refleksi` hanya menyalin jawaban atau mengunduh file teks. Google Forms diperlukan untuk pengumpulan terpusat.

## Tower of Hanoi
Tower of Hanoi tetap tersedia sebagai aktivitas pendukung untuk mengeksplorasi strategi dan penalaran algoritmik. Game eksternal mungkin tidak dapat tampil di dalam halaman karena pembatasan situs; gunakan tautan untuk membukanya di tab baru.

## Memperbarui PDF
Ganti `assets/CT_Game_Lab_Materi_Lengkap.pdf` dengan file baru memakai nama yang sama. Jika nama berubah, perbarui jalur pada `index.html`.

## Catatan pedagogis
- Fokus website adalah penerapan empat fondasi CT pada masalah sehari-hari, penyusunan algoritma, dan representasi solusi dalam flowchart.
- Penjelasan dan simulasi Bubble Sort telah dihapus dari halaman website agar tidak mengalihkan fokus.
- Kuis konsep dan refleksi melengkapi, tetapi tidak menggantikan penilaian terhadap proses berpikir dan produk flowchart.
- Skor kuis, file flowchart, dan refleksi berada pada tempat berbeda kecuali dibuat integrasi tambahan.

## Urutan pembelajaran dan mode
- Video pembelajaran ditempatkan setelah materi, lalu diikuti game Tower of Hanoi sebelum bagian Flowchart Builder.
- Mode Terpandu menggunakan lima kasus dan diagram awal yang sebagian disusun; Mode Mandiri menggunakan lima kasus lain dengan kanvas awal kosong.
- Koneksi dibuat langsung dengan konektor visual: pilih keluaran simbol lalu klik titik masuk pada simbol tujuan.

## Catatan revisi Builder (22 Oktober 2026 - Perbaikan Total)
- **Tata Letak Bebas Tumpukan (No-Overlap Grid)**:
  - Jarak antarbaris pada diagram dinaikkan menjadi 180–200 px sehingga kartu simbol tidak akan pernah saling menutupi atau bertumpuk.
  - Kartu simbol distandarkan dengan lebar 185 px (dan 205 px untuk Keputusan), memberikan ruang bernapas yang cukup pada kanvas luas (860 x 960 px).
- **Rute Panah Siku-Siku Rapi (Orthogonal / Manhattan Routing)**:
  - Panah konektor tidak lagi berbentuk kurva meliuk-liuk yang semrawut ("semraut").
  - Seluruh panah berjalan murni **lurus ke samping (horizontal) dan lurus ke bawah (vertikal)** dengan sudut siku-siku 90° yang rapi dan elegan layaknya standar diagram rekayasa / flowchart profesional.
  - Alur loop-back (perulangan) berjalan rapi melalui margin samping kanvas sehingga tidak menembus simbol lain di tengah.
  - Label cabang **YA** (hijau) dan **TIDAK** (amber) ditempatkan tepat di tengah segmen garis horizontal sehingga mudah terbaca dan tidak menabrak teks kartu.
- **Mekanisme Drag-to-Connect & Click-to-Connect ("Node Ungu")**:
  - Di setiap simbol terdapat **titik konektor (node ungu)** di bagian bawah dan titik masuk (●) di bagian atas.
  - Murid dapat langsung **mengeklik dan menarik panah (drag-to-connect)** dari node ungu ke simbol tujuan berikutnya, dengan garis pratinjau putus-putus (*preview dashed line*) yang bergerak mengikuti kursor.
  - Mekanisme **klik-ke-klik (click-to-connect)** tetap aktif sebagai alternatif: klik node ungu lalu klik simbol tujuan.
  - Memutus koneksi panah dapat dilakukan dengan mengeklik tombol `✕` di samping konektor, atau mengeklik langsung pada garis panah / badge labelnya di kanvas.
- **Tempat Menulis Pertanyaan Kondisi / Keputusan (Pilihan) Luas & Nyaman**:
  - Simbol Keputusan kini dilengkapi dengan header kondisi (`◇ Kondisi / Pertanyaan:`) dan area teks multiline (`<textarea>`) yang lapang, jelas, berkontras tinggi, dan langsung tersinkronisasi saat diketik.
  - Kotak teks tidak lagi terjepit atau tertutup oleh simbol lain di atasnya.
- **Mode Terpandu vs Mode Mandiri**:
  - Mode Terpandu menyediakan 5 studi kasus latihan dengan diagram sebagian terisi untuk dilengkapi murid.
  - Mode Mandiri menyediakan 5 studi kasus baru dengan kanvas terbuka dari Mulai dan Selesai tanpa hubungan otomatis, sehingga murid menyusun seluruh solusi dari awal.
- **Pemeriksaan Algoritma Komprehensif**:
  - Memeriksa jumlah simbol Mulai dan Selesai (tepat 1).
  - Memeriksa teks keterangan dan pertanyaan kondisi agar tidak kosong.
  - Memeriksa kelengkapan cabang YA dan TIDAK pada Keputusan (keduanya wajib terhubung ke langkah berbeda).
  - Memeriksa keterjangkauan langkah dari Mulai (BFS traversal) dan mendeteksi jalan buntu (dead-end).
  - Memeriksa kesesuaian kata kunci dan logika semantik cabang terhadap studi kasus yang dipilih (`branchIssue`).
  - Menandai simbol yang bermasalah dengan highlight merah (`node-error`) pada kanvas dan memberikan umpan balik spesifik per bagian.
- **Pemulihan Panduan & Bantuan Mode Terpandu**:
  - **Banner Panduan Dinamis**: Setiap studi kasus pada Mode Terpandu menampilkan panduan spesifik yang menjelaskan alur apa yang sudah disiapkan dan langkah persis yang harus dilengkapi oleh siswa.
  - **Visual Target Slot Berdenyut**: Simbol tujuan yang belum terhubung ditandai secara mencolok dengan garis putus-putus ungu (`.guided-target-slot`), latar ungu lembut, animasi pulse, dan badge `⚡ Lengkapi Alur Ini`.
  - **Tombol Petunjuk Kasus Interaktif**: Tombol `Petunjuk Kasus ?` memiliki warna pembeda (amber hangat) dan otomatis menampilkan arahan langkah demi langkah serta melakukan scroll halus ke panel umpan balik saat diklik.
  - **Tata Letak Bilah Aksi Rapi**: `.canvas-actions` ditata dengan flexbox responsif sehingga tombol Petunjuk Kasus, Periksa Flowchart, Mulai Ulang, dan Unduh SVG tersusun rapi tanpa saling bertumpuk.

