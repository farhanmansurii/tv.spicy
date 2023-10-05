"use client";
import React from "react";
import { Button } from "../ui/button";
// import { SearchBar } from "./SearchBar";
import Link from "next/link";
import { ArrowLeft, Moon, MoonIcon, Sun } from "lucide-react";
import SearchBar from "../SearchBar";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Navbar() {
  const { setTheme } = useTheme();
  return (
    <div className="w-full  py-8 ">
      <div className="flex gap-4 justify-between  items-center flex-row w-[90%] mx-auto text-lg">
        <Link href="">Spicy-TV</Link>
        <div className="flex items-center justify-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="rounded-full w-10 h-10 md:w-12 md:h-12 "
              >
                <svg viewBox="0 0 30 30" fill="currentColor" className="w-10 h">
                  <path d="M3.74 14.44c0-1.52.3-2.98.89-4.37s1.4-2.58 2.4-3.59 2.2-1.81 3.59-2.4 2.84-.89 4.37-.89 2.98.3 4.37.89 2.59 1.4 3.6 2.4 1.81 2.2 2.4 3.59.89 2.84.89 4.37-.3 2.98-.89 4.37-1.4 2.59-2.4 3.6-2.2 1.81-3.6 2.4-2.85.89-4.37.89-2.98-.3-4.37-.89-2.58-1.4-3.59-2.4-1.81-2.2-2.4-3.6-.89-2.84-.89-4.37zm1.2 0c0 1.37.27 2.67.8 3.91s1.25 2.31 2.15 3.21 1.97 1.61 3.21 2.15 2.54.8 3.9.8h.38c.67-2.49 1.01-5.84 1.01-10.06 0-3.82-.34-7.17-1.03-10.05h-.37c-1.36 0-2.66.27-3.9.8s-2.3 1.24-3.2 2.14-1.61 1.97-2.15 3.21-.8 2.54-.8 3.89z" />
                </svg>
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
              <DropdownMenuItem onClick={() => setTheme("netflix")}>
                Red
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
