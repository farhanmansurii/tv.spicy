import React from "react";
import { Button } from "../ui/button";
// import { SearchBar } from "./SearchBar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SearchBar from "../SearchBar";

export default function Navbar() {
  return (
    <div className="w-full  py-8 ">
      <div className="flex gap-4 justify-between  items-center flex-row w-[90%] mx-auto text-lg">
        <Link href="">Spicy-tv</Link>
        <SearchBar />
      </div>
    </div>
  );
}
