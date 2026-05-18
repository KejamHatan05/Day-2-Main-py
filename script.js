const boxes     = Array.from(document.querySelectorAll('.otp-box'));
const verifyBtn = document.getElementById('verifyBtn');
const resendBtn = document.getElementById('resendBtn');
const msgEl     = document.getElementById('message');

/* Simpan referensi interval agar bisa di-clear saat Resend ditekan */
let timerInterval = startCountdown();

function startCountdown() {
  let countdown = 30;

  /* Reset tampilan awal */
  resendBtn.disabled = true;
  msgEl.className    = 'message';
  msgEl.innerHTML    = `You can request a new code in <span id="timer">${countdown}</span>s.`;

  return setInterval(() => {
    countdown--;

    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = countdown;

    if (countdown <= 0) {
      clearInterval(timerInterval);
      msgEl.textContent  = "Didn't receive a code?";
      resendBtn.disabled = false;
    }
  }, 1000);
}

boxes.forEach((box, i) => {

  box.addEventListener('keydown', (e) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) {
      e.preventDefault(); 
    }

    if (e.key === 'ArrowLeft'  && i > 0)              boxes[i - 1].focus();
    if (e.key === 'ArrowRight' && i < boxes.length-1) boxes[i + 1].focus();
  });


  box.addEventListener('input', (e) => {
    const val = e.target.value.replace(/\D/g, '');  
    box.value = val.slice(-1);                       

    clearState();           
    updateFilledState();    

    if (val && i < boxes.length - 1) {
      boxes[i + 1].focus();
    }
  });


  box.addEventListener('keyup', (e) => {
    if (e.key === 'Backspace' && !box.value && i > 0) {
      boxes[i - 1].value = '';       
      boxes[i - 1].focus();
      updateFilledState();
    }
  });

  box.addEventListener('focus', () => box.select());
});

boxes[0].addEventListener('paste', (e) => {
  e.preventDefault();   

  const pasted = (e.clipboardData || window.clipboardData)
    .getData('text')
    .replace(/\D/g, '')   
    .slice(0, 6);        

  pasted.split('').forEach((digit, j) => {
    if (boxes[j]) boxes[j].value = digit;
  });

  updateFilledState();


  const nextBox = boxes[pasted.length] || boxes[boxes.length - 1];
  nextBox.focus();
});

function updateFilledState() {
  boxes.forEach(b => b.classList.toggle('filled', b.value !== ''));
}

function clearState() {
  boxes.forEach(b => b.classList.remove('error', 'success'));
  msgEl.className = 'message';
}

function setError(msg) {
  boxes.forEach(b => {
    b.classList.add('error');
    b.classList.remove('success', 'filled');
  });
  msgEl.className   = 'message error-msg';
  msgEl.textContent = msg;
}

function setSuccess(msg) {
  boxes.forEach(b => {
    b.classList.add('success');
    b.classList.remove('error');
  });
  msgEl.className   = 'message success-msg';
  msgEl.textContent = msg;
}

verifyBtn.addEventListener('click', () => {
  const code = boxes.map(b => b.value).join('');

  if (code.length < 6) {
    setError('Please fill in all 6 digits.');
    boxes.find(b => !b.value)?.focus();  
    return;
  }

  verifyBtn.disabled   = true;
  verifyBtn.textContent = 'Verifying…';

  setTimeout(() => {
    verifyBtn.disabled   = false;
    verifyBtn.textContent = 'Verify';

    if (code === '123456') {
      setSuccess('✓ Verified successfully!');
    } else {
      setError('Invalid code. Please try again.');
      
      boxes.forEach(b => b.value = '');
      updateFilledState();
      boxes[0].focus();
    }
  }, 1200);
});

resendBtn.addEventListener('click', () => {

  boxes.forEach(b => {
    b.value = '';
    b.classList.remove('error', 'success', 'filled');
  });


  clearInterval(timerInterval);
  timerInterval = startCountdown();

 
  boxes[0].focus();
});

boxes[0].focus();
