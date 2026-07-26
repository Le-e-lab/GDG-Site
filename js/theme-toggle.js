document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');

  const updateMobileToggleText = (isDark) => {
    const textLight = document.getElementById('mobile-theme-text');
    const textDark = document.getElementById('mobile-theme-text-dark');
    if (textLight && textDark) {
      if (isDark) {
        textDark.classList.remove('hidden');
        textDark.classList.add('block');
        textLight.classList.add('hidden');
        textLight.classList.remove('block');
      } else {
        textLight.classList.remove('hidden');
        textLight.classList.add('block');
        textDark.classList.add('hidden');
        textDark.classList.remove('block');
      }
    }
  };

  const setTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      try {
        window.localStorage.setItem('theme', 'dark');
      } catch (e) {
        console.warn('localStorage is not accessible:', e);
      }
      updateMobileToggleText(true);
    } else {
      document.documentElement.classList.remove('dark');
      try {
        window.localStorage.setItem('theme', 'light');
      } catch (e) {
        console.warn('localStorage is not accessible:', e);
      }
      updateMobileToggleText(false);
    }
  };

  // Initial UI state update for mobile text
  updateMobileToggleText(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  if (mobileThemeToggleBtn) {
    mobileThemeToggleBtn.addEventListener('click', toggleTheme);
  }
});
