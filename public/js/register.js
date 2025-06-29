document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const step1 = document.querySelector('.step-1');
  const step2 = document.querySelector('.step-2');
  const step3 = document.querySelector('.step-3');
  const nextBtn = document.getElementById('nextBtn');


  nextBtn.addEventListener('click', () => {
    const username = form.username;
    const email = form.email;

    if (!username.value.trim()) {
      alert('Bitte gib einen Benutzernamen ein.');
      username.focus();
      return;
    }

    if (!email.value.trim() || !validateEmail(email.value)) {
      alert('Bitte gib eine gültige Email-Adresse ein.');
      email.focus();
      return;
    }

    step1.classList.remove('active');
    step2.classList.add('active');
  });

  nextBtn2.addEventListener('click', () => {
    const password = form.password;
    const passwordRepeat = form.querySelector('#password-repeat');

    if (password.value.length < 8) {
      alert('Das Passwort muss mindestens 8 Zeichen lang sein.');
      password.focus();
      return;
    }

    if (password.value !== passwordRepeat.value) {
      alert('Die Passwörter stimmen nicht überein.');
      passwordRepeat.focus();
      return;
    }

    step2.classList.remove('active');
    step3.classList.add('active');
  });

  form.addEventListener('submit', (e) => {
    const consent = document.getElementById('consent');
    if (!consent.checked) {
      e.preventDefault();
      alert('Du musst den Datenschutzbestimmungen zustimmen.');
      consent.focus();
      return;
    }
  });

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});