/* eslint-disable @next/next/no-img-element */
import { Show } from "@/lib/types";
import Link from "next/link";
import React from "react";
import { Motiondiv } from "./MotionDiv";
import { TextGlitch } from "../animated-common/TextFlip";
import { Skeleton } from "../ui/skeleton";

export default function ShowCard(props: {
  index: number;
  variants?: any;
  show: Show;
  showRank?: Boolean;
  isVertical?: Boolean;
  type?: string;
  onClick?: any;
}) {
  const { index, show, showRank, isVertical, type } = props;
  const imagePath = `https://image.tmdb.org/t/p/w500/${show.backdrop_path}`;
  const posterPath = `https://image.tmdb.org/t/p/w500/${show.poster_path}`;

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };
  function calculateDelay(index: number) {
    const staggeredIndex = index % 20 !== 0 ? index % 20 : 0;
    return staggeredIndex;
  }
  return (
    <Link
      onClick={() => props.onClick && props.onClick(show)}
      href={`/${show.media_type || type}/${show.id}`}
    >
      <Motiondiv
        initial="hidden"
        animate="visible"
        transition={{
          delay: calculateDelay(index) * 0.1,
          ease: "easeInOut",
          duration: 0.5,
        }}
        viewport={{ amount: 0 }}
        custom={props.index}
        variants={variants}
      >
        {!isVertical ? (
          <div key={show.id} className="relative group">
            <div className="aspect-video ">
              <img
                alt=""
                className="object-center object-cover h-full w-full border-transparent border group-hover:border-primary duration-200 ease-in-out"
                src={imagePath}
              />
            </div>
            <svg
              fill="currentColor"
              viewBox="0 0 16 16"
              height="2em"
              width="2em"
              className="absolute mix-blend-difference group-hover:opacity-100 opacity-0 inset-0   scale-90 group-hover:scale-100 duration-200  ease-in-out bottom-0 right-0 m-4 text-white"
            >
              <path d="M16 8A8 8 0 110 8a8 8 0 0116 0zM6.79 5.093A.5.5 0 006 5.5v5a.5.5 0 00.79.407l3.5-2.5a.5.5 0 000-.814l-3.5-2.5z" />
            </svg>
            <div className="p-1 relative flex  flex-col ">
              {showRank && (
                <div className="absolute -mt-[1.8rem] mix-blend-difference font-bold text-7xl ">
                  {index + 1}
                </div>
              )}
              <div
                className={` text-sm  line-clamp-1 ${
                  showRank && (index + 1 === 10 ? ` ml-24` : "ml-12")
                }`}
              >
                <TextGlitch>{show.title || show.name}</TextGlitch>
              </div>
              <div
                className={`text-[10px]  flex gap-1 capitalize opacity-75 ${
                  showRank && (index + 1 === 10 ? ` ml-24` : "ml-12")
                }`}
              >
                {(show.first_air_date || show.release_date)?.split("-")[0]}{" "}
                <p
                  className={`${
                    (show.media_type || type)?.toLowerCase() === "tv"
                      ? "uppercase"
                      : "capitalize"
                  }`}
                >
                  • {type ? type : show.media_type}
                </p>
                <p className="flex gap-2 items-center">
                  {" • " + show.vote_average?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            key={show.id}
            className="relative group hover:opacity-100 durtion-300 border border-transparent hover:border-primary hover:shadow-2xl md:opacity-40"
            style={{ display: "grid", placeItems: "center" }}
          >
            <div className="   relative  flex items-center justify-center">
              <img
                alt=""
                className="w-full  object-coverinset-0 h-full"
                src={posterPath}
              />
            </div>

            <svg
              fill="currentColor"
              viewBox="0 0 16 16"
              height="2rem" // Adjust as needed
              width="2rem" // Adjust as needed
              className="absolute group-hover:opacity-100 opacity-0 scale-90 group-hover:scale-100 duration-200 ease-in-out bottom-0 right-0 m-4 text-white"
            >
              <path d="M16 8A8 8 0 110 8a8 8 0 0116 0zM6.79 5.093A.5.5 0 006 5.5v5a.5.5 0 00.79.407l3.5-2.5a.5.5 0 000-.814l-3.5-2.5z" />
            </svg>

            <div className="relative flex flex-col">
              {showRank && (
                <div className="absolute -mt-10 font-bold text-7xl">
                  {index + 1}
                </div>
              )}
            </div>
          </div>
        )}
      </Motiondiv>
    </Link>
  );
}
