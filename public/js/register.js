document.addEventListener('DOMContentLoaded', () => {
  const nextBtn = document.getElementById('nextBtn');
  const form = document.getElementById('registerForm');
  const step1 = document.querySelector('.step-1');
  const step2 = document.querySelector('.step-2');

  nextBtn.addEventListener('click', () => {
    // Validierung von Username und Email
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

    // Animation: Schritt 1 raus, Schritt 2 rein
    step1.classList.remove('active');
    step2.classList.add('active');
  });

  form.addEventListener('submit', (e) => {
    const password = form.password;
    const passwordRepeat = form.querySelector('#password-repeat');

    if (password.value.length < 8) {
      e.preventDefault();
      alert('Das Passwort muss mindestens 8 Zeichen lang sein.');
      password.focus();
      return;
    }

    if (password.value !== passwordRepeat.value) {
      e.preventDefault();
      alert('Die Passwörter stimmen nicht überein.');
      passwordRepeat.focus();
      return;
    }
  });

  function validateEmail(email) {
    // einfache Emailprüfung
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
