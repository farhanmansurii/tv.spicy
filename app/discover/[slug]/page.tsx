import { TextGlitch } from "@/components/animated-common/TextFlip";
import Navbar from "@/components/common/Navbar";
import { Header } from "@/components/common/header";
import LoadMore from "@/components/container/LoadMore";
import React from "react";

export default function Page(params: any) {
  return (
    <div className="mx-auto max-w-6xl md:pt-4 space-y-8">
      <div className="flex   mb-4    justify-between  mx-auto text-xl md:text-2xl items-center  py-1 flex-row">
        <div className=" flex text-3xl font-bold capitalize px-2  md:text-4xl gap-2 items-center">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">
                {params.searchParams.title}
                {params.searchParams.type.toLowerCase() === "movie"
                  ? " Movies "
                  : " TV"}{" "}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-[4rem] flex  gap-[3rem] flex-col mx-auto">
        <LoadMore params={params} />
      </div>
    </div>
  );
}
