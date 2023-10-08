import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { fetchRowData } from "@/lib/utils";
import Link from "next/link";
import ThemeButton from "./ThemeButton";
import SearchBar from "../SearchBar";

export const Carousal = async () => {
  const tvwatchlist = await fetchRowData("discover");
  return (
    <div className="  lg:mx-auto">
      <div className="  pb-4 lg:w-100 ">
        <div className="flex flex-col    mx-auto gap-4 ">
          <div className="relative  w-full h-full md:h-[400px] z-30">
            <div className="absolute -inset-0 -inset-y-2 bg-gradient-to-t from-background to-background/20"></div>
            <div className="w-full aspect-video md:h-[400px] ">
              <img
                src={`https://image.tmdb.org/t/p/original${tvwatchlist[0].backdrop_path}`}
                className="z-0 w-full h-full md:h-[400px] object-cover object-top"
                alt=""
              />
            </div>
            <div className="w-full absolute justify-center flex  top-0">
              <div className="flex p-4 items-center flex-row-reverse w-full lg:w-11/12 justify-between mx-auto">
                <div className="flex items-center justify-center gap-4">
                  <ThemeButton />
                  <SearchBar />
                </div>
              </div>
            </div>
            <div className="absolute w-full bottom-0">
              <div className="flex p-4  flex-col  mb-3 w-full lg:w-11/12 justify-between mx-auto">
                <h1 className=" text-4xl mb-2 font-bold  lg:text-5xl">
                  {tvwatchlist[0].title}
                </h1>
                <div className="opacity-70 lg:w-5/12 mb-3 italic line-clamp-3 text-[10px] md:text-sm">
                  {tvwatchlist[0].overview}
                </div>
                <div className="gap-2 flex text-[10px]">
                  <Link href={`/movie/${tvwatchlist[0].id}`}>
                    <Button
                      size="sm"
                      className="text-[10px] md:text-xs  rounded-full gap-2 "
                    >
                      <svg
                        viewBox="0 0 512 512"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path d="M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z" />
                      </svg>
                      Watch Movie
                    </Button>
                  </Link>
                  <Link href={`/movie/${tvwatchlist[0].id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] md:text-xs rounded-full "
                    >
                      More Info
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
