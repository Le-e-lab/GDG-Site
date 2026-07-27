document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');

  const updateMobileToggleText = (isLight) => {
    const textLight = document.getElementById('mobile-theme-text');
    const textDark = document.getElementById('mobile-theme-text-dark');
    if (textLight && textDark) {
      if (isLight) {
        // Current theme is light, show "Dark Mode" option
        textLight.classList.remove('hidden');
        textLight.classList.add('block');
        textDark.classList.add('hidden');
        textDark.classList.remove('block');
      } else {
        // Current theme is dark, show "Light Mode" option
        textDark.classList.remove('hidden');
        textDark.classList.add('block');
        textLight.classList.add('hidden');
        textLight.classList.remove('block');
      }
    }
  };

  const setTheme = (theme) => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      try {
        window.localStorage.setItem('theme', 'light');
      } catch (e) {
        console.warn('localStorage is not accessible:', e);
      }
      updateMobileToggleText(true);
    } else {
      document.documentElement.classList.remove('light');
      try {
        window.localStorage.setItem('theme', 'dark');
      } catch (e) {
        console.warn('localStorage is not accessible:', e);
      }
      updateMobileToggleText(false);
    }
  };

  // Initial UI state update for mobile text
  updateMobileToggleText(document.documentElement.classList.contains('light'));

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'dark' : 'light');
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  if (mobileThemeToggleBtn) {
    mobileThemeToggleBtn.addEventListener('click', toggleTheme);
  }
});
