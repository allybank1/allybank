/* Mobile menu toggle */
document.querySelector('.mobile-menu-toggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('active');
});

/* Close mobile menu when a link is clicked */
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('active');
  });
});

/* Customer Login: Email + Password */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    // Basic validation
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => 
      u.email.toLowerCase() === email && 
      u.password === password
    );

    if (!user) {
      alert('Invalid email or password.');
      return;
    }

    // First-time PIN setup
    if (!user.pin) {
      const pin = prompt('Welcome! Please set your 4-digit transaction PIN:');
      if (!pin || !/^\d{4}$/.test(pin)) {
        alert('PIN must be exactly 4 digits. Try again.');
        return;
      }
      user.pin = pin;
      localStorage.setItem('users', JSON.stringify(users));
      alert('PIN set successfully!');
    }

    // Save to session and go to dashboard
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    alert(`Welcome back, ${user.name}!`);
    window.location.href = 'dashboard.html'; // NOW EXISTS
  });
}