import Navbar from "@/components/common/Navbar";
import SearchPageContainer from "@/components/common/SearchPageContainer";
import React from "react";
import Head from "next/head";

export default function SearchPage() {
  return (
    <div>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-4 lg:px-0">
        <div className="flex p-2 mb-4 font-bold justify-between mx-auto text-xl md:text-2xl items-center py-1 flex-row">
          <div className="mx-1 flex gap-2 items-center">Search</div>
        </div>
        <SearchPageContainer />
      </div>
    </div>
  );
}
