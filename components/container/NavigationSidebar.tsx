import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchGenres } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const NavigationSidebar = (props:{ tvGenre: any, movieGenre: any }) => {
 const {movieGenre, tvGenre} = props;
  return (
    <div>
      <SheetContent className=" overflow-scroll py-10">
        <SheetHeader>
          <SheetTitle className="">Explore</SheetTitle>
          <SheetDescription>
            <Tabs className=" w-full lg:max-w-[80%]">
              <TabsList
                className=" flex w-full bg-background"
                defaultValue={"tv"}
              >
                <TabsTrigger className="w-full" value="movies">
                  Movies{" "}
                </TabsTrigger>
                <TabsTrigger className="w-full" value="tv">
                  TV{" "}
                </TabsTrigger>
              </TabsList>
              <TabsContent className="  " value="tv">
                {renderButtons(tvGenre, "tv")}
              </TabsContent>
              <TabsContent className=" " value="movies">
                {renderButtons(movieGenre, "movie")}
              </TabsContent>
            </Tabs>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </div>
  );
};

const renderButtons = (genres: any[], type: string) => {
  return (
    <>
      <Link href={`/discover/trending?type=${type}&title=Trending`}>
        <SheetTrigger className="w-full">
          <Button
            variant={"ghost"}
            className="flex w-full text-start justify-start"
          >
            Trending
          </Button>
        </SheetTrigger>
      </Link>

      <Link href={`/discover/airing-today?type=${type}&title=Airing Today`}>
        <SheetTrigger className="w-full">
          <Button
            variant={"ghost"}
            className="flex w-full text-start justify-start"
          >
            Airing Today
          </Button>
        </SheetTrigger>
      </Link>

      <Link href={`/discover/on-the-air?type=${type}&title=On The Air`}>
        <SheetTrigger className="w-full">
          <Button
            variant={"ghost"}
            className="flex w-full text-start justify-start"
          >
            On The Air
          </Button>
        </SheetTrigger>
      </Link>

      <Link href={`/discover/popular?type=${type}&title=Popular`}>
        <SheetTrigger className="w-full">
          <Button
            variant={"ghost"}
            className="flex w-full text-start justify-start"
          >
            Popular
          </Button>
        </SheetTrigger>
      </Link>

      <Link href={`/discover/top-rated?type=${type}&title=Top Rated`}>
        <SheetTrigger className="w-full">
          <Button
            variant={"ghost"}
            className="flex w-full text-start justify-start"
          >
            Top Rated
          </Button>
        </SheetTrigger>
      </Link>
      {genres?.map((genre: any, index: number) => (
        <Link
          key={index}
          href={`/discover/${genre.name.toLowerCase()}?type=${type}&id=${
            genre.id
          }&title=${encodeURIComponent(genre.name)}`}
        >
          <SheetTrigger className="w-full">
            <Button
              variant={"ghost"}
              className="flex w-full text-start justify-start"
            >
              {genre.name}
            </Button>
          </SheetTrigger>
        </Link>
      ))}
    </>
  );
};

export default NavigationSidebar;
