"use client";
import { BackgroundGradientAnimation } from "@/components/animated-common/background-gradient-animation";
import ShowCard from "@/components/common/Card";
import { PlaceholdersAndVanishInput } from "@/components/common/vanish-input";
import { Button } from "@/components/ui/button";
import { Show } from "@/lib/types";
import useTitle from "@/lib/use-title";
import { searchShows } from "@/lib/utils";
import { set } from "date-fns";
import { X } from "lucide-react";
import React, { useState } from "react";

export default function HomeContainer() {
  const { title } = useTitle();
  const [query, setQuery] = useState<string | null>("");
  const [data, setData] = useState<any[]>([]);
  const placeholders = [
    "The Shawshank Redemption (1994)",
    "12 Angary Man (2000)",
    "Titanic (1997)",
    "The Dark Knight (2008)",
    "Inception (2010)",
    "Avengers: Endgame (2019)",
    "The Lord of the Rings (2001)",
    "Avatar (2009)",
    "The Godfather (1972)",
    "Forrest Gump (1994)",
    "The Empire Strikes Back (1980)",
    "Gladiator (2000)",
    "Spirited Away (2001)",
    "Mulholland Drive (2001)",
    "In the Mood for Love (2000)",
    "Brokeback Mountain (2005)",
    "Kingdom of the Planet of the Apes (2024)",
    "Hit Man (2007)",
    "Bad Boys: Ride or Die (2024)",
    "The Watchers (2020)",
    "Godzilla Minus One (2024)",
    "Furiosa: A Mad Max Saga (2024)",
    "Under Paris (2024)",
    "Naruto (2002-2007)",
    "Attack on Titan (2013-2023)",
    "Death Note (2006-2007)",
    "Demon Slayer: Kimetsu no Yaiba (2019-present)",
    "My Hero Academia (2016-present)",
    "X-Men: The Animated Series (1992-1997)",
    "BoJack Horseman (2014-2020)",
    "The Flintstones (1960-1966)",
    "Sacred Games (2018-2019)",
    "Mirzapur (2018-2020)",
    "Panchayat (2020-present)",
    "Special Ops (2020)",
    "Scam 1992: The Harshad Mehta Story (2020)",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query) return;
    const shows = await searchShows(query);
    console.log(shows);
    setData(shows.results);
    setQuery(null);
    console.log("submitted");
  };

  return (
    <BackgroundGradientAnimation>
      <div className="h-[100vh] max-w-4xl px-10 mx-auto flex flex-col justify-center  items-center ">
        <h2 className="mb-10  text-4xl text-center sm:text-5xl text-white">
          {title}
        </h2>
        <div className="w-full max-w-2xl items-center justify-center flex mx-auto">
          <div className="flex w-full ">
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit}
            />
            {data?.length > 0 && (
              <button
                className=" border hover:scale-95 duration-150  z-30 rounded-full w-10 h-10  m-1 bg-muted "
                onClick={() => setData([])}
              >
                <X className="p-2 w-full h-full" />
              </button>
            )}
          </div>
        </div>
        {data && (
          <div className="z-30 mt-10  grid h-[50vh]  overflow-scroll max-w-4xl mx-auto -scroll grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-3 md:gap-y-10   ">
            {data.map((show: Show, index: number) =>
              show.backdrop_path ? (
                <ShowCard
                  key={index}
                  showRank={false}
                  variants={""}
                  show={show}
                  type={show.media_type}
                  index={index}
                  isVertical={true}
                />
              ) : null
            )}
          </div>
        )}
      </div>
    </BackgroundGradientAnimation>
  );
}
