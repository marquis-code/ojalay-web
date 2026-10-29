const LIGHT_THEME: Record<string, string> = {
  '--bg': '251 247 239',
  '--surface': '255 255 255',
  '--raised': '247 242 232',
  '--ink': '6 35 26',
  '--muted': '95 107 100',
  '--line': '229 222 208',
};

export function useCustomerTheme() {
  const keys = Object.keys(LIGHT_THEME);
  onMounted(() => {
    if (!import.meta.client) return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(LIGHT_THEME)) root.style.setProperty(key, value);
    root.style.setProperty('color-scheme', 'light');
  });
  onBeforeUnmount(() => {
    if (!import.meta.client) return;
    const root = document.documentElement;
    for (const key of keys) root.style.removeProperty(key);
    root.style.removeProperty('color-scheme');
  });
}
