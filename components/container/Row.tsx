"use client";
import Link from "next/link";
import React, { useRef } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "../common/Card";
import { Skeleton } from "../ui/skeleton";

interface RowProps {
  shows?: any[];
  text: string;
  type: string;
}

const Row: React.FC<RowProps> = ({ shows, text, type }) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollTo = (scrollOffset: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const currentScrollLeft = container.scrollLeft;
      const targetScrollLeft = currentScrollLeft + scrollOffset;
      container.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full flex gap-0 flex-col mx-auto mb-5">
      <div
        className="flex  items-center
       justify-between"
      >
        <h2 className="text-2xl lg:text-3xl  mx-2">{text}</h2>
        <div className="flex gap-3 items-center">
          <Button
            size="icon"
            onClick={() => scrollTo(-400)}
            className=" bg-secondary rounded-full w-6 h-6 p-1"
          >
            <ChevronLeft />
          </Button>
          <Button
            size="icon"
            onClick={() => scrollTo(400)}
            className=" bg-secondary rounded-full w-6 h-6 p-1"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className=""
        ref={scrollContainerRef}
        style={{
          display: "flex",
          overflowX: "scroll",
          overflowY: "unset",
          gap: "2px",
          scrollbarWidth: "none", // Hide the scrollbar in Firefox
          WebkitOverflowScrolling: "touch", // Enable smooth scrolling on iOS
        }}
      >
        {shows
          ?.sort((a, b) => b.popularity - a.popularity)
          .map((e) => (
            <>
            <div key={e.id} className=" py-3">
              <MovieCard data={e} type={type} />
            </div>
            
            </>
          ))}
      </div>
    </div>
  );
};

export default Row;
