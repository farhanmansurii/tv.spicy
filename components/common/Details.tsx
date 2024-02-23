import React, { Suspense } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import SearchBar from "../SearchBar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import DetailLoader from "../loading/DetailLoader";
import { Skeleton } from "../ui/skeleton";
import ShowContainer from "./ShowContainer";
import ContinueWatchingButton from "./ContinueWatchingButton";
import { formatRelativeTime } from "@/lib/utils";
import ThemeButton from "./ThemeButton";
import SeasonsTabLoader from "../container/SeasonsTabLoader";
import CarousalCard from "./DetailsCard";
import MoreInfoComponent from "./MoreInfoComponent";
import MoreDetailsContainer from "../container/MoreDetailsContainer";
import Navbar from "./Navbar";
import RowLoader from "../loading/RowLoader";
const Seperator = () => <div className="text-ring font-bold">|</div>;
const Details = (props: any) => {
  const { data, type } = props;
  if (typeof document !== 'undefined') {
    document.addEventListener("gesturestart", function (e) {
        e.preventDefault();
        if (document.body) {
          (document.body.style as any).zoom = "0.99";
      }
    });

    document.addEventListener("gesturechange", function (e) {
        e.preventDefault();
        if (document.body) {
          (document.body.style as any).zoom = "0.99";
        }
    });

    document.addEventListener("gestureend", function (e) {
        e.preventDefault();
        if (document.body) {
          (document.body.style as any).zoom = "1";
        }
    });
}

  return (
    <>
      <div className="  lg:mx-auto">
        <Navbar text="details"/>
        <div className=" flex gap-10 flex-col lg:w-100 ">
          <CarousalCard
            id={data?.id || ''}
            type={type}
            isDetailsPage={true}
            show={data}
          />
          <Separator className="w-[96%]  mx-auto" />
          <Suspense
            fallback={
              type === "tv" ? (
                <RowLoader />
              ) : (
                <Skeleton className="mx-auto mb-10  aspect-video  w-full lg:w-[600px] " />
              )
            }
          >
            <ShowContainer id={data?.id} type={type} />
          </Suspense>
          <MoreDetailsContainer type={type} show={data} />
        </div>
      </div>
    </>
  );
};
export default Details;
