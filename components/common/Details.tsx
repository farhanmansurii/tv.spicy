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
const Details = (props: any) => {
  const { data, type, id } = props;
  return (
    <>
      <div className="  lg:mx-auto">
        <Navbar text="details" />
        <div className=" flex gap-10 flex-col lg:w-100 ">
          <CarousalCard
            id={data?.id || ""}
            type={type}
            isDetailsPage={true}
            show={data}
          />
          <Separator className="w-[96%]  mx-auto" />
          <ShowContainer id={data?.id} type={type} />
          <MoreDetailsContainer type={type} show={data} />
        </div>
      </div>
    </>
  );
};
export default Details;
