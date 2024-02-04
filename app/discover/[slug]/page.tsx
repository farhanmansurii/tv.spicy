import Navbar from "@/components/common/Navbar";
import LoadMore from "@/components/container/LoadMore";
import React from "react";

export default function Page(params: any) {
  return (
    <>
      <div className="flex pt-[4rem]  mb-4 w-[96%]  font-bold justify-between  mx-auto text-xl md:text-2xl items-center  py-1 flex-row">
        <div className="mx-1 flex gap-2 items-center">
          {params.searchParams.title}
        </div>
      </div>
      <div className="mb-[4rem] flex gap-[3rem] flex-col mx-auto">
        <LoadMore params={params} />
      </div>
    </>
  );
}
