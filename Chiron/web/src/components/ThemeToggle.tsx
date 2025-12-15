import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const getInitialTheme = () => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return 'light'
      }
      const saved = localStorage.getItem('theme')
      if (saved === 'dark' || saved === 'light') return saved

      const prefersDark =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches

      return prefersDark ? 'dark' : 'light'
    } catch (e) {
      return 'light'
    }
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{
        padding: "6px 12px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--panel-elev)",
        color: "var(--text)",
        cursor: "pointer",
        marginRight: "0.75rem",
      }}
    >
      {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
