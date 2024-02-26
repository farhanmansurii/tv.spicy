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
        <Button size={"icon"} className="rounded-full aspect-square p-2">
          <Moon className="h-full w-full" />
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
          Red (taylor&apos;s version)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("redDark")}>
          Red (dark)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
