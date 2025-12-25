import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Effect to apply the class to the HTML Body
  useEffect(() => {
    console.log("🎨 Applying Class to Body:", theme); // <--- DEBUG LOG
    document.body.className = theme; // This sets <body class="dark">
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Custom Hook for easy usage
export const useTheme = () => useContext(ThemeContext);