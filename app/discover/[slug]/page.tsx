import { TextGlitch } from "@/components/animated-common/TextFlip";
import Navbar from "@/components/common/Navbar";
import LoadMore from "@/components/container/LoadMore";
import React from "react";

export default function Page(params: any) {
  return (
    <>
      <Navbar text="genre" />
      <div className="flex pt-[6rem]  mb-4 w-[94%]   justify-between  mx-auto text-xl md:text-2xl items-center  py-1 flex-row">
        <div className=" flex text-3xl capitalize px-2  md:text-4xl gap-2 items-center">
          <TextGlitch>
            {params.searchParams.type.toLowerCase() === "movie"
              ? "Movies "
              : "TV"}{" "}
            : {params.searchParams.title}
          </TextGlitch>
        </div>
      </div>
      <div className="mb-[4rem] flex w-[95%] gap-[3rem] flex-col mx-auto">
        <LoadMore params={params} />
      </div>
    </>
  );
}
