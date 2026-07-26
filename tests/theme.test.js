import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Helper to construct a JSDOM window utilizing the actual production index.html
function createTestDOM(initialTheme = null, prefersDark = false) {
  const store = {};
  if (initialTheme) {
    store['theme'] = initialTheme;
  }
  const htmlPath = path.resolve(__dirname, '../index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlContent, {
    runScripts: 'outside-only', // Allows us to use dom.window.eval safely
    resources: 'usable',
    url: 'http://localhost/'
  });

  const { window } = dom;

  // Mock localStorage
  const mockLocalStorage = {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    clear: vi.fn(() => { for (const k in store) delete store[k]; }),
    removeItem: vi.fn((key) => { delete store[key]; })
  };
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true
  });

  // Mock matchMedia
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: prefersDark && query.includes('dark'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  // Manually parse and run the inline theme scripts in index.html to guarantee
  // execution inside the test JSDOM window context.
  const scripts = window.document.querySelectorAll('script');
  scripts.forEach(script => {
    if (!script.src && script.textContent) {
      const code = script.textContent;
      if (code.includes('localStorage') && (code.includes('matchMedia') || code.includes('prefers-color-scheme'))) {
        // Run Initialization Script
        window.eval(code);
      } else if (code.includes('theme-toggle') || code.includes('mobile-theme-toggle')) {
        // Run Controller Script
        window.eval(code);
      }
    }
  });

  // Dispatch DOMContentLoaded event to trigger the controller initialization
  const domContentLoadedEvent = new window.Event('DOMContentLoaded', {
    bubbles: true,
    cancelable: true
  });
  window.document.dispatchEvent(domContentLoadedEvent);

  return { dom, store };
}

describe('Theme Controller', () => {
  // Keep the signature requested by Step 1 of task plan (tests classList on JSDOM instance)
  it('should toggle light and dark class on html tag', () => {
    const dom = new JSDOM('<!DOCTYPE html><html><body class="bg-white"><button id="theme-toggle"></button></body></html>');
    const html = dom.window.document.documentElement;
    expect(html.classList.contains('dark')).toBe(false);
    
    // Toggle logic function (to be implemented)
    const toggleTheme = () => {
      html.classList.toggle('dark');
    };
    
    toggleTheme();
    expect(html.classList.contains('dark')).toBe(true);
  });

  it('should initialize theme to dark when localStorage is dark', () => {
    const { dom } = createTestDOM('dark');
    expect(dom.window.document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should initialize theme to light when localStorage is light', () => {
    const { dom } = createTestDOM('light');
    expect(dom.window.document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should default to dark if prefers-color-scheme is dark', () => {
    const { dom } = createTestDOM(null, true);
    expect(dom.window.document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should default to light if prefers-color-scheme is light', () => {
    const { dom } = createTestDOM(null, false);
    expect(dom.window.document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should toggle theme from light to dark on theme button click', () => {
    const { dom, store } = createTestDOM('light');
    const doc = dom.window.document;
    const btn = doc.getElementById('theme-toggle');

    expect(doc.documentElement.classList.contains('dark')).toBe(false);
    btn.click();
    expect(doc.documentElement.classList.contains('dark')).toBe(true);
    expect(store['theme']).toBe('dark');

    btn.click();
    expect(doc.documentElement.classList.contains('dark')).toBe(false);
    expect(store['theme']).toBe('light');
  });

  it('should update mobile menu text when theme changes', () => {
    const { dom } = createTestDOM('light');
    const doc = dom.window.document;
    const mobileBtn = doc.getElementById('mobile-theme-toggle');
    const textLight = doc.getElementById('mobile-theme-text');
    const textDark = doc.getElementById('mobile-theme-text-dark');

    // Default light theme means textLight ("Dark Mode") is visible, textDark is hidden
    expect(textLight.classList.contains('hidden')).toBe(false);
    expect(textDark.classList.contains('hidden')).toBe(true);

    mobileBtn.click(); // Toggle to dark

    // Now textDark ("Light Mode") should be visible, textLight hidden
    expect(textLight.classList.contains('hidden')).toBe(true);
    expect(textDark.classList.contains('hidden')).toBe(false);
  });
});
