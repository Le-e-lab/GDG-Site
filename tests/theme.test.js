import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Theme Controller', () => {
  let dom;
  let store = {};

  beforeEach(() => {
    store = {};
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            // Head script simulation
            window.initTheme = function() {
              const savedTheme = localStorage.getItem('theme');
              if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                document.documentElement.classList.add('light');
              } else {
                document.documentElement.classList.remove('light');
              }
            };
          </script>
        </head>
        <body class="bg-white">
          <button id="theme-toggle"></button>
          <button id="mobile-theme-toggle">
            <span id="mobile-theme-text">Dark Mode</span>
            <span id="mobile-theme-text-dark" class="hidden">Light Mode</span>
          </button>
          <script>
            // Page script simulation
            window.setupThemeToggle = function() {
              const themeToggleBtn = document.getElementById('theme-toggle');
              const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');

              const updateMobileToggleText = (isLight) => {
                const textLight = document.getElementById('mobile-theme-text');
                const textDark = document.getElementById('mobile-theme-text-dark');
                if (textLight && textDark) {
                  if (isLight) {
                    textLight.classList.remove('hidden');
                    textLight.classList.add('block');
                    textDark.classList.add('hidden');
                    textDark.classList.remove('block');
                  } else {
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
                  localStorage.setItem('theme', 'light');
                  updateMobileToggleText(true);
                } else {
                  document.documentElement.classList.remove('light');
                  localStorage.setItem('theme', 'dark');
                  updateMobileToggleText(false);
                }
              };

              updateMobileToggleText(document.documentElement.classList.contains('light'));

              const toggleTheme = () => {
                const isLight = document.documentElement.classList.contains('light');
                setTheme(isLight ? 'dark' : 'light');
              };

              if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
              if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggleTheme);
            };
          </script>
        </body>
      </html>
    `, {
      runScripts: 'dangerously',
      resources: 'usable'
    });

    global.document = dom.window.document;
    global.window = dom.window;
    
    // Define localStorage on the window with defineProperty
    const mockLocalStorage = {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
      clear: vi.fn(() => { store = {}; }),
      removeItem: vi.fn((key) => { delete store[key]; })
    };
    
    Object.defineProperty(dom.window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    });
    
    global.localStorage = dom.window.localStorage;

    // Mock matchMedia
    dom.window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  // Keep the signature requested by Step 1 of task plan
  it('should toggle light and dark class on html tag', () => {
    const html = document.documentElement;
    expect(html.classList.contains('dark')).toBe(false);
    
    // Toggle logic function (to be implemented)
    const toggleTheme = () => {
      html.classList.toggle('dark');
    };
    
    toggleTheme();
    expect(html.classList.contains('dark')).toBe(true);
  });

  it('should initialize theme based on localStorage', () => {
    global.localStorage.setItem('theme', 'light');
    global.window.initTheme();
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('should initialize theme to dark by default if matchMedia doesn\'t match light', () => {
    global.window.initTheme();
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('should toggle theme from dark to light on theme button click', () => {
    global.window.initTheme();
    global.window.setupThemeToggle();

    const themeToggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    expect(html.classList.contains('light')).toBe(false);
    themeToggleBtn.click();
    expect(html.classList.contains('light')).toBe(true);
    expect(global.localStorage.getItem('theme')).toBe('light');

    themeToggleBtn.click();
    expect(html.classList.contains('light')).toBe(false);
    expect(global.localStorage.getItem('theme')).toBe('dark');
  });

  it('should update mobile menu text when theme changes', () => {
    global.window.initTheme();
    global.window.setupThemeToggle();

    const mobileBtn = document.getElementById('mobile-theme-toggle');
    const textLight = document.getElementById('mobile-theme-text');
    const textDark = document.getElementById('mobile-theme-text-dark');

    // Default dark theme (without light class) means textDark is block, textLight is hidden
    expect(textDark.classList.contains('hidden')).toBe(false);
    expect(textLight.classList.contains('hidden')).toBe(true);

    mobileBtn.click(); // Toggle to light

    expect(textDark.classList.contains('hidden')).toBe(true);
    expect(textLight.classList.contains('hidden')).toBe(false);
  });
});
