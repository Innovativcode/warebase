import type { ReactNode } from "react";

type AppThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: AppThemeProviderProps) {
  return children;
}
