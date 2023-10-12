"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination } from "swiper/modules";

import "swiper/css/navigation";
import "swiper/css/pagination";

import SwiperCore from "swiper";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import ThemeButton from "./ThemeButton";
import SearchBar from "../SearchBar";
import Link from "next/link";
SwiperCore.use([EffectCoverflow, Pagination]);

export default function CarousalComponent(props: any) {
  const [activeSlide, setActiveSlide] = useState(1);

  const handleSlideChange = (swiper: any) => {
    setActiveSlide(swiper.realIndex);
  };
  return (
    <div className=" ">
      <div className="w-full z-10 absolute justify-center flex  top-0">
        <div className="flex p-4 items-center flex-row-reverse w-full lg:w-11/12 justify-between mx-auto">
          <div className="flex items-center justify-center gap-4">
            <ThemeButton />
            <SearchBar />
          </div>
        </div>
      </div>
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        autoplay={true}
        slidesPerView={2} // Display 4 slides at once
        spaceBetween={2} // Add space between slides
        coverflowEffect={{
          rotate: 30,
          depth: 60,
          slideShadows:false
        }}
        mousewheel={true}
        initialSlide={1}
        style={{paddingBlock:'6rem'}}
        className=""
        onSlideChange={handleSlideChange}
      >
        {props.items.map((show: any, index: any) => (
          <SwiperSlide key={index} className=" max-h-[500px]">
            <div className="md:hidden relative ">
              <img
                src={`https://image.tmdb.org/t/p/original${show.poster_path}`}
                className={`w-full md:hidden h-full rounded-lg `}
                alt=""
              />
              <div
                className={`absolute inset-0  duration-400  ${
                  activeSlide === index ? " shadow-neutral-900 shadow-2xl rounded-lg" : "bg-background opacity-70"
                }`}
              ></div>
              {activeSlide === index ? (
                <div
                  className="flex gap-2 absolute inset-0
               justify-center
              items-center"
                >
                  <Link href={`/movie/${show.id}`}>
                    <Button className="rounded-full shadow-2xl shadow-primary w-12 h-12  gap-2 ">
                      <svg
                        viewBox="0 0 512 512"
                        fill="currentColor"
                        className="w-10 h-10"
                      >
                        <path d="M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              ) : (
                ""
              )}
            </div>

            <div className="hidden md:block     relative">
              <img
                src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
                className={`w-full   h-full rounded-xl`}
                alt=""
              />
              <div
                className={`absolute inset-0    ${
                  activeSlide === index
                    ? "bg-gradient-to-t  shadow-neutral-900 shadow-2xl rounded-xl from-background to-transparent"
                    : "bg-background opacity-70"
                }`}
              ></div>
              {activeSlide === index ? (
                <div className="absolute flex-col w-full  gap-2  bottom-2 flex px-5 py-3">
                  <div className="text-4xl px-1  flex  items-center gap-2 font-bold">
                    {show.title || show.name}{" "}
                    <Button size='xs' >
                      {show?.vote_average?.toFixed(1)}
                    </Button>
                  </div>
                  <div className="opacity-70 px-1  lg:w-5/12  italic line-clamp-2 text-[10px] md:text-sm">
                    {show.overview}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Link href={`/movie/${show.id}`}>
                      <Button className="rounded-full  gap-2 ">
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
                    <button className="rounded-full  text-primary border-primary border-2   ">
                      <Plus className="p-1 w-full h-full" />
                    </button>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
