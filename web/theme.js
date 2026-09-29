(() => {
  const storageKey = 'hawk-color-theme';
  const validModes = new Set(['light', 'system', 'dark']);
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let mode = 'system';

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (validModes.has(saved)) mode = saved;
  } catch {
    // Private browsing or storage restrictions: use the system preference.
  }

  function apply() {
    const dark = mode === 'dark' || (mode === 'system' && media.matches);
    root.dataset.themeMode = mode;
    root.classList.toggle('dark', dark);
    root.classList.toggle('light', !dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = dark ? '#111111' : '#f3f6f9';
    window.dispatchEvent(new Event('hawk-theme-change'));
  }

  window.hawkTheme = {
    getMode: () => mode,
    setMode(next) {
      if (!validModes.has(next)) return;
      mode = next;
      try { window.localStorage.setItem(storageKey, mode); } catch { /* Keep the selection for this page view. */ }
      apply();
    }
  };

  media.addEventListener?.('change', () => {
    if (mode === 'system') apply();
  });
  apply();
})();
