"use client";
import React, { Suspense } from "react";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import ShowContainer from "./ShowContainer";
import CarousalCard from "./DetailsCard";
import MoreDetailsContainer from "../container/MoreDetailsContainer";
import Navbar from "./Navbar";
import RowLoader from "../loading/RowLoader";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchDetails } from "@/lib/utils";
import { TvSerieDetails } from "../container/tv-details.tsx/TVDetails";
const Details = (props: any) => {
  const { data, type, id } = props;
  return (
    <>
      <TvSerieDetails
        id={data?.id}
        tvSerie={data}
        language={"en"}
        type={type}
      />
      <Separator className="max-w-4xl w-full  mx-auto" />
      <ShowContainer id={data?.id} type={type} />
      <Separator className="max-w-4xl w-full  mx-auto" />
      <MoreDetailsContainer type={type} show={data} />
    </>
  );
};
export default Details;
