"use client";

import { MoonStar } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nextIsDark);
    window.localStorage.setItem("compliance-theme", nextIsDark ? "dark" : "light");
  }

  return (
    <Button onClick={toggleTheme} type="button" variant="outline" size="sm">
      <MoonStar className="size-4" />
      Toggle Theme
    </Button>
  );
}