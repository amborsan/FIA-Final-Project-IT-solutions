// Apply the theme before React renders to prevent a flash of the default palette.
try {
  const saved = localStorage.getItem("orbit_theme");
  const dark = saved === "dark" ||
    (saved !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "orbit-dark" : "orbit";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
} catch {
  // Storage can be blocked. The default palette is defined in CSS.
}
