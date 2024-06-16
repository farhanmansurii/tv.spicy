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
import DetailLoader from "../loading/DetailLoader";
import dynamic from "next/dynamic";
import ShowDetails from "../container/tv-details.tsx/TVDetails";
import RelatedShowsComponent from "../container/RelatedShowContainer";

const Details = (props: any) => {
  const { data, type, id } = props;
  const renderContent = (selected: string) => {
    switch (selected) {
      case "Recommendations":
        return (
          <RelatedShowsComponent
            relation="recommendations"
            type={type}
            show={data}
          />
        );
      case "Related Shows":
        return (
          <RelatedShowsComponent relation="similar" type={type} show={data} />
        );
      default:
        return <div>No Content</div>;
    }
  };
  return (
    <div className="max-w-6xl w-full space-y-10  mx-auto">
      <ShowDetails id={data?.id} show={data} language={"en"} type={type} />
      <Separator className="max-w-4xl w-full  mx-auto" />
      <ShowContainer id={data?.id} type={type} />
      <Separator className="max-w-4xl w-full  mx-auto" />
      <MoreDetailsContainer
        renderContent={renderContent}
        type={type}
        show={data}
      />
    </div>
  );
};
export default Details;
