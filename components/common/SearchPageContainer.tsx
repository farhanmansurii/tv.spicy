"use client";
import React, { useState } from "react";
import { DebouncedInput } from "./DebouncedInput";
import useRecentSearchStore from "@/store/recentsSearchStore";
import { useSearchStore } from "@/store/searchStore";
import { searchShows } from "@/lib/utils";
import Row from "../container/Row";
import { Button } from "../ui/button";
import { Frown, Link, Loader2 } from "lucide-react";
import ShowCard from "./Card";
import { Show } from "@/lib/types";
import { CaretRightIcon } from "@radix-ui/react-icons";
import GridLoader from "../loading/GridLoader";
import { Skeleton } from "../ui/skeleton";

export default function SearchPageContainer() {
  const searchStore = useSearchStore();
  const { searches, addToSearchList, clearSearchList, removeFromSearchList } =
    useRecentSearchStore();
  async function searchShowsByQuery(value: string) {
    searchStore.setQuery(value);
    if (value) searchStore.setLoading(true);
    if (value.length >= 3) {
      const shows = await searchShows(value);
      searchStore.setShows(shows.results);
      searchStore.setLoading(false);
    } else searchStore.setShows([]);
  }
  const handleAddToHistory = (ep: any) => {
    searchStore.setShows([]);
    searchStore.setQuery("");
    searchStore.setLoading(false);
    addToSearchList(ep);
  };
  return (
    <div className="  mx-auto min-h-screen w-full ">
      <div className=" border rounded mb-10 ">
        <DebouncedInput
          setQuery={searchStore.setQuery}
          setData={searchStore.setShows}
          value={searchStore.query}
          onChange={(value) => void searchShowsByQuery(value.toString())}
        />
      </div>
      {searchStore.query.length >= 3 ? (
        <div>
          {searchStore.loading ? (
            <div className="">
              <div className="flex font-bold justify-between  mx-auto text-xl md:text-2xl items-center my-1 py-1 flex-row">
                <div className="mx-1 flex gap-2 items-center">
                  Search Results for {searchStore?.query}
                  <div>
                    <CaretRightIcon className="h-full " />
                  </div>
                </div>
              </div>
              <GridLoader />
            </div>
          ) : searchStore.shows?.length > 0 ? (
            <div className="">
              <div className="flex font-bold justify-between  mx-auto text-xl md:text-2xl items-center my-1 py-1 flex-row">
                <div className="mx-1 flex gap-2 items-center">
                  Search Results for {searchStore.query}
                  <div>
                    <CaretRightIcon className="h-full " />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-3 md:gap-y-10   ">
                {searchStore.shows.map((show: Show, index: number) =>
                  show.backdrop_path ? (
                    <ShowCard
                      key={index}
                      showRank={false}
                      variants={""}
                      show={show}
                      type={show.media_type}
                      onClick={() => handleAddToHistory(show)}
                      index={index}
                      isVertical={true}
                    />
                  ) : null
                )}
              </div>{" "}
            </div>
          ) : (
            <div className="flex items-center my-[10rem] flex-col gap-2 ">
              <Frown className=" w-16 h-16 " />
              <div>No Results found</div>
            </div>
          )}
        </div>
      ) : searches.length ? (
        <>
          <div className="flex font-bold justify-between  mx-auto text-xl md:text-2xl items-center my-1 py-1 flex-row">
            <div className="mx-1 flex gap-2 items-center">
              Recently Searched
              <div>
                <CaretRightIcon className="h-full " />
              </div>
              <Button variant={"link"} onClick={clearSearchList}>
                Clear
                <span className="sr-only">Clear</span>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-3 md:gap-y-10   ">
            {searches.map((show: Show, index: number) =>
              show.backdrop_path ? (
                <ShowCard
                  key={index}
                  showRank={false}
                  variants={""}
                  show={show}
                  type={show.media_type}
                  onClick={(show: Show) => handleAddToHistory(show)}
                  index={index}
                  isVertical={true}
                />
              ) : null
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
