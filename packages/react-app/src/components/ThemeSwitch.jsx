import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import { useThemeSwitcher } from "react-css-theme-switcher";

export default function ThemeSwitcher() {
  const { currentTheme } = useThemeSwitcher();

  useEffect(() => {
    window.localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  return <div className="main fade-in" style={{ position: "fixed", right: 8, bottom: 8 }}></div>;
}
