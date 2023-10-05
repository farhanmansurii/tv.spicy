"use client";
import React from "react";
import { Button } from "../ui/button";
// import { SearchBar } from "./SearchBar";
import Link from "next/link";
import { ArrowLeft, Moon, MoonIcon, Sun, SunDimIcon } from "lucide-react";
import SearchBar from "../SearchBar";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ThemeButton from "./ThemeButton";

export default function Navbar() {

  return (
    <div className="w-full  py-8 ">
      <div className="flex gap-4 justify-between  items-center flex-row w-[90%] mx-auto text-lg">
        <Link href="">Spicy-TV</Link>
        <div className="flex items-center justify-center gap-4">
          <ThemeButton/>
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
