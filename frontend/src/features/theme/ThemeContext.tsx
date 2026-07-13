import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeId = "light" | "dark";

export type ThemeOption = {
  id: ThemeId;
  name: string;
  description: string;
  swatches: {
    background: string;
    accent: string;
    text: string;
    secondary: string;
  };
};

export const themeOptions: ThemeOption[] = [
  {
    id: "light",
    name: "Light Mode",
    description: "Pale mint to lavender with navy text and teal progress.",
    swatches: {
      background: "#EEF7FF",
      accent: "#22C7A9",
      text: "#26344F",
      secondary: "#7B8387",
    },
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Deep indigo to violet with apricot headings and glowing streaks.",
    swatches: {
      background: "#1B1744",
      accent: "#F0C38E",
      text: "#FFFFFF",
      secondary: "#C3BFD9",
    },
  },
];

const THEME_STORAGE_KEY = "habitTracker.theme";

type ThemeContextValue = {
  theme: ThemeOption;
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeId(value: string | null): value is ThemeId {
  return value === "light" || value === "dark";
}

function getInitialThemeId(): ThemeId {
  const storedThemeId = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeId(storedThemeId) ? storedThemeId : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(getInitialThemeId);
  const theme = useMemo(
    () => themeOptions.find((option) => option.id === themeId) ?? themeOptions[0],
    [themeId],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId: setThemeIdState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return value;
}
