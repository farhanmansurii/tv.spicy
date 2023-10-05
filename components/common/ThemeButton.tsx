"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeButton() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="rounded-full w-10 h-10 md:w-12 md:h-12 ">
          <Moon className="p-1" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("redLight")}>
          Red (light)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("redDark")}>
          Red (dark)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
