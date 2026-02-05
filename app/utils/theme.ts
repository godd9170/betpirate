export const themeBootstrapScript = `(() => {
  const prefersDark = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
  const validThemes = ['lemonade', 'abyss'];
  const legacyMap = {
    light: 'lemonade',
    dark: 'abyss',
  };
  let stored = null;

  try {
    stored = localStorage.getItem('theme');
  } catch (error) {
    // ignore storage errors
  }

  const normalized = legacyMap[stored] || stored;
  const isValid = typeof normalized === 'string' && validThemes.includes(normalized);
  const theme = isValid ? normalized : (prefersDark ? 'abyss' : 'lemonade');
  document.documentElement.dataset.theme = theme;

  if (stored !== null && stored !== normalized) {
    try {
      localStorage.setItem('theme', normalized);
    } catch (error) {
      // ignore storage errors
    }
  } else if (stored !== null && !isValid) {
    try {
      localStorage.removeItem('theme');
    } catch (error) {
      // ignore storage errors
    }
  }
})();`;
