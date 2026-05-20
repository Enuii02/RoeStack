function dismissWelcomeBanner() {
  const banner = document.getElementById('welcome-banner');
  if (banner) banner.remove();

  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');
  if (emailInput) emailInput.value = 'guest@sample.ac.uk';
  if (passwordInput) passwordInput.value = '123';
}
