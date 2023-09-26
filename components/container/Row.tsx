"use client";
import Link from "next/link";
import React, { useRef } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "../common/Card";

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
    <div className="w-11/12 mx-auto mb-10">
      <div
        className="flex my-2 items-center
       justify-between"
      >
        <h2 className="text-2xl lg:text-3xl my-2 mx-2">{text}</h2>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => scrollTo(-400)}
            className=" rounded-md p-3"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="secondary"
            onClick={() => scrollTo(200)}
            className=" rounded-md p-3"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        style={{
          display: "flex",
          overflowX: "scroll",
          gap: "2px",
          scrollbarWidth: "none", // Hide the scrollbar in Firefox
          WebkitOverflowScrolling: "touch", // Enable smooth scrolling on iOS
        }}
      >
        {shows?.map((e) => (
          <MovieCard key={e.id} data={e} type={type} />
        ))}
      </div>
    </div>
  );
};

export default Row;
