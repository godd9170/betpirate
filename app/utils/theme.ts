export const themeBootstrapScript = `(() => {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'abyss' : 'lemonade');
    document.documentElement.dataset.theme = theme;
  } catch (error) {
    // ignore storage or media query errors
  }
})();`;
