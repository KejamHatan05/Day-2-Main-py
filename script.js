/* ── 1. DOM References ──────────────────────────────────────────────────────
  Kumpulkan semua elemen yang akan dimanipulasi.
  querySelectorAll() mengembalikan NodeList, diubah ke Array agar bisa
  pakai method seperti .forEach(), .find(), .map(), dll.
────────────────────────────────────────────────────────────────────────── */
const boxes     = Array.from(document.querySelectorAll('.otp-box'));
const verifyBtn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');
const msgEl     = document.getElementById('message');

/* Simpan referensi interval agar bisa di-clear saat Resend ditekan */
let timerInterval = startCountdown();


/* ── 2. Countdown Timer ─────────────────────────────────────────────────────
  setInterval(fn, 1000) → jalankan fn setiap 1000ms (1 detik).
  Setelah 30 detik, clear interval & aktifkan tombol Resend.
────────────────────────────────────────────────────────────────────────── */
function startCountdown() {
  let countdown = 30;

  /* Reset tampilan awal */
  resendBtn.disabled = true;
  msgEl.className    = 'message';
  msgEl.innerHTML    = `You can request a new code in <span id="timer">${countdown}</span>s.`;

  return setInterval(() => {
    countdown--;

    /* getElementById setiap tick karena innerHTML di-replace tiap Resend */
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = countdown;

    if (countdown <= 0) {
      clearInterval(timerInterval);
      msgEl.textContent  = "Didn't receive a code?";
      resendBtn.disabled = false;
    }
  }, 1000);
}


/* ── 3. Event Listeners per Kotak OTP ───────────────────────────────────── */
boxes.forEach((box, i) => {

  /* ── 3a. keydown: Blokir karakter non-angka ──────────────────────────────
    Tanpa ini, huruf seperti 'a', 'b', '@' bisa diketik masuk.
    Key yang diizinkan:
    - Digit 0–9          → /^\d$/.test(e.key) → true
    - Backspace, Delete  → navigasi mundur / hapus
    - ArrowLeft/Right    → pindah antar kotak
    - Tab                → pindah fokus secara alami
  ────────────────────────────────────────────────────────────────────────── */
  
  box.addEventListener('keydown', (e) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) {
      e.preventDefault();   /* batalkan keypress jika bukan angka/key khusus */
    }

    /* Arrow key navigation */
    if (e.key === 'ArrowLeft'  && i > 0)              boxes[i - 1].focus();
    if (e.key === 'ArrowRight' && i < boxes.length-1) boxes[i + 1].focus();
  });


  /* ── 3b. input: Auto-advance ─────────────────────────────────────────────
    Dipanggil setiap kali nilai input berubah (setelah keydown selesai).
    Hanya ambil 1 digit terakhir (slice(-1)) untuk berjaga-jaga.
    Lalu pindahkan fokus ke kotak berikutnya.
  ────────────────────────────────────────────────────────────────────────── */
  box.addEventListener('input', (e) => {
    const val = e.target.value.replace(/\D/g, '');  /* buang semua non-digit */
    box.value = val.slice(-1);                       /* simpan 1 digit terakhir */

    clearState();           /* hapus kelas error/success lama */
    updateFilledState();    /* perbarui kelas "filled" */

    /* Pindah ke kotak berikutnya jika ada nilai */
    if (val && i < boxes.length - 1) {
      boxes[i + 1].focus();
    }
  });


  /* ── 3c. keyup: Backspace mundur ────────────────────────────────────────
    Kenapa keyup, bukan keydown?
    Karena saat keydown, nilai box belum terhapus oleh browser.
    Saat keyup, nilai sudah '' → baru kita tahu kotak ini kosong.
  ────────────────────────────────────────────────────────────────────────── */
  box.addEventListener('keyup', (e) => {
    if (e.key === 'Backspace' && !box.value && i > 0) {
      boxes[i - 1].value = '';        /* kosongkan kotak sebelumnya juga */
      boxes[i - 1].focus();
      updateFilledState();
    }
  });


  /* ── 3d. focus: Select all ───────────────────────────────────────────────
    Saat kotak dapat fokus, select isinya agar mudah diketik ulang.
  ────────────────────────────────────────────────────────────────────────── */
  box.addEventListener('focus', () => box.select());
});


/* ── 4. Paste Support ────────────────────────────────────────────────────────
  Dipasang di kotak PERTAMA agar bisa tangkap paste OTP dari clipboard.
  e.clipboardData.getData('text') → ambil teks yang di-paste.
  Lalu isi setiap kotak satu per satu, dan fokuskan kotak terakhir yang terisi.

  Contoh: paste "123456" → boxes[0]='1', [1]='2', dst.
────────────────────────────────────────────────────────────────────────── */
boxes[0].addEventListener('paste', (e) => {
  e.preventDefault();   /* cegah paste default (semua masuk ke box[0]) */

  const pasted = (e.clipboardData || window.clipboardData)
    .getData('text')
    .replace(/\D/g, '')   /* buang non-digit */
    .slice(0, 6);         /* maks 6 karakter */

  pasted.split('').forEach((digit, j) => {
    if (boxes[j]) boxes[j].value = digit;
  });

  updateFilledState();

  /* Fokus ke kotak setelah digit terakhir yang di-paste */
  const nextBox = boxes[pasted.length] || boxes[boxes.length - 1];
  nextBox.focus();
});


/* ── 5. State Helper Functions ───────────────────────────────────────────── */

/* Tambah class "filled" jika kotak berisi nilai, hapus jika kosong */
function updateFilledState() {
  boxes.forEach(b => b.classList.toggle('filled', b.value !== ''));
}

/* Hapus semua class state (error, success) dari kotak & pesan */
function clearState() {
  boxes.forEach(b => b.classList.remove('error', 'success'));
  msgEl.className = 'message';
}

/* Tampilkan state ERROR: border merah + animasi getar + pesan */
function setError(msg) {
  boxes.forEach(b => {
    b.classList.add('error');
    b.classList.remove('success', 'filled');
  });
  msgEl.className   = 'message error-msg';
  msgEl.textContent = msg;
}

/* Tampilkan state SUCCESS: border hijau + pesan */
function setSuccess(msg) {
  boxes.forEach(b => {
    b.classList.add('success');
    b.classList.remove('error');
  });
  msgEl.className   = 'message success-msg';
  msgEl.textContent = msg;
}


/* ── 6. Verify Button ────────────────────────────────────────────────────────
  Klik → ambil nilai semua kotak → validasi → simulasi API call (setTimeout).

  Di production, ganti setTimeout dengan fetch() ke endpoint verifikasi:
  
  const res  = await fetch('/api/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (data.success) { ... } else { ... }
────────────────────────────────────────────────────────────────────────── */
verifyBtn.addEventListener('click', () => {
  const code = boxes.map(b => b.value).join('');

  /* Validasi: semua 6 kotak harus terisi */
  if (code.length < 6) {
    setError('Please fill in all 6 digits.');
    boxes.find(b => !b.value)?.focus();   /* fokus ke kotak kosong pertama */
    return;
  }

  /* Tunjukkan loading state */
  verifyBtn.disabled   = true;
  verifyBtn.textContent = 'Verifying…';

  /* Simulasi network request (1.2 detik) */
  setTimeout(() => {
    verifyBtn.disabled   = false;
    verifyBtn.textContent = 'Verify';

    /* DEMO: kode "123456" dianggap benar. Ganti dengan logika API nyata. */
    if (code === '123456') {
      setSuccess('✓ Verified successfully!');
    } else {
      setError('Invalid code. Please try again.');
      /* Reset semua kotak untuk input ulang */
      boxes.forEach(b => b.value = '');
      updateFilledState();
      boxes[0].focus();
    }
  }, 1200);
});


/* ── 7. Resend Button ────────────────────────────────────────────────────────
  Reset seluruh state → kosongkan kotak → restart countdown.
────────────────────────────────────────────────────────────────────────── */
resendBtn.addEventListener('click', () => {
  /* Kosongkan & bersihkan semua kotak */
  boxes.forEach(b => {
    b.value = '';
    b.classList.remove('error', 'success', 'filled');
  });

  /* Restart timer (batalkan yang lama terlebih dahulu) */
  clearInterval(timerInterval);
  timerInterval = startCountdown();

  /* Kembalikan fokus ke kotak pertama */
  boxes[0].focus();
});


/* 8. Initial Focus */
boxes[0].focus();
